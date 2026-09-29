import { Router } from 'express';
import { dbStore } from '../services/db/store.js';
import { recommendCrops } from '../domain/agronomy/recommendation.engine.js';
export const cropRouter = Router();
// Get All Master Reference Crops
cropRouter.get('/', (_req, res) => {
    const crops = dbStore.getCrops();
    res.json({
        success: true,
        data: crops,
        provenance: {
            source: 'AgriSense Agronomic Master Knowledge Base',
            timestamp: new Date().toISOString(),
            mode: 'LIVE'
        }
    });
});
// Run Crop Recommendation Engine
cropRouter.post('/recommend', (req, res) => {
    try {
        const { soilType, soilPh, waterAvailability, availableBudget, season, month } = req.body;
        const recommendations = recommendCrops({
            soilType: soilType,
            soilPh: soilPh ? Number(soilPh) : undefined,
            waterAvailability: waterAvailability,
            availableBudget: availableBudget ? Number(availableBudget) : undefined,
            targetSeason: season,
            currentMonth: month ? Number(month) : undefined
        });
        res.json({
            success: true,
            data: recommendations,
            provenance: {
                source: 'AgriSense Agronomic Rule Engine (ICAR Standard Criteria)',
                timestamp: new Date().toISOString(),
                mode: 'LIVE'
            }
        });
    }
    catch (err) {
        const msg = err instanceof Error ? err.message : 'Recommendation error';
        res.status(500).json({
            success: false,
            error: {
                code: 'RECOMMENDATION_ERROR',
                message: msg,
                userFacingMessage: 'Unable to compute crop recommendations. Please check parameters and retry.'
            },
            provenance: {
                source: 'AgriSense Crop Engine',
                timestamp: new Date().toISOString(),
                mode: 'LIVE'
            }
        });
    }
});
