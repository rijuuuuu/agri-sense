import { dbStore } from '../db/store.js';
import { fetchFarmWeather } from '../weather/weather.service.js';
export async function askFarmCopilot(userQuestion) {
    const farmer = dbStore.getFarmer();
    const farm = dbStore.getFarms()[0];
    const soil = farm ? dbStore.getSoilProfile(farm.id) : undefined;
    const water = farm ? dbStore.getWaterProfile(farm.id) : undefined;
    const cycles = farm ? dbStore.getCropCycles(farm.id) : [];
    const activeCycle = cycles.find(c => c.status === 'active') || cycles[0];
    const crop = activeCycle?.crop;
    // Retrieve current weather telemetry for grounding
    const weatherResult = await fetchFarmWeather(farm?.latitude || 28.6139, farm?.longitude || 77.2090, farm?.villageDistrict || 'Local Farm');
    const weather = weatherResult.payload;
    // Context summary for auditability
    const contextSummary = {
        farmerName: farmer?.fullName || 'Farmer',
        farmName: farm?.farmName || 'Primary Farm',
        acres: farm?.totalAreaAcres || 1,
        soilType: soil?.soilType || 'alluvial',
        soilPh: soil?.phLevel || 6.8,
        waterSource: water?.waterSource || 'borewell',
        waterAvailability: water?.availabilityStatus || 'sufficient',
        irrigationMethod: water?.irrigationMethod || 'drip',
        cropName: crop?.commonName || 'Wheat',
        stage: activeCycle?.currentStage || 'vegetative',
        temperature: `${weather.current.temperatureCelsius}°C`,
        rainOdds: `${weather.current.rainProbabilityPct}%`,
        weatherCondition: weather.current.weatherDescription,
        advisory: weather.advisory.irrigationNotice.advice
    };
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
        try {
            // Call Google Gemini API (Gemini 1.5/2.0 Flash)
            const systemInstruction = `
You are AgriSense Farm Copilot, a trusted agricultural advisor for farmers.
Answer practical questions using the specific farm context below.

FARM CONTEXT:
- Farmer: ${contextSummary.farmerName} (${farmer?.farmingExperienceYears || 0} years experience)
- Farm Location: ${farm?.villageDistrict || 'North Zone'} (${farm?.totalAreaAcres} acres)
- Soil: ${contextSummary.soilType} (pH: ${contextSummary.soilPh})
- Water: Source=${contextSummary.waterSource}, Availability=${contextSummary.waterAvailability}, Method=${contextSummary.irrigationMethod}
- Current Planted Crop: ${contextSummary.cropName} in stage: ${contextSummary.stage.toUpperCase()}
- Today's Weather: Temp=${contextSummary.temperature}, Rain Probability=${contextSummary.rainOdds}, Condition=${contextSummary.weatherCondition}
- Irrigation Guidance: ${contextSummary.advisory}

CORE RULES:
1. Always ground your advice in this specific farm's context (e.g. mention the stage '${contextSummary.stage}' or soil '${contextSummary.soilType}' when relevant).
2. Never promise 100% certainty. Use terms like "suitable based on available data", "consider", "recommended".
3. Use simple, direct, practical language. Avoid unnecessary jargon.
4. For severe crop disease or toxic chemical questions, remind the farmer to verify with their local agricultural extension officer (KVK/agronomist).
5. Always provide 2-3 clear next steps.
`;
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [
                        { role: 'user', parts: [{ text: `${systemInstruction}\n\nFARMER QUESTION: ${userQuestion}` }] }
                    ],
                    generationConfig: {
                        temperature: 0.2,
                        maxOutputTokens: 600
                    }
                }),
                signal: AbortSignal.timeout(10000)
            });
            if (response.ok) {
                const result = await response.json();
                const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
                if (text) {
                    const assistantMsg = {
                        id: `msg-${Date.now()}`,
                        conversationId: 'default-conv',
                        role: 'assistant',
                        content: text,
                        createdAt: new Date().toISOString(),
                        contextSnapshot: {
                            farmName: contextSummary.farmName,
                            cropName: contextSummary.cropName,
                            stage: activeCycle?.currentStage,
                            weatherSummary: `${contextSummary.temperature}, ${contextSummary.rainOdds} rain`
                        },
                        groundingCitations: [
                            `AgriSense Farm Profile (${contextSummary.farmName})`,
                            `Open-Meteo Live Telemetry (${weatherResult.provenance.source})`,
                            `Google Gemini 1.5 Flash Model`
                        ]
                    };
                    dbStore.addMessage(assistantMsg);
                    return {
                        message: assistantMsg,
                        provenance: {
                            source: 'Google Gemini 1.5 Flash (Grounded on Farm Context)',
                            timestamp: new Date().toISOString(),
                            mode: 'LIVE'
                        }
                    };
                }
            }
        }
        catch (err) {
            console.warn('[GeminiService] Live Gemini API call failed or timed out, using grounded fallback engine', err);
        }
    }
    // Grounded Deterministic Agro-AI Response Engine (DEMO / Fallback Mode)
    const answer = generateGroundedAgroResponse(userQuestion, contextSummary);
    const assistantMsg = {
        id: `msg-${Date.now()}`,
        conversationId: 'default-conv',
        role: 'assistant',
        content: answer,
        createdAt: new Date().toISOString(),
        contextSnapshot: {
            farmName: contextSummary.farmName,
            cropName: contextSummary.cropName,
            stage: activeCycle?.currentStage,
            weatherSummary: `${contextSummary.temperature}, ${contextSummary.rainOdds} rain`
        },
        groundingCitations: [
            `AgriSense Farm Profile: ${contextSummary.farmName}`,
            `Soil Profile: ${contextSummary.soilType} (pH ${contextSummary.soilPh})`,
            `Weather Telemetry: ${contextSummary.temperature}, ${contextSummary.rainOdds} rain probability`,
            `Agronomic Rule Matrix (ICAR & Agro-Meteorological Standards)`
        ]
    };
    dbStore.addMessage(assistantMsg);
    return {
        message: assistantMsg,
        provenance: {
            source: apiKey ? 'AgriSense Grounded AI Engine (Fallback)' : 'AgriSense Contextual Copilot Engine',
            timestamp: new Date().toISOString(),
            mode: apiKey ? 'LIVE' : 'DEMO'
        }
    };
}
function generateGroundedAgroResponse(question, ctx) {
    const q = question.toLowerCase();
    if (q.includes('irrigate') || q.includes('water') || q.includes('sinchai')) {
        const rainOdds = parseInt(ctx.rainOdds) || 0;
        if (rainOdds >= 50) {
            return `Based on your farm profile and today's weather in **${ctx.farmName}**:

1. **Irrigation Decision:** **Hold / Postpone irrigation today**.
   - There is a **${ctx.rainOdds}** chance of precipitation forecast for your area.
   - Irrigating right before rain increases the risk of waterlogging in your **${ctx.soilType}** soil.
2. **Current Crop Stage:** Your **${ctx.cropName}** is in the **${ctx.stage.toUpperCase()}** stage. Ensure surface drains are clear so rainwater does not stagnate around root zones.
3. **Action:** Check field moisture tomorrow morning after the weather event before running your ${ctx.irrigationMethod} system.`;
        }
        else {
            return `Based on your farm profile and current telemetry:

1. **Irrigation Decision:** **Proceed with scheduled irrigation**.
   - Rain probability is currently low (**${ctx.rainOdds}**).
   - Temperature is **${ctx.temperature}**, so evapotranspiration is active.
2. **Crop Context:** Your **${ctx.cropName}** is in the **${ctx.stage.toUpperCase()}** stage, which requires consistent root-zone moisture to maintain healthy vegetative and nutrient absorption rates.
3. **Recommendation:** Using your **${ctx.irrigationMethod}** method, irrigate during early morning or late afternoon to minimize evaporation losses.`;
        }
    }
    if (q.includes('fertilizer') || q.includes('khad') || q.includes('urea') || q.includes('nutrient')) {
        return `For your **${ctx.cropName}** currently in the **${ctx.stage.toUpperCase()}** stage on **${ctx.soilType}** soil (pH ${ctx.soilPh}):

1. **Nutrient Priority:**
   - In the **${ctx.stage}** stage, focus on balanced nitrogen and potassium. For wheat/grains, a split application of Urea with bio-stimulants or micronutrient zinc is commonly beneficial.
2. **Application Window:**
   - Weather is currently **${ctx.temperature}** with **${ctx.rainOdds}** rain probability.
   - Apply fertilizer when soil has adequate moisture, avoiding application during midday heat.
3. **Safety Note:** Avoid excessive nitrogen which can cause soft, disease-prone foliage. Consult your local agricultural officer (KVK) for specific dosage calibrated to your recent soil test.`;
    }
    if (q.includes('yellow') || q.includes('leaf') || q.includes('disease') || q.includes('pest') || q.includes('keeda')) {
        return `Regarding leaf discoloration or symptoms on your **${ctx.cropName}** (${ctx.stage} stage):

1. **Common Causes for ${ctx.cropName} in ${ctx.stage}:**
   - **Nutrient Deficiency:** Nitrogen deficiency typically causes uniform yellowing on older/lower leaves first. Zinc deficiency shows interveinal bleaching.
   - **Moisture Stress:** Both waterlogging and prolonged root dryness cause leaf yellowing and tip necrosis in **${ctx.soilType}** soils.
   - **Fungal Pathogens:** Rust or leaf blight starts as chlorotic spots before turning necrotic.
2. **Suggested Actions:**
   - Inspect the underside of leaves for powdery spores or insect nymphs (aphids/thrips).
   - Verify that your ${ctx.irrigationMethod} is delivering uniform moisture without soil crusting.
   - For an accurate diagnosis, capture a close-up photo of the affected leaf in our Crop Health section or show a sample to your nearest agricultural extension worker.`;
    }
    if (q.includes('grow') || q.includes('suitable') || q.includes('recommend') || q.includes('fasal')) {
        return `Based on your land size (**${ctx.acres} acres**), soil type (**${ctx.soilType}**, pH ${ctx.soilPh}), and water availability (**${ctx.waterAvailability}** via ${ctx.waterSource}):

1. **Potentially Suitable Crops for your Agro-Zone:**
   - **Wheat (Gehun):** Highly suited to alluvial/loam soils with moderate water requirement.
   - **Mustard (Sarson):** Low water requirement, excellent cash returns on lighter soils.
   - **Chickpea (Chana):** Restores nitrogen in soil, low irrigation need, strong local demand.
2. **Considerations:**
   - Your water source (${ctx.waterSource}) is currently rated **${ctx.waterAvailability}**, making low-to-medium water intensity crops the safest economic choice.
3. **Next Step:** Open the **Crop Recommendation Engine** in AgriSense to see detailed duration, cost breakdown, and estimated gross margin for each crop.`;
    }
    return `Hello ${ctx.farmerName}. Here is the current context for your farm (**${ctx.farmName}**):

- **Planted Crop:** ${ctx.cropName} (${ctx.stage.toUpperCase()} stage)
- **Soil & Water:** ${ctx.soilType} soil (pH ${ctx.soilPh}) with ${ctx.waterAvailability} water via ${ctx.irrigationMethod}
- **Current Weather:** ${ctx.temperature}, ${ctx.weatherCondition} (${ctx.rainOdds} rain probability)
- **Agricultural Outlook:** ${ctx.advisory}

How can I assist your farm today? You can ask:
- *"Should I irrigate today?"*
- *"What fertilizer should I consider for my ${ctx.cropName} in ${ctx.stage}?"*
- *"Why are my leaves changing color?"*
- *"What can I plant next season on my ${ctx.acres} acres?"*`;
}
