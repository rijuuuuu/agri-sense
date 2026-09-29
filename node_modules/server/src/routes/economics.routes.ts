import { Router, Request, Response } from 'express';
import { calculateWhatIfScenario, calculateResourceRequirements } from '../domain/economics/economics.engine.js';
import type { WhatIfInput } from '@agrisense/shared';

export const economicsRouter = Router();

// What-If Scenario Calculation
economicsRouter.post('/what-if', (req: Request, res: Response) => {
  try {
    const input: WhatIfInput = req.body;

    if (!input || typeof input.areaAcres !== 'number' || typeof input.expectedYieldKgPerAcre !== 'number') {
      res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Invalid What-If calculation parameters',
          userFacingMessage: 'Please enter valid numerical farm economics parameters.'
        },
        provenance: {
          source: 'AgriSense Economics Gateway',
          timestamp: new Date().toISOString(),
          mode: 'LIVE'
        }
      });
      return;
    }

    const result = calculateWhatIfScenario(input);

    res.json({
      success: true,
      data: result,
      provenance: {
        source: 'AgriSense Deterministic Economics Engine',
        timestamp: new Date().toISOString(),
        mode: 'LIVE'
      }
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Economics calculation error';
    res.status(500).json({
      success: false,
      error: {
        code: 'CALCULATION_ERROR',
        message: msg,
        userFacingMessage: 'Failed to compute financial scenarios.'
      },
      provenance: {
        source: 'AgriSense Economics Gateway',
        timestamp: new Date().toISOString(),
        mode: 'LIVE'
      }
    });
  }
});

// Resource Requirements Estimation (Water, Fertilizer, Labor, Budget)
economicsRouter.post('/resources', (req: Request, res: Response) => {
  try {
    const { areaAcres, waterRequirementLevel, estimatedCostPerAcre } = req.body;
    const area = Number(areaAcres) || 1;
    const waterLevel = (waterRequirementLevel as 'low' | 'medium' | 'high') || 'medium';
    const costPerAcre = Number(estimatedCostPerAcre) || 18000;

    const requirements = calculateResourceRequirements(area, waterLevel, costPerAcre);

    res.json({
      success: true,
      data: requirements,
      provenance: {
        source: 'AgriSense Agronomic Resource Allocation Engine',
        timestamp: new Date().toISOString(),
        mode: 'LIVE'
      }
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Resource calculation error';
    res.status(500).json({
      success: false,
      error: {
        code: 'RESOURCE_CALCULATION_ERROR',
        message: msg,
        userFacingMessage: 'Failed to compute farm resource requirements.'
      },
      provenance: {
        source: 'AgriSense Economics Gateway',
        timestamp: new Date().toISOString(),
        mode: 'LIVE'
      }
    });
  }
});
