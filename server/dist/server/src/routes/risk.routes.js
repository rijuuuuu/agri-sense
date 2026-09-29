import { Router } from 'express';
import { dbStore } from '../services/db/store.js';
import { fetchFarmWeather } from '../services/weather/weather.service.js';
import { evaluateFarmRisks } from '../domain/risk/risk.engine.js';
export const riskRouter = Router();
// Evaluate Real-Time Farm Risk Matrix
riskRouter.get('/overview', async (req, res) => {
    try {
        const { farmId } = req.query;
        const farm = farmId ? dbStore.getFarmById(String(farmId)) : dbStore.getFarms()[0];
        if (!farm) {
            res.json({
                success: true,
                data: null,
                provenance: {
                    source: 'AgriSense Risk Center',
                    timestamp: new Date().toISOString(),
                    mode: 'LIVE'
                }
            });
            return;
        }
        const cycles = dbStore.getCropCycles(farm.id);
        const activeCycle = cycles.find(c => c.status === 'active') || cycles[0];
        const water = dbStore.getWaterProfile(farm.id);
        const weatherResult = await fetchFarmWeather(farm.latitude, farm.longitude, farm.villageDistrict);
        const riskAnalysis = evaluateFarmRisks(farm, activeCycle, weatherResult.payload, water);
        res.json({
            success: true,
            data: riskAnalysis,
            provenance: {
                source: 'AgriSense Multi-Factor Risk Engine (Formula-Based)',
                timestamp: new Date().toISOString(),
                mode: 'LIVE'
            }
        });
    }
    catch (err) {
        const msg = err instanceof Error ? err.message : 'Risk engine error';
        res.status(500).json({
            success: false,
            error: {
                code: 'RISK_ENGINE_ERROR',
                message: msg,
                userFacingMessage: 'Failed to compute farm risks.'
            },
            provenance: {
                source: 'AgriSense Risk Engine',
                timestamp: new Date().toISOString(),
                mode: 'LIVE'
            }
        });
    }
});
