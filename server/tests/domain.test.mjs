import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateWhatIfScenario } from '../dist/server/src/domain/economics/economics.engine.js';
import { recommendCrops } from '../dist/server/src/domain/agronomy/recommendation.engine.js';
import { generateDailyFarmActions } from '../dist/server/src/domain/actions/actions.engine.js';
import { evaluateFarmRisks } from '../dist/server/src/domain/risk/risk.engine.js';
import { interpretAgriculturalWeather } from '../dist/server/src/services/weather/weather.service.js';

// 1. Deterministic Farm Economics & What-If Tests (Rule #19 & #36)
test('What-If Scenario: Baseline calculation matches exact formulas', () => {
  const input = {
    areaAcres: 2,
    expectedYieldKgPerAcre: 1500, // Total 3000 kg
    sellingPricePerKg: 20,        // Revenue = 60,000
    seedCostPerAcre: 2000,
    fertilizerCostPerAcre: 4000,
    pesticideCostPerAcre: 1000,
    labourCostPerAcre: 3000,
    irrigationCostPerAcre: 1000,
    otherCostPerAcre: 1000,       // Total cost/ac = 12,000 -> Total 24,000
    priceVariationPct: 0,
    yieldVariationPct: 0,
    costVariationPct: 0
  };

  const result = calculateWhatIfScenario(input);
  assert.equal(result.baseline.totalYieldKg, 3000);
  assert.equal(result.baseline.grossRevenue, 60000);
  assert.equal(result.baseline.totalCost, 24000);
  assert.equal(result.baseline.grossMargin, 36000);
  assert.equal(result.baseline.marginPerAcre, 18000);
  assert.equal(result.baseline.breakevenPricePerKg, 8); // 24000 / 3000 = 8.00
});

test('What-If Scenario: Negative price shock correctly shifts gross margin and assesses risk', () => {
  const input = {
    areaAcres: 2,
    expectedYieldKgPerAcre: 1500,
    sellingPricePerKg: 20,
    seedCostPerAcre: 2000,
    fertilizerCostPerAcre: 4000,
    pesticideCostPerAcre: 1000,
    labourCostPerAcre: 3000,
    irrigationCostPerAcre: 1000,
    otherCostPerAcre: 1000,
    priceVariationPct: -60, // 20 -> 8 Rs/kg (exact breakeven)
    yieldVariationPct: 0,
    costVariationPct: 0
  };

  const result = calculateWhatIfScenario(input);
  assert.equal(result.simulated.grossRevenue, 24000);
  assert.equal(result.simulated.grossMargin, 0);
  assert.equal(result.delta.percentageChange, -100);
  assert.equal(result.delta.riskAssessment, 'moderate_risk');
});

// 2. Deterministic Agronomic Recommendation Tests (Rule #7 & #8)
test('Crop Recommendation Engine: Matches Rabi crops for Rabi season on alluvial soil', () => {
  const recommendations = recommendCrops({
    soilType: 'alluvial',
    soilPh: 6.8,
    waterAvailability: 'sufficient',
    targetSeason: 'rabi'
  });

  assert.ok(recommendations.length > 0);
  const wheatRec = recommendations.find(r => r.crop.id === 'crop-wheat');
  assert.ok(wheatRec, 'Wheat should be evaluated');
  assert.equal(wheatRec.suitabilityLevel, 'Highly Suitable');
  assert.ok(wheatRec.suitabilityScorePct >= 80);
});

// 3. Agro-Meteorological Weather Interpretation Tests (Rule #9 & #10)
test('Weather Interpretation: High rain probability triggers irrigation postponement', () => {
  const advisory = interpretAgriculturalWeather(
    {
      temperatureCelsius: 28,
      humidityPct: 75,
      rainfallMm: 2,
      rainProbabilityPct: 80,
      windSpeedKmh: 12,
      weatherCode: 61,
      weatherDescription: 'Rain'
    },
    [
      { date: '2026-09-25', tempMax: 30, tempMin: 22, precipitationMm: 12, precipitationProbability: 85, condition: 'Rain', weatherCode: 61 }
    ]
  );

  assert.equal(advisory.irrigationNotice.status, 'postpone');
  assert.match(advisory.irrigationNotice.advice, /Postpone irrigation/);
});

test('Weather Interpretation: High wind speed triggers spraying caution', () => {
  const advisory = interpretAgriculturalWeather(
    {
      temperatureCelsius: 26,
      humidityPct: 60,
      rainfallMm: 0,
      rainProbabilityPct: 10,
      windSpeedKmh: 24, // > 20 km/h
      weatherCode: 1,
      weatherDescription: 'Clear'
    },
    [
      { date: '2026-09-25', tempMax: 28, tempMin: 19, precipitationMm: 0, precipitationProbability: 10, condition: 'Clear', weatherCode: 1 }
    ]
  );

  assert.equal(advisory.sprayingNotice.isSuitable, false);
  assert.match(advisory.sprayingNotice.reason, /Wind speed is high/);
});

// 4. Formula-Based Risk Evaluation Tests (Rule #20)
test('Risk Center: Formula-based weighting correctly calculates composite risk score', () => {
  const farm = {
    id: 'test-farm',
    farmerId: 'farmer-1',
    farmName: 'Test Farm',
    totalAreaAcres: 3,
    latitude: 28.6,
    longitude: 77.2,
    villageDistrict: 'District',
    stateProvince: 'State',
    country: 'India',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const risk = evaluateFarmRisks(farm, undefined, undefined, undefined);
  assert.ok(typeof risk.overallRiskScore === 'number');
  assert.ok(risk.overallRiskScore >= 0 && risk.overallRiskScore <= 100);
  assert.ok(risk.methodology.includes('Weighted Multi-Factor Formula'));
  assert.equal(risk.riskCategories.length, 5);
});
