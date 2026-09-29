import { Router } from 'express';
import { analyzeCropDisease } from '../services/ai/disease.service.js';
import { dbStore } from '../services/db/store.js';
export const healthRouter = Router();
// GET /api/health - System Healthcheck & Service Status Contract
healthRouter.get('/', (_req, res) => {
    res.json({
        success: true,
        data: {
            status: 'healthy',
            service: 'AgriSense API Gateway',
            version: '1.0.0',
            timestamp: new Date().toISOString(),
            integrations: {
                weather: { provider: 'Open-Meteo', status: 'ready' },
                gemini: { provider: 'Google GenAI', status: process.env.GEMINI_API_KEY ? 'configured' : 'not_configured' },
                market: { provider: 'AgriSense Market Engine', status: process.env.MARKET_API_MODE || 'LIVE' },
                database: { provider: process.env.SUPABASE_URL ? 'Supabase' : 'Local Persistence', status: 'ready' }
            }
        },
        provenance: {
            source: 'AgriSense System Telemetry',
            timestamp: new Date().toISOString(),
            mode: 'LIVE'
        }
    });
});
// GET /api/health/scans - Retrieve Past Disease Scans for Farm
healthRouter.get('/scans', (req, res) => {
    try {
        const { farmId } = req.query;
        const farm = farmId ? dbStore.getFarmById(String(farmId)) : dbStore.getFarms()[0];
        const scans = dbStore.getDiseaseScans(farm?.id);
        res.json({
            success: true,
            data: scans,
            provenance: {
                source: 'AgriSense Disease Registry',
                timestamp: new Date().toISOString(),
                mode: 'LIVE'
            }
        });
    }
    catch (err) {
        const msg = err instanceof Error ? err.message : 'Error fetching scans';
        res.status(500).json({
            success: false,
            error: {
                code: 'SCAN_RETRIEVAL_ERROR',
                message: msg,
                userFacingMessage: 'Failed to retrieve scan history.'
            },
            provenance: {
                source: 'AgriSense Health Gateway',
                timestamp: new Date().toISOString(),
                mode: 'LIVE'
            }
        });
    }
});
// POST /api/health/analyze-disease - Real Plant Disease Image Diagnosis
healthRouter.post('/analyze-disease', async (req, res) => {
    try {
        const { farmId, cropId, cropName, stage, affectedPart, symptomDescription, imageBase64, imageMimeType, language } = req.body;
        if (!affectedPart) {
            res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_FAILED',
                    message: 'affectedPart is mandatory (leaves, stem, roots, fruit)',
                    userFacingMessage: 'Please specify the affected plant part.'
                },
                provenance: {
                    source: 'AgriSense Validation Gateway',
                    timestamp: new Date().toISOString(),
                    mode: 'LIVE'
                }
            });
            return;
        }
        const farm = farmId ? dbStore.getFarmById(farmId) : dbStore.getFarms()[0];
        const targetFarmId = farm?.id || 'farm-default';
        const result = await analyzeCropDisease({
            farmId: targetFarmId,
            cropId,
            cropName,
            stage,
            affectedPart,
            symptomDescription,
            imageBase64,
            imageMimeType,
            language
        });
        res.json({
            success: true,
            data: result.scan,
            provenance: result.provenance
        });
    }
    catch (err) {
        const msg = err instanceof Error ? err.message : 'Disease analysis failed';
        const isConfigError = msg.includes('API Key is required') || msg.includes('not configured');
        res.status(isConfigError ? 400 : 500).json({
            success: false,
            error: {
                code: isConfigError ? 'GEMINI_NOT_CONFIGURED' : 'DISEASE_ANALYSIS_ERROR',
                message: msg,
                userFacingMessage: isConfigError
                    ? 'Google Gemini API key is not configured in server/.env. Please configure GEMINI_API_KEY to enable AI disease analysis.'
                    : 'Disease diagnostic service encountered an issue. Please try with a clearer photo or try again.'
            },
            provenance: {
                source: 'AgriSense Pathology Engine',
                timestamp: new Date().toISOString(),
                mode: isConfigError ? 'NOT_CONFIGURED' : 'LIVE'
            }
        });
    }
});
