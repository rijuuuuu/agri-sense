import { dbStore } from '../../services/db/store.js';
export function recommendCrops(params) {
    const allCrops = dbStore.getCrops();
    const soil = params.soilType || 'alluvial';
    const ph = params.soilPh || 6.8;
    const water = params.waterAvailability || 'sufficient';
    const budget = params.availableBudget || 50000;
    // Determine current season if not explicitly passed
    let season = params.targetSeason;
    if (!season) {
        const month = params.currentMonth || (new Date().getMonth() + 1);
        if (month >= 6 && month <= 10)
            season = 'kharif';
        else if (month >= 11 || month <= 3)
            season = 'rabi';
        else
            season = 'zaid';
    }
    const results = [];
    for (const crop of allCrops) {
        let score = 50;
        const reasons = [];
        const risks = [];
        // 1. Season Match
        const seasonMatch = crop.suitableSeasons.includes(season) || crop.suitableSeasons.includes('year_round');
        if (seasonMatch) {
            score += 20;
            reasons.push(`Optimal planting window during ${season.toUpperCase()} season.`);
        }
        else {
            score -= 25;
            risks.push(`Current season (${season}) is outside standard planting window.`);
        }
        // 2. Soil Type Match
        const soilMatch = crop.preferredSoilTypes.includes(soil);
        if (soilMatch) {
            score += 15;
            reasons.push(`Well adapted to your ${soil.replace('_', ' ')} soil type.`);
        }
        else {
            score -= 10;
            risks.push(`May require soil amendment or organic matter addition on ${soil.replace('_', ' ')} soil.`);
        }
        // 3. Soil pH Compatibility
        if (ph >= crop.minSoilPh && ph <= crop.maxSoilPh) {
            score += 10;
            reasons.push(`Soil pH (${ph}) is within optimal physiological range (${crop.minSoilPh}-${crop.maxSoilPh}).`);
        }
        else {
            score -= 15;
            risks.push(`Soil pH (${ph}) is outside optimal threshold (${crop.minSoilPh}-${crop.maxSoilPh}).`);
        }
        // 4. Water Availability Alignment
        if (crop.waterRequirementLevel === 'low') {
            score += 10;
            reasons.push('Low water intensity makes it drought resilient and economical on irrigation.');
        }
        else if (crop.waterRequirementLevel === 'high') {
            if (water === 'abundant') {
                score += 10;
                reasons.push('High water demand is fully supported by your abundant water source.');
            }
            else if (water === 'limited' || water === 'scarce') {
                score -= 30;
                risks.push('High water requirement creates significant risk under limited/scarce water availability.');
            }
        }
        // 5. Budget Fit
        if (crop.estimatedCostPerAcre <= budget) {
            score += 5;
        }
        else {
            score -= 15;
            risks.push(`Estimated input cost (~₹${crop.estimatedCostPerAcre.toLocaleString()}/acre) exceeds your preferred budget.`);
        }
        // Estimated Financial Return
        const avgSellingPricePerKg = 25; // reference baseline
        const grossRevenuePerAcre = (crop.averageYieldPerAcreKg || 1500) * avgSellingPricePerKg;
        const estimatedGrossMarginPerAcre = grossRevenuePerAcre - (crop.estimatedCostPerAcre || 12000);
        const boundedScore = Math.max(20, Math.min(95, score));
        const suitabilityLevel = boundedScore >= 75 ? 'Highly Suitable' : boundedScore >= 55 ? 'Potentially Suitable' : 'Moderate Suitability';
        results.push({
            crop,
            suitabilityScorePct: boundedScore,
            suitabilityLevel,
            reasons,
            seasonSuitability: `Suitable for ${crop.suitableSeasons.join(', ').toUpperCase()}`,
            soilSuitability: `Preferred: ${crop.preferredSoilTypes.join(', ')}`,
            waterSuitability: `Water demand: ${crop.waterRequirementLevel.toUpperCase()}`,
            budgetFit: `Estimated cost: ₹${crop.estimatedCostPerAcre.toLocaleString()} / acre`,
            estimatedGrossMarginPerAcre,
            potentialRisks: risks.length > 0 ? risks : ['Standard market price fluctuations and seasonal pest monitoring required.'],
            marketOutlook: 'Stable domestic demand with local mandi presence.'
        });
    }
    // Sort by highest suitability score
    return results.sort((a, b) => b.suitabilityScorePct - a.suitabilityScorePct);
}
