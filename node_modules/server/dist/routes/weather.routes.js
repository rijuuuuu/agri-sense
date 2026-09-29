import { Router } from 'express';
import { dbStore } from '../services/db/store.js';
import { fetchFarmWeather } from '../services/weather/weather.service.js';
export const weatherRouter = Router();
weatherRouter.get('/current-and-forecast', async (req, res) => {
    try {
        const { farmId } = req.query;
        const farm = farmId ? dbStore.getFarmById(String(farmId)) : dbStore.getFarms()[0];
        const lat = farm ? farm.latitude : 28.6139; // New Delhi default
        const lon = farm ? farm.longitude : 77.2090;
        const district = farm ? farm.villageDistrict : 'Agricultural Sector';
        const result = await fetchFarmWeather(lat, lon, district);
        res.json({
            success: true,
            data: result.payload,
            provenance: result.provenance
        });
    }
    catch (err) {
        const msg = err instanceof Error ? err.message : 'Weather service error';
        res.status(500).json({
            success: false,
            error: {
                code: 'WEATHER_SERVICE_ERROR',
                message: msg,
                userFacingMessage: 'Weather data is temporarily unavailable. Please retry in a few moments.'
            },
            provenance: {
                source: 'Open-Meteo Gateway',
                timestamp: new Date().toISOString(),
                mode: 'LIVE'
            }
        });
    }
});
