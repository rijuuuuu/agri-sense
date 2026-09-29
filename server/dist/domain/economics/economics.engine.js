export function calculateWhatIfScenario(input) {
    const area = Math.max(0.1, input.areaAcres);
    const baselineYield = Math.max(1, input.expectedYieldKgPerAcre);
    const baselinePrice = Math.max(0.1, input.sellingPricePerKg);
    const baselineCostPerAcre = (input.seedCostPerAcre || 0) +
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
    // Simulated Variations
    const priceMultiplier = 1 + (input.priceVariationPct || 0) / 100;
    const yieldMultiplier = 1 + (input.yieldVariationPct || 0) / 100;
    const costMultiplier = 1 + (input.costVariationPct || 0) / 100;
    const simYieldKgPerAcre = baselineYield * yieldMultiplier;
    const simPricePerKg = baselinePrice * priceMultiplier;
    const simCostPerAcre = baselineCostPerAcre * costMultiplier;
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
    let riskAssessment = 'favorable';
    let recommendation = 'Your farm projected return remains profitable under this scenario.';
    if (simGrossMargin < 0) {
        riskAssessment = 'severe_loss_risk';
        recommendation = `Under this scenario, operational costs exceed revenue by ₹${Math.abs(Math.round(simGrossMargin)).toLocaleString()}. Consider forward selling contracts, diversifying inputs, or exploring crop insurance protection.`;
    }
    else if (simGrossMargin < baseGrossMargin * 0.5) {
        riskAssessment = 'moderate_risk';
        recommendation = `Net farm profit drops by ${Math.abs(Math.round(percentageChange))}%. Breakeven selling price is ₹${simBreakevenPrice.toFixed(2)}/kg. Monitor input costs closely.`;
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
            breakevenPricePerKg: Number(simBreakevenPrice.toFixed(2))
        },
        delta: {
            grossMarginDiff: Math.round(marginDiff),
            percentageChange: Number(percentageChange.toFixed(1)),
            riskAssessment,
            recommendation
        }
    };
}
