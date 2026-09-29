import type { WhatIfInput, WhatIfResult, ResourceRequirement } from '@agrisense/shared';

export function calculateWhatIfScenario(input: WhatIfInput): WhatIfResult {
  const area = Math.max(0.1, input.areaAcres);
  const baselineYield = Math.max(1, input.expectedYieldKgPerAcre);
  const baselinePrice = Math.max(0.1, input.sellingPricePerKg);

  const baselineCostPerAcre = 
    (input.seedCostPerAcre || 0) +
    (input.fertilizerCostPerAcre || 0) +
    (input.pesticideCostPerAcre || 0) +
    (input.labourCostPerAcre || 0) +
    (input.irrigationCostPerAcre || 0) +
    (input.otherCostPerAcre || 0);

  // Baseline Calculations
  const baseTotalYieldKg = area * baselineYield;
  const baseGrossRevenue = baseTotalYieldKg * baselinePrice;
  const baseTotalCost = area * baselineCostPerAcre;
  const baseGrossMargin = baseGrossRevenue - baseTotalCost;
  const baseMarginPerAcre = baseGrossMargin / area;
  const baseCostPerKg = baseTotalYieldKg > 0 ? baseTotalCost / baseTotalYieldKg : 0;
  const baseBreakevenPrice = baseCostPerKg;

  // Water / Irrigation Sensitivity: FAO-33 crop water production function
  // If irrigation is reduced by R%, irrigation cost is reduced, but yield drops by Ky * R%
  const irrigationReductionPct = Math.max(0, Math.min(100, input.irrigationReductionPct || 0));
  const waterResponseFactorKy = 1.1; // Standard agricultural sensitivity index
  const yieldLossFromWaterStressPct = irrigationReductionPct > 0 ? irrigationReductionPct * waterResponseFactorKy : 0;

  // Simulated Variations
  const priceMultiplier = 1 + (input.priceVariationPct || 0) / 100;
  const netYieldMultiplier = Math.max(0.05, (1 + (input.yieldVariationPct || 0) / 100) * (1 - yieldLossFromWaterStressPct / 100));

  // Irrigation cost savings
  const savedIrrigationCostPerAcre = (input.irrigationCostPerAcre || 0) * (irrigationReductionPct / 100);
  const costMultiplier = 1 + (input.costVariationPct || 0) / 100;

  const simYieldKgPerAcre = baselineYield * netYieldMultiplier;
  const simPricePerKg = baselinePrice * priceMultiplier;
  const simCostPerAcre = Math.max(0, (baselineCostPerAcre - savedIrrigationCostPerAcre) * costMultiplier);

  const simTotalYieldKg = area * simYieldKgPerAcre;
  const simGrossRevenue = simTotalYieldKg * simPricePerKg;
  const simTotalCost = area * simCostPerAcre;
  const simGrossMargin = simGrossRevenue - simTotalCost;
  const simMarginPerAcre = simGrossMargin / area;
  const simCostPerKg = simTotalYieldKg > 0 ? simTotalCost / simTotalYieldKg : 0;
  const simBreakevenPrice = simCostPerKg;

  // Delta Analysis
  const marginDiff = simGrossMargin - baseGrossMargin;
  const percentageChange = baseGrossMargin !== 0 
    ? ((simGrossMargin - baseGrossMargin) / Math.abs(baseGrossMargin)) * 100 
    : 0;

  let riskAssessment: 'favorable' | 'moderate_risk' | 'severe_loss_risk' = 'favorable';
  let recommendation = 'Your farm projected return remains profitable under this scenario.';

  if (simGrossMargin < 0) {
    riskAssessment = 'severe_loss_risk';
    recommendation = `Under this scenario, operational costs exceed revenue by ₹${Math.abs(Math.round(simGrossMargin)).toLocaleString()}. Consider forward selling contracts, diversifying inputs, or exploring crop insurance protection.`;
  } else if (simGrossMargin < baseGrossMargin * 0.5) {
    riskAssessment = 'moderate_risk';
    recommendation = `Net farm profit drops by ${Math.abs(Math.round(percentageChange))}%. Breakeven selling price is ₹${simBreakevenPrice.toFixed(2)}/kg. Monitor input costs closely.`;
  } else if (irrigationReductionPct > 0 && simGrossMargin >= baseGrossMargin * 0.9) {
    recommendation = `A ${irrigationReductionPct}% irrigation reduction saves ₹${Math.round(savedIrrigationCostPerAcre * area).toLocaleString()} in pumping costs with a manageable ${(yieldLossFromWaterStressPct).toFixed(1)}% yield trade-off.`;
  }

  return {
    baseline: {
      totalYieldKg: Math.round(baseTotalYieldKg),
      grossRevenue: Math.round(baseGrossRevenue),
      totalCost: Math.round(baseTotalCost),
      grossMargin: Math.round(baseGrossMargin),
      marginPerAcre: Math.round(baseMarginPerAcre),
      costPerKg: Number(baseCostPerKg.toFixed(2)),
      breakevenPricePerKg: Number(baseBreakevenPrice.toFixed(2))
    },
    simulated: {
      totalYieldKg: Math.round(simTotalYieldKg),
      grossRevenue: Math.round(simGrossRevenue),
      totalCost: Math.round(simTotalCost),
      grossMargin: Math.round(simGrossMargin),
      marginPerAcre: Math.round(simMarginPerAcre),
      costPerKg: Number(simCostPerKg.toFixed(2)),
      breakevenPricePerKg: Number(simBreakevenPrice.toFixed(2)),
      irrigationReductionPct: irrigationReductionPct > 0 ? irrigationReductionPct : undefined,
      yieldLossFromWaterStressPct: yieldLossFromWaterStressPct > 0 ? Number(yieldLossFromWaterStressPct.toFixed(1)) : undefined
    },
    delta: {
      grossMarginDiff: Math.round(marginDiff),
      percentageChange: Number(percentageChange.toFixed(1)),
      riskAssessment,
      recommendation
    }
  };
}

/**
 * Calculates agronomic resource requirements (water, fertilizer, labour, budget)
 * from farm acreage and crop attributes.
 */
export function calculateResourceRequirements(
  areaAcres: number,
  waterRequirementLevel: 'low' | 'medium' | 'high' = 'medium',
  cropEstimatedCostPerAcre: number = 18000
): ResourceRequirement {
  const area = Math.max(0.1, areaAcres);

  // Water requirement (liters per acre)
  // Low water (e.g. chickpea, mustard): ~1.2 million liters/acre (~300 mm)
  // Medium water (e.g. wheat, maize, tomato): ~2.0 million liters/acre (~500 mm)
  // High water (e.g. paddy): ~4.8 million liters/acre (~1200 mm)
  const waterLitersPerAcre = 
    waterRequirementLevel === 'high' ? 4800000 :
    waterRequirementLevel === 'low' ? 1200000 : 2000000;

  // Fertilizer recommendations (NPK kg per acre based on ICAR guidelines)
  const fertilizerKgPerAcre = 
    waterRequirementLevel === 'high' 
      ? { nitrogenKg: 50, phosphorusKg: 25, potassiumKg: 25 }
      : waterRequirementLevel === 'low'
      ? { nitrogenKg: 20, phosphorusKg: 20, potassiumKg: 10 }
      : { nitrogenKg: 40, phosphorusKg: 20, potassiumKg: 20 };

  // Labor person-days per acre across entire lifecycle
  const laborPersonDaysPerAcre = 
    waterRequirementLevel === 'high' ? 35 :
    waterRequirementLevel === 'low' ? 18 : 28;

  const totalCost = area * cropEstimatedCostPerAcre;

  const breakdown = [
    { category: 'Seeds & Planting Material', amount: Math.round(totalCost * 0.16), percentage: 16 },
    { category: 'Fertilizers & Nutrients', amount: Math.round(totalCost * 0.26), percentage: 26 },
    { category: 'Crop Protection & Pesticides', amount: Math.round(totalCost * 0.12), percentage: 12 },
    { category: 'Labor & Operations', amount: Math.round(totalCost * 0.28), percentage: 28 },
    { category: 'Irrigation & Power', amount: Math.round(totalCost * 0.10), percentage: 10 },
    { category: 'Machinery & Post-Harvest', amount: Math.round(totalCost * 0.08), percentage: 8 }
  ];

  return {
    waterLitersPerAcre,
    totalWaterLiters: Math.round(waterLitersPerAcre * area),
    fertilizerKgPerAcre,
    totalFertilizerKg: {
      nitrogenKg: Math.round(fertilizerKgPerAcre.nitrogenKg * area),
      phosphorusKg: Math.round(fertilizerKgPerAcre.phosphorusKg * area),
      potassiumKg: Math.round(fertilizerKgPerAcre.potassiumKg * area)
    },
    laborPersonDaysPerAcre,
    totalLaborPersonDays: Math.round(laborPersonDaysPerAcre * area),
    totalBudgetRequired: Math.round(totalCost),
    breakdown
  };
}
