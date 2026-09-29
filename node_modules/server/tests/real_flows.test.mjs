import { test, describe, before } from 'node:test';
import assert from 'node:assert/strict';
import dotenv from 'dotenv';
import path from 'node:path';
import fs from 'node:fs';

const envPath = fs.existsSync(path.resolve(process.cwd(), '.env'))
  ? path.resolve(process.cwd(), '.env')
  : path.resolve(process.cwd(), 'server/.env');

dotenv.config({ path: envPath });

import { askFarmCopilot } from '../dist/server/src/services/ai/gemini.service.js';
import { geocodeLocationQuery, reverseGeocodeLocation } from '../dist/server/src/services/location/location.service.js';
import { calculateWhatIfScenario, calculateResourceRequirements } from '../dist/server/src/domain/economics/economics.engine.js';
import { analyzeCropDisease } from '../dist/server/src/services/ai/disease.service.js';
import { dbStore } from '../dist/server/src/services/db/store.js';
import { getMarketIntelligence } from '../dist/server/src/services/market/market.service.js';
import { fetchFarmWeather } from '../dist/server/src/services/weather/weather.service.js';
import { recommendCrops } from '../dist/server/src/domain/agronomy/recommendation.engine.js';

describe('AgriSense Real Decision-Support Platform Integration Tests', () => {

  test('Flow 1: Geocoding resolves real coordinates for any location (Salem)', async () => {
    const loc = await geocodeLocationQuery('Salem');
    assert.ok(loc.latitude !== undefined, 'Latitude should be present');
    assert.ok(loc.longitude !== undefined, 'Longitude should be present');
    assert.ok(loc.district.toLowerCase().includes('salem'), `District should contain Salem, got ${loc.district}`);
    assert.ok(loc.latitude > 11 && loc.latitude < 12.5, `Latitude should be near Salem (~11.66), got ${loc.latitude}`);
  });

  test('Flow 2: Economics What-If engine computes exact 20% irrigation reduction sensitivity', () => {
    const baseline = calculateWhatIfScenario({
      areaAcres: 3,
      expectedYieldKgPerAcre: 2000,
      sellingPricePerKg: 25,
      seedCostPerAcre: 2500,
      fertilizerCostPerAcre: 4000,
      pesticideCostPerAcre: 1500,
      labourCostPerAcre: 3000,
      irrigationCostPerAcre: 2000,
      otherCostPerAcre: 1000,
      priceVariationPct: 0,
      yieldVariationPct: 0,
      costVariationPct: 0,
      irrigationReductionPct: 0
    });

    const reducedIrrigation = calculateWhatIfScenario({
      areaAcres: 3,
      expectedYieldKgPerAcre: 2000,
      sellingPricePerKg: 25,
      seedCostPerAcre: 2500,
      fertilizerCostPerAcre: 4000,
      pesticideCostPerAcre: 1500,
      labourCostPerAcre: 3000,
      irrigationCostPerAcre: 2000,
      otherCostPerAcre: 1000,
      priceVariationPct: 0,
      yieldVariationPct: 0,
      costVariationPct: 0,
      irrigationReductionPct: 20
    });

    assert.ok(reducedIrrigation.simulated.totalCost < baseline.baseline.totalCost, 'Irrigation savings should reduce total operational cost');
    assert.ok(reducedIrrigation.simulated.totalYieldKg < baseline.baseline.totalYieldKg, 'Water deficit should reflect FAO yield reduction');
    assert.equal(reducedIrrigation.simulated.irrigationReductionPct, 20);
    assert.ok(reducedIrrigation.simulated.yieldLossFromWaterStressPct > 0, 'Yield loss percentage should be computed');
  });

  test('Flow 3: Resource Management calculates water, NPK, labor, and budget requirements', () => {
    const res = calculateResourceRequirements(3.5, 'high', 20000);
    assert.equal(res.totalBudgetRequired, 70000, '3.5 acres * 20000 = 70000 total budget');
    assert.ok(res.totalWaterLiters > 0, 'Water requirement in liters must be positive');
    assert.ok(res.totalFertilizerKg.nitrogenKg > 0, 'Nitrogen requirement must be positive');
    assert.ok(res.totalLaborPersonDays > 0, 'Labor days must be positive');
    assert.ok(res.breakdown.length === 6, 'Cost breakdown categories must be present');
  });

  test('Flow 4: Database persistence and user isolation', () => {
    const userA = 'auth-farmer-alpha';
    const userB = 'auth-farmer-beta';

    const farmerA = {
      id: 'farmer-alpha-1',
      authUserId: userA,
      fullName: 'Farmer Alpha',
      preferredLanguage: 'ta',
      farmingExperienceYears: 8,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    dbStore.saveFarmer(farmerA);

    const farmA = {
      id: 'farm-alpha-1',
      farmerId: farmerA.id,
      farmName: 'Alpha Farmstead',
      totalAreaAcres: 4.5,
      latitude: 10.7870,
      longitude: 79.1378,
      villageDistrict: 'Thanjavur',
      stateProvince: 'Tamil Nadu',
      country: 'India',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    dbStore.saveFarm(farmA);

    // Switch to User B
    dbStore.setActiveAuthUserId(userB);
    const farmsUserB = dbStore.getFarms(userB);
    assert.equal(farmsUserB.length, 0, 'User B should have zero farms before creation (strict tenant isolation)');

    // Switch back to User A
    dbStore.setActiveAuthUserId(userA);
    const farmsUserA = dbStore.getFarms(farmerA.id);
    assert.equal(farmsUserA.length, 1, 'User A farm must persist');
    assert.equal(farmsUserA[0].farmName, 'Alpha Farmstead');
  });

  test('Flow 5: Gemini AI Tool Calling for Weather in Salem', async (t) => {
    if (!process.env.GEMINI_API_KEY) {
      t.skip('Skipping live Gemini test because GEMINI_API_KEY is not set');
      return;
    }

    const response = await askFarmCopilot('What is the current weather and temperature in Salem?', 'en');
    assert.ok(response.message.content.length > 0, 'Response should not be empty');
    assert.ok(
      response.message.groundingCitations?.some(c => c.toLowerCase().includes('weather') || c.toLowerCase().includes('open-meteo')),
      `Grounding citations should include weather tool execution, got: ${JSON.stringify(response.message.groundingCitations)}`
    );
    assert.ok(
      response.provenance.mode === 'LIVE',
      `Provenance should be LIVE, got: ${response.provenance.mode}`
    );
  });

  test('Flow 6: Gemini AI Tool Calling for What-If scenario (20% irrigation reduction)', async (t) => {
    if (!process.env.GEMINI_API_KEY) {
      t.skip('Skipping live Gemini test because GEMINI_API_KEY is not set');
      return;
    }

    const response = await askFarmCopilot('What happens if I reduce my irrigation by 20%?', 'en');
    assert.ok(response.message.content.length > 0, 'Response should not be empty');
    assert.ok(
      response.message.groundingCitations?.some(c => c.toLowerCase().includes('what-if') || c.toLowerCase().includes('response index') || c.toLowerCase().includes('engine')),
      `Grounding citations should verify calculate_what_if_scenario tool execution, got: ${JSON.stringify(response.message.groundingCitations)}`
    );
  });

  test('Flow 7: Disease Analysis via AI multimodal vision returns diagnosis and uncertainty', async () => {
    // 1x1 transparent PNG base64 sample
    const sampleBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    const result = await analyzeCropDisease({
      farmId: 'farm-alpha-1',
      affectedPart: 'leaves',
      imageBase64: sampleBase64,
      imageMimeType: 'image/png',
      cropName: 'Tomato',
      symptomDescription: 'Dark brown spots on leaves with concentric rings'
    });

    assert.ok(result.scan.condition.length > 0, 'Condition name must be returned');
    assert.ok(result.scan.confidencePct >= 0 && result.scan.confidencePct <= 100, 'Confidence score must be 0-100');
    assert.ok(result.scan.uncertaintyFactors.length > 0, 'Uncertainty factors must be provided');
    assert.ok(Array.isArray(result.scan.recommendedActions), 'Recommended actions must be an array');
    assert.ok(result.scan.recommendedActions.length > 0, 'At least one next step must be given');
  });

  test('Flow 8: Market Intelligence returns real provenance and official benchmarks', async () => {
    const market = await getMarketIntelligence('Tamil Nadu');
    assert.ok(market.stateData.prices.length > 0, 'Prices should be returned for Tamil Nadu');
    assert.equal(market.stateData.state, 'Tamil Nadu');
    assert.ok(market.provenance.source.length > 0, 'Data source must be identified');
    assert.ok(market.provenance.timestamp.length > 0, 'Timestamp must be ISO date');
    assert.ok(['LIVE', 'NOT_CONFIGURED'].includes(market.provenance.mode), 'Mode must be LIVE or NOT_CONFIGURED');
  });

  test('Flow 9: API Error Handling - Weather Service throws proper error instead of returning fake data', async () => {
    // Invalid coordinates out of range
    await assert.rejects(
      async () => {
        await fetchFarmWeather(999, 999, 'Invalid Location');
      },
      /Open-Meteo API returned HTTP status|weather service unavailable/,
      'Must reject with real service error instead of returning fake fallback'
    );
  });

  test('Flow 10: Dynamic Crop Recommendations change when soil/season parameters change', () => {
    const rabiAlluvial = recommendCrops({
      targetSeason: 'rabi',
      soilType: 'alluvial',
      waterAvailability: 'sufficient'
    });

    const kharifBlack = recommendCrops({
      targetSeason: 'kharif',
      soilType: 'black',
      waterAvailability: 'sufficient'
    });

    assert.ok(rabiAlluvial.length > 0, 'Rabi recommendations must exist');
    assert.ok(kharifBlack.length > 0, 'Kharif recommendations must exist');

    const topRabi = rabiAlluvial[0].crop.id;
    const topKharif = kharifBlack[0].crop.id;
    assert.notEqual(topRabi, topKharif, 'Different seasons and soil types must recommend different crops');
    assert.ok(rabiAlluvial.some(c => c.crop.id === 'crop-wheat' && c.suitabilityScorePct >= 70), 'Wheat should score high for Rabi alluvial');
    assert.ok(kharifBlack.some(c => c.crop.id === 'crop-cotton' && c.suitabilityScorePct >= 70), 'Cotton should score high for Kharif black soil');
  });

  test('Flow 11: Gemini AI Farm-Specific Question Grounds on Farm Data', async (t) => {
    if (!process.env.GEMINI_API_KEY) {
      t.skip('Skipping live Gemini test because GEMINI_API_KEY is not set');
      return;
    }

    const response = await askFarmCopilot('Should I irrigate my tomato crop today given current conditions?', 'en');
    assert.ok(response.message.content.length > 0, 'Response should not be empty');
    assert.ok(
      response.message.groundingCitations?.some(c => 
        c.toLowerCase().includes('weather') || 
        c.toLowerCase().includes('farm') || 
        c.toLowerCase().includes('crop')
      ),
      `Grounding citations should verify farm/weather tool execution, got: ${JSON.stringify(response.message.groundingCitations)}`
    );
  });
});
