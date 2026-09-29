import { Router, Request, Response } from 'express';
import { reverseGeocodeLocation } from '../services/location/location.service.js';

export const locationRouter = Router();

// Reverse-Geocode Coordinates to District and State
locationRouter.get('/lookup', async (req: Request, res: Response) => {
  try {
    const latStr = req.query.lat as string;
    const lonStr = req.query.lon as string;

    if (!latStr || !lonStr) {
      res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_COORDINATES',
          message: 'Both latitude and longitude parameters are required.',
          userFacingMessage: 'Please provide valid latitude and longitude coordinates.'
        },
        provenance: {
          source: 'AgriSense Geolocation Engine',
          timestamp: new Date().toISOString(),
          mode: 'LIVE'
        }
      });
      return;
    }

    const lat = parseFloat(latStr);
    const lon = parseFloat(lonStr);

    if (isNaN(lat) || isNaN(lon)) {
      res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_COORDINATES',
          message: 'Latitude and longitude must be valid floating point numbers.',
          userFacingMessage: 'Invalid GPS coordinates received.'
        },
        provenance: {
          source: 'AgriSense Geolocation Engine',
          timestamp: new Date().toISOString(),
          mode: 'LIVE'
        }
      });
      return;
    }

    const locationInfo = await reverseGeocodeLocation(lat, lon);

    res.json({
      success: true,
      data: locationInfo,
      provenance: {
        source: 'AgriSense Regional Geocoding & Spatial Engine',
        timestamp: new Date().toISOString(),
        mode: 'LIVE'
      }
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Location lookup failed';
    res.status(500).json({
      success: false,
      error: {
        code: 'LOCATION_LOOKUP_ERROR',
        message: msg,
        userFacingMessage: 'Unable to resolve regional location at this time.'
      },
      provenance: {
        source: 'AgriSense Geolocation Engine',
        timestamp: new Date().toISOString(),
        mode: 'LIVE'
      }
    });
  }
});

// Forward-Geocode District, Town, or Village Name
locationRouter.get('/search', async (req: Request, res: Response) => {
  try {
    const q = req.query.q as string;
    if (!q || !q.trim()) {
      res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_QUERY',
          message: 'Query parameter q is required.',
          userFacingMessage: 'Please enter a location name to search.'
        },
        provenance: {
          source: 'AgriSense Geocoding Gateway',
          timestamp: new Date().toISOString(),
          mode: 'LIVE'
        }
      });
      return;
    }

    const { geocodeLocationQuery } = await import('../services/location/location.service.js');
    const locationInfo = await geocodeLocationQuery(q);

    res.json({
      success: true,
      data: locationInfo,
      provenance: {
        source: 'Open-Meteo Geocoding & Regional Engine',
        timestamp: new Date().toISOString(),
        mode: 'LIVE'
      }
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Location geocoding failed';
    res.status(500).json({
      success: false,
      error: {
        code: 'GEOCODING_ERROR',
        message: msg,
        userFacingMessage: 'Location search failed.'
      },
      provenance: {
        source: 'AgriSense Geocoding Gateway',
        timestamp: new Date().toISOString(),
        mode: 'LIVE'
      }
    });
  }
});

