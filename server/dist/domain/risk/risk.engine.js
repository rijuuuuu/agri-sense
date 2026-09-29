export function evaluateFarmRisks(farm, cropCycle, weather, water) {
    const activeRisks = [];
    // 1. Weather Risk (Weight: 30%)
    let weatherScore = 20;
    const temp = weather?.current.temperatureCelsius || 25;
    const rainOdds = weather?.current.rainProbabilityPct || 10;
    if (temp >= 38) {
        weatherScore = 85;
        activeRisks.push({
            id: 'risk-heat-stress',
            category: 'weather',
            title: 'Extreme Heat Stress Advisory',
            severity: 'critical',
            description: `Ambient temperature reached ${temp}°C. Significant risk of flower drop, pollen sterility, and rapid soil desiccation.`,
            recommendedMitigation: 'Schedule emergency evening light irrigation and maintain soil mulching.',
            dataOrigin: 'Open-Meteo Current Temperature Telemetry'
        });
    }
    else if (temp >= 34) {
        weatherScore = 55;
        activeRisks.push({
            id: 'risk-moderate-heat',
            category: 'weather',
            title: 'Elevated Temperature Caution',
            severity: 'medium',
            description: `Temperature at ${temp}°C causes higher evapotranspiration rates.`,
            recommendedMitigation: 'Shorten irrigation intervals by 15-20%.',
            dataOrigin: 'Open-Meteo Current Temperature Telemetry'
        });
    }
    if (rainOdds >= 60) {
        weatherScore = Math.max(weatherScore, 70);
        activeRisks.push({
            id: 'risk-rain-damage',
            category: 'weather',
            title: 'Precipitation & Waterlogging Warning',
            severity: 'high',
            description: `Precipitation probability is ${rainOdds}%. Excessive soil saturation can drown root respiration.`,
            recommendedMitigation: 'Hold irrigation immediately and clear perimeter field drainage channels.',
            dataOrigin: 'Open-Meteo 24h Precipitation Forecast'
        });
    }
    // 2. Water Security Risk (Weight: 25%)
    let waterScore = 20;
    const waterStatus = water?.availabilityStatus || 'sufficient';
    const cropWaterNeed = cropCycle?.crop?.waterRequirementLevel || 'medium';
    if (waterStatus === 'scarce') {
        waterScore = 85;
        activeRisks.push({
            id: 'risk-water-scarcity',
            category: 'water',
            title: 'Critical Water Availability Deficit',
            severity: 'critical',
            description: `Water availability is classified as scarce, while ${cropCycle?.crop?.commonName || 'crop'} requires ${cropWaterNeed} water.`,
            recommendedMitigation: 'Shift exclusively to micro-drip irrigation with alternate furrow wetting.',
            dataOrigin: 'AgriSense Farm Water Profile'
        });
    }
    else if (waterStatus === 'limited') {
        waterScore = 50;
        activeRisks.push({
            id: 'risk-water-limited',
            category: 'water',
            title: 'Moderate Water Stress Vulnerability',
            severity: 'medium',
            description: `Limited water reserves may constrain full yield potential during peak reproductive stages.`,
            recommendedMitigation: 'Prioritize irrigation strictly during critical flowering and grain filling stages.',
            dataOrigin: 'AgriSense Farm Water Profile'
        });
    }
    // 3. Crop Health & Stage Risk (Weight: 20%)
    let cropScore = 25;
    const stage = cropCycle?.currentStage || 'vegetative';
    if (stage === 'flowering') {
        cropScore = 50; // Flowering is the most vulnerable physiological stage
        activeRisks.push({
            id: 'risk-stage-vulnerability',
            category: 'crop_health',
            title: 'High Flowering Stage Sensitivity',
            severity: 'medium',
            description: `Flowering stage is highly sensitive to moisture stress and chemical burn.`,
            recommendedMitigation: 'Avoid harsh synthetic insecticides during peak morning pollination hours.',
            dataOrigin: 'Crop Lifecycle State Machine'
        });
    }
    // 4. Market Price Volatility Risk (Weight: 15%)
    const marketScore = 35;
    // 5. Input Cost / Financial Risk (Weight: 10%)
    const costScore = 30;
    // Formula-based Weighted Aggregate Calculation (Rule #20)
    // Overall Risk = (Weather * 0.30) + (Water * 0.25) + (Crop * 0.20) + (Market * 0.15) + (Cost * 0.10)
    const weightedTotal = (weatherScore * 0.30) +
        (waterScore * 0.25) +
        (cropScore * 0.20) +
        (marketScore * 0.15) +
        (costScore * 0.10);
    const roundedScore = Math.round(weightedTotal);
    let overallRiskLevel = 'low';
    if (roundedScore >= 70)
        overallRiskLevel = 'high';
    else if (roundedScore >= 50)
        overallRiskLevel = 'elevated';
    else if (roundedScore >= 30)
        overallRiskLevel = 'moderate';
    return {
        overallRiskScore: roundedScore,
        overallRiskLevel,
        methodology: 'Weighted Multi-Factor Formula: (Weather × 30%) + (Water Security × 25%) + (Crop Vulnerability × 20%) + (Market Volatility × 15%) + (Input Cost × 10%)',
        riskCategories: [
            { category: 'Weather Impact', score: weatherScore, weightPct: 30, status: weatherScore >= 60 ? 'High' : 'Normal' },
            { category: 'Water Security', score: waterScore, weightPct: 25, status: waterScore >= 60 ? 'Deficit' : 'Secure' },
            { category: 'Crop Stage Vulnerability', score: cropScore, weightPct: 20, status: stage === 'flowering' ? 'Sensitive' : 'Resilient' },
            { category: 'Market Volatility', score: marketScore, weightPct: 15, status: 'Moderate' },
            { category: 'Cost Margin Buffer', score: costScore, weightPct: 10, status: 'Stable' }
        ],
        activeRisks
    };
}
