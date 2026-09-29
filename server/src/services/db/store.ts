import fs from 'fs';
import path from 'path';
import type { 
  FarmerProfile, 
  Farm, 
  Field, 
  SoilProfile, 
  WaterProfile, 
  CropReference, 
  CropCycle, 
  FarmTask, 
  CopilotMessage,
  MarketPriceRecord,
  DiseaseScanRecord,
  ExpenseRecord
} from '@agrisense/shared';
import { getSupabaseClient } from './supabase.service.js';

// Agronomic Master Reference Crops
export const SEED_CROPS: CropReference[] = [
  {
    id: 'crop-wheat',
    commonName: 'Wheat (Gehun)',
    scientificName: 'Triticum aestivum',
    category: 'grain',
    suitableSeasons: ['rabi'],
    minTempCelsius: 10,
    maxTempCelsius: 25,
    optimalRainfallMmMin: 300,
    optimalRainfallMmMax: 750,
    minSoilPh: 6.0,
    maxSoilPh: 7.5,
    preferredSoilTypes: ['alluvial', 'clay_loam', 'silt_loam'],
    durationDaysMin: 110,
    durationDaysMax: 140,
    waterRequirementLevel: 'medium',
    averageYieldPerAcreKg: 1800,
    estimatedCostPerAcre: 14000,
    managementComplexity: 'low',
    description: 'Staple winter cereal crop. Requires cool early season and warm dry ripening period.'
  },
  {
    id: 'crop-rice',
    commonName: 'Rice / Paddy (Dhan)',
    scientificName: 'Oryza sativa',
    category: 'grain',
    suitableSeasons: ['kharif'],
    minTempCelsius: 20,
    maxTempCelsius: 38,
    optimalRainfallMmMin: 900,
    optimalRainfallMmMax: 2000,
    minSoilPh: 5.5,
    maxSoilPh: 7.2,
    preferredSoilTypes: ['clay_loam', 'alluvial'],
    durationDaysMin: 120,
    durationDaysMax: 155,
    waterRequirementLevel: 'high',
    averageYieldPerAcreKg: 2200,
    estimatedCostPerAcre: 18000,
    managementComplexity: 'medium',
    description: 'Primary monsoon grain. High water requirement, suitable for heavy soils with standing water retention.'
  },
  {
    id: 'crop-cotton',
    commonName: 'Cotton (Kapas)',
    scientificName: 'Gossypium hirsutum',
    category: 'cash',
    suitableSeasons: ['kharif'],
    minTempCelsius: 21,
    maxTempCelsius: 35,
    optimalRainfallMmMin: 500,
    optimalRainfallMmMax: 1000,
    minSoilPh: 6.0,
    maxSoilPh: 8.0,
    preferredSoilTypes: ['black', 'alluvial'],
    durationDaysMin: 150,
    durationDaysMax: 180,
    waterRequirementLevel: 'medium',
    averageYieldPerAcreKg: 1000,
    estimatedCostPerAcre: 22000,
    managementComplexity: 'high',
    description: 'High-value cash fiber crop. Thrives in deep black cotton soils with good drainage.'
  },
  {
    id: 'crop-mustard',
    commonName: 'Mustard (Sarson)',
    scientificName: 'Brassica juncea',
    category: 'oilseed',
    suitableSeasons: ['rabi'],
    minTempCelsius: 10,
    maxTempCelsius: 24,
    optimalRainfallMmMin: 250,
    optimalRainfallMmMax: 500,
    minSoilPh: 6.0,
    maxSoilPh: 7.5,
    preferredSoilTypes: ['sandy_loam', 'alluvial'],
    durationDaysMin: 100,
    durationDaysMax: 130,
    waterRequirementLevel: 'low',
    averageYieldPerAcreKg: 800,
    estimatedCostPerAcre: 10500,
    managementComplexity: 'low',
    description: 'Drought-tolerant winter oilseed with relatively low input cost and high market demand.'
  },
  {
    id: 'crop-tomato',
    commonName: 'Tomato (Tamatar)',
    scientificName: 'Solanum lycopersicum',
    category: 'vegetable',
    suitableSeasons: ['kharif', 'rabi', 'zaid', 'year_round'],
    minTempCelsius: 15,
    maxTempCelsius: 32,
    optimalRainfallMmMin: 400,
    optimalRainfallMmMax: 700,
    minSoilPh: 6.0,
    maxSoilPh: 7.0,
    preferredSoilTypes: ['sandy_loam', 'clay_loam', 'red'],
    durationDaysMin: 90,
    durationDaysMax: 120,
    waterRequirementLevel: 'medium',
    averageYieldPerAcreKg: 12000,
    estimatedCostPerAcre: 35000,
    managementComplexity: 'high',
    description: 'High-value horticultural crop with short duration and high returns, but sensitive to pest pressure and temperature spikes.'
  },
  {
    id: 'crop-chickpea',
    commonName: 'Chickpea / Bengal Gram (Chana)',
    scientificName: 'Cicer arietinum',
    category: 'pulse',
    suitableSeasons: ['rabi'],
    minTempCelsius: 12,
    maxTempCelsius: 28,
    optimalRainfallMmMin: 350,
    optimalRainfallMmMax: 600,
    minSoilPh: 6.0,
    maxSoilPh: 8.0,
    preferredSoilTypes: ['black', 'clay_loam', 'alluvial'],
    durationDaysMin: 95,
    durationDaysMax: 120,
    waterRequirementLevel: 'low',
    averageYieldPerAcreKg: 950,
    estimatedCostPerAcre: 11000,
    managementComplexity: 'low',
    description: 'Key pulse crop that fixes atmospheric nitrogen, restoring soil health with low water needs.'
  },
  {
    id: 'crop-maize',
    commonName: 'Maize / Corn (Makka)',
    scientificName: 'Zea mays',
    category: 'grain',
    suitableSeasons: ['kharif', 'rabi', 'zaid'],
    minTempCelsius: 18,
    maxTempCelsius: 34,
    optimalRainfallMmMin: 500,
    optimalRainfallMmMax: 900,
    minSoilPh: 5.8,
    maxSoilPh: 7.5,
    preferredSoilTypes: ['alluvial', 'red', 'sandy_loam'],
    durationDaysMin: 85,
    durationDaysMax: 110,
    waterRequirementLevel: 'medium',
    averageYieldPerAcreKg: 2400,
    estimatedCostPerAcre: 15500,
    managementComplexity: 'medium',
    description: 'Versatile cereal for food, feed, and starch. Rapid growth with responsive yield to balanced nutrition.'
  }
];

export interface AppStateData {
  farmer: FarmerProfile | null;
  farmers: FarmerProfile[];
  farms: Farm[];
  fields: Field[];
  soilProfiles: SoilProfile[];
  waterProfiles: WaterProfile[];
  crops: CropReference[];
  cropCycles: CropCycle[];
  tasks: FarmTask[];
  messages: CopilotMessage[];
  marketPrices: MarketPriceRecord[];
  diseaseScans: DiseaseScanRecord[];
  expenses: ExpenseRecord[];
  activeAuthUserId: string;
}

const STORAGE_FILE = path.resolve(process.cwd(), 'data', 'agrisense_store.json');

class DataStore {
  private data: AppStateData;

  constructor() {
    this.data = this.loadFromDisk();
  }

  private loadFromDisk(): AppStateData {
    try {
      if (fs.existsSync(STORAGE_FILE)) {
        const raw = fs.readFileSync(STORAGE_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        return {
          farmer: parsed.farmer || null,
          farmers: parsed.farmers || (parsed.farmer ? [parsed.farmer] : []),
          farms: parsed.farms || [],
          fields: parsed.fields || [],
          soilProfiles: parsed.soilProfiles || [],
          waterProfiles: parsed.waterProfiles || [],
          crops: parsed.crops?.length ? parsed.crops : [...SEED_CROPS],
          cropCycles: parsed.cropCycles || [],
          tasks: parsed.tasks || [],
          messages: parsed.messages || [],
          marketPrices: parsed.marketPrices || [],
          diseaseScans: parsed.diseaseScans || [],
          expenses: parsed.expenses || [],
          activeAuthUserId: parsed.activeAuthUserId || parsed.farmer?.authUserId || 'default-farmer-auth-id'
        };
      }
    } catch (err) {
      console.error('[DataStore] Failed to load from disk, initializing defaults', err);
    }

    const defaultAuthId = 'auth-default-farmer';
    return {
      farmer: null,
      farmers: [],
      farms: [],
      fields: [],
      soilProfiles: [],
      waterProfiles: [],
      crops: [...SEED_CROPS],
      cropCycles: [],
      tasks: [],
      messages: [],
      marketPrices: [],
      diseaseScans: [],
      expenses: [],
      activeAuthUserId: defaultAuthId
    };
  }

  private saveToDisk() {
    try {
      const dir = path.dirname(STORAGE_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(STORAGE_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('[DataStore] Failed to save to disk', err);
    }
  }

  // Active User / Auth Isolation
  getActiveAuthUserId(): string {
    return this.data.activeAuthUserId;
  }

  setActiveAuthUserId(authUserId: string) {
    this.data.activeAuthUserId = authUserId;
    // Update active farmer reference for this auth user
    const matched = this.data.farmers.find(f => f.authUserId === authUserId);
    this.data.farmer = matched || null;
    this.saveToDisk();
  }

  // Farmer Profiles
  getFarmer(authUserId?: string): FarmerProfile | null {
    const targetAuth = authUserId || this.data.activeAuthUserId;
    if (this.data.farmers && this.data.farmers.length > 0) {
      const found = this.data.farmers.find(f => f.authUserId === targetAuth);
      if (found) return found;
    }
    return this.data.farmer;
  }

  saveFarmer(farmer: FarmerProfile): FarmerProfile {
    this.data.farmer = farmer;
    if (!this.data.farmers) this.data.farmers = [];
    const idx = this.data.farmers.findIndex(f => f.id === farmer.id || f.authUserId === farmer.authUserId);
    if (idx >= 0) {
      this.data.farmers[idx] = farmer;
    } else {
      this.data.farmers.push(farmer);
    }
    this.data.activeAuthUserId = farmer.authUserId;
    this.saveToDisk();
    return farmer;
  }

  getAllFarmers(): FarmerProfile[] {
    return this.data.farmers || [];
  }

  // Farms
  getFarms(farmerId?: string): Farm[] {
    const activeFarmer = this.getFarmer();
    const effectiveFarmerId = farmerId || activeFarmer?.id;
    if (effectiveFarmerId) {
      return this.data.farms.filter(f => f.farmerId === effectiveFarmerId);
    }
    return this.data.farms;
  }

  getFarmById(id: string): Farm | undefined {
    return this.data.farms.find(f => f.id === id);
  }

  saveFarm(farm: Farm): Farm {
    const idx = this.data.farms.findIndex(f => f.id === farm.id);
    if (idx >= 0) {
      this.data.farms[idx] = farm;
    } else {
      this.data.farms.push(farm);
    }
    this.saveToDisk();
    return farm;
  }

  deleteFarm(farmId: string): boolean {
    const prevCount = this.data.farms.length;
    this.data.farms = this.data.farms.filter(f => f.id !== farmId);
    this.data.soilProfiles = this.data.soilProfiles.filter(s => s.farmId !== farmId);
    this.data.waterProfiles = this.data.waterProfiles.filter(w => w.farmId !== farmId);
    this.data.cropCycles = this.data.cropCycles.filter(c => c.farmId !== farmId);
    this.data.tasks = this.data.tasks.filter(t => t.farmId !== farmId);
    this.data.diseaseScans = this.data.diseaseScans.filter(d => d.farmId !== farmId);
    this.data.expenses = this.data.expenses.filter(e => e.farmId !== farmId);
    this.saveToDisk();
    return this.data.farms.length < prevCount;
  }

  // Fields
  getFields(farmId?: string): Field[] {
    if (farmId) {
      return this.data.fields.filter(f => f.farmId === farmId);
    }
    return this.data.fields;
  }

  saveField(field: Field): Field {
    const idx = this.data.fields.findIndex(f => f.id === field.id);
    if (idx >= 0) {
      this.data.fields[idx] = field;
    } else {
      this.data.fields.push(field);
    }
    this.saveToDisk();
    return field;
  }

  // Soil Profiles
  getSoilProfile(farmId: string): SoilProfile | undefined {
    return this.data.soilProfiles.find(s => s.farmId === farmId);
  }

  saveSoilProfile(soil: SoilProfile): SoilProfile {
    const idx = this.data.soilProfiles.findIndex(s => s.farmId === soil.farmId);
    if (idx >= 0) {
      this.data.soilProfiles[idx] = soil;
    } else {
      this.data.soilProfiles.push(soil);
    }
    this.saveToDisk();
    return soil;
  }

  // Water Profiles
  getWaterProfile(farmId: string): WaterProfile | undefined {
    return this.data.waterProfiles.find(w => w.farmId === farmId);
  }

  saveWaterProfile(water: WaterProfile): WaterProfile {
    const idx = this.data.waterProfiles.findIndex(w => w.farmId === water.farmId);
    if (idx >= 0) {
      this.data.waterProfiles[idx] = water;
    } else {
      this.data.waterProfiles.push(water);
    }
    this.saveToDisk();
    return water;
  }

  // Crops & Cycles
  getCrops(): CropReference[] {
    return this.data.crops;
  }

  getCropById(id: string): CropReference | undefined {
    return this.data.crops.find(c => c.id === id);
  }

  getCropCycles(farmId?: string): CropCycle[] {
    if (farmId) {
      return this.data.cropCycles.filter(c => c.farmId === farmId);
    }
    return this.data.cropCycles;
  }

  saveCropCycle(cycle: CropCycle): CropCycle {
    const idx = this.data.cropCycles.findIndex(c => c.id === cycle.id);
    if (idx >= 0) {
      this.data.cropCycles[idx] = cycle;
    } else {
      this.data.cropCycles.push(cycle);
    }
    this.saveToDisk();
    return cycle;
  }

  deleteCropCycle(cycleId: string): boolean {
    const prev = this.data.cropCycles.length;
    this.data.cropCycles = this.data.cropCycles.filter(c => c.id !== cycleId);
    this.saveToDisk();
    return this.data.cropCycles.length < prev;
  }

  // Tasks / Actions
  getTasks(farmId?: string): FarmTask[] {
    if (farmId) {
      return this.data.tasks.filter(t => t.farmId === farmId);
    }
    return this.data.tasks;
  }

  saveTasks(tasks: FarmTask[]) {
    this.data.tasks = tasks;
    this.saveToDisk();
  }

  toggleTaskCompleted(taskId: string): FarmTask | undefined {
    const task = this.data.tasks.find(t => t.id === taskId);
    if (task) {
      task.completed = !task.completed;
      task.completedAt = task.completed ? new Date().toISOString() : undefined;
      this.saveToDisk();
    }
    return task;
  }

  // Copilot Messages
  getMessages(): CopilotMessage[] {
    return this.data.messages;
  }

  addMessage(msg: CopilotMessage): CopilotMessage {
    this.data.messages.push(msg);
    this.saveToDisk();
    return msg;
  }

  clearMessages(): void {
    this.data.messages = [];
    this.saveToDisk();
  }

  // Market Prices
  getMarketPrices(): MarketPriceRecord[] {
    return this.data.marketPrices;
  }

  saveMarketPrices(prices: MarketPriceRecord[]) {
    this.data.marketPrices = prices;
    this.saveToDisk();
  }

  // Disease Scans
  getDiseaseScans(farmId?: string): DiseaseScanRecord[] {
    if (farmId) {
      return this.data.diseaseScans.filter(d => d.farmId === farmId);
    }
    return this.data.diseaseScans;
  }

  saveDiseaseScan(scan: DiseaseScanRecord): DiseaseScanRecord {
    this.data.diseaseScans.unshift(scan);
    this.saveToDisk();
    return scan;
  }

  // Expenses & Ledger
  getExpenses(farmId?: string): ExpenseRecord[] {
    if (farmId) {
      return this.data.expenses.filter(e => e.farmId === farmId);
    }
    return this.data.expenses;
  }

  saveExpense(expense: ExpenseRecord): ExpenseRecord {
    this.data.expenses.push(expense);
    this.saveToDisk();
    return expense;
  }
}

export const dbStore = new DataStore();
