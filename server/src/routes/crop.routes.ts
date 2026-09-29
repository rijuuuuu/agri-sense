import { Router, Request, Response } from 'express';
import { dbStore } from '../services/db/store.js';
import { recommendCrops } from '../domain/agronomy/recommendation.engine.js';
import type { SoilType, WaterAvailability, AgriculturalSeason } from '@agrisense/shared';

export const cropRouter = Router();

// Get All Master Reference Crops
cropRouter.get('/', (_req: Request, res: Response) => {
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
cropRouter.post('/recommend', (req: Request, res: Response) => {
  try {
    const { soilType, soilPh, waterAvailability, availableBudget, season, month } = req.body;

    const recommendations = recommendCrops({
      soilType: soilType as SoilType,
      soilPh: soilPh ? Number(soilPh) : undefined,
      waterAvailability: waterAvailability as WaterAvailability,
      availableBudget: availableBudget ? Number(availableBudget) : undefined,
      targetSeason: season as AgriculturalSeason,
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
  } catch (err: unknown) {
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
