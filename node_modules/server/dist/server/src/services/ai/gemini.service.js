import { GoogleGenAI, Type } from '@google/genai';
import { dbStore } from '../db/store.js';
import { fetchFarmWeather } from '../weather/weather.service.js';
import { getMarketIntelligence } from '../market/market.service.js';
import { geocodeLocationQuery } from '../location/location.service.js';
import { recommendCrops } from '../../domain/agronomy/recommendation.engine.js';
import { evaluateFarmRisks } from '../../domain/risk/risk.engine.js';
import { calculateWhatIfScenario, calculateResourceRequirements } from '../../domain/economics/economics.engine.js';
/**
 * Transforms stored messages into the role/parts format required by @google/genai.
 */
function buildGeminiHistory(storedMessages, currentUserQuestion) {
    const valid = storedMessages.filter(m => m.content && m.content.trim().length > 0 && !m.content.startsWith('⚠️'));
    if (valid.length === 0)
        return [];
    const messagesToProcess = [...valid];
    if (messagesToProcess.length > 0 &&
        messagesToProcess[messagesToProcess.length - 1].role === 'user' &&
        messagesToProcess[messagesToProcess.length - 1].content.trim() === currentUserQuestion.trim()) {
        messagesToProcess.pop();
    }
    const recent = messagesToProcess.slice(-6);
    const history = [];
    for (const msg of recent) {
        const role = msg.role === 'user' ? 'user' : 'model';
        if (history.length === 0 && role !== 'user') {
            continue;
        }
        if (history.length > 0 && history[history.length - 1].role === role) {
            history[history.length - 1].parts[0].text += `\n\n${msg.content}`;
        }
        else {
            history.push({
                role,
                parts: [{ text: msg.content }]
            });
        }
    }
    if (history.length > 0 && history[history.length - 1].role === 'user') {
        history.pop();
    }
    return history;
}
/**
 * Determines an optional contextual navigation action button to render under the AI response.
 */
function extractActionFromIntent(qText, context) {
    const q = qText.toLowerCase();
    if (q.includes('market') || q.includes('price') || q.includes('mandi') || q.includes('rate') || q.includes('சந்தை') || q.includes('விபணி')) {
        return { type: 'navigate', target: 'market', label: `Open ${context.farmer?.state || 'State'} Mandi Rates` };
    }
    if (q.includes('task') || q.includes('action') || q.includes('schedule') || q.includes('பணி') || q.includes('പ്രവർത്തനം')) {
        return { type: 'navigate', target: 'actions', label: 'Open Farm Tasks' };
    }
    if (q.includes('economic') || q.includes('profit') || q.includes('margin') || q.includes('what if') || q.includes('வருமானம்') || q.includes('വരുമാനം') || q.includes('reduce irrigation')) {
        return { type: 'navigate', target: 'economics', label: 'Open What-If Simulator' };
    }
    if (q.includes('recommend') || q.includes('what to plant') || q.includes('suitable crop') || q.includes('பரிந்துரை') || q.includes('ശുபாർശ')) {
        return { type: 'navigate', target: 'recommendations', label: 'View Crop Recommendations' };
    }
    if (q.includes('health') || q.includes('disease') || q.includes('pest') || q.includes('diagnos') || q.includes('நோய்') || q.includes('രോഗം') || q.includes('yellow')) {
        return { type: 'navigate', target: 'health', label: 'Open Crop Health' };
    }
    return null;
}
/**
 * Tool Declarations for Gemini Function Calling
 */
const AGRI_TOOLS_DECLARATIONS = [
    {
        name: 'get_weather',
        description: 'Retrieve real-time weather telemetry, current temperature, rain probability, humidity, wind speed, and 7-day agro-meteorological advisory for ANY city, district, or coordinates.',
        parameters: {
            type: Type.OBJECT,
            properties: {
                location: {
                    type: Type.STRING,
                    description: 'Name of the city, district, or town (e.g. "Salem", "Coimbatore", "Thanjavur", "Karnal", "Palakkad", "Ludhiana").'
                },
                latitude: {
                    type: Type.NUMBER,
                    description: 'Optional latitude coordinate.'
                },
                longitude: {
                    type: Type.NUMBER,
                    description: 'Optional longitude coordinate.'
                }
            },
            required: ['location']
        }
    },
    {
        name: 'get_farm_profile',
        description: 'Retrieve the farmer\'s registered farm profile including acreage, district, state, soil type, pH, drainage quality, and water source/irrigation method.',
        parameters: {
            type: Type.OBJECT,
            properties: {}
        }
    },
    {
        name: 'get_crop_lifecycle_and_stage',
        description: 'Retrieve the standing active crop, sowing date, current growth stage (planning, planting, germination, vegetative, flowering, fruiting, harvest, selling), days active, and expected harvest window.',
        parameters: {
            type: Type.OBJECT,
            properties: {}
        }
    },
    {
        name: 'get_farm_tasks_and_actions',
        description: 'Retrieve today\'s farm action checklist (irrigation, scouting, chemical spray, harvest), priority levels, completion status, and data rationale.',
        parameters: {
            type: Type.OBJECT,
            properties: {}
        }
    },
    {
        name: 'get_crop_recommendations',
        description: 'Run the agronomic crop recommendation engine to determine suitable crops ranked by suitability percentage based on season, soil, water availability, and budget.',
        parameters: {
            type: Type.OBJECT,
            properties: {
                season: {
                    type: Type.STRING,
                    description: 'Agricultural season: "kharif", "rabi", or "zaid".'
                },
                soilType: {
                    type: Type.STRING,
                    description: 'Soil type: "alluvial", "black", "red", "clay_loam", "sandy_loam", "laterite".'
                },
                waterAvailability: {
                    type: Type.STRING,
                    description: 'Water status: "abundant", "sufficient", "limited", "scarce".'
                },
                availableBudget: {
                    type: Type.NUMBER,
                    description: 'Total available farm budget in INR.'
                }
            }
        }
    },
    {
        name: 'get_market_prices',
        description: 'Retrieve wholesale agricultural APMC mandi benchmark prices (modal price, min, max, trend per quintal) and state procurement policies.',
        parameters: {
            type: Type.OBJECT,
            properties: {
                state: {
                    type: Type.STRING,
                    description: 'State name (e.g. "Tamil Nadu", "Kerala", "Karnataka", "Maharashtra", "Punjab", "Haryana", "Uttar Pradesh", "Andhra Pradesh").'
                },
                commodity: {
                    type: Type.STRING,
                    description: 'Optional commodity name (e.g. "paddy", "wheat", "cotton", "turmeric", "tomato").'
                }
            }
        }
    },
    {
        name: 'get_farm_risk_analysis',
        description: 'Evaluate real-time multi-factor farm risks across weather hazards, water scarcity, crop vulnerability, and market volatility.',
        parameters: {
            type: Type.OBJECT,
            properties: {}
        }
    },
    {
        name: 'calculate_what_if_scenario',
        description: 'Execute the deterministic farm economics simulation engine. Computes baseline vs simulated gross revenue, total operational cost, gross margin, breakeven price/kg, and risk rating when changing irrigation, price, yield, or costs.',
        parameters: {
            type: Type.OBJECT,
            properties: {
                irrigationReductionPct: {
                    type: Type.NUMBER,
                    description: 'Percentage reduction in irrigation water (e.g. 20 for 20% reduction).'
                },
                priceVariationPct: {
                    type: Type.NUMBER,
                    description: 'Percentage change in commodity selling price (e.g. -10 for 10% drop, 15 for 15% increase).'
                },
                yieldVariationPct: {
                    type: Type.NUMBER,
                    description: 'Percentage change in crop yield (e.g. -15 for 15% yield loss).'
                },
                costVariationPct: {
                    type: Type.NUMBER,
                    description: 'Percentage change in input costs (e.g. 10 for 10% inflation).'
                }
            }
        }
    },
    {
        name: 'calculate_resource_requirements',
        description: 'Calculate detailed agricultural resource requirements: total water in liters, NPK fertilizer in kg, labor person-days, and budget breakdown.',
        parameters: {
            type: Type.OBJECT,
            properties: {
                areaAcres: {
                    type: Type.NUMBER,
                    description: 'Farm area in acres.'
                },
                waterRequirementLevel: {
                    type: Type.STRING,
                    description: '"low", "medium", or "high".'
                }
            }
        }
    }
];
/**
 * Executes a tool called by Gemini AI and returns structured factual data.
 */
async function executeAgriTool(toolName, args, reqLocation) {
    const farm = dbStore.getFarms()[0];
    const farmer = dbStore.getFarmer();
    const soil = farm ? dbStore.getSoilProfile(farm.id) : undefined;
    const water = farm ? dbStore.getWaterProfile(farm.id) : undefined;
    const cycles = farm ? dbStore.getCropCycles(farm.id) : [];
    const activeCycle = cycles.find(c => c.status === 'active') || cycles[0];
    const crop = activeCycle?.crop;
    switch (toolName) {
        case 'get_weather': {
            const locQuery = args.location || reqLocation?.district || farm?.villageDistrict || 'Salem';
            let lat = args.latitude;
            let lon = args.longitude;
            let districtName = locQuery;
            if (!lat || !lon) {
                const geocoded = await geocodeLocationQuery(locQuery);
                lat = geocoded.latitude;
                lon = geocoded.longitude;
                districtName = geocoded.district;
            }
            const weatherRes = await fetchFarmWeather(lat, lon, districtName);
            const w = weatherRes.payload;
            return {
                result: {
                    location: districtName,
                    coordinates: { latitude: lat, longitude: lon },
                    current: {
                        temperatureCelsius: w.current.temperatureCelsius,
                        weatherDescription: w.current.weatherDescription,
                        rainProbabilityPct: w.current.rainProbabilityPct,
                        rainfallMm: w.current.rainfallMm,
                        humidityPct: w.current.humidityPct,
                        windSpeedKmh: w.current.windSpeedKmh
                    },
                    advisory: {
                        irrigationStatus: w.advisory.irrigationNotice.status,
                        irrigationAdvice: w.advisory.irrigationNotice.advice,
                        sprayingSuitable: w.advisory.sprayingNotice.isSuitable,
                        sprayingReason: w.advisory.sprayingNotice.reason
                    },
                    forecast7Days: w.daily.slice(0, 5).map(d => ({
                        date: d.date,
                        tempMax: d.tempMax,
                        tempMin: d.tempMin,
                        rainMm: d.precipitationMm,
                        rainProbPct: d.precipitationProbability,
                        condition: d.condition
                    }))
                },
                citation: `Open-Meteo Live Weather Telemetry: ${districtName} (${w.current.temperatureCelsius}°C, ${w.current.weatherDescription})`
            };
        }
        case 'get_farm_profile': {
            return {
                result: {
                    farmerName: farmer?.fullName || 'Registered Farmer',
                    farmName: farm?.farmName || 'Primary Farm',
                    totalAreaAcres: farm?.totalAreaAcres || 3.5,
                    location: `${farm?.villageDistrict || 'Coimbatore'}, ${farm?.stateProvince || 'Tamil Nadu'}`,
                    soil: {
                        soilType: soil?.soilType || 'alluvial',
                        phLevel: soil?.phLevel || 6.8,
                        drainageQuality: soil?.drainageQuality || 'well_drained'
                    },
                    water: {
                        waterSource: water?.waterSource || 'borewell',
                        availabilityStatus: water?.availabilityStatus || 'sufficient',
                        irrigationMethod: water?.irrigationMethod || 'drip'
                    }
                },
                citation: `AgriSense Farm Database: ${farm?.farmName || 'Holding'} (${soil?.soilType || 'alluvial'} soil, ${water?.waterSource || 'borewell'})`
            };
        }
        case 'get_crop_lifecycle_and_stage': {
            return {
                result: {
                    cropName: crop?.commonName || 'Wheat (Gehun)',
                    category: crop?.category || 'grain',
                    currentStage: activeCycle?.currentStage || 'vegetative',
                    sowingDate: activeCycle?.sowingDate || new Date().toISOString().split('T')[0],
                    expectedHarvestDate: activeCycle?.expectedHarvestDate || 'Upcoming',
                    plantedAreaAcres: activeCycle?.plantedAreaAcres || farm?.totalAreaAcres || 3.5,
                    waterRequirementLevel: crop?.waterRequirementLevel || 'medium',
                    averageYieldPerAcreKg: crop?.averageYieldPerAcreKg || 1800,
                    estimatedCostPerAcre: crop?.estimatedCostPerAcre || 14000
                },
                citation: `AgriSense Lifecycle Engine: ${crop?.commonName || 'Crop'} (Stage: ${activeCycle?.currentStage || 'vegetative'})`
            };
        }
        case 'get_farm_tasks_and_actions': {
            const tasks = dbStore.getTasks(farm?.id);
            return {
                result: {
                    totalTasks: tasks.length,
                    pendingTasks: tasks.filter(t => !t.completed).map(t => ({
                        id: t.id,
                        category: t.category,
                        title: t.title,
                        description: t.description,
                        priority: t.priority,
                        rationale: t.rationale
                    })),
                    completedTasksCount: tasks.filter(t => t.completed).length
                },
                citation: `AgriSense Action Center: ${tasks.filter(t => !t.completed).length} pending tasks`
            };
        }
        case 'get_crop_recommendations': {
            const recs = recommendCrops({
                soilType: args.soilType || soil?.soilType || 'alluvial',
                soilPh: args.soilPh || soil?.phLevel || 6.8,
                waterAvailability: args.waterAvailability || water?.availabilityStatus || 'sufficient',
                availableBudget: args.availableBudget || farmer?.approximateBudget || 50000,
                targetSeason: args.season || undefined
            });
            return {
                result: recs.slice(0, 4).map(r => ({
                    cropName: r.crop.commonName,
                    category: r.crop.category,
                    suitabilityScorePct: r.suitabilityScorePct,
                    suitabilityLevel: r.suitabilityLevel,
                    reasons: r.reasons,
                    potentialRisks: r.potentialRisks,
                    estimatedGrossMarginPerAcre: r.estimatedGrossMarginPerAcre
                })),
                citation: `AgriSense Agronomic Rule Engine: Top Match ${recs[0]?.crop.commonName || 'Crops'}`
            };
        }
        case 'get_market_prices': {
            const state = args.state || farm?.stateProvince || reqLocation?.state || 'Tamil Nadu';
            const intel = await getMarketIntelligence(state);
            let prices = intel.stateData.prices;
            if (args.commodity) {
                const comm = args.commodity.toLowerCase();
                prices = prices.filter(p => p.commodity.toLowerCase().includes(comm));
            }
            return {
                result: {
                    state: intel.stateData.state,
                    policy: intel.stateData.stateSummary.procurementPolicy,
                    prices: prices.slice(0, 6).map(p => ({
                        commodity: p.commodity,
                        market: p.marketName,
                        modalPricePerQuintal: p.modalPricePerQuintal,
                        minPrice: p.minPrice,
                        maxPrice: p.maxPrice,
                        trend: p.trend,
                        date: p.dateRecorded
                    })),
                    considerations: intel.stateData.sellingConsiderations
                },
                citation: `${intel.provenance.source} (${state})`
            };
        }
        case 'get_farm_risk_analysis': {
            const farmLat = reqLocation?.latitude || farm?.latitude || 11.0168;
            const farmLon = reqLocation?.longitude || farm?.longitude || 76.9558;
            const farmDist = reqLocation?.district || farm?.villageDistrict || 'Coimbatore';
            const weatherRes = await fetchFarmWeather(farmLat, farmLon, farmDist);
            const farmObj = farm || {
                id: 'farm-default',
                farmerId: farmer?.id || 'farmer-default',
                farmName: 'Primary Farm',
                totalAreaAcres: 3.5,
                villageDistrict: farmDist,
                stateProvince: 'Tamil Nadu',
                latitude: farmLat,
                longitude: farmLon,
                country: 'India',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            const risk = evaluateFarmRisks(farmObj, activeCycle, weatherRes.payload, water);
            return {
                result: {
                    overallRiskScore: risk.overallRiskScore,
                    overallRiskLevel: risk.overallRiskLevel,
                    categories: risk.riskCategories,
                    activeRisks: risk.activeRisks.map(r => ({
                        title: r.title,
                        severity: r.severity,
                        description: r.description,
                        recommendedMitigation: r.recommendedMitigation
                    }))
                },
                citation: `AgriSense Multi-Factor Risk Center (Score: ${risk.overallRiskScore}/100 - ${risk.overallRiskLevel})`
            };
        }
        case 'calculate_what_if_scenario': {
            const area = farm?.totalAreaAcres || 3.5;
            const yieldKg = crop?.averageYieldPerAcreKg || 1800;
            const costPerAcre = crop?.estimatedCostPerAcre || 14000;
            const pricePerKg = 24;
            const whatIfResult = calculateWhatIfScenario({
                areaAcres: area,
                expectedYieldKgPerAcre: yieldKg,
                sellingPricePerKg: pricePerKg,
                seedCostPerAcre: costPerAcre * 0.16,
                fertilizerCostPerAcre: costPerAcre * 0.26,
                pesticideCostPerAcre: costPerAcre * 0.12,
                labourCostPerAcre: costPerAcre * 0.28,
                irrigationCostPerAcre: costPerAcre * 0.10,
                otherCostPerAcre: costPerAcre * 0.08,
                irrigationReductionPct: args.irrigationReductionPct || 0,
                priceVariationPct: args.priceVariationPct || 0,
                yieldVariationPct: args.yieldVariationPct || 0,
                costVariationPct: args.costVariationPct || 0
            });
            return {
                result: {
                    baseline: whatIfResult.baseline,
                    simulated: whatIfResult.simulated,
                    delta: whatIfResult.delta
                },
                citation: `AgriSense Deterministic What-If Engine (FAO-33 Response Index)`
            };
        }
        case 'calculate_resource_requirements': {
            const area = args.areaAcres || farm?.totalAreaAcres || 3.5;
            const waterLevel = args.waterRequirementLevel || crop?.waterRequirementLevel || 'medium';
            const cost = crop?.estimatedCostPerAcre || 18000;
            const resources = calculateResourceRequirements(area, waterLevel, cost);
            return {
                result: resources,
                citation: `AgriSense Resource Engine: ${area} acres (${resources.totalWaterLiters.toLocaleString()} L water)`
            };
        }
        default:
            return {
                result: { error: `Tool ${toolName} not found` },
                citation: ''
            };
    }
}
/**
 * Handles conversational queries via Google's @google/genai SDK with autonomous tool use.
 */
export async function askFarmCopilot(userQuestion, reqLanguage, reqLocation) {
    const isMalayalam = (reqLanguage === 'ml') || /[\u0D00-\u0D7F]/.test(userQuestion);
    const isTamil = !isMalayalam && ((reqLanguage === 'ta') || /[\u0B80-\u0BFF]/.test(userQuestion));
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (!apiKey) {
        const missingKeyNotice = isTamil
            ? `⚠️ **Google Gemini AI சாவி தேவைப்படுகிறது**\n\nAgriSense நேரடி மற்றும் புதுமையான AI பதில்களை உருவாக்க Google Gemini API ஐப் பயன்படுத்துகிறது. \n\n\`server/.env\` கோப்பில் \`GEMINI_API_KEY\` இன்னும் சேர்க்கப்படவில்லை.\n\n**செயல்படுத்தும் முறை:**\n1. [Google AI Studio](https://aistudio.google.com/app/apikey) இல் இலவச Gemini API Key பெறவும்.\n2. \`server/.env\` கோப்பில் சேர்க்கவும்:\n   \`\`\`env\n   GEMINI_API_KEY=உங்கள்_api_சாவி\n   \`\`\`\n3. சேவையகத்தை மீண்டும் இயக்கவும்.`
            : isMalayalam
                ? `⚠️ **Google Gemini AI കീ ആവശ്യമാണ്**\n\nAgriSense തത്സമയ സംഭാഷണ AI-യ്ക്കായി Google Gemini API ഉപയോഗിക്കുന്നു. \n\n\`server/.env\` ഫയലിൽ \`GEMINI_API_KEY\` സജ്ജീകരിച്ചിട്ടില്ല.\n\n**പ്രവർത്തിപ്പിക്കാനുള്ള ഘട്ടങ്ങൾ:**\n1. [Google AI Studio](https://aistudio.google.com/app/apikey) ൽ നിന്ന് സൌജന്യ Gemini API Key എടുക്കുക.\n2. \`server/.env\` ഫയലിൽ ചേർക്കുക:\n   \`\`\`env\n   GEMINI_API_KEY=നിങ്ങളുടെ_api_കീ\n   \`\`\`\n3. സെർവർ റീസ്റ്റാർട്ട് ചെയ്യുക.`
                : `⚠️ **Google Gemini API Key Required**\n\nAgriSense is configured to use Google's real-time **Gemini AI** for dynamic, generative agricultural intelligence. No API key was found in \`server/.env\`.\n\n**To activate live Gemini AI:**\n1. Get a free API key from [Google AI Studio](https://aistudio.google.com/app/apikey)\n2. Add it to \`server/.env\`:\n   \`\`\`env\n   GEMINI_API_KEY=your_api_key_here\n   \`\`\`\n3. Restart or reload your server to chat dynamically with Gemini!`;
        const assistantMsg = {
            id: `msg-${Date.now()}`,
            conversationId: 'default-conv',
            role: 'assistant',
            content: missingKeyNotice,
            createdAt: new Date().toISOString(),
            groundingCitations: []
        };
        dbStore.addMessage(assistantMsg);
        return {
            message: assistantMsg,
            provenance: {
                source: 'AgriSense System Configuration',
                timestamp: new Date().toISOString(),
                mode: 'NOT_CONFIGURED'
            }
        };
    }
    const languageDirective = isMalayalam
        ? 'Respond fluently, warmly, and naturally in Malayalam (മലയാളം).'
        : isTamil
            ? 'Respond fluently, warmly, and naturally in Tamil (தமிழ்).'
            : 'Respond warmly, clearly, and concisely in English (or the language the farmer uses).';
    const AGRISENSE_SYSTEM_INSTRUCTION = `You are AgriSense AI, an intelligent, application-aware agricultural decision-support agent.

CORE INSTRUCTIONS:
1. You have access to real-time tools for weather, farm profile, standing crop, tasks, crop recommendations, market prices, farm risks, and what-if calculations.
2. ALWAYS use your tools to retrieve facts before answering questions that involve:
   - Weather or temperature in any location: call "get_weather".
   - Irrigation advice or "should I irrigate today": retrieve farm profile, crop, and weather first!
   - What happens if irrigation is reduced, or prices change: call "calculate_what_if_scenario" using the exact parameters. Never invent or hallucinate calculation numbers!
   - Crop recommendations: call "get_crop_recommendations".
   - Market or mandi prices: call "get_market_prices".
   - Farm risks or active hazards: call "get_farm_risk_analysis".
   - Scheduled farm tasks: call "get_farm_tasks_and_actions".
3. NEVER claim to know information you did not retrieve. Never fabricate market prices, weather conditions, or financial margins.
4. If a question is a general agronomy or scientific question (e.g. photosythesis, yellowing leaves causes, pest management), answer clearly with expert agronomic guidance.
5. Language instruction: ${languageDirective}
6. Keep answers actionable, practical, respectful, and direct.`;
    const storedMessages = dbStore.getMessages();
    const geminiHistory = buildGeminiHistory(storedMessages, userQuestion);
    const ai = new GoogleGenAI({ apiKey });
    const modelsToTry = [
        process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite',
        'gemini-3.8-flash',
        'gemini-3.5-flash',
        'gemini-flash-latest'
    ];
    let replyText = '';
    const executedCitations = [];
    let lastError = null;
    for (const modelName of modelsToTry) {
        try {
            const chat = ai.chats.create({
                model: modelName,
                config: {
                    systemInstruction: AGRISENSE_SYSTEM_INSTRUCTION,
                    temperature: 0.4,
                    tools: [{ functionDeclarations: AGRI_TOOLS_DECLARATIONS }]
                },
                history: geminiHistory
            });
            let currentResponse = await chat.sendMessage({
                message: userQuestion
            });
            // Tool execution loop (up to 4 multi-step iterations)
            let iterations = 0;
            while (currentResponse && currentResponse.functionCalls && currentResponse.functionCalls.length > 0 && iterations < 4) {
                iterations++;
                const functionResponses = [];
                for (const call of currentResponse.functionCalls) {
                    const toolName = call.name || '';
                    if (!toolName)
                        continue;
                    const { result, citation } = await executeAgriTool(toolName, call.args || {}, reqLocation);
                    if (citation && !executedCitations.includes(citation)) {
                        executedCitations.push(citation);
                    }
                    functionResponses.push({
                        functionResponse: {
                            ...(call.id ? { id: call.id } : {}),
                            name: toolName,
                            response: result
                        }
                    });
                }
                currentResponse = await chat.sendMessage({
                    message: functionResponses
                });
            }
            if (currentResponse && currentResponse.text) {
                replyText = currentResponse.text;
                break;
            }
        }
        catch (err) {
            lastError = err;
            console.warn(`[GeminiService] Model ${modelName} returned error:`, err?.message || err);
            if (err?.message?.includes('API_KEY_INVALID') || err?.status === 400 || err?.status === 403) {
                break;
            }
        }
    }
    if (!replyText) {
        let errorExplanation = 'AgriSense AI was unable to generate a response at this moment. Please check your connection and try again.';
        const errMsg = lastError?.message || '';
        if (errMsg.includes('API_KEY_INVALID') || errMsg.includes('401') || errMsg.includes('403')) {
            errorExplanation = 'The configured `GEMINI_API_KEY` is invalid or unauthorized. Please verify your API key in Google AI Studio.';
        }
        else if (errMsg.includes('429') || errMsg.includes('RESOURCE_EXHAUSTED') || errMsg.includes('Quota')) {
            errorExplanation = 'Gemini API quota exceeded. Please wait a moment and try again.';
        }
        else if (errMsg.includes('503') || errMsg.includes('UNAVAILABLE')) {
            errorExplanation = 'The Gemini AI model is experiencing high demand. Please try again in a few moments.';
        }
        const assistantMsg = {
            id: `msg-${Date.now()}`,
            conversationId: 'default-conv',
            role: 'assistant',
            content: `⚠️ **AI Service Notice**\n\n${errorExplanation}`,
            createdAt: new Date().toISOString(),
            groundingCitations: []
        };
        dbStore.addMessage(assistantMsg);
        return {
            message: assistantMsg,
            provenance: {
                source: 'AgriSense Copilot Service',
                timestamp: new Date().toISOString(),
                mode: 'NOT_CONFIGURED'
            }
        };
    }
    const farm = dbStore.getFarms()[0];
    const activeCycle = dbStore.getCropCycles(farm?.id).find(c => c.status === 'active');
    const action = extractActionFromIntent(userQuestion, { farmer: dbStore.getFarmer() });
    const assistantMsg = {
        id: `msg-${Date.now()}`,
        conversationId: 'default-conv',
        role: 'assistant',
        content: replyText,
        createdAt: new Date().toISOString(),
        contextSnapshot: {
            farmName: farm?.farmName || 'Primary Farm',
            cropName: activeCycle?.crop?.commonName,
            stage: activeCycle?.currentStage,
            weatherSummary: reqLocation?.district ? `${reqLocation.district}` : undefined
        },
        groundingCitations: executedCitations,
        action: action || undefined
    };
    dbStore.addMessage(assistantMsg);
    return {
        message: assistantMsg,
        provenance: {
            source: `Google Gemini AI (${executedCitations.length > 0 ? 'Tool Augmented' : 'Direct Grounded'})`,
            timestamp: new Date().toISOString(),
            mode: 'LIVE'
        }
    };
}
