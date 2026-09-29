import { Router, Request, Response } from 'express';
import { dbStore } from '../services/db/store.js';
import type { 
  FarmerProfile, 
  Farm, 
  SoilProfile, 
  WaterProfile, 
  CropCycle,
  CropStage
} from '@agrisense/shared';

export const farmRouter = Router();

// User Isolation & Tenant Switcher
farmRouter.get('/auth/users', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      activeAuthUserId: dbStore.getActiveAuthUserId(),
      users: dbStore.getAllFarmers()
    },
    provenance: {
      source: 'AgriSense Identity Layer',
      timestamp: new Date().toISOString(),
      mode: 'LIVE'
    }
  });
});

farmRouter.post('/auth/switch', (req: Request, res: Response) => {
  const { authUserId } = req.body;
  if (!authUserId) {
    res.status(400).json({ success: false, error: { message: 'authUserId required' } });
    return;
  }
  dbStore.setActiveAuthUserId(authUserId);
  res.json({
    success: true,
    data: {
      activeAuthUserId: dbStore.getActiveAuthUserId(),
      farmer: dbStore.getFarmer(authUserId)
    },
    provenance: {
      source: 'AgriSense Identity Layer',
      timestamp: new Date().toISOString(),
      mode: 'LIVE'
    }
  });
});

// Get Farmer Profile & Active Farm
farmRouter.get('/profile', (req: Request, res: Response) => {
  const authHeader = req.headers['x-auth-user-id'] as string | undefined;
  if (authHeader) {
    dbStore.setActiveAuthUserId(authHeader);
  }
  const farmer = dbStore.getFarmer();
  const farms = dbStore.getFarms();
  const activeFarm = farms[0] || null;
  const soil = activeFarm ? dbStore.getSoilProfile(activeFarm.id) : null;
  const water = activeFarm ? dbStore.getWaterProfile(activeFarm.id) : null;
  const cycles = activeFarm ? dbStore.getCropCycles(activeFarm.id) : [];
  const activeCycle = cycles.find(c => c.status === 'active') || cycles[0] || null;

  res.json({
    success: true,
    data: {
      farmer,
      farm: activeFarm,
      soil,
      water,
      activeCycle,
      crops: dbStore.getCrops()
    },
    provenance: {
      source: 'AgriSense Relational Store',
      timestamp: new Date().toISOString(),
      mode: 'LIVE'
    }
  });
});

// Create / Update Farmer & Farm Onboarding Data
farmRouter.post('/onboard', (req: Request, res: Response) => {
  try {
    const { 
      fullName, 
      phoneNumber, 
      preferredLanguage, 
      farmingExperienceYears,
      approximateBudget,
      farmName,
      totalAreaAcres,
      latitude,
      longitude,
      villageDistrict,
      stateProvince,
      soilType,
      soilPh,
      drainageQuality,
      waterSource,
      waterAvailability,
      irrigationMethod,
      cropId,
      sowingDate,
      currentStage
    } = req.body;

    if (!fullName || !farmName || !totalAreaAcres) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_FAILED',
          message: 'Missing required onboarding parameters (fullName, farmName, totalAreaAcres)',
          userFacingMessage: 'Please provide all mandatory farmer and farm fields.'
        },
        provenance: {
          source: 'AgriSense Validation Engine',
          timestamp: new Date().toISOString(),
          mode: 'LIVE'
        }
      });
      return;
    }

    const authHeader = req.headers['x-auth-user-id'] as string | undefined;
    const authUserId = authHeader || dbStore.getActiveAuthUserId() || `auth-user-${Date.now()}`;
    const farmerId = dbStore.getFarmer(authUserId)?.id || `farmer-${Date.now()}`;
    const farmer: FarmerProfile = {
      id: farmerId,
      authUserId,
      fullName,
      phoneNumber: phoneNumber || '',
      preferredLanguage: preferredLanguage || 'en',
      farmingExperienceYears: Number(farmingExperienceYears) || 0,
      approximateBudget: Number(approximateBudget) || 50000,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    dbStore.saveFarmer(farmer);

    const farmId = dbStore.getFarms()[0]?.id || `farm-${Date.now()}`;
    const farm: Farm = {
      id: farmId,
      farmerId,
      farmName,
      totalAreaAcres: Number(totalAreaAcres) || 1,
      latitude: Number(latitude) || 28.6139, // Default New Delhi latitude if not specified
      longitude: Number(longitude) || 77.2090, // Default New Delhi longitude
      villageDistrict: villageDistrict || 'Central Agricultural District',
      stateProvince: stateProvince || 'Northern Plains',
      country: 'India',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    dbStore.saveFarm(farm);

    const soil: SoilProfile = {
      id: `soil-${farmId}`,
      farmId,
      soilType: soilType || 'alluvial',
      phLevel: soilPh ? Number(soilPh) : 6.8,
      drainageQuality: drainageQuality || 'well_drained'
    };
    dbStore.saveSoilProfile(soil);

    const water: WaterProfile = {
      id: `water-${farmId}`,
      farmId,
      waterSource: waterSource || 'borewell',
      availabilityStatus: waterAvailability || 'sufficient',
      irrigationMethod: irrigationMethod || 'drip'
    };
    dbStore.saveWaterProfile(water);

    // Initial Crop Cycle
    const selectedCrop = dbStore.getCropById(cropId || 'crop-wheat');
    const cycleId = `cycle-${Date.now()}`;
    const cropCycle: CropCycle = {
      id: cycleId,
      farmId,
      cropId: selectedCrop?.id || 'crop-wheat',
      crop: selectedCrop,
      sowingDate: sowingDate || new Date().toISOString().split('T')[0],
      expectedHarvestDate: new Date(Date.now() + 110 * 86400000).toISOString().split('T')[0],
      currentStage: (currentStage as CropStage) || 'vegetative',
      plantedAreaAcres: Number(totalAreaAcres),
      status: 'active'
    };
    dbStore.saveCropCycle(cropCycle);

    res.json({
      success: true,
      data: {
        farmer,
        farm,
        soil,
        water,
        activeCycle: cropCycle
      },
      provenance: {
        source: 'AgriSense Relational Store',
        timestamp: new Date().toISOString(),
        mode: 'LIVE'
      }
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Onboarding processing failed';
    res.status(500).json({
      success: false,
      error: {
        code: 'ONBOARDING_ERROR',
        message: msg,
        userFacingMessage: 'Failed to save farm profile. Please check inputs and retry.'
      },
      provenance: {
        source: 'AgriSense System',
        timestamp: new Date().toISOString(),
        mode: 'LIVE'
      }
    });
  }
});

// Update Crop Cycle Stage (Phase 8: Lifecycle Management)
farmRouter.patch('/crop-cycle/:id/stage', (req: Request, res: Response) => {
  const { id } = req.params;
  const { stage } = req.body;

  const validStages: CropStage[] = [
    'planning', 'planting', 'germination', 'vegetative', 
    'flowering', 'fruiting', 'harvest', 'selling'
  ];

  if (!validStages.includes(stage as CropStage)) {
    res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_STAGE',
        message: `Stage must be one of: ${validStages.join(', ')}`,
        userFacingMessage: 'Invalid crop stage requested.'
      },
      provenance: {
        source: 'AgriSense Lifecycle Engine',
        timestamp: new Date().toISOString(),
        mode: 'LIVE'
      }
    });
    return;
  }

  const cycles = dbStore.getCropCycles();
  const cycle = cycles.find(c => c.id === id);

  if (!cycle) {
    res.status(404).json({
      success: false,
      error: {
        code: 'CYCLE_NOT_FOUND',
        message: `Crop cycle ${id} not found`,
        userFacingMessage: 'Crop cycle not found.'
      },
      provenance: {
        source: 'AgriSense Lifecycle Engine',
        timestamp: new Date().toISOString(),
        mode: 'LIVE'
      }
    });
    return;
  }

  cycle.currentStage = stage as CropStage;
  dbStore.saveCropCycle(cycle);

  res.json({
    success: true,
    data: cycle,
    provenance: {
      source: 'AgriSense Lifecycle Engine',
      timestamp: new Date().toISOString(),
      mode: 'LIVE'
    }
  });
});
