export type Language = 'en' | 'ta' | 'ml';

export interface Translations {
  brand: {
    title: string;
    subtitle: string;
    copilotBadge: string;
    weatherBadge: string;
    setUpFarm: string;
  };
  nav: {
    dashboard: string;
    actions: string;
    copilot: string;
    recommendations: string;
    lifecycle: string;
    health: string;
    market: string;
    economics: string;
    risk: string;
  };
  dashboard: {
    fieldStatus: string;
    farmerLabel: string;
    areaLabel: string;
    soilLabel: string;
    currentCrop: string;
    cropStage: string;
    updateStage: string;
    todaysWeather: string;
    openMeteoLive: string;
    rainProb: string;
    humidity: string;
    windSpeed: string;
    agroAdvisory: string;
    actionAdvisory: string;
    irrigationGuidance: string;
    sprayingNotice: string;
    actionCenter: string;
    actionCenterSubtitle: string;
    completed: string;
    copilotCardTitle: string;
    copilotCardSubtitle: string;
    openCopilotBtn: string;
    noTasks: string;
  };
  actions: {
    title: string;
    subtitle: string;
    allTasks: string;
    irrigation: string;
    scouting: string;
    weatherDefense: string;
    rationaleLabel: string;
    completedOf: string;
    noTasksCategory: string;
    categoryLabel: string;
  };
  copilot: {
    title: string;
    subtitle: string;
    inputPlaceholder: string;
    sendBtn: string;
    suggestedTitle: string;
    verifiedSources: string;
    analyzing: string;
    activeStatus: string;
    quickPrompts: string[];
    welcomeMsg: string;
  };
  recommendations: {
    title: string;
    subtitle: string;
    targetSeason: string;
    fieldLocation: string;
    soilLabel: string;
    waterLabel: string;
    areaLabel: string;
    suitableScore: string;
    estMargin: string;
    duration: string;
    waterNeed: string;
    estCost: string;
    marketOutlook: string;
    keyRisk: string;
    plantBtn: string;
    reasonsTitle: string;
    evaluating: string;
    seasons: {
      rabi: string;
      kharif: string;
      zaid: string;
    };
  };
  lifecycle: {
    title: string;
    subtitle: string;
    clickToSet: string;
    activeNow: string;
    completed: string;
    upcoming: string;
    criticalNotice: string;
    stages: Record<string, { title: string; subtitle: string; guidance: string; criticalWatch: string }>;
  };
  health: {
    title: string;
    subtitle: string;
    step1Title: string;
    affectedPartLabel: string;
    parts: {
      leaves: string;
      stem: string;
      roots: string;
      fruit: string;
    };
    symptomsLabel: string;
    symptomsOptions: {
      yellowing: string;
      rust: string;
      curling: string;
      bleaching: string;
    };
    attachPhotoLabel: string;
    attachClick: string;
    photoAttached: string;
    photoFormats: string;
    analyzeBtn: string;
    analyzingBtn: string;
    step2Title: string;
    step2Placeholder: string;
    observedFactors: string;
    practicalSteps: string;
    safetyNotice: string;
  };
  economics: {
    title: string;
    subtitle: string;
    baselineTitle: string;
    plantedArea: string;
    yieldPerAcre: string;
    sellingPrice: string;
    inputCostHeader: string;
    seeds: string;
    fertilizer: string;
    pesticides: string;
    labour: string;
    irrigation: string;
    machineryOther: string;
    slidersTitle: string;
    priceVar: string;
    yieldVar: string;
    costVar: string;
    scenarioPriceDrop: string;
    scenarioYieldLoss: string;
    resetBase: string;
    resultsTitle: string;
    estRevenue: string;
    prodCost: string;
    grossMargin: string;
    breakeven: string;
    riskRating: string;
    decisionGuidance: string;
    baselinePrefix: string;
    shiftPrefix: string;
  };
  market: {
    title: string;
    subtitle: string;
    liveBadge: string;
    demoBadge: string;
    dataSource: string;
    modeLabel: string;
    timestampLabel: string;
    modalRate: string;
    perQuintal: string;
    trendRising: string;
    trendStable: string;
    trendFalling: string;
    minLabel: string;
    maxLabel: string;
    sellingConsiderations: string;
    loading: string;
    stateIntelligence: string;
    informedByLocation: string;
    selectState: string;
    procurementPolicy: string;
    regionalFocus: string;
    mandiAdvisory: string;
    arrivalTrend: string;
  };
  location: {
    detectBtn: string;
    detecting: string;
    detectedBadge: string;
    useMyGps: string;
    permissionPrompt: string;
  };
  risk: {
    title: string;
    subtitle: string;
    riskIndex: string;
    methodologyLabel: string;
    breakdownTitle: string;
    activeAlertsTitle: string;
    noRisks: string;
    mitigationLabel: string;
    originLabel: string;
    loading: string;
  };
  onboarding: {
    modalTitleEdit: string;
    modalTitleNew: string;
    modalSubtitle: string;
    step1: string;
    step2: string;
    step3: string;
    farmerName: string;
    phone: string;
    experience: string;
    languageLabel: string;
    farmName: string;
    landArea: string;
    district: string;
    state: string;
    latitude: string;
    longitude: string;
    soilTitle: string;
    soilType: string;
    soilPh: string;
    drainage: string;
    waterTitle: string;
    waterSource: string;
    waterAvailability: string;
    irrigationMethod: string;
    cropTitle: string;
    currentCrop: string;
    currentStage: string;
    workingBudget: string;
    workingBudgetHelp: string;
    nextBtn: string;
    backBtn: string;
    saveBtn: string;
    savingBtn: string;
  };
  common: {
    acres: string;
    kg: string;
    quintal: string;
    rupee: string;
    perAcre: string;
    days: string;
  };
}

export const translations: Record<Language, Translations> = {
  en: {
    brand: {
      title: 'AgriSense',
      subtitle: 'AI Farm Decision-Support',
      copilotBadge: 'Copilot',
      weatherBadge: 'Weather',
      setUpFarm: 'Set Up Farm'
    },
    nav: {
      dashboard: 'Action Center',
      actions: "Today's Actions",
      copilot: 'AI Farm Copilot',
      recommendations: 'Crop Recommendations',
      lifecycle: 'Crop Lifecycle',
      health: 'Crop Health',
      market: 'Market Intelligence',
      economics: 'What-If Economics',
      risk: 'Risk Center'
    },
    dashboard: {
      fieldStatus: 'Active Field Status',
      farmerLabel: 'Farmer',
      areaLabel: 'Area',
      soilLabel: 'Soil',
      currentCrop: 'Current Crop & Stage',
      cropStage: 'Stage',
      updateStage: 'Update Stage',
      todaysWeather: "Today's Field Weather",
      openMeteoLive: 'Open-Meteo Live',
      rainProb: 'RAIN PROBABILITY',
      humidity: 'HUMIDITY',
      windSpeed: 'WIND SPEED',
      agroAdvisory: 'Agricultural Interpretation Layer',
      actionAdvisory: 'Action Advisory',
      irrigationGuidance: 'Irrigation Guidance',
      sprayingNotice: 'Foliar Spray & Chemical Application',
      actionCenter: "Today's Farm Action Center",
      actionCenterSubtitle: 'Proactive daily actions computed from your standing crop stage and real-time weather.',
      completed: 'Completed',
      copilotCardTitle: 'Ask AgriSense Copilot',
      copilotCardSubtitle: 'Context-grounded AI advisor ready to answer practical questions about your farm.',
      openCopilotBtn: 'Open Full Copilot Chat →',
      noTasks: 'No actions pending for today. Your farm is up to date!'
    },
    actions: {
      title: "Today's Farm Action Center",
      subtitle: 'Traceable daily priorities generated from real-time weather forecasts and current crop stage requirements.',
      allTasks: 'All Tasks',
      irrigation: '💧 Irrigation',
      scouting: '🔍 Crop Scouting',
      weatherDefense: '🌦️ Weather Defense',
      rationaleLabel: 'Data Origin / Rationale',
      completedOf: 'Completed',
      noTasksCategory: 'No tasks found in this category.',
      categoryLabel: 'Category'
    },
    copilot: {
      title: 'Personalized Farm Copilot (Grounded AI)',
      subtitle: 'Grounded strictly on your farm acreage, soil pH, active crop stage, and live weather.',
      inputPlaceholder: 'Ask about irrigation, crop health, fertilizer, or weather...',
      sendBtn: 'Send',
      suggestedTitle: 'Quick Suggested Inquiries',
      verifiedSources: 'Verified Context Sources',
      analyzing: 'AgriSense Copilot is analyzing your farm metrics and weather data...',
      activeStatus: 'Grounded AI Active',
      quickPrompts: [
        'Should I irrigate today?',
        'What fertilizer is best for this stage?',
        'Why are lower leaves turning yellow?',
        'What happens if commodity prices fall 10%?'
      ],
      welcomeMsg: 'Hello! I am your **AgriSense Farm Copilot**. I have loaded your farm metrics and live weather. Ask me anything about irrigation decisions, fertilizer scheduling, disease observation, or crop choices!'
    },
    recommendations: {
      title: 'Agronomic Crop Recommendation Engine',
      subtitle: 'Deterministic agro-climatic matching engine: evaluates your soil texture, pH, water availability, and regional season.',
      targetSeason: 'Target Season',
      fieldLocation: 'Field Location',
      soilLabel: 'Soil',
      waterLabel: 'Water',
      areaLabel: 'Area',
      suitableScore: 'Suitability',
      estMargin: 'Est. Gross Margin',
      duration: 'CROP DURATION',
      waterNeed: 'WATER INTENSITY',
      estCost: 'ESTIMATED COST',
      marketOutlook: 'MARKET OUTLOOK',
      keyRisk: 'Key Risk',
      plantBtn: 'Plant on Farm →',
      reasonsTitle: 'Suitability Factors (Based on Available Data):',
      evaluating: 'Evaluating agro-climatic rules and market margins...',
      seasons: {
        rabi: 'Rabi (Winter: Oct - Mar)',
        kharif: 'Kharif (Monsoon: Jun - Oct)',
        zaid: 'Zaid (Summer: Mar - Jun)'
      }
    },
    lifecycle: {
      title: 'Crop Lifecycle Stage Tracker',
      subtitle: 'AgriSense adapts daily farm actions, irrigation guidelines, and risk advisories based on your crop’s physiological stage.',
      clickToSet: 'Click to Set Active Stage',
      activeNow: 'Active Now',
      completed: 'Completed',
      upcoming: 'Upcoming',
      criticalNotice: 'Critical',
      stages: {
        planning: {
          title: '1. Planning',
          subtitle: 'Pre-Sowing & Soil Prep',
          guidance: 'Perform deep summer ploughing, apply 4-5 tonnes of farmyard manure per acre, and test soil pH before finalizing seed variety.',
          criticalWatch: 'Ensure soil pH is between 6.0 and 7.5; procure certified seed with high germination (>85%).'
        },
        planting: {
          title: '2. Planting',
          subtitle: 'Sowing & Basal Dosing',
          guidance: 'Maintain row-to-row spacing (20-22 cm) and depth (4-5 cm). Apply basal dose of phosphorus (DAP) and potassium at sowing.',
          criticalWatch: 'Avoid sowing in dry topsoil or waterlogged furrows.'
        },
        germination: {
          title: '3. Germination',
          subtitle: 'Seedling Emergence (Days 5-15)',
          guidance: 'Monitor seedling emergence rate. Maintain uniform light surface moisture. Inspect for cutworms or soil-borne damping-off fungi.',
          criticalWatch: 'Resow bare patches within 10 days to protect population density.'
        },
        vegetative: {
          title: '4. Vegetative Growth',
          subtitle: 'Tillering & Canopy Expansion',
          guidance: 'Apply first split of top-dressed Urea along with irrigation (Crown Root Initiation stage for wheat). Conduct mechanical weeding.',
          criticalWatch: 'Monitor for aphid colonies and zinc deficiency (yellow chlorotic bands).'
        },
        flowering: {
          title: '5. Flowering',
          subtitle: 'Bloom & Pollination Set',
          guidance: 'Extremely critical moisture stage. Maintain optimal root-zone water. Do not apply harsh chemical sprays during morning pollination hours.',
          criticalWatch: 'Heat stress (>35°C) can cause pollen desiccation. Light evening irrigation mitigates heat shock.'
        },
        fruiting: {
          title: '6. Fruiting / Filling',
          subtitle: 'Grain Filling & Pod Maturation',
          guidance: 'Foliar spray of 0:0:50 (Potassium Sulfate) supports grain weight and test weight. Protect against pod borers and late rust.',
          criticalWatch: 'Prevent terminal moisture drought to avoid shriveled grains.'
        },
        harvest: {
          title: '7. Harvest',
          subtitle: 'Physiological Maturity',
          guidance: 'Harvest when grain moisture drops below 14-16%. Use clean combine harvesters or sickles in dry morning weather.',
          criticalWatch: 'Avoid harvesting damp crop to prevent storage mould and mycotoxin contamination.'
        },
        selling: {
          title: '8. Selling',
          subtitle: 'Post-Harvest & Mandi Dispatch',
          guidance: 'Clean and grade grain batches. Check live Mandi modal rates in AgriSense Market Intelligence before choosing yard or storage.',
          criticalWatch: 'Compare local APMC rates against minimum support prices (MSP).'
        }
      }
    },
    health: {
      title: 'Crop Health & Symptom Checker',
      subtitle: 'Assists in identifying possible nutrient deficiencies, pests, and leaf diseases.',
      step1Title: 'Step 1: Select Plant Symptoms',
      affectedPartLabel: 'Affected Plant Part',
      parts: {
        leaves: 'Leaves',
        stem: 'Stem',
        roots: 'Roots',
        fruit: 'Fruit / Grain'
      },
      symptomsLabel: 'Observed Visual Symptoms',
      symptomsOptions: {
        yellowing: 'Uniform leaf yellowing (Chlorosis)',
        rust: 'Orange/Brown powdery spots or stripes (Rust)',
        curling: 'Leaf curling / Stunted upward growth',
        bleaching: 'Interveinal white/yellow bleaching (Micronutrient)'
      },
      attachPhotoLabel: 'Attach Leaf Photo (Optional)',
      attachClick: 'Click to select sample crop photo',
      photoAttached: 'Attached',
      photoFormats: 'Supports JPEG, PNG, WebP (Max 5MB)',
      analyzeBtn: 'Analyze Symptoms & Review Guidance →',
      analyzingBtn: 'Evaluating Symptoms...',
      step2Title: 'Step 2: AI-Assisted Assessment',
      step2Placeholder: 'Select observed symptoms on the left to view agricultural diagnostic guidance.',
      observedFactors: 'Observed Factors:',
      practicalSteps: 'Practical Farm Next Steps:',
      safetyNotice: 'Notice: AI-assisted observation only. Always verify acute disease symptoms with an agricultural extension officer.'
    },
    economics: {
      title: 'Farm Economics & Deterministic What-If Simulator',
      subtitle: 'Pure algorithmic calculations (zero AI math hallucination). Test how price drops or yield losses impact your net farm margin.',
      baselineTitle: 'Baseline Parameters',
      plantedArea: 'Planted Area (Acres)',
      yieldPerAcre: 'Yield (kg / acre)',
      sellingPrice: 'Selling Price (₹ / kg)',
      inputCostHeader: 'Input Cost Breakdown (₹ per Acre)',
      seeds: 'Seeds',
      fertilizer: 'Fertilizer',
      pesticides: 'Pesticides',
      labour: 'Labour',
      irrigation: 'Irrigation',
      machineryOther: 'Machinery/Other',
      slidersTitle: 'What-If Scenario Sliders',
      priceVar: 'Market Price Variation',
      yieldVar: 'Yield Variation (Weather / Pests)',
      costVar: 'Input Cost Inflation',
      scenarioPriceDrop: 'Scenario: 10% Price Drop',
      scenarioYieldLoss: 'Scenario: 20% Yield Loss',
      resetBase: 'Reset to Base',
      resultsTitle: 'Financial Outcome Comparison',
      estRevenue: 'ESTIMATED REVENUE',
      prodCost: 'TOTAL PRODUCTION COST',
      grossMargin: 'PROJECTED GROSS MARGIN',
      breakeven: 'BREAKEVEN SELLING PRICE',
      riskRating: 'Risk Rating',
      decisionGuidance: 'Economic Decision Guidance:',
      baselinePrefix: 'Baseline',
      shiftPrefix: 'Shift'
    },
    market: {
      title: 'Agricultural Market Intelligence',
      subtitle: 'Wholesale terminal prices, mandi trends, and timing considerations for key agricultural commodities.',
      liveBadge: 'Live APMC Feed',
      demoBadge: 'DEMO: Reference Benchmarks',
      dataSource: 'Data Source',
      modeLabel: 'Mode',
      timestampLabel: 'Timestamp',
      modalRate: 'Modal Price',
      perQuintal: '/ quintal',
      trendRising: 'RISING',
      trendStable: 'STABLE',
      trendFalling: 'FALLING',
      minLabel: 'Min',
      maxLabel: 'Max',
      sellingConsiderations: 'Selling Considerations & Timing Guidance',
      loading: 'Fetching wholesale mandi rates...',
      stateIntelligence: 'State Market Intelligence & APMC Analysis',
      informedByLocation: 'Informed by your detected GPS location',
      selectState: 'Select State / Territory',
      procurementPolicy: 'State Procurement & Support Price (MSP)',
      regionalFocus: 'Regional Agro-Economic Focus',
      mandiAdvisory: 'Mandi Quality & Arrival Advisory',
      arrivalTrend: 'Arrival Volume'
    },
    location: {
      detectBtn: 'Detect GPS Location',
      detecting: 'Locating GPS...',
      detectedBadge: 'GPS Active',
      useMyGps: 'Use Current Location',
      permissionPrompt: 'AgriSense uses your location to provide accurate field weather and state-specific market prices.'
    },
    risk: {
      title: 'Farm Risk Center',
      subtitle: 'Multi-factor risk assessment derived deterministically from field telemetry, soil/water security, and market trends.',
      riskIndex: 'COMPOSITE RISK INDEX',
      methodologyLabel: 'Documented Methodology:',
      breakdownTitle: 'Vulnerability Breakdown by Factor',
      activeAlertsTitle: 'Active Risk Alerts & Recommended Defenses',
      noRisks: 'No acute risks detected. All operational parameters are within safe thresholds.',
      mitigationLabel: 'Mitigation Defense:',
      originLabel: 'Origin:',
      loading: 'Computing multi-factor risk matrix...'
    },
    onboarding: {
      modalTitleEdit: 'Farm Profile & Land Context',
      modalTitleNew: 'Welcome to AgriSense: Farm Onboarding',
      modalSubtitle: 'Your profile grounds the AI Copilot, weather rules, and crop recommendations in your real field metrics.',
      step1: '1. Farmer & Land',
      step2: '2. Soil & Water',
      step3: '3. Planted Crop & Budget',
      farmerName: 'Farmer Full Name *',
      phone: 'Phone Number',
      experience: 'Farming Experience (Years)',
      languageLabel: 'Preferred Advisory Language',
      farmName: 'Farm / Holding Name *',
      landArea: 'Total Land Area (Acres) *',
      district: 'Village / District *',
      state: 'State / Province',
      latitude: 'Latitude (for Open-Meteo Weather)',
      longitude: 'Longitude (for Open-Meteo Weather)',
      soilTitle: 'Soil Characteristics & Health',
      soilType: 'Soil Type',
      soilPh: 'Soil pH Level',
      drainage: 'Drainage Quality',
      waterTitle: 'Water Resources & Irrigation Setup',
      waterSource: 'Primary Water Source',
      waterAvailability: 'Availability Status',
      irrigationMethod: 'Irrigation Method',
      cropTitle: 'Active Standing Crop',
      currentCrop: 'Currently Planted Crop',
      currentStage: 'Current Growth Stage',
      workingBudget: 'Approximate Season Working Budget (₹)',
      workingBudgetHelp: 'Used to filter realistic crop recommendations and calculate safety buffers.',
      nextBtn: 'Continue →',
      backBtn: '← Back',
      saveBtn: 'Save & Activate Farm Profile',
      savingBtn: 'Saving Profile...'
    },
    common: {
      acres: 'Acres',
      kg: 'kg',
      quintal: 'quintal',
      rupee: '₹',
      perAcre: '/ acre',
      days: 'Days'
    }
  },
  ta: {
    brand: {
      title: 'அக்ரிசென்ஸ் (AgriSense)',
      subtitle: 'விவசாய முடிவெடுக்கும் AI தளம்',
      copilotBadge: 'AI வழிகாட்டி',
      weatherBadge: 'வானிலை',
      setUpFarm: 'நிலத்தை அமைக்கவும்'
    },
    nav: {
      dashboard: 'செயல் மையம்',
      actions: 'இன்றைய பணிகள்',
      copilot: 'விவசாய AI வழிகாட்டி',
      recommendations: 'பயிர் பரிந்துரைகள்',
      lifecycle: 'பயிர் சுழற்சி',
      health: 'பயிர் நலம்',
      market: 'சந்தை நிலவரம்',
      economics: 'வருமான மாதிரி கணக்கீடு',
      risk: 'ஆபத்து மையம்'
    },
    dashboard: {
      fieldStatus: 'செயலில் உள்ள நில நிலை',
      farmerLabel: 'விவசாயி',
      areaLabel: 'பரப்பளவு',
      soilLabel: 'மண் வகை',
      currentCrop: 'தற்போதைய பயிர் & நிலை',
      cropStage: 'பயிர் நிலை',
      updateStage: 'நிலையை மாற்று',
      todaysWeather: 'இன்றைய நில வானிலை',
      openMeteoLive: 'நேரடி வானிலை',
      rainProb: 'மழை வாய்ப்பு',
      humidity: 'ஈரப்பதம்',
      windSpeed: 'காற்றின் வேகம்',
      agroAdvisory: 'விவசாய வானிலை வழிகாட்டல்',
      actionAdvisory: 'செயல் ஆலோசனை',
      irrigationGuidance: 'பாசன வழிகாட்டுதல்',
      sprayingNotice: 'பூச்சிக்கொல்லி & உரம் தெளிக்கும் நிலை',
      actionCenter: 'இன்றைய விவசாய செயல் மையம்',
      actionCenterSubtitle: 'உங்கள் பயிர் நிலை மற்றும் நேரடி வானிலையின் அடிப்படையில் கணக்கிடப்பட்ட தினசரி பணிகள்.',
      completed: 'நிறைவுற்றவை',
      copilotCardTitle: 'விவசாய AI வழிகாட்டியிடம் கேளுங்கள்',
      copilotCardSubtitle: 'உங்கள் நிலத் தகவல்களின் அடிப்படையில் துல்லியமான பதில்களை வழங்கும் விவசாய உதவியாளர்.',
      openCopilotBtn: 'முழு AI அரட்டையைத் திறக்கவும் →',
      noTasks: 'இன்று நிலுவையில் பணிகள் எதுவும் இல்லை. உங்கள் பண்ணை சீராக உள்ளது!'
    },
    actions: {
      title: 'இன்றைய விவசாய செயல் மையம்',
      subtitle: 'நேரடி வானிலை மற்றும் தற்போதைய பயிர் நிலைக்கு ஏற்ப உருவாக்கப்பட்ட முன்னுரிமைப் பணிகள்.',
      allTasks: 'அனைத்து பணிகள்',
      irrigation: '💧 பாசனம்',
      scouting: '🔍 பயிர் கண்காணிப்பு',
      weatherDefense: '🌦️ வானிலை பாதுகாப்பு',
      rationaleLabel: 'காரணம் / தகவல் ஆதாரம்',
      completedOf: 'நிறைவுற்றவை',
      noTasksCategory: 'இந்தப் பிரிவில் பணிகள் எதுவும் இல்லை.',
      categoryLabel: 'பிரிவு'
    },
    copilot: {
      title: 'தனிப்பயனாக்கப்பட்ட விவசாய AI வழிகாட்டி',
      subtitle: 'உங்கள் நிலத்தின் அளவு, மண்ணின் pH, பயிர் நிலை மற்றும் நேரடி வானிலை அடிப்படையில் பதிலளிக்கிறது.',
      inputPlaceholder: 'பாசனம், பயிர் நலம், உரம் அல்லது வானிலை குறித்து கேளுங்கள்...',
      sendBtn: 'அனுப்பு',
      suggestedTitle: 'பரிந்துரைக்கப்பட்ட கேள்விகள்',
      verifiedSources: 'சரிபார்க்கப்பட்ட தகவல் ஆதாரங்கள்',
      analyzing: 'உங்கள் நிலத் தகவல்களையும் வானிலையையும் அக்ரிசென்ஸ் பகுப்பாய்வு செய்கிறது...',
      activeStatus: 'தமிழ் AI வழிகாட்டல் செயலில்',
      quickPrompts: [
        'இன்று நான் பாசனம் செய்ய வேண்டுமா?',
        'இந்த வளர்ச்சி நிலைக்கு சிறந்த உரம் எது?',
        'கீழ் இலைகள் ஏன் மஞ்சளாக மாறுகின்றன?',
        'சந்தை விலை 10% குறைந்தால் என்ன நடக்கும்?'
      ],
      welcomeMsg: 'வணக்கம்! நான் உங்கள் **அக்ரிசென்ஸ் விவசாய AI வழிகாட்டி**. உங்கள் நிலத் தரவுகளையும் நேரடி வானிலையையும் இணைத்துள்ளேன். பாசனம், உரமிடுதல், பயிர் நோய்கள் குறித்து என்னிடம் கேளுங்கள்!'
    },
    recommendations: {
      title: 'விஞ்ஞான பயிர் பரிந்துரை இயந்திரம்',
      subtitle: 'மண் வகை, pH அளவு, நீர் இருப்பு மற்றும் பருவத்திற்கு ஏற்ற சிறந்த பயிர்களைத் தேர்ந்தெடுக்கிறது.',
      targetSeason: 'விவசாய பருவம்',
      fieldLocation: 'நில அமைவிடம்',
      soilLabel: 'மண்',
      waterLabel: 'நீர் ஆதாரம்',
      areaLabel: 'பரப்பளவு',
      suitableScore: 'பொருத்தம்',
      estMargin: 'எதிர்பார்க்கப்படும் நிகர லாபம்',
      duration: 'பயிர் காலம்',
      waterNeed: 'நீர் தேவை',
      estCost: 'மதிப்பிடப்பட்ட செலவு',
      marketOutlook: 'சந்தை வாய்ப்பு',
      keyRisk: 'முக்கிய ஆபத்து',
      plantBtn: 'பயிரிடத் தொடங்கு →',
      reasonsTitle: 'பொருத்தத்திற்கான காரணங்கள் (கிடைக்கப்பெற்ற தரவுகளின்படி):',
      evaluating: 'மண் மற்றும் பருவ விதிகளை பகுப்பாய்வு செய்கிறது...',
      seasons: {
        rabi: 'ரபி பருவம் (குளிர்காலம்: அக் - மார்ச்)',
        kharif: 'காரீஃப் பருவம் (பருவமழை: ஜூன் - அக்)',
        zaid: 'ஜாயித் பருவம் (கோடைக்காலம்: மார்ச் - ஜூன்)'
      }
    },
    lifecycle: {
      title: 'பயிர் வளர்ச்சி நிலை கண்காணிப்பாளர்',
      subtitle: 'பயிரின் 8 நிலைகளுக்கு ஏற்ப பாசன வழிகாட்டுதல் மற்றும் ஆபத்து ஆலோசனைகளை மாற்றியமைக்கிறது.',
      clickToSet: 'தற்போதைய நிலையைத் தேர்ந்தெடுக்க கிளிக் செய்யவும்',
      activeNow: 'தற்போது செயலில்',
      completed: 'நிறைவுற்றது',
      upcoming: 'வரவிருப்பது',
      criticalNotice: 'முக்கிய எச்சரிக்கை',
      stages: {
        planning: {
          title: '1. திட்டமிடல்',
          subtitle: 'விதைப்புக்கு முந்தைய நில தயாரிப்பு',
          guidance: 'ஆழ உழவு செய்து, ஏக்கருக்கு 4-5 டன் மக்கிய தொழு உரம் இட்டு, மண் பரிசோதனை முடிவுகளுக்கு ஏற்ப சான்றளிக்கப்பட்ட விதைகளைத் தேர்வு செய்யவும்.',
          criticalWatch: 'மண் pH 6.0 முதல் 7.5 வரை உள்ளதை உறுதி செய்யவும்; 85%க்கும் அதிக முளைப்புத்திறன் கொண்ட விதைகளைப் பயன்படுத்தவும்.'
        },
        planting: {
          title: '2. விதைத்தல் / நடுதல்',
          subtitle: 'விதைப்பு மற்றும் அடி உரமிடுதல்',
          guidance: 'வரிசைக்கு வரிசை 20-22 செ.மீ இடைவெளியும் 4-5 செ.மீ ஆழமும் பராமரிக்கவும். விதைப்பின் போது டிஏபி மற்றும் பொட்டாஷ் அடியுரமாக இடவும்.',
          criticalWatch: 'வறண்ட மண்ணிலோ அல்லது நீர் தேங்கிய பள்ளங்களிலோ விதைப்பதைத் தவிர்க்கவும்.'
        },
        germination: {
          title: '3. முளைப்பு நிலை',
          subtitle: 'நாற்று வெளிவருதல் (5-15 நாட்கள்)',
          guidance: 'நாற்றுகளின் முளைப்பு விகிதத்தைக் கண்காணிக்கவும். மண்ணில் மிதமான ஈரப்பதம் இருக்க வேண்டும். வேர்ப்புழுக்கள் அல்லது அழுகல் நோயைக் கண்காணிக்கவும்.',
          criticalWatch: 'முளைக்காத இடைவெளிகளில் 10 நாட்களுக்குள் மறுவிதைப்பு செய்து பயிர் எண்ணிக்கையை உறுதிப்படுத்தவும்.'
        },
        vegetative: {
          title: '4. பயிர் வளர்ச்சி நிலை',
          subtitle: 'தூர்கட்டுதல் & இலை வளர்ச்சி',
          guidance: 'முதல் முறை யூரியா மேலுரமிட்டு பாசனம் செய்யவும். தேவையான இடங்களில் களை எடுக்கும் பணிகளை மேற்கொள்ளவும்.',
          criticalWatch: 'அசுவினி பூச்சிகள் மற்றும் துத்தநாக குறைபாடு (இலை நரம்புகளில் வெளுப்பு) உள்ளதா எனப் பார்க்கவும்.'
        },
        flowering: {
          title: '5. பூக்கும் நிலை',
          subtitle: 'பூத்தல் & மகரந்தச் சேர்க்கை',
          guidance: 'மிகவும் முக்கியமான நீர் தேவைப்படும் நிலை. வேர்ப்பகுதியில் சீரான ஈரப்பதம் அவசியம். காலை நேர மகரந்தச் சேர்க்கையின் போது கடுமையான மருந்துகளைத் தெளிக்க வேண்டாம்.',
          criticalWatch: '35°Cக்கு மேல் வெப்பம் இருந்தால் மாலை நேர மிதமான பாசனம் வெப்ப அதிர்ச்சியைத் தணிக்கும்.'
        },
        fruiting: {
          title: '6. காய் பிடிக்கும் நிலை',
          subtitle: 'கதிர் முதிர்தல் & காய் வளர்ச்சி',
          guidance: 'பொட்டாசியம் சத்து தெளிப்பது தானிய எடையை அதிகரிக்கும். காய்த்துளைப்பான் மற்றும் துரு நோய்களைத் தீவிரமாகக் கண்காணிக்கவும்.',
          criticalWatch: 'கதிர் முதிரும் போது கடும் வறட்சி ஏற்பட்டால் தானியங்கள் சுருங்கி மகசூல் குறையும்.'
        },
        harvest: {
          title: '7. அறுவடை நிலை',
          subtitle: 'முழு முதிர்ச்சி நிலை',
          guidance: 'தானியத்தின் ஈரப்பதம் 14-16%க்குக் கீழ் குறையும் போது அறுவடை செய்யவும். உலர்ந்த வெயில் காலங்களில் அறுவடை செய்வது சிறந்தது.',
          criticalWatch: 'ஈரப்பதமான பயிரை அறுவடை செய்தால் சேமிப்பில் பூஞ்சான் பிடித்து தரம் குறையும்.'
        },
        selling: {
          title: '8. விற்பனை நிலை',
          subtitle: 'அறுவடைக்கு பின் & சந்தைப்படுத்துதல்',
          guidance: 'தானியங்களைச் சுத்தம் செய்து தரம் பிரிக்கவும். அக்ரிசென்ஸ் சந்தை நிலவரத்தில் மண்டிகளின் சராசரி விலையை ஒப்பிட்டு விற்கவும்.',
          criticalWatch: 'அரசு நிர்ணயித்த குறைந்தபட்ச ஆதரவு விலையை (MSP) மண்டை விலையோடு ஒப்பிடவும்.'
        }
      }
    },
    health: {
      title: 'பயிர் நலம் & நோய் கண்டறிதல்',
      subtitle: 'ஊட்டச்சத்து குறைபாடுகள், பூச்சி தாக்குதல் மற்றும் இலை நோய்களைக் கண்டறிய உதவுகிறது.',
      step1Title: 'படி 1: பயிர் அறிகுறிகளைத் தேர்ந்தெடுக்கவும்',
      affectedPartLabel: 'பாதிக்கப்பட்ட பகுதி',
      parts: {
        leaves: 'இலைகள்',
        stem: 'தண்டு',
        roots: 'வேர்கள்',
        fruit: 'காய் / கதிர்'
      },
      symptomsLabel: 'கண்டறியப்பட்ட அறிகுறிகள்',
      symptomsOptions: {
        yellowing: 'இலைகள் முழுமையாக மஞ்சளாதல் (குளோரோசிஸ்)',
        rust: 'ஆரஞ்சு/பழுப்பு நிற துருப் புள்ளிகள் அல்லது கோடுகள்',
        curling: 'இலை சுருட்டுதல் / வளர்ச்சி குன்றுதல்',
        bleaching: 'இலை நரம்புகளுக்கு இடையே வெளுத்தல் (நுண்ணூட்டம்)'
      },
      attachPhotoLabel: 'இலையின் புகைப்படத்தை இணைக்கவும் (விருப்பத்தேர்வு)',
      attachClick: 'மாதிரி புகைப்படத்தைத் தேர்ந்தெடுக்க கிளிக் செய்யவும்',
      photoAttached: 'இணைக்கப்பட்டது',
      photoFormats: 'JPEG, PNG, WebP வடிவம் (அதிகபட்சம் 5MB)',
      analyzeBtn: 'அறிகுறிகளை ஆய்வு செய்து வழிகாட்டலைப் பெறவும் →',
      analyzingBtn: 'அறிகுறிகள் பகுப்பாய்வு செய்யப்படுகின்றன...',
      step2Title: 'படி 2: AI-அடிப்படையிலான ஆய்வு முடிவுகள்',
      step2Placeholder: 'இடதுபுறத்தில் உள்ள அறிகுறிகளைத் தேர்ந்தெடுத்து ஆய்வு முடிவுகளைப் பார்க்கவும்.',
      observedFactors: 'கண்டறியப்பட்ட காரணிகள்:',
      practicalSteps: 'பரிந்துரைக்கப்பட்ட விவசாய நடவடிக்கைகள்:',
      safetyNotice: 'குறிப்பு: இது AI அடிப்படையிலான வழிகாட்டல் மட்டுமே. தீவிர நோய் பாதிப்புகளுக்கு உங்கள் பகுதி வேளாண்மை அலுவலரை அணுகவும்.'
    },
    economics: {
      title: 'விவசாய நிதி & மாறுபட்ட சூழல் மாதிரி கணக்கீடு (What-If)',
      subtitle: 'விலை வீழ்ச்சி அல்லது மகசூல் குறைவு ஏற்பட்டால் உங்கள் நிகர லாபம் எப்படி மாறும் என்பதைச் சோதிக்கவும்.',
      baselineTitle: 'அடிப்படை விவசாய அளவீடுகள்',
      plantedArea: 'பயிரிடப்பட்ட பரப்பளவு (ஏக்கர்)',
      yieldPerAcre: 'எதிர்பார்க்கப்படும் மகசூல் (கிலோ / ஏக்கர்)',
      sellingPrice: 'விற்பனை விலை (₹ / கிலோ)',
      inputCostHeader: 'உற்பத்திச் செலவு விவரம் (₹ / ஏக்கர்)',
      seeds: 'விதைகள்',
      fertilizer: 'உரங்கள்',
      pesticides: 'பூச்சிக்கொல்லிகள்',
      labour: 'கூலி ஆட்கள்',
      irrigation: 'பாசனம்',
      machineryOther: 'இயந்திரம் / பிற செலவுகள்',
      slidersTitle: 'மாறுபட்ட சூழல் மாதிரிகள்',
      priceVar: 'சந்தை விலை மாற்றம்',
      yieldVar: 'மகசூல் மாற்றம் (வானிலை / பூச்சிகள்)',
      costVar: 'உற்பத்திச் செலவு உயர்வு',
      scenarioPriceDrop: 'மாதிரி: 10% விலை வீழ்ச்சி',
      scenarioYieldLoss: 'மாதிரி: 20% மகசூல் இழப்பு',
      resetBase: 'மீட்டமைக்க',
      resultsTitle: 'நிதி ஒப்பீட்டு முடிவுகள்',
      estRevenue: 'எதிர்பார்க்கப்படும் மொத்த வருவாய்',
      prodCost: 'மொத்த உற்பத்திச் செலவு',
      grossMargin: 'எதிர்பார்க்கப்படும் நிகர லாபம்',
      breakeven: 'அடக்க விலை (கிலோவுக்கு)',
      riskRating: 'ஆபத்து மதிப்பீடு',
      decisionGuidance: 'பொருளாதார முடிவெடுக்கும் வழிகாட்டல்:',
      baselinePrefix: 'அடிப்படை',
      shiftPrefix: 'மாற்றம்'
    },
    market: {
      title: 'விவசாய சந்தை நுண்ணறிவு நிலவரம்',
      subtitle: 'மொத்த விற்பனை சந்தை விலைகள், விலை மாற்றப் போக்கு மற்றும் விற்பனை நேர வழிகாட்டல்.',
      liveBadge: 'நேரடி APMC சந்தை தரவு',
      demoBadge: 'மாதிரி: அதிகாரப்பூர்வ குறிப்பு விலைகள்',
      dataSource: 'தகவல் ஆதாரம்',
      modeLabel: 'நிலை',
      timestampLabel: 'தேதி',
      modalRate: 'சராசரி சந்தை விலை',
      perQuintal: '/ குவிண்டால்',
      trendRising: 'விலை உயர்கிறது',
      trendStable: 'நிலையான விலை',
      trendFalling: 'விலை குறைகிறது',
      minLabel: 'குறைந்தபட்சம்',
      maxLabel: 'அதிகபட்சம்',
      sellingConsiderations: 'விற்பனை நேரம் மற்றும் முன்னெச்சரிக்கை வழிகாட்டல்',
      loading: 'சந்தை விலைகள் பெறப்படுகின்றன...',
      stateIntelligence: 'மாநில சந்தை நுண்ணறிவு & கொள்முதல் பகுப்பாய்வு',
      informedByLocation: 'உங்கள் ஜி.பி.எஸ் இருப்பிடத்தின் அடிப்படையில் பெறப்பட்டது',
      selectState: 'மாநிலம் / பகுதியைத் தேர்ந்தெடுக்கவும்',
      procurementPolicy: 'அரசு கொள்முதல் & ஆதார விலை (MSP) கொள்கை',
      regionalFocus: 'மண்டல விவசாயப் பொருளாதார முக்கியத்துவம்',
      mandiAdvisory: 'சந்தை தரம் & வரத்து வழிகாட்டல்',
      arrivalTrend: 'சந்தை வரத்து அளவு'
    },
    location: {
      detectBtn: 'ஜி.பி.எஸ் இருப்பிடம் கண்டறி',
      detecting: 'இருப்பிடம் கண்டறியப்படுகிறது...',
      detectedBadge: 'ஜி.பி.எஸ் இணைக்கப்பட்டது',
      useMyGps: 'தற்போதைய இருப்பிடம்',
      permissionPrompt: 'துல்லியமான வானிலை மற்றும் மாநில சந்தை விலைகளைப் பெற உங்கள் இருப்பிடத்தை அக்ரிசென்ஸ் பயன்படுத்துகிறது.'
    },
    risk: {
      title: 'விவசாய ஆபத்து பகுப்பாய்வு மையம்',
      subtitle: 'வானிலை, நீர் இருப்பு, பயிர் பாதிப்பு மற்றும் சந்தை விலைகளின் அடிப்படையில் கணக்கிடப்பட்ட ஆபத்து குறியீடு.',
      riskIndex: 'ஒட்டுமொத்த ஆபத்து குறியீடு',
      methodologyLabel: 'கணக்கீட்டு முறை:',
      breakdownTitle: 'காரணிகள் வாரியான பாதிப்பு நிலை',
      activeAlertsTitle: 'செயலில் உள்ள ஆபத்து எச்சரிக்கைகள் மற்றும் பாதுகாப்பு நடவடிக்கைகள்',
      noRisks: 'தீவிர ஆபத்துகள் எதுவும் கண்டறியப்படவில்லை. அனைத்து காரணிகளும் பாதுகாப்பான வரம்பிற்குள் உள்ளன.',
      mitigationLabel: 'பாதுகாப்பு நடவடிக்கை:',
      originLabel: 'ஆதாரம்:',
      loading: 'ஆபத்து காரணிகள் கணக்கிடப்படுகின்றன...'
    },
    onboarding: {
      modalTitleEdit: 'நில விவரங்கள் & மண் பண்புகள்',
      modalTitleNew: 'அக்ரிசென்ஸுக்கு நல்வரவு: நில பதிவு',
      modalSubtitle: 'உங்கள் நிலத் தகவல்கள் AI வழிகாட்டி, வானிலை விதிகள் மற்றும் பயிர் பரிந்துரைகளை துல்லியமாக்குகின்றன.',
      step1: '1. விவசாயி & நிலம்',
      step2: '2. மண் & நீர்',
      step3: '3. பயிர் & பட்ஜெட்',
      farmerName: 'விவசாயி முழுப் பெயர் *',
      phone: 'தொலைபேசி எண்',
      experience: 'விவசாய அனுபவம் (ஆண்டுகள்)',
      languageLabel: 'விருப்ப மொழி',
      farmName: 'பண்ணை / நிலத்தின் பெயர் *',
      landArea: 'மொத்த நிலப்பரப்பு (ஏக்கர்) *',
      district: 'கிராமம் / மாவட்டம் *',
      state: 'மாநிலம்',
      latitude: 'அட்சரேகை (வானிலைக்கு)',
      longitude: 'தீர்க்கரேகை (வானிலைக்கு)',
      soilTitle: 'மண் பண்புகள் & ஆரோக்கியம்',
      soilType: 'மண் வகை',
      soilPh: 'மண்ணின் pH அளவு',
      drainage: 'வடிகால் தரம்',
      waterTitle: 'நீர் ஆதாரங்கள் & பாசன முறை',
      waterSource: 'முக்கிய நீர் ஆதாரம்',
      waterAvailability: 'நீர் இருப்பு நிலை',
      irrigationMethod: 'பாசன முறை',
      cropTitle: 'செயலில் உள்ள பயிர்',
      currentCrop: 'தற்போது பயிரிடப்பட்டுள்ள பயிர்',
      currentStage: 'தற்போதைய வளர்ச்சி நிலை',
      workingBudget: 'பருவ வேலை பட்ஜெட் (₹)',
      workingBudgetHelp: 'நடைமுறைக்கு ஏற்ற பயிர்களைப் பரிந்துரைக்கப் பயன்படுகிறது.',
      nextBtn: 'தொடரவும் →',
      backBtn: '← பின்செல்க',
      saveBtn: 'நில விவரங்களைச் சேமித்து செயல்படுத்தவும்',
      savingBtn: 'சேமிக்கப்படுகிறது...'
    },
    common: {
      acres: 'ஏக்கர்',
      kg: 'கிலோ',
      quintal: 'குவிண்டால்',
      rupee: '₹',
      perAcre: '/ ஏக்கர்',
      days: 'நாட்கள்'
    }
  },
  ml: {
    brand: {
      title: 'അഗ്രിസെൻസ് (AgriSense)',
      subtitle: 'കാർഷിക തീരുമാന പിന്തുണാ AI പ്ലാറ്റ്‌ഫോം',
      copilotBadge: 'AI സഹായി',
      weatherBadge: 'കാലാവസ്ഥ',
      setUpFarm: 'കൃഷിയിടം സജ്ജീകരിക്കുക'
    },
    nav: {
      dashboard: 'പ്രവർത്തന കേന്ദ്രം',
      actions: 'ഇന്നത്തെ പ്രവർത്തനങ്ങൾ',
      copilot: 'കാർഷിക AI സഹായി',
      recommendations: 'വിള ശുപാർശകൾ',
      lifecycle: 'വിള വളർച്ചാ ഘട്ടങ്ങൾ',
      health: 'വിള ആരോഗ്യം',
      market: 'വിപണി വിവരങ്ങൾ',
      economics: 'വരുമാന സാധ്യത മാതൃക',
      risk: 'അപായ വിശകലന കേന്ദ്രം'
    },
    dashboard: {
      fieldStatus: 'സജീവ കൃഷിയിട നില',
      farmerLabel: 'കർഷകൻ',
      areaLabel: 'വിസ്തൃതി',
      soilLabel: 'മണ്ണ്',
      currentCrop: 'നിലവിലെ വിളയും ഘട്ടവും',
      cropStage: 'വളർച്ചാ ഘട്ടം',
      updateStage: 'ഘട്ടം മാറ്റുക',
      todaysWeather: 'ഇന്നത്തെ കൃഷിയിട കാലാവസ്ഥ',
      openMeteoLive: 'തത്സമയ കാലാവസ്ഥ',
      rainProb: 'മഴ സാധ്യത',
      humidity: 'ഈർപ്പം',
      windSpeed: 'കാറ്റിന്റെ വേഗത',
      agroAdvisory: 'കാർഷിക കാലാവസ്ഥാ നിർദ്ദേശങ്ങൾ',
      actionAdvisory: 'പ്രവർത്തന നിർദ്ദേശം',
      irrigationGuidance: 'ജലസേചന മാർഗ്ഗനിർദ്ദേശം',
      sprayingNotice: 'കീടനാശിനി / വളം തളിക്കൽ അനുയോജ്യത',
      actionCenter: 'ഇന്നത്തെ കാർഷിക പ്രവർത്തന കേന്ദ്രം',
      actionCenterSubtitle: 'നിങ്ങളുടെ വിളയുടെ ഘട്ടവും തത്സമയ കാലാവസ്ഥയും അടിസ്ഥാനമാക്കി തയ്യാറാക്കിയ പ്രതിദിന പ്രവർത്തനങ്ങൾ.',
      completed: 'പൂർത്തിയായവ',
      copilotCardTitle: 'കാർഷിക AI സഹായിയോട് ചോദിക്കുക',
      copilotCardSubtitle: 'നിങ്ങളുടെ കൃഷിയിട വിവരങ്ങളുടെ അടിസ്ഥാനത്തിൽ കൃത്യമായ നിർദ്ദേശങ്ങൾ നൽകുന്ന സഹായി.',
      openCopilotBtn: 'പൂർണ്ണ AI സംഭാഷണം തുറക്കുക →',
      noTasks: 'ഇന്ന് ചെയ്യേണ്ട പ്രവർത്തനങ്ങൾ ഒന്നുമില്ല. കൃഷിയിടം ഭദ്രമാണ്!'
    },
    actions: {
      title: 'ഇന്നത്തെ കാർഷിക പ്രവർത്തന കേന്ദ്രം',
      subtitle: 'തത്സമയ കാലാവസ്ഥാ പ്രവചനവും നിലവിലെ വിള ഘട്ടവും കണക്കിലെടുത്ത് തയ്യാറാക്കിയ മുൻഗണനാ പ്രവർത്തനങ്ങൾ.',
      allTasks: 'എല്ലാ പ്രവർത്തനങ്ങളും',
      irrigation: '💧 ജലസേചനം',
      scouting: '🔍 വിള നിരീക്ഷണം',
      weatherDefense: '🌦️ കാലാവസ്ഥാ സുരക്ഷ',
      rationaleLabel: 'വിവര ഉറവിടം / കാരണം',
      completedOf: 'പൂർത്തിയായവ',
      noTasksCategory: 'ഈ വിഭാഗത്തിൽ പ്രവർത്തനങ്ങൾ ഒന്നുമില്ല.',
      categoryLabel: 'വിഭാഗം'
    },
    copilot: {
      title: 'വ്യക്തിഗത കാർഷിക AI സഹായി (Grounded AI)',
      subtitle: 'നിങ്ങളുടെ കൃഷിയിട വിസ്തൃതി, മണ്ണിന്റെ pH, വിള ഘട്ടം, തത്സമയ കാലാവസ്ഥ എന്നിവയുടെ അടിസ്ഥാനത്തിൽ മറുപടി നൽകുന്നു.',
      inputPlaceholder: 'ജലസേചനം, വിള ആരോഗ്യം, വളപ്രയോഗം, കാലാവസ്ഥ എന്നിവയെക്കുറിച്ച് ചോദിക്കുക...',
      sendBtn: 'അയക്കുക',
      suggestedTitle: 'നിർദ്ദേശിച്ച ചോദ്യങ്ങൾ',
      verifiedSources: 'സ്ഥിരീകരിച്ച വിവര സ്രോതസ്സുകൾ',
      analyzing: 'അഗ്രിസെൻസ് നിങ്ങളുടെ കൃഷിയിട വിവരങ്ങളും കാലാവസ്ഥയും വിശകലനം ചെയ്യുന്നു...',
      activeStatus: 'മലയാളം AI സജീവം',
      quickPrompts: [
        'ഇന്ന് ഞാൻ നനയ്ക്കേണ്ടതുണ്ടോ?',
        'ഈ വളർച്ചാ ഘട്ടത്തിന് ഏറ്റവും അനുയോജ്യമായ വളം ഏതാണ്?',
        'താഴത്തെ ഇലകൾ മഞ്ഞനിറമാകുന്നത് എന്തുകൊണ്ട്?',
        'വിപണി വില 10% കുറഞ്ഞാൽ എന്ത് സംഭവിക്കും?'
      ],
      welcomeMsg: 'നമസ്കാരം! ഞാൻ നിങ്ങളുടെ **അഗ്രിസെൻസ് കാർഷിക AI സഹായി**. നിങ്ങളുടെ കൃഷിയിട വിവരങ്ങളും തത്സമയ കാലാവസ്ഥയും ഞാൻ പരിശോധിച്ചിട്ടുണ്ട്. ജലസേചനം, വളപ്രയോഗം, രോഗലക്ഷണങ്ങൾ എന്നിവയെക്കുറിച്ച് എന്നോട് ചോദിക്കാം!'
    },
    recommendations: {
      title: 'ശാസ്ത്രീയ വിള ശുപാർശാ സംവിധാനം',
      subtitle: 'മണ്ണിന്റെ ഘടന, pH നില, ജലലഭ്യത, കാലാവസ്ഥാ സീസൺ എന്നിവ വിലയിരുത്തി അനുയോജ്യമായ വിളകൾ കണ്ടെത്തുന്നു.',
      targetSeason: 'കാർഷിക സീസൺ',
      fieldLocation: 'കൃഷിയിട സ്ഥലം',
      soilLabel: 'മണ്ണ്',
      waterLabel: 'ജലലഭ്യത',
      areaLabel: 'വിസ്തൃതി',
      suitableScore: 'യോജ്യത',
      estMargin: 'പ്രതീക്ഷിക്കുന്ന ലാഭം',
      duration: 'വിള കാലയളവ്',
      waterNeed: 'ജലാവശ്യകത',
      estCost: 'പ്രതീക്ഷിക്കുന്ന ചെലവ്',
      marketOutlook: 'വിപണി സാധ്യത',
      keyRisk: 'പ്രധാന വെല്ലുവിളി',
      plantBtn: 'കൃഷി ചെയ്യാൻ തിരഞ്ഞെടുക്കുക →',
      reasonsTitle: 'അനുയോജ്യതയ്ക്കുള്ള കാരണങ്ങൾ (ലഭ്യമായ വിവരങ്ങൾ പ്രകാരം):',
      evaluating: 'മണ്ണും കാലാവസ്ഥാ നിയമങ്ങളും പരിശോധിക്കുന്നു...',
      seasons: {
        rabi: 'റബി സീസൺ (ശീതകാലം: ഒക്ടോബർ - മാർച്ച്)',
        kharif: 'ഖാരിഫ് സീസൺ (മഴക്കാലം: ജൂൺ - ഒക്ടോബർ)',
        zaid: 'സെയ്ദ് സീസൺ (വേനൽക്കാലം: മാർച്ച് - ജൂൺ)'
      }
    },
    lifecycle: {
      title: 'വിള വളർച്ചാ ഘട്ട നിരീക്ഷകൻ',
      subtitle: 'വിളയുടെ 8 വ്യത്യസ്ത വളർച്ചാ ഘട്ടങ്ങൾക്കനുസരിച്ച് ജലസേചനവും പരിചരണവും ക്രമീകരിക്കുന്നു.',
      clickToSet: 'നിലവിലെ ഘട്ടം തിരഞ്ഞെടുക്കാൻ ക്ലിക്ക് ചെയ്യുക',
      activeNow: 'ഇപ്പോൾ സജീവം',
      completed: 'പൂർത്തിയായി',
      upcoming: 'വരാനിരിക്കുന്നത്',
      criticalNotice: 'പ്രധാന ശ്രദ്ധയ്ക്ക്',
      stages: {
        planning: {
          title: '1. ആസൂത്രണം',
          subtitle: 'വിതയ്ക്ക് മുമ്പുള്ള മണ്ണൊരുക്കൽ',
          guidance: 'ആഴത്തിൽ ഉഴുതുമറിച്ച്, ഏക്കറിന് 4-5 ടൺ കാലിവളം ചേർക്കുക. മണ്ണ് പരിശോധന നടത്തി മികച്ച വിത്തു തിരഞ്ഞെടുക്കുക.',
          criticalWatch: 'മണ്ണിന്റെ pH 6.0 മുതൽ 7.5 വരെയെന്ന് ഉറപ്പാക്കുക; 85%-ൽ കൂടുതൽ മുളയ്ക്കുന്ന വിത്ത് വാങ്ങുക.'
        },
        planting: {
          title: '2. വിതയ്ക്കൽ / നടീൽ',
          subtitle: 'വിതയും അടിവള പ്രയോഗവും',
          guidance: 'വരികൾ തമ്മിൽ 20-22 സെ.മീ അകലവും 4-5 സെ.മീ ആഴവും പാലിക്കുക. വിതയ്ക്കുമ്പോൾ ഫോസ്ഫറസ്, പൊട്ടാഷ് എന്നിവ അടിവളമായി നൽകുക.',
          criticalWatch: 'വളരെ ഉണങ്ങിയ മണ്ണിലോ വെള്ളക്കെട്ടുള്ള ചാലുകളിലോ വിതയ്ക്കരുത്.'
        },
        germination: {
          title: '3. മുളയ്ക്കൽ ഘട്ടം',
          subtitle: 'വിത്ത് മുളച്ച് വരുന്നത് (5-15 ദിവസം)',
          guidance: 'മുളയ്ക്കൽ നിരക്ക് നിരീക്ഷിക്കുക. നേരിയ ഈർപ്പം നിലനിർത്തുക. മുരടിപ്പ്, കുമിൾ രോഗങ്ങൾ എന്നിവ ശ്രദ്ധിക്കുക.',
          criticalWatch: 'മുളയ്ക്കാത്ത ഇടങ്ങളിൽ 10 ദിവസത്തിനകം വീണ്ടും വിത്തിട്ട് തൈകളുടെ എണ്ണം ഉറപ്പാക്കുക.'
        },
        vegetative: {
          title: '4. വളർച്ചാ ഘട്ടം',
          subtitle: 'ചില്ലകൾ പൊട്ടലും ഇലവളർച്ചയും',
          guidance: 'ആദ്യ തവണ യൂറിയ മേൽവളമായി നൽകി നനയ്ക്കുക. കളനിയന്ത്രണം കൃത്യമായി നടത്തുക.',
          criticalWatch: 'മുഞ്ഞ, കീടബാധ, സിങ്ക് കുറവ് (ഇലകളിലെ മഞ്ഞപ്പ്) എന്നിവ പരിശോധിക്കുക.'
        },
        flowering: {
          title: '5. പൂവിടൽ ഘട്ടം',
          subtitle: 'പൂവിടലും പരാഗണവും',
          guidance: 'ഏറ്റവും നിർണായകമായ ജലസേചന ഘട്ടം. വേരുപടലത്തിൽ ഈർപ്പം നിലനിർത്തുക. പരാഗണ സമയത്ത് കടുത്ത കീടനാശിനികൾ തളിക്കരുത്.',
          criticalWatch: '35°C-ൽ കൂടുതൽ ചൂടുണ്ടായാൽ വൈകുന്നേരങ്ങളിൽ നേരിയ ജലസേചനം നടത്തി ചൂട് കുറയ്ക്കുക.'
        },
        fruiting: {
          title: '6. കായ്ക്കൽ / കതിരിടൽ',
          subtitle: 'മണികൾ നിറയുന്ന സമയം',
          guidance: 'പൊട്ടാഷ് അടങ്ങിയ വളങ്ങൾ തളിക്കുന്നത് ധാന്യങ്ങളുടെ ഭാരവും ഗുണനിലവാരവും വർദ്ധിപ്പിക്കും. തണ്ടുതുരപ്പൻ പുഴുക്കളെ ശ്രദ്ധിക്കുക.',
          criticalWatch: 'ഈ സമയത്ത് ജലക്ഷാമമുണ്ടായാൽ ധാന്യങ്ങൾ ചുരുങ്ങി വിളവ് കുറയും.'
        },
        harvest: {
          title: '7. വിളവെടുപ്പ് ഘട്ടം',
          subtitle: 'പൂർണ്ണ പാകത',
          guidance: 'ധാന്യങ്ങളിലെ ഈർപ്പം 14-16%-ൽ താഴെയാകുമ്പോൾ വിളവെടുക്കുക. തെളിഞ്ഞ ഉണങ്ങിയ കാലാവസ്ഥയിൽ കൊയ്യുക.',
          criticalWatch: 'നനവോടെ വിളവെടുത്താൽ സൂക്ഷിപ്പിൽ പൂപ്പൽ ബാധ ഉണ്ടാകും.'
        },
        selling: {
          title: '8. വിപണനം',
          subtitle: 'വിപണിയിലേക്ക് എത്തിക്കൽ',
          guidance: 'ഉല്പന്നങ്ങൾ വൃത്തിയാക്കി തരംതിരിക്കുക. അഗ്രിസെൻസിലെ ശരാശരി ചന്ത വിലകൾ പരിശോധിച്ച് അനുയോജ്യമായ വിപണി തിരഞ്ഞെടുക്കുക.',
          criticalWatch: 'തറവിലയും (MSP) പ്രാദേശിക ചന്ത വിലകളും താരതമ്യം ചെയ്യുക.'
        }
      }
    },
    health: {
      title: 'വിള ആരോഗ്യം & രോഗനിർണ്ണയം',
      subtitle: 'പോഷകക്കുറവ്, കീടബാധ, ഇലരോഗങ്ങൾ എന്നിവ തിരിച്ചറിയാൻ സഹായിക്കുന്നു.',
      step1Title: 'ഘട്ടം 1: ചെടിയുടെ ലക്ഷണങ്ങൾ തിരഞ്ഞെടുക്കുക',
      affectedPartLabel: 'ബാധിച്ച ഭാഗം',
      parts: {
        leaves: 'ഇലകൾ',
        stem: 'തണ്ട്',
        roots: 'വേരുകൾ',
        fruit: 'കായ് / കതിര്'
      },
      symptomsLabel: 'കണ്ട ലക്ഷണങ്ങൾ',
      symptomsOptions: {
        yellowing: 'ഇലകൾ മഞ്ഞനിറമാകുന്നു (ക്ലോറോസിസ്)',
        rust: 'ഓറഞ്ച്/തവിട്ട് നിറത്തിലുള്ള തുരുമ്പ് പുള്ളികൾ',
        curling: 'ഇല ചുരുളലും മുരടിപ്പും',
        bleaching: 'ഇല ഞരമ്പുകൾക്കിടയിൽ വെളുപ്പ് നിറം'
      },
      attachPhotoLabel: 'ഇലയുടെ ചിത്രം ചേർക്കുക (ഐച്ഛികം)',
      attachClick: 'സാമ്പിൾ ചിത്രം തിരഞ്ഞെടുക്കാൻ ക്ലിക്ക് ചെയ്യുക',
      photoAttached: 'ചിത്രം ചേർത്തു',
      photoFormats: 'JPEG, PNG, WebP (പരമാവധി 5MB)',
      analyzeBtn: 'ലക്ഷണങ്ങൾ പരിശോധിച്ച് നിർദ്ദേശം കാണുക →',
      analyzingBtn: 'ലക്ഷണങ്ങൾ പരിശോധിക്കുന്നു...',
      step2Title: 'ഘട്ടം 2: AI നിരീക്ഷണ ഫലം',
      step2Placeholder: 'നിർദ്ദേശങ്ങൾ കാണാൻ ഇടതുവശത്തുള്ള ലക്ഷണങ്ങൾ തിരഞ്ഞെടുക്കുക.',
      observedFactors: 'കണ്ടെത്തിയ ഘടകങ്ങൾ:',
      practicalSteps: 'കർഷകൻ ചെയ്യേണ്ട കാര്യങ്ങൾ:',
      safetyNotice: 'ശ്രദ്ധിക്കുക: ഇത് AI അടിസ്ഥാനമാക്കിയുള്ള പ്രാഥമിക നിരീക്ഷണം മാത്രമാണ്. ഗുരുതരമായ രോഗങ്ങൾക്ക് കൃഷി ഓഫീസറെയോ കൃഷി വിജ്ഞാന കേന്ദ്രത്തെയോ സമീപിക്കുക.'
    },
    economics: {
      title: 'കാർഷിക സാമ്പത്തിക വിശകലനം & സാധ്യത മാതൃക (What-If)',
      subtitle: 'വിലയിലോ വിളവിലോ ഉണ്ടാകുന്ന മാറ്റങ്ങൾ നിങ്ങളുടെ ലാഭത്തെ എങ്ങനെ ബാധിക്കുന്നുവെന്ന് കൃത്യമായി കണക്കുകൂട്ടുക.',
      baselineTitle: 'അടിസ്ഥാന കൃഷി വിവരങ്ങൾ',
      plantedArea: 'കൃഷി വിസ്തൃതി (ഏക്കർ)',
      yieldPerAcre: 'പ്രതീക്ഷിക്കുന്ന വിളവ് (കിലോ / ഏക്കർ)',
      sellingPrice: 'വിൽപ്പന വില (₹ / കിലോ)',
      inputCostHeader: 'ഉൽപ്പാദന ചെലവ് വിവരങ്ങൾ (₹ / ഏക്കർ)',
      seeds: 'വിത്ത്',
      fertilizer: 'വളം',
      pesticides: 'കീടനാശിനി',
      labour: 'കൂലി ചെലവ്',
      irrigation: 'ജലസേചനം',
      machineryOther: 'യന്ത്രങ്ങൾ / മറ്റുള്ളവ',
      slidersTitle: 'സാധ്യത മാതൃകാ സ്ലൈഡറുകൾ',
      priceVar: 'വിപണി വിലയിലെ വ്യത്യാസം',
      yieldVar: 'വിളവിലെ വ്യത്യാസം (കാലാവസ്ഥ / കീടങ്ങൾ)',
      costVar: 'ഉൽപ്പാദന ചെലവിലെ വർദ്ധനവ്',
      scenarioPriceDrop: 'മാതൃക: 10% വിലക്കുറവ്',
      scenarioYieldLoss: 'മാതൃക: 20% വിളവ് നഷ്ടം',
      resetBase: 'യഥാർത്ഥ അളവിലേക്ക് മാറ്റുക',
      resultsTitle: 'സാമ്പത്തിക ഫലങ്ങളുടെ താരതമ്യം',
      estRevenue: 'പ്രതീക്ഷിക്കുന്ന മൊത്ത വരുമാനം',
      prodCost: 'ആകെ ഉൽപ്പാദന ചെലവ്',
      grossMargin: 'പ്രതീക്ഷിക്കുന്ന അറ്റാദായം (ലാഭം)',
      breakeven: 'മുതൽമുടക്ക് തിരിച്ചുകിട്ടാനുള്ള വില',
      riskRating: 'അപായ സാധ്യത നിലവാരം',
      decisionGuidance: 'സാമ്പത്തിക തീരുമാന നിർദ്ദേശം:',
      baselinePrefix: 'അടിസ്ഥാനം',
      shiftPrefix: 'മാറ്റം'
    },
    market: {
      title: 'കാർഷിക വിപണി വിവരങ്ങൾ',
      subtitle: 'മൊത്തവിൽപ്പന ചന്തകളിലെ നിരക്കുകൾ, വില പ്രവണതകൾ, വിൽപ്പന സമയ നിർദ്ദേശങ്ങൾ.',
      liveBadge: 'തത്സമയ APMC ചന്ത നിരക്കുകൾ',
      demoBadge: 'റഫറൻസ് മാതൃകാ നിരക്കുകൾ',
      dataSource: 'വിവര ഉറവിടം',
      modeLabel: 'നില',
      timestampLabel: 'തീയതി',
      modalRate: 'ശരാശരി ചന്ത വില',
      perQuintal: '/ ക്വിന്റൽ',
      trendRising: 'വില കൂടുന്നു',
      trendStable: 'സ്ഥിരമായ വില',
      trendFalling: 'വില കുറയുന്നു',
      minLabel: 'കുറഞ്ഞത്',
      maxLabel: 'കൂടിയത്',
      sellingConsiderations: 'വിൽപ്പന സമയ നിർദ്ദേശങ്ങളും മുൻകരുതലുകളും',
      loading: 'ചന്ത വിലകൾ ശേഖരിക്കുന്നു...',
      stateIntelligence: 'സംസ്ഥാന വിപണി വിവരങ്ങളും സംഭരണ വിശകലനവും',
      informedByLocation: 'നിങ്ങളുടെ ജി.പി.എസ് സ്ഥാനം അടിസ്ഥാനമാക്കിയുള്ള വിവരങ്ങൾ',
      selectState: 'സംസ്ഥാനം / പ്രദേശം തിരഞ്ഞെടുക്കുക',
      procurementPolicy: 'സംഭരണ നയവും താങ്ങുവിലയും (MSP)',
      regionalFocus: 'പ്രാദേശിക കാർഷിക സാമ്പത്തിക പ്രാധാന്യം',
      mandiAdvisory: 'ചന്ത ഗുണനിലവാരവും വരവ് നിർദ്ദേശങ്ങളും',
      arrivalTrend: 'ചന്തയിലെ വരവ്'
    },
    location: {
      detectBtn: 'ജി.പി.എസ് സ്ഥാനം കണ്ടെത്തുക',
      detecting: 'സ്ഥാനം കണ്ടെത്തുന്നു...',
      detectedBadge: 'ജി.പി.എസ് സജീവം',
      useMyGps: 'നിലവിലെ സ്ഥാനം',
      permissionPrompt: 'കൃത്യമായ പ്രാദേശിക കാലാവസ്ഥയും സംസ്ഥാന വിപണി നിരക്കുകളും നൽകാൻ അഗ്രിസെൻസ് നിങ്ങളുടെ ലൊക്കേഷൻ ഉപയോഗിക്കുന്നു.'
    },
    risk: {
      title: 'കാർഷിക അപായ വിശകലന കേന്ദ്രം',
      subtitle: 'കാലാവസ്ഥ, ജലലഭ്യത, വിളയുടെ ഘട്ടം, വിപണി വില എന്നിവ അടിസ്ഥാനമാക്കിയുള്ള അപകട സാധ്യത സൂചിക.',
      riskIndex: 'മൊത്തം അപായ സൂചിക',
      methodologyLabel: 'കണക്കുകൂട്ടൽ രീതി:',
      breakdownTitle: 'ഘടകങ്ങൾ തിരിച്ചുള്ള അപായ സാധ്യത',
      activeAlertsTitle: 'സജീവ ജാഗ്രതാ നിർദ്ദേശങ്ങളും മുൻകരുതലുകളും',
      noRisks: 'പ്രത്യേക അപകടസാധ്യതകളൊന്നും കണ്ടെത്തിയിട്ടില്ല. കൃഷിയിടം സുരക്ഷിതമാണ്.',
      mitigationLabel: 'മുൻകരുതൽ പ്രവർത്തനം:',
      originLabel: 'ഉറവിടം:',
      loading: 'അപകട ഘടകങ്ങൾ പരിശോധിക്കുന്നു...'
    },
    onboarding: {
      modalTitleEdit: 'കൃഷിയിട വിവരങ്ങളും മണ്ണിന്റെ സ്വഭാവവും',
      modalTitleNew: 'അഗ്രിസെൻസിലേക്ക് സ്വാഗതം: കൃഷിയിട രജിസ്ട്രേഷൻ',
      modalSubtitle: 'കൃത്യമായ ഉപദേശങ്ങളും വിള ശുപാർശകളും നൽകാൻ നിങ്ങളുടെ കൃഷിയിട വിവരങ്ങൾ സഹായിക്കുന്നു.',
      step1: '1. കർഷകനും കൃഷിയിടവും',
      step2: '2. മണ്ണും ജലസേചനവും',
      step3: '3. വിളയും ബജറ്റും',
      farmerName: 'കർഷകന്റെ പൂർണ്ണ പേര് *',
      phone: 'ഫോൺ നമ്പർ',
      experience: 'കൃഷി പരിചയം (വർഷങ്ങൾ)',
      languageLabel: 'ആശയവിനിമയ ഭാഷ',
      farmName: 'കൃഷിയിടത്തിന്റെ പേര് *',
      landArea: 'ആകെ വിസ്തൃതി (ഏക്കർ) *',
      district: 'ഗ്രാമം / ജില്ല *',
      state: 'സംസ്ഥാനം',
      latitude: 'അക്ഷാംശം (കാലാവസ്ഥയ്ക്ക്)',
      longitude: 'രേഖാംശം (കാലാവസ്ഥയ്ക്ക്)',
      soilTitle: 'മണ്ണിന്റെ ഗുണനിലവാരം',
      soilType: 'മണ്ണ് തരം',
      soilPh: 'മണ്ണിന്റെ pH നില',
      drainage: 'നീർവാർച്ച സൗകര്യം',
      waterTitle: 'ജലസ്രോതസ്സും ജലസേചനവും',
      waterSource: 'പ്രധാന ജലസ്രോതസ്സ്',
      waterAvailability: 'ജല ലഭ്യത',
      irrigationMethod: 'ജലസേചന രീതി',
      cropTitle: 'നിലവിലെ വിള',
      currentCrop: 'ഇപ്പോൾ കൃഷി ചെയ്യുന്ന വിള',
      currentStage: 'നിലവിലെ വളർച്ചാ ഘട്ടം',
      workingBudget: 'പ്രതീക്ഷിക്കുന്ന സീസൺ ബജറ്റ് (₹)',
      workingBudgetHelp: 'യാഥാർത്ഥ്യപരമായ വിളകൾ ശുപാർശ ചെയ്യാൻ സഹായിക്കുന്നു.',
      nextBtn: 'തുടരുക →',
      backBtn: '← പിന്നോട്ട്',
      saveBtn: 'കൃഷിയിട വിവരങ്ങൾ സേവ് ചെയ്യുക',
      savingBtn: 'സേവ് ചെയ്യുന്നു...'
    },
    common: {
      acres: 'ഏക്കർ',
      kg: 'കിലോ',
      quintal: 'ക്വിന്റൽ',
      rupee: '₹',
      perAcre: '/ ഏക്കർ',
      days: 'ദിവസങ്ങൾ'
    }
  }
};
