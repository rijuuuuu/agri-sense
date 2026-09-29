import type { 
  Farm, 
  CropCycle, 
  WeatherDataPayload, 
  FarmTask, 
  SoilProfile, 
  WaterProfile 
} from '@agrisense/shared';

export function generateDailyFarmActions(
  farm: Farm,
  activeCycle?: CropCycle,
  weather?: WeatherDataPayload,
  soil?: SoilProfile,
  water?: WaterProfile
): FarmTask[] {
  const tasks: FarmTask[] = [];
  const today = new Date().toISOString().split('T')[0];
  const cropName = activeCycle?.crop?.commonName || 'Current Crop';
  const stage = activeCycle?.currentStage || 'vegetative';
  const rainOdds = weather?.current.rainProbabilityPct || 10;
  const windSpeed = weather?.current.windSpeedKmh || 12;
  const temp = weather?.current.temperatureCelsius || 28;

  // 1. Irrigation Task
  if (rainOdds >= 60) {
    tasks.push({
      id: `task-irrig-${today}`,
      farmId: farm.id,
      cropCycleId: activeCycle?.id,
      category: 'irrigation',
      title: 'Hold scheduled irrigation',
      description: `Rain probability is ${rainOdds}%. Postpone irrigation to avoid waterlogging and root asphyxiation in your ${soil?.soilType || 'farm'} soil.`,
      priority: 'high',
      dueDate: today,
      completed: false,
      generatedBy: 'rule_engine',
      rationale: `Derived from Open-Meteo precipitation forecast (${rainOdds}% probability) and ${soil?.drainageQuality || 'well_drained'} drainage profile.`
    });
  } else if (temp > 35) {
    tasks.push({
      id: `task-irrig-${today}`,
      farmId: farm.id,
      cropCycleId: activeCycle?.id,
      category: 'irrigation',
      title: 'Conduct early morning / evening irrigation',
      description: `High daytime temperature (${temp}°C) increases evapotranspiration. Run ${water?.irrigationMethod || 'drip'} system during cooler hours.`,
      priority: 'high',
      dueDate: today,
      completed: false,
      generatedBy: 'rule_engine',
      rationale: `Temperature is ${temp}°C, causing elevated soil surface moisture loss.`
    });
  } else {
    tasks.push({
      id: `task-irrig-${today}`,
      farmId: farm.id,
      cropCycleId: activeCycle?.id,
      category: 'irrigation',
      title: `Inspect root-zone moisture for ${cropName}`,
      description: `Check soil 2 inches below surface. If crumbly, apply standard irrigation using your ${water?.irrigationMethod || 'irrigation'} system.`,
      priority: 'medium',
      dueDate: today,
      completed: false,
      generatedBy: 'rule_engine',
      rationale: `Routine moisture maintenance for ${cropName} in ${stage} stage.`
    });
  }

  // 2. Crop Stage Monitoring Task
  let stageTitle = `Field inspection for ${cropName}`;
  let stageDesc = `Inspect crop canopy uniformity and weed competition in the ${stage} stage.`;
  let stagePriority: 'urgent' | 'high' | 'medium' | 'low' = 'medium';

  if (stage === 'flowering') {
    stageTitle = `Inspect bloom set and pollinator activity`;
    stageDesc = `Check flowers for thrips or fungal spots. Avoid moisture stress or harsh sprays during peak bloom hours.`;
    stagePriority = 'high';
  } else if (stage === 'fruiting') {
    stageTitle = `Monitor fruit/grain filling development`;
    stageDesc = `Ensure adequate potassium availability and inspect for fruit borers or pod damage.`;
    stagePriority = 'high';
  } else if (stage === 'germination') {
    stageTitle = `Verify seedling emergence rate`;
    stageDesc = `Check seedling density per linear meter. Spot-sow gaps if germination falls below 85%.`;
  } else if (stage === 'harvest') {
    stageTitle = `Check harvest maturity indicators`;
    stageDesc = `Examine grain moisture or crop color. Prepare clean threshing/packing equipment.`;
    stagePriority = 'urgent';
  }

  tasks.push({
    id: `task-stage-${today}`,
    farmId: farm.id,
    cropCycleId: activeCycle?.id,
    category: 'pest_monitoring',
    title: stageTitle,
    description: stageDesc,
    priority: stagePriority,
    dueDate: today,
    completed: false,
    generatedBy: 'rule_engine',
    rationale: `Triggered by ${cropName} lifecycle stage (${stage.toUpperCase()}).`
  });

  // 3. Weather-Specific Task
  if (windSpeed > 20) {
    tasks.push({
      id: `task-weather-${today}`,
      farmId: farm.id,
      cropCycleId: activeCycle?.id,
      category: 'weather_alert',
      title: 'Do not spray chemicals or liquid fertilizers today',
      description: `Wind speed is elevated (${windSpeed.toFixed(1)} km/h). Spray drift will cause chemical wastage and risk non-target leaf damage.`,
      priority: 'high',
      dueDate: today,
      completed: false,
      generatedBy: 'rule_engine',
      rationale: `Wind speed threshold (>20 km/h) exceeded based on Open-Meteo telemetry.`
    });
  } else {
    tasks.push({
      id: `task-weather-${today}`,
      farmId: farm.id,
      cropCycleId: activeCycle?.id,
      category: 'field_prep',
      title: 'Optimal weather window for foliar nourishment',
      description: `Wind is calm (${windSpeed.toFixed(1)} km/h) and rain risk is low. Favorable conditions for foliar nutrient or bio-fertilizer application.`,
      priority: 'low',
      dueDate: today,
      completed: false,
      generatedBy: 'rule_engine',
      rationale: `Wind and rain parameters are within safe agrochemical application windows.`
    });
  }

  // 4. Upcoming Preparation Task
  tasks.push({
    id: `task-prep-${today}`,
    farmId: farm.id,
    cropCycleId: activeCycle?.id,
    category: 'fertilization',
    title: `Record farm input expenses`,
    description: `Log any recent seed, fertilizer, or labor costs in Farm Economics to keep your What-If margin analysis accurate.`,
    priority: 'low',
    dueDate: today,
    completed: false,
    generatedBy: 'rule_engine',
    rationale: `Continuous financial intelligence update.`
  });

  return tasks;
}
