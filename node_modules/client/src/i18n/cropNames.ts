import type { Language } from './translations.js';

export const localizedCrops: Record<string, Record<Language, string>> = {
  'crop-wheat': {
    en: 'Wheat (Gehun)',
    ta: 'கோதுமை (Wheat)',
    ml: 'ഗോതമ്പ് (Wheat)'
  },
  'crop-rice': {
    en: 'Rice / Paddy (Dhan)',
    ta: 'நெல் / அரிசி (Paddy)',
    ml: 'നെല്ല് / അരി (Paddy)'
  },
  'crop-cotton': {
    en: 'Cotton (Kapas)',
    ta: 'பருத்தி (Cotton)',
    ml: 'പരുത്തി (Cotton)'
  },
  'crop-mustard': {
    en: 'Mustard (Sarson)',
    ta: 'கடுகு (Mustard)',
    ml: 'കടുക് (Mustard)'
  },
  'crop-tomato': {
    en: 'Tomato (Tamatar)',
    ta: 'தக்காளி (Tomato)',
    ml: 'തക്കാളി (Tomato)'
  },
  'crop-chickpea': {
    en: 'Chickpea / Gram (Chana)',
    ta: 'கொண்டைக்கடலை (Chana)',
    ml: 'കടല (Chickpea)'
  },
  'crop-maize': {
    en: 'Maize / Corn (Makka)',
    ta: 'மக்காச்சோளம் (Corn)',
    ml: 'ചോളം (Maize)'
  }
};

export const localizedSoilTypes: Record<string, Record<Language, string>> = {
  alluvial: {
    en: 'Alluvial Soil (Loam)',
    ta: 'வண்டல் மண் (Alluvial)',
    ml: 'എക്കൽ മണ്ണ് (Alluvial)'
  },
  black: {
    en: 'Black Cotton Soil (Regur)',
    ta: 'கரிசல் மண் (Black Soil)',
    ml: 'കറുത്ത മണ്ണ് (Black Soil)'
  },
  red: {
    en: 'Red Loam Soil',
    ta: 'செம்மண் (Red Soil)',
    ml: 'ചുവന്ന മണ്ണ് / ചെങ്കൽ മണ്ണ്'
  },
  clay_loam: {
    en: 'Clay Loam',
    ta: 'களிமண் கலந்த வண்டல்',
    ml: 'കളിമൺ കലർന്ന മണ്ണ്'
  },
  sandy_loam: {
    en: 'Sandy Loam',
    ta: 'மணல் கலந்த வண்டல்',
    ml: 'മണൽ കലർന്ന എക്കൽ മണ്ണ്'
  },
  silt_loam: {
    en: 'Silt Loam',
    ta: 'மண் துகள் கலவை',
    ml: 'എക്കൽ എക്കൽ മണ്ണ്'
  },
  laterite: {
    en: 'Laterite Soil',
    ta: 'சரளை மண் (Laterite)',
    ml: 'ലാറ്ററൈറ്റ് ചെങ്കൽ മണ്ണ്'
  }
};

export const localizedWaterSources: Record<string, Record<Language, string>> = {
  borewell: {
    en: 'Deep Borewell',
    ta: 'ஆழ்துளை கிணறு',
    ml: 'കുഴൽക്കിണർ (Borewell)'
  },
  canal: {
    en: 'Canal Network',
    ta: 'கால்வாய் பாசனம்',
    ml: 'കനാൽ ജലം'
  },
  open_well: {
    en: 'Open Well',
    ta: 'திறந்தவெளி கிணறு',
    ml: 'തുറന്ന കിണർ'
  },
  river: {
    en: 'River / Stream',
    ta: 'ஆற்றுநீர்',
    ml: 'പുഴ / തോട്'
  },
  farm_pond: {
    en: 'Rainwater Farm Pond',
    ta: 'பண்ணைக் குட்டை',
    ml: 'കൃഷിയിട കുളം'
  },
  rainfed: {
    en: 'Rainfed Only (No pump)',
    ta: 'மானாவாரி (மழை மட்டுமே)',
    ml: 'മഴയെ ആശ്രയിച്ച് മാത്രം'
  }
};

export const localizedIrrigationMethods: Record<string, Record<Language, string>> = {
  drip: {
    en: 'Drip Irrigation (Micro)',
    ta: 'சொட்டு நீர் பாசனம்',
    ml: 'തുള്ളിനന (Drip Irrigation)'
  },
  sprinkler: {
    en: 'Sprinkler System',
    ta: 'தெளிப்பு நீர் பாசனம்',
    ml: 'തളനന (Sprinkler System)'
  },
  flood: {
    en: 'Surface Flood Irrigation',
    ta: 'வாய்க்கால் பாய்ச்சல் முறை',
    ml: 'വെള്ളം കയറ്റിവിടൽ (Flood)'
  },
  furrow: {
    en: 'Furrow Irrigation',
    ta: 'பாத்தி அமைத்து பாசனம்',
    ml: 'ചാലുനന (Furrow)'
  },
  rainfed_only: {
    en: 'Rainfed (No irrigation)',
    ta: 'மானாவாரி முறை',
    ml: 'മഴാശ്രിത കൃഷി'
  }
};

export const localizedWaterAvailability: Record<string, Record<Language, string>> = {
  abundant: {
    en: 'Abundant Year-Round',
    ta: 'ஆண்டு முழுவதும் தாராளம்',
    ml: 'വർഷം മുഴുവൻ സമൃദ്ധം'
  },
  sufficient: {
    en: 'Sufficient for Planned Crop',
    ta: 'பயிருக்கு போதுமான அளவு',
    ml: 'വിളയ്ക്ക് ആവശ്യത്തിന് ലഭ്യമാണ്'
  },
  limited: {
    en: 'Limited (Seasonal constraint)',
    ta: 'குறைவான நீர் இருப்பு',
    ml: 'പരിമിതമായ ജലലഭ്യത'
  },
  scarce: {
    en: 'Scarce (Critical deficit)',
    ta: 'கடும் பற்றாக்குறை',
    ml: 'കടുത്ത ജലക്ഷാമം'
  }
};

export const localizedStages: Record<string, Record<Language, string>> = {
  planning: {
    en: 'Planning (Pre-sowing)',
    ta: 'திட்டமிடல் (விதைப்புக்கு முன்)',
    ml: 'ആസൂത്രണം (വിതയ്ക്ക് മുമ്പ്)'
  },
  planting: {
    en: 'Planting / Sowing',
    ta: 'விதைத்தல் / நடுதல்',
    ml: 'വിതയ്ക്കൽ / നടീൽ'
  },
  germination: {
    en: 'Germination / Emergence',
    ta: 'முளைப்பு நிலை',
    ml: 'മുളയ്ക്കൽ ഘട്ടം'
  },
  vegetative: {
    en: 'Vegetative Growth',
    ta: 'பயிர் வளர்ச்சி நிலை',
    ml: 'വളർച്ചാ ഘട്ടം'
  },
  flowering: {
    en: 'Flowering / Bloom',
    ta: 'பூக்கும் நிலை',
    ml: 'പൂവിടൽ ഘട്ടം'
  },
  fruiting: {
    en: 'Fruiting / Grain Filling',
    ta: 'காய் பிடிக்கும் / கதிர் முதிர்தல்',
    ml: 'കായ്ക്കൽ / കതിരിടൽ'
  },
  harvest: {
    en: 'Harvest Period',
    ta: 'அறுவடை நிலை',
    ml: 'വിളവെടുപ്പ് ഘട്ടം'
  },
  selling: {
    en: 'Selling / Market Dispatch',
    ta: 'விற்பனை நிலை',
    ml: 'വിപണന ഘട്ടം'
  }
};

export function getLocalizedCropName(cropId: string, lang: Language): string {
  return localizedCrops[cropId]?.[lang] || cropId;
}

export function getLocalizedSoilType(soilType: string, lang: Language): string {
  return localizedSoilTypes[soilType]?.[lang] || soilType;
}

export function getLocalizedWaterSource(source: string, lang: Language): string {
  return localizedWaterSources[source]?.[lang] || source;
}

export function getLocalizedIrrigationMethod(method: string, lang: Language): string {
  return localizedIrrigationMethods[method]?.[lang] || method;
}

export function getLocalizedWaterAvailability(status: string, lang: Language): string {
  return localizedWaterAvailability[status]?.[lang] || status;
}

export function getLocalizedStage(stage: string, lang: Language): string {
  return localizedStages[stage]?.[lang] || stage;
}
