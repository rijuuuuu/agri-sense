import { Router } from 'express';
import { getMarketIntelligence } from '../services/market/market.service.js';
export const marketRouter = Router();
// Retrieve Commodity Market Rates & Intelligence
marketRouter.get('/prices', async (req, res) => {
    try {
        const stateQuery = req.query.state;
        const intel = await getMarketIntelligence(stateQuery);
        res.json({
            success: true,
            data: {
                state: intel.stateData.state,
                stateSummary: intel.stateData.stateSummary,
                prices: intel.stateData.prices,
                sellingConsiderations: intel.stateData.sellingConsiderations,
                availableStates: intel.stateData.availableStates
            },
            provenance: intel.provenance
        });
    }
    catch (err) {
        const msg = err instanceof Error ? err.message : 'Market service error';
        res.status(500).json({
            success: false,
            error: {
                code: 'MARKET_SERVICE_ERROR',
                message: msg,
                userFacingMessage: 'Market data is temporarily unavailable.'
            },
            provenance: {
                source: 'AgriSense Market Engine',
                timestamp: new Date().toISOString(),
                mode: 'LIVE'
            }
        });
    }
});
