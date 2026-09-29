import { Router } from 'express';
import { calculateWhatIfScenario } from '../domain/economics/economics.engine.js';
export const economicsRouter = Router();
// What-If Scenario Calculation
economicsRouter.post('/what-if', (req, res) => {
    try {
        const input = req.body;
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
    }
    catch (err) {
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
