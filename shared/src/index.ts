export type IntegrationMode = 'LIVE' | 'DEMO' | 'NOT_CONFIGURED';

export interface DataProvenance {
  source: string;
  timestamp: string;
  mode: IntegrationMode;
  cached?: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    userFacingMessage: string;
  };
  provenance: DataProvenance;
}

export type PreferredLanguage = 'en' | 'hi' | 'pa' | 'te' | 'ta' | 'mr' | 'bn' | 'ml';

export interface FarmerProfile {
  id: string;
  authUserId: string;
  fullName: string;
  phoneNumber?: string;
  preferredLanguage: PreferredLanguage;
  farmingExperienceYears: number;
  approximateBudget?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Farm {
  id: string;
  farmerId: string;
  farmName: string;
  totalAreaAcres: number;
  latitude: number;
  longitude: number;
  villageDistrict: string;
  stateProvince: string;
  country: string;
  climateZone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Field {
  id: string;
  farmId: string;
  fieldName: string;
  areaAcres: number;
  currentCropCycleId?: string;
}

export type SoilType =
  | 'alluvial'
  | 'black'
  | 'red'
  | 'clay_loam'
  | 'sandy_loam'
  | 'silt_loam'
  | 'laterite';

export type NutrientLevel = 'low' | 'medium' | 'high';
export type DrainageQuality = 'poor' | 'moderate' | 'well_drained' | 'excessive';

export interface SoilProfile {
  id: string;
  farmId: string;
  fieldId?: string;
  soilType: SoilType;
  phLevel?: number;
  nitrogenLevel?: NutrientLevel;
  phosphorusLevel?: NutrientLevel;
  potassiumLevel?: NutrientLevel;
  organicMatterPct?: number;
  drainageQuality: DrainageQuality;
}

export type WaterSource =
  | 'borewell'
  | 'canal'
  | 'rainfed'
  | 'river'
  | 'open_well'
  | 'farm_pond';

export type WaterAvailability = 'abundant' | 'sufficient' | 'limited' | 'scarce';

export type IrrigationMethod =
  | 'drip'
  | 'sprinkler'
  | 'flood'
  | 'furrow'
  | 'rainfed_only';

export interface WaterProfile {
  id: string;
  farmId: string;
  waterSource: WaterSource;
  availabilityStatus: WaterAvailability;
  irrigationMethod: IrrigationMethod;
  storageCapacityLiters?: number;
}

export type CropCategory = 'grain' | 'pulse' | 'oilseed' | 'vegetable' | 'fruit' | 'cash';
export type AgriculturalSeason = 'kharif' | 'rabi' | 'zaid' | 'year_round';

export interface CropReference {
  id: string;
  commonName: string;
  scientificName?: string;
  category: CropCategory;
  suitableSeasons: AgriculturalSeason[];
  minTempCelsius: number;
  maxTempCelsius: number;
  optimalRainfallMmMin: number;
  optimalRainfallMmMax: number;
  minSoilPh: number;
  maxSoilPh: number;
  preferredSoilTypes: SoilType[];
  durationDaysMin: number;
  durationDaysMax: number;
  waterRequirementLevel: 'low' | 'medium' | 'high';
  averageYieldPerAcreKg: number;
  estimatedCostPerAcre: number;
  managementComplexity: 'low' | 'medium' | 'high';
  description?: string;
}

export type CropStage =
  | 'planning'
  | 'planting'
  | 'germination'
  | 'vegetative'
  | 'flowering'
  | 'fruiting'
  | 'harvest'
  | 'selling';

export interface CropCycle {
  id: string;
  farmId: string;
  fieldId?: string;
  cropId: string;
  crop?: CropReference;
  sowingDate: string;
  expectedHarvestDate: string;
  actualHarvestDate?: string;
  currentStage: CropStage;
  plantedAreaAcres: number;
  status: 'active' | 'completed' | 'abandoned';
  notes?: string;
}

export type ActionCategory =
  | 'irrigation'
  | 'fertilization'
  | 'pest_monitoring'
  | 'field_prep'
  | 'weather_alert'
  | 'harvest'
  | 'selling';

export type ActionPriority = 'urgent' | 'high' | 'medium' | 'low';

export interface FarmTask {
  id: string;
  farmId: string;
  cropCycleId?: string;
  category: ActionCategory;
  title: string;
  description: string;
  priority: ActionPriority;
  dueDate: string;
  completed: boolean;
  completedAt?: string;
  generatedBy: 'rule_engine' | 'copilot_ai' | 'farmer_manual';
  rationale: string;
}

export interface WeatherCondition {
  temperatureCelsius: number;
  humidityPct: number;
  rainfallMm: number;
  rainProbabilityPct: number;
  windSpeedKmh: number;
  weatherCode: number;
  weatherDescription: string;
}

export interface DailyForecast {
  date: string;
  tempMax: number;
  tempMin: number;
  precipitationMm: number;
  precipitationProbability: number;
  condition: string;
  weatherCode: number;
}

export interface AgriculturalAdvisory {
  irrigationNotice: {
    status: 'proceed' | 'caution' | 'postpone' | 'emergency';
    advice: string;
  };
  sprayingNotice: {
    isSuitable: boolean;
    reason: string;
  };
  heatStressAlert?: {
    level: 'normal' | 'moderate' | 'severe';
    message: string;
  };
  rainRiskWarning?: {
    level: 'none' | 'light' | 'heavy' | 'waterlogging_risk';
    message: string;
  };
}

export interface WeatherDataPayload {
  current: WeatherCondition;
  daily: DailyForecast[];
  advisory: AgriculturalAdvisory;
  farmLocation: {
    villageDistrict: string;
    latitude: number;
    longitude: number;
  };
}

export interface WhatIfInput {
  areaAcres: number;
  expectedYieldKgPerAcre: number;
  sellingPricePerKg: number;
  seedCostPerAcre: number;
  fertilizerCostPerAcre: number;
  pesticideCostPerAcre: number;
  labourCostPerAcre: number;
  irrigationCostPerAcre: number;
  otherCostPerAcre: number;
  priceVariationPct: number;
  yieldVariationPct: number;
  costVariationPct: number;
  irrigationReductionPct?: number;
}

export interface WhatIfResult {
  baseline: {
    totalYieldKg: number;
    grossRevenue: number;
    totalCost: number;
    grossMargin: number;
    marginPerAcre: number;
    costPerKg: number;
    breakevenPricePerKg: number;
  };
  simulated: {
    totalYieldKg: number;
    grossRevenue: number;
    totalCost: number;
    grossMargin: number;
    marginPerAcre: number;
    costPerKg: number;
    breakevenPricePerKg: number;
    irrigationReductionPct?: number;
    yieldLossFromWaterStressPct?: number;
  };
  delta: {
    grossMarginDiff: number;
    percentageChange: number;
    riskAssessment: 'favorable' | 'moderate_risk' | 'severe_loss_risk';
    recommendation: string;
  };
}

export interface CopilotAction {
  type: 'navigate' | 'update_stage' | 'complete_task' | 'detect_location' | 'switch_language' | 'open_modal' | 'calculate_economics';
  target?: string;
  label: string;
  payload?: any;
  executed?: boolean;
}

export interface CopilotMessage {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: string;
  contextSnapshot?: {
    farmName: string;
    cropName?: string;
    stage?: CropStage;
    weatherSummary?: string;
  };
  groundingCitations?: string[];
  action?: CopilotAction;
}

export interface MarketPriceRecord {
  commodity: string;
  marketName: string;
  state?: string;
  modalPricePerQuintal: number;
  minPrice: number;
  maxPrice: number;
  trend: 'rising' | 'stable' | 'falling';
  dateRecorded: string;
  distanceKm?: number;
}

export interface StateMarketSummary {
  state: string;
  regionalFocus: string;
  procurementPolicy: string;
  arrivalTrend: 'high' | 'moderate' | 'low';
  topGainers: string[];
  topDecliners: string[];
  mandiAdvisory: string;
}

export interface StateMarketIntelligenceData {
  state: string;
  stateSummary: StateMarketSummary;
  prices: MarketPriceRecord[];
  sellingConsiderations: string[];
  availableStates: { code: string; name: string }[];
}

export interface UserLocationInfo {
  latitude: number;
  longitude: number;
  district: string;
  state: string;
  country: string;
  formattedAddress?: string;
  isGpsDetected?: boolean;
}

export interface RiskItem {
  id: string;
  category: 'weather' | 'water' | 'crop_health' | 'market' | 'cost';
  title: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  recommendedMitigation: string;
  dataOrigin: string;
}

export interface DiseaseScanRecord {
  id: string;
  farmId: string;
  cropId?: string;
  cropName?: string;
  stage?: CropStage;
  affectedPart: 'leaves' | 'stem' | 'roots' | 'fruit';
  condition: string;
  conditionScientific?: string;
  confidencePct: number;
  confidenceRating: 'High' | 'Moderate' | 'Low / Uncertain';
  uncertaintyFactors?: string;
  observations: string[];
  recommendedActions: string[];
  preventionTips?: string[];
  requiresExtensionVerification: boolean;
  safetyNotice: string;
  imageUrl?: string;
  timestamp: string;
}

export interface ResourceRequirement {
  waterLitersPerAcre: number;
  totalWaterLiters: number;
  fertilizerKgPerAcre: {
    nitrogenKg: number;
    phosphorusKg: number;
    potassiumKg: number;
  };
  totalFertilizerKg: {
    nitrogenKg: number;
    phosphorusKg: number;
    potassiumKg: number;
  };
  laborPersonDaysPerAcre: number;
  totalLaborPersonDays: number;
  totalBudgetRequired: number;
  breakdown: {
    category: string;
    amount: number;
    percentage: number;
  }[];
}

export interface ExpenseRecord {
  id: string;
  farmId: string;
  cropCycleId?: string;
  category: 'seeds' | 'fertilizer' | 'pesticide' | 'labor' | 'irrigation' | 'machinery' | 'other';
  description: string;
  amount: number;
  dateRecorded: string;
}

