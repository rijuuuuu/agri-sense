import { GoogleGenAI } from '@google/genai';
import { dbStore } from '../db/store.js';
export async function analyzeCropDisease(request) {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (!apiKey) {
        throw new Error('Google Gemini API Key is required for live disease scanning and AI vision diagnosis. Please configure GEMINI_API_KEY in server/.env.');
    }
    const ai = new GoogleGenAI({ apiKey });
    const crop = request.cropName || 'Standing Crop';
    const stage = request.stage || 'vegetative';
    const part = request.affectedPart || 'leaves';
    const notes = request.symptomDescription ? `User observed symptoms: "${request.symptomDescription}".` : '';
    const prompt = `You are a world-class agricultural plant pathologist and entomologist.
Analyze this crop image and diagnosis request.

Crop context:
- Standing Crop: ${crop}
- Growth Stage: ${stage}
- Affected Plant Anatomy: ${part}
${notes}

Respond strictly in valid JSON matching this schema:
{
  "condition": "Specific suspected disease, pest, or nutrient deficiency name",
  "conditionScientific": "Scientific binomial name of pathogen or scientific cause (e.g. Puccinia striiformis)",
  "confidencePct": 78, // Realistic confidence integer from 25 to 95 based on visual clarity
  "confidenceRating": "High" | "Moderate" | "Low / Uncertain",
  "uncertaintyFactors": "Explicit explanation of any visual ambiguities (e.g. leaf glare, symptom overlap with potassium deficiency vs fungal blight, angle limitations)",
  "observations": [
    "Specific symptom 1 visible on the sample",
    "Specific symptom 2 visible on the sample"
  ],
  "recommendedActions": [
    "Step 1: Immediate physical/cultural isolation or moisture adjustment",
    "Step 2: Recommended organic or bio-fungicide/pesticide intervention calibrated for ${stage} stage",
    "Step 3: Verification step"
  ],
  "preventionTips": [
    "Preventative measure 1 for future irrigation or crop spacing"
  ],
  "requiresExtensionVerification": true,
  "safetyNotice": "Disclaimer emphasizing that critical agrochemical applications must be verified by local agricultural extension officers (KVK / Agronomist)."
}
Do not include markdown code block ticks (\`\`\`json) if possible, or provide raw JSON only.`;
    const contents = [];
    if (request.imageBase64) {
        const rawData = request.imageBase64.includes(',')
            ? request.imageBase64.split(',')[1]
            : request.imageBase64;
        const mimeType = request.imageMimeType || 'image/jpeg';
        contents.push({
            inlineData: {
                data: rawData,
                mimeType
            }
        });
    }
    contents.push({
        text: prompt
    });
    const modelsToTry = [
        process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite',
        'gemini-3.8-flash',
        'gemini-3.5-flash',
        'gemini-flash-latest'
    ];
    let parsed = null;
    let lastError = null;
    for (const modelName of modelsToTry) {
        try {
            const response = await ai.models.generateContent({
                model: modelName,
                contents,
                config: {
                    temperature: 0.2
                }
            });
            const text = response?.text?.trim() || '';
            const cleanJson = text.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
            parsed = JSON.parse(cleanJson);
            break;
        }
        catch (err) {
            lastError = err;
            console.warn(`[DiseaseService] Model ${modelName} returned error:`, err?.message || err);
            if (err?.message?.includes('API_KEY_INVALID'))
                break;
        }
    }
    if (!parsed || !parsed.condition) {
        throw new Error(`AI Disease analysis failed: ${lastError?.message || 'Unable to parse diagnostic response from Gemini Vision'}`);
    }
    const scanRecord = {
        id: `scan-${Date.now()}`,
        farmId: request.farmId,
        cropId: request.cropId,
        cropName: crop,
        stage: request.stage,
        affectedPart: request.affectedPart,
        condition: parsed.condition,
        conditionScientific: parsed.conditionScientific,
        confidencePct: Number(parsed.confidencePct) || 70,
        confidenceRating: parsed.confidenceRating || 'Moderate',
        uncertaintyFactors: parsed.uncertaintyFactors || 'Visual assessment based on uploaded photo; laboratory confirmation advised.',
        observations: Array.isArray(parsed.observations) ? parsed.observations : [parsed.condition],
        recommendedActions: Array.isArray(parsed.recommendedActions) ? parsed.recommendedActions : [],
        preventionTips: Array.isArray(parsed.preventionTips) ? parsed.preventionTips : [],
        requiresExtensionVerification: Boolean(parsed.requiresExtensionVerification),
        safetyNotice: parsed.safetyNotice || 'Always verify with your local agricultural extension officer (KVK) before applying scheduled chemical sprays.',
        imageUrl: request.imageBase64 ? (request.imageBase64.length < 50000 ? request.imageBase64 : undefined) : undefined,
        timestamp: new Date().toISOString()
    };
    dbStore.saveDiseaseScan(scanRecord);
    return {
        scan: scanRecord,
        provenance: {
            source: 'Google Gemini Multimodal AI Vision & Agronomic Pathology',
            timestamp: new Date().toISOString(),
            mode: 'LIVE'
        }
    };
}
