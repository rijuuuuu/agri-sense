import type { Language } from './translations.js';
import type { FarmTask, ActionCategory } from '@agrisense/shared';

// Weather Condition Localizations
export const localizedWeatherDescriptions: Record<string, Record<Language, string>> = {
  'Clear sky': {
    en: 'Clear sky',
    ta: 'தெளிவான வானம்',
    ml: 'തെളിഞ്ഞ ആകാശം'
  },
  'Mainly clear': {
    en: 'Mainly clear',
    ta: 'பெரும்பாலும் தெளிவான வானம்',
    ml: 'പ്രധാനമായും തെളിഞ്ഞ കാലാവസ്ഥ'
  },
  'Partly cloudy': {
    en: 'Partly cloudy',
    ta: 'பகுதி மேகமூட்டம்',
    ml: 'ഭാഗികമായി മേഘാവൃതം'
  },
  'Overcast': {
    en: 'Overcast',
    ta: 'முழு மேகமூட்டம்',
    ml: 'പൂർണ്ണ മേഘാവൃതം'
  },
  'Fog': {
    en: 'Fog',
    ta: 'பனிமூட்டம்',
    ml: 'മൂടൽമഞ്ഞ്'
  },
  'Light rain': {
    en: 'Light rain',
    ta: 'லேசான மழை',
    ml: 'നേരിയ മഴ'
  },
  'Moderate rain': {
    en: 'Moderate rain',
    ta: 'மிதமான மழை',
    ml: 'മിതമായ മഴ'
  },
  'Heavy rain': {
    en: 'Heavy rain',
    ta: 'கனமழை',
    ml: 'കനത്ത മഴ'
  },
  'Thunderstorm': {
    en: 'Thunderstorm',
    ta: 'இடி மின்னலுடன் கூடிய மழை',
    ml: 'ഇടിമിന്നലോടു കൂടിയ മഴ'
  }
};

export function getLocalizedWeatherDescription(desc: string, lang: Language): string {
  return localizedWeatherDescriptions[desc]?.[lang] || desc;
}

// Advisory Guidance Localizations
export function getLocalizedAdvisory(
  irrigationStatus: string,
  irrigationAdvice: string,
  sprayingSuitable: boolean,
  sprayingReason: string,
  lang: Language
): { status: string; advice: string; sprayStatus: string; sprayReason: string } {
  if (lang === 'en') {
    return {
      status: irrigationStatus,
      advice: irrigationAdvice,
      sprayStatus: sprayingSuitable ? 'SUITABLE' : 'UNFAVORABLE',
      sprayReason: sprayingReason
    };
  }

  if (lang === 'ta') {
    let statusText = irrigationStatus;
    let adviceText = irrigationAdvice;

    if (irrigationStatus === 'HOLD') {
      statusText = 'ஒத்திவைக்கவும்';
      adviceText = 'மழை பெய்ய வாய்ப்புள்ளதால், நீர் தேங்குவதைத் தவிர்க்க பாசனத்தை ஒத்திவைக்கவும்.';
    } else if (irrigationStatus === 'SCHEDULE') {
      statusText = 'பாசனம் செய்யவும்';
      adviceText = 'அதிக வெப்பநிலை காரணமாக நீர் ஆவியாதல் கூடும். அதிகாலை அல்லது மாலை வேளையில் பாசனம் செய்யவும்.';
    } else if (irrigationStatus === 'NORMAL') {
      statusText = 'வழக்கமான பாசனம்';
      adviceText = 'வழக்கமான பயிர் நீர் தேவை. மண்ணின் ஈரப்பதத்திற்கு ஏற்ப வேர்ப்பகுதியில் நீர்ப்பாசனம் செய்யவும்.';
    }

    const sprayStatus = sprayingSuitable ? 'பொருத்தமானது' : 'தவிர்க்கவும்';
    let sprayReason = sprayingReason;
    if (sprayingReason.includes('Wind speeds are calm') || sprayingReason.includes('calm')) {
      sprayReason = 'காற்றின் வேகம் குறைவாகவும் மழையின் ஆபத்து குறைவாகவும் உள்ளது. இலைவழி ஊட்டச்சத்து தெளிக்க ஏற்ற சூழல்.';
    } else if (sprayingReason.includes('Rain risk is high') || sprayingReason.includes('Wash-off')) {
      sprayReason = 'மழை வாய்ப்பு அதிகமாக உள்ளது. மருந்து நீரில் அடித்துச் செல்லப்படலாம். தெளிப்பதை ஒத்திவைக்கவும்.';
    } else if (sprayingReason.includes('Wind speed exceeds')) {
      sprayReason = 'காற்றின் வேகம் மணிக்கு 20 கி.மீ-க்கு மேல் உள்ளது. மருந்து காற்றில் சிதறக்கூடும் என்பதால் தெளிப்பதை ஒத்திவைக்கவும்.';
    }

    return { status: statusText, advice: adviceText, sprayStatus, sprayReason };
  }

  // Malayalam (ml)
  let statusText = irrigationStatus;
  let adviceText = irrigationAdvice;

  if (irrigationStatus === 'HOLD') {
    statusText = 'മാറ്റിവെക്കുക';
    adviceText = 'മഴ സാധ്യതയുള്ളതിനാൽ വെള്ളക്കെട്ട് ഒഴിവാക്കാൻ ജലസേചനം മാറ്റിവെക്കുക.';
  } else if (irrigationStatus === 'SCHEDULE') {
    statusText = 'നനയ്ക്കുക';
    adviceText = 'കൂടിയ താപനില കാരണം ഈർപ്പം വേഗത്തിൽ നഷ്ടപ്പെടും. അതിരാവിലെയോ വൈകുന്നേരമോ നനയ്ക്കുക.';
  } else if (irrigationStatus === 'NORMAL') {
    statusText = 'സാധാരണ ജലസേചനം';
    adviceText = 'സാധാരണ ജലാവശ്യകത. മണ്ണിന്റെ ഈർപ്പത്തിനനുസരിച്ച് വേരുപടലത്തിൽ നനവ് നിലനിർത്തുക.';
  }

  const sprayStatus = sprayingSuitable ? 'അനുയോജ്യം' : 'ഒഴിവാക്കുക';
  let sprayReason = sprayingReason;
  if (sprayingReason.includes('Wind speeds are calm') || sprayingReason.includes('calm')) {
    sprayReason = 'കാറ്റിന്റെ വേഗത കുറവാണ്, മഴ സാധ്യതയും കുറവാണ്. വളമോ കീടനാശിനിയോ തളിക്കാൻ അനുകൂല സമയം.';
  } else if (sprayingReason.includes('Rain risk is high') || sprayingReason.includes('Wash-off')) {
    sprayReason = 'മഴ സാധ്യത കൂടുതലായതിനാൽ മരുന്ന് ഒലിച്ചുപോകാൻ സാധ്യതയുണ്ട്. തളിക്കുന്നത് മാറ്റിവെക്കുക.';
  } else if (sprayingReason.includes('Wind speed exceeds')) {
    sprayReason = 'കാറ്റിന്റെ വേഗത മണിക്കൂറിൽ 20 കി.മീറ്ററിൽ കൂടുതലായതിനാൽ മരുന്ന് പറന്നുപോകാൻ സാധ്യതയുണ്ട്. തളിക്കൽ മാറ്റിവെക്കുക.';
  }

  return { status: statusText, advice: adviceText, sprayStatus, sprayReason };
}

// Localized Priority & Category
export function getLocalizedPriority(priority: string, lang: Language): string {
  const p = priority.toLowerCase();
  if (lang === 'ta') {
    if (p === 'urgent') return 'அவசரம்';
    if (p === 'high') return 'உயர் முன்னுரிமை';
    if (p === 'medium') return 'நடுத்தரம்';
    return 'வழக்கமானது';
  }
  if (lang === 'ml') {
    if (p === 'urgent') return 'അടിയന്തിരം';
    if (p === 'high') return 'ഉയർന്ന മുൻഗണന';
    if (p === 'medium') return 'ഇടത്തരം മുൻഗണന';
    return 'സാധാരണ';
  }
  return priority.toUpperCase();
}

export function getLocalizedCategory(category: string, lang: Language): string {
  const c = category.toLowerCase();
  if (lang === 'ta') {
    if (c === 'irrigation') return 'பாசனம்';
    if (c === 'pest_monitoring') return 'பயிர் ஆய்வு & பூச்சி கண்காணிப்பு';
    if (c === 'weather_alert') return 'வானிலை பாதுகாப்பு';
    if (c === 'field_prep') return 'நில பராமரிப்பு';
    return 'பொது பணி';
  }
  if (lang === 'ml') {
    if (c === 'irrigation') return 'ജലസേചനം';
    if (c === 'pest_monitoring') return 'വിള നിരീക്ഷണവും കീടനിയന്ത്രണവും';
    if (c === 'weather_alert') return 'കാലാവസ്ഥാ സുരക്ഷ';
    if (c === 'field_prep') return 'നിലമൊരുക്കൽ';
    return 'പൊതു പ്രവർത്തനം';
  }
  return category.replace('_', ' ');
}

// Localize Individual Farm Task
export function getLocalizedTask(task: FarmTask, lang: Language): { title: string; description: string; rationale: string } {
  if (lang === 'en') {
    return {
      title: task.title,
      description: task.description,
      rationale: task.rationale
    };
  }

  const id = task.id;
  const title = task.title;

  if (lang === 'ta') {
    if (title.includes('Hold scheduled irrigation')) {
      return {
        title: 'திட்டமிடப்பட்ட பாசனத்தை ஒத்திவைக்கவும்',
        description: 'மழை பெய்ய வாய்ப்புள்ளதால், மண்ணில் நீர் தேங்குவதையும் வேர் அழுகலையும் தவிர்க்க பாசனத்தை ஒத்திவைக்கவும்.',
        rationale: 'வானிலை முன்னறிவிப்பு மற்றும் மண்ணின் வடிகால் தன்மையின் அடிப்படையில் பெறப்பட்டது.'
      };
    }
    if (title.includes('early morning') || title.includes('Conduct early')) {
      return {
        title: 'அதிகாலை அல்லது மாலையில் பாசனம் செய்யவும்',
        description: 'பகலில் அதிக வெப்பம் நிலவுவதால் நீர் ஆவியாதல் கூடும். குளிர்ந்த வேளையில் சொட்டு நீர் பாசனம் செயல்படுத்தவும்.',
        rationale: 'வெப்பநிலை அதிகரிப்பால் மண் மேற்பரப்பு ஈரப்பதம் விரைவாகக் குறைவதைத் தடுக்க.'
      };
    }
    if (title.includes('root-zone moisture')) {
      return {
        title: 'பயிரின் வேர்ப்பகுதி ஈரப்பதத்தை ஆய்வு செய்யவும்',
        description: 'மண் மேற்பரப்பிற்கு கீழ் 2 அங்குல ஆழத்தில் சோதிக்கவும். காய்ந்திருந்தால் வழக்கமான பாசனம் செய்யவும்.',
        rationale: 'பயிர் வளர்ச்சி நிலைக்கேற்ற வழக்கமான ஈரப்பதம் பராமரிப்பு.'
      };
    }
    if (title.includes('Field inspection')) {
      return {
        title: 'பயிரின் வளர்ச்சி மற்றும் கள ஆய்வு',
        description: 'பயிரின் சீரான வளர்ச்சி மற்றும் களைகளின் வளர்ச்சியை தற்போதைய நிலையில் கண்காணிக்கவும்.',
        rationale: 'பயிர் சுழற்சி நிலைக்கு ஏற்ப உருவான களப்பணி.'
      };
    }
    if (title.includes('bloom set') || title.includes('pollinator')) {
      return {
        title: 'பூக்கும் நிலை மற்றும் மகரந்தச் சேர்க்கை பூச்சிகளை கண்காணிக்கவும்',
        description: 'பூக்களில் பூச்சிகள் அல்லது கரும்புள்ளிகள் உள்ளதா எனப் பார்க்கவும். பூக்கும் நேரத்தில் கடுமையான மருந்துகளைத் தெளிப்பதைத் தவிர்க்கவும்.',
        rationale: 'பூக்கும் நிலை உணர்திறன் பாதுகாப்பு வழிகாட்டல்.'
      };
    }
    if (title.includes('fruit/grain filling')) {
      return {
        title: 'காய் மற்றும் கதிர் முதிர்தல் வளர்ச்சியை கண்காணிக்கவும்',
        description: 'போதுமான பொட்டாசியம் சத்து கிடைப்பதை உறுதிசெய்து, காய் துளைப்பான்கள் அல்லது கதிர் புழுக்களை கண்காணிக்கவும்.',
        rationale: 'கதிர் முதிர்தல் நிலை விளைச்சல் பாதுகாப்பு.'
      };
    }
    if (title.includes('emergence rate') || title.includes('seedling')) {
      return {
        title: 'நாற்று முளைப்பு வீதத்தை சரிபார்க்கவும்',
        description: 'சதுர மீட்டருக்கு நாற்றுகளின் அடர்த்தியை சரிபார்க்கவும். 85%-க்கு குறைவாக இருந்தால் உடனடி மறுவிதைப்பு செய்யவும்.',
        rationale: 'ஆரம்ப முளைப்பு நிலை அடர்த்தி உறுதிப்படுத்தல்.'
      };
    }
    if (title.includes('harvest maturity')) {
      return {
        title: 'அறுவடை பக்குவ நிலையை சரிபார்க்கவும்',
        description: 'தானியத்தின் ஈரப்பதம் மற்றும் பயிரின் நிறத்தை சோதிக்கவும். தூய அறுவடைக் கருவிகளைத் தயார் செய்யவும்.',
        rationale: 'அறுவடை நிலை உடனடி முன்னுரிமை.'
      };
    }
    if (title.includes('Do not spray chemicals')) {
      return {
        title: 'இன்று ரசாயனங்கள் அல்லது திரவ உரங்கள் தெளிக்க வேண்டாம்',
        description: 'காற்றின் வேகம் அதிகமாக உள்ளது. மருந்து காற்றில் சிதறி வீணாகும் மற்றும் அருகில் உள்ள இலைகளுக்கு பாதிப்பை ஏற்படுத்தும்.',
        rationale: 'வானிலை உணரியின் காற்றின் வேக எச்சரிக்கை அடிப்படையில் பெறப்பட்டது.'
      };
    }
    if (title.includes('Optimal weather window')) {
      return {
        title: 'இலைவழி உரம் தெளிக்க சாதகமான வானிலை',
        description: 'காற்றின் வேகம் குறைவாகவும் மழை வாய்ப்பு குறைவாகவும் உள்ளது. இலைவழி ஊட்டச்சத்து அல்லது நுண்ணுயிர் உரம் தெளிக்க உகந்தது.',
        rationale: 'வானிலை மற்றும் ஈரப்பதம் பாதுகாப்பான வரம்பிற்குள் உள்ளது.'
      };
    }
    if (title.includes('inventory') || title.includes('readiness')) {
      return {
        title: 'கருவிகள் மற்றும் இடுபொருட்கள் தயார்நிலை ஆய்வு',
        description: 'அடுத்த கட்ட விவசாயப் பணிகளுக்கான உரங்கள், பாசன உபகரணங்கள் மற்றும் தெளிப்பான்களைச் சரிபார்க்கவும்.',
        rationale: 'அடுத்த கட்ட பயிர் நிலைக்கு முன்கூட்டியே தயாராதல்.'
      };
    }
    return {
      title: task.title,
      description: task.description,
      rationale: task.rationale
    };
  }

  // Malayalam (ml)
  if (title.includes('Hold scheduled irrigation')) {
    return {
      title: 'നിശ്ചയിച്ച ജലസേചനം മാറ്റിവെക്കുക',
      description: 'മഴ സാധ്യതയുള്ളതിനാൽ വെള്ളക്കെട്ടും വേരഴുകലും ഒഴിവാക്കാൻ ജലസേചനം മാറ്റിവെക്കുക.',
      rationale: 'കാലാവസ്ഥാ പ്രവചനത്തിന്റെയും മണ്ണിന്റെ നീർവാർച്ചാ ശേഷിയുടെയും അടിസ്ഥാനത്തിൽ തയ്യാറാക്കിയത്.'
    };
  }
  if (title.includes('early morning') || title.includes('Conduct early')) {
    return {
      title: 'അതിരാവിലെയോ വൈകുന്നേരമോ ജലസേചനം നടത്തുക',
      description: 'പകൽ സമയത്തെ ഉയർന്ന താപനില കാരണം ഈർപ്പനഷ്ടം കൂടും. തണുപ്പുള്ള സമയങ്ങളിൽ തുള്ളിനന നടത്തുക.',
      rationale: 'കൂടിയ താപനിലയിൽ ഉപരിതല ഈർപ്പം വേഗത്തിൽ നഷ്ടപ്പെടുന്നത് തടയാൻ.'
    };
  }
  if (title.includes('root-zone moisture')) {
    return {
      title: 'വേരിലെ ഈർപ്പ നില പരിശോധിക്കുക',
      description: 'ഉപരിതലത്തിൽ നിന്ന് 2 ഇഞ്ച് താഴെ മണ്ണ് പരിശോധിക്കുക. ഉണങ്ങിയിട്ടുണ്ടെങ്കിൽ നിശ്ചിത അളവിൽ നനയ്ക്കുക.',
      rationale: 'വിളയുടെ ഘട്ടത്തിനനുസൃതമായ പതിവ് ഈർപ്പ സംരക്ഷണം.'
    };
  }
  if (title.includes('Field inspection')) {
    return {
      title: 'വിളയുടെ വളർച്ചയും കളകളും പരിശോധിക്കുക',
      description: 'ചെടികളുടെ വളർച്ചാ പുരോഗതിയും കളകളുടെ സാന്നിധ്യവും കൃഷിയിടത്തിൽ പരിശോധിക്കുക.',
      rationale: 'വിളയുടെ വളർച്ചാ ഘട്ടത്തിനനുസരിച്ചുള്ള പതിവ് നിരീക്ഷണം.'
    };
  }
  if (title.includes('bloom set') || title.includes('pollinator')) {
    return {
      title: 'പൂവിടലും പരാഗണ പ്രാണികളുടെ സാന്നിധ്യവും നിരീക്ഷിക്കുക',
      description: 'പൂക്കളിൽ കീടങ്ങളോ കുമിൾ രോഗങ്ങളോ ഉണ്ടോ എന്ന് നോക്കുക. പൂവിടുന്ന സമയത്ത് കടുത്ത മരുന്നുകൾ തളിക്കരുത്.',
      rationale: 'പൂവിടൽ ഘട്ടത്തിലെ അതിലോല സംരക്ഷണ നിർദ്ദേശം.'
    };
  }
  if (title.includes('fruit/grain filling')) {
    return {
      title: 'കതിരുകളിൽ ധാന്യം നിറയുന്നത് നിരീക്ഷിക്കുക',
      description: 'പൊട്ടാഷ് സാന്നിധ്യം ഉറപ്പാക്കുകയും തണ്ടുതുരപ്പൻ പുഴുക്കളുടെ ആക്രമണം ശ്രദ്ധിക്കുകയും ചെയ്യുക.',
      rationale: 'ധാന്യങ്ങളുടെ ഭാരവും ഗുണമേന്മയും ഉറപ്പാക്കാൻ.'
    };
  }
  if (title.includes('emergence rate') || title.includes('seedling')) {
    return {
      title: 'വിത്ത് മുളച്ചുവരുന്നതിന്റെ നിരക്ക് ഉറപ്പുവരുത്തുക',
      description: 'മുളച്ച തൈകളുടെ സാന്ദ്രത പരിശോധിക്കുക. 85%-ൽ താഴെയാണെങ്കിൽ 10 ദിവസത്തിനകം വിത്ത് വീണ്ടും നടുക.',
      rationale: 'ആദ്യഘട്ട വിള സാന്ദ്രത ഉറപ്പാക്കൽ.'
    };
  }
  if (title.includes('harvest maturity')) {
    return {
      title: 'വിളവെടുപ്പ് പാകതയുടെ ലക്ഷണങ്ങൾ പരിശോധിക്കുക',
      description: 'ധാന്യത്തിലെ ഈർപ്പവും വിളയുടെ നിറവും പരിശോധിക്കുക. വൃത്തിയുള്ള കൊയ്ത്തുപകരണങ്ങൾ സജ്ജമാക്കുക.',
      rationale: 'വിളവെടുപ്പ് ഘട്ടത്തിലെ നിർണായക മുൻഗണന.'
    };
  }
  if (title.includes('Do not spray chemicals')) {
    return {
      title: 'ഇന്ന് കീടനാശിനികളോ ദ്രാവക വളങ്ങളോ തളിക്കരുത്',
      description: 'കാറ്റിന്റെ വേഗത കൂടുതലായതിനാൽ മരുന്ന് ലക്ഷ്യസ്ഥാനത്ത് പതിക്കാതെ പാഴാകും, മറ്റ് ഇലകൾക്ക് കേടുവരുത്തും.',
      rationale: 'കാലാവസ്ഥാ നിരീക്ഷണത്തിലെ കാറ്റിന്റെ വേഗത മുന്നറിയിപ്പ് പ്രകാരം.'
    };
  }
  if (title.includes('Optimal weather window')) {
    return {
      title: 'ഇലകളിൽ വളം തളിക്കാൻ ഏറ്റവും അനുയോജ്യമായ സമയം',
      description: 'കാറ്റിന്റെ വേഗത കുറവാണ്, മഴ സാധ്യതയും ഇല്ല. ഇലകളിൽ ജൈവവളമോ സൂക്ഷ്മ മൂലകങ്ങളോ തളിക്കാൻ അനുകൂല ഘട്ടം.',
      rationale: 'കാലാവസ്ഥ സുരക്ഷിതമായ പരിധിക്കുള്ളിലാണ്.'
    };
  }
  if (title.includes('inventory') || title.includes('readiness')) {
    return {
      title: 'കാർഷിക ഉപകരണങ്ങളും വളം സ്റ്റോക്കും പരിശോധിക്കുക',
      description: 'അടുത്ത വളർച്ചാ ഘട്ടത്തിലേക്ക് ആവശ്യമായ വളങ്ങൾ, സ്പ്രേയറുകൾ, ജലസേചന പൈപ്പുകൾ എന്നിവ പരിശോധിക്കുക.',
      rationale: 'അടുത്ത ഘട്ടത്തിനായുള്ള മുൻകൂട്ടിയുള്ള തയ്യാറെടുപ്പ്.'
    };
  }

  return {
    title: task.title,
    description: task.description,
    rationale: task.rationale
  };
}

// Localized Commodity Names for Market
export const localizedCommodities: Record<string, Record<Language, string>> = {
  'Wheat': { en: 'Wheat', ta: 'கோதுமை', ml: 'ഗോതമ്പ്' },
  'Paddy (Basmati)': { en: 'Paddy (Basmati)', ta: 'பாசுமதி நெல்', ml: 'ബസ്മതി നെല്ല്' },
  'Mustard Seed': { en: 'Mustard Seed', ta: 'கடுகு விதை', ml: 'കടുക്' },
  'Cotton (Raw)': { en: 'Cotton (Raw)', ta: 'பருத்தி (மூல)', ml: 'പരുത്തി' },
  'Tomato (Hybrid)': { en: 'Tomato (Hybrid)', ta: 'தக்காளி (வீரிய ஒட்டு)', ml: 'തക്കാളി (ഹൈബ്രിഡ്)' },
  'Chickpea / Chana': { en: 'Chickpea / Chana', ta: 'கொண்டைக்கடலை', ml: 'കടല' }
};

export function getLocalizedCommodity(name: string, lang: Language): string {
  return localizedCommodities[name]?.[lang] || name;
}

// Localized Selling Considerations
export const localizedSellingConsiderations: Record<Language, string[]> = {
  en: [
    'Rabi wheat arrivals peak in March-April. Clean grain with <12% moisture commands a ₹120-180/quintal premium in terminal mandis.',
    'Consider partial staggered selling: market 40% of produce immediately to cover harvesting costs, and hold 60% for 30-45 days if on-farm hermetic storage is accessible.',
    'Monitor government minimum support price (MSP) procurement centers alongside private mandi auctions.'
  ],
  ta: [
    'மார்ச்-ஏப்ரல் மாதங்களில் கோதுமை வரத்து அதிகமாகும். 12%-க்கும் குறைவான ஈரப்பதம் கொண்ட தூய தானியத்திற்கு குவிண்டாலுக்கு ₹120-180 கூடுதல் விலை கிடைக்கும்.',
    'பகுதி பகுதியாக விற்பனை செய்தல்: அறுவடை செலவுகளுக்காக 40% விளைச்சலை உடனே விற்றுவிட்டு, நல்ல சேமிப்புக் கிடங்கு இருந்தால் 60% விளைச்சலை 30-45 நாட்கள் வைத்திருக்கலாம்.',
    'தனியார் சந்தை ஏலத்துடன் அரசு குறைந்தபட்ச ஆதரவு விலை (MSP) கொள்முதல் நிலையங்களையும் கண்காணியுங்கள்.'
  ],
  ml: [
    'മാർച്ച്-ഏപ്രിൽ മാസങ്ങളിൽ വിപണിയിൽ ധാന്യ വരവ് കൂടും. 12%-ൽ താഴെ ഈർപ്പമുള്ള വൃത്തിയുള്ള വിളവിന് ക്വിന്റലിന് ₹120-180 കൂടുതൽ ലഭിക്കും.',
    'ഘട്ടം ഘട്ടമായുള്ള വിൽപ്പന: വിളവെടുപ്പ് ചെലവിനായി 40% ഉൽപ്പന്നം ഉടൻ വിൽക്കുക, സുരക്ഷിതമായ സംഭരണ സൗകര്യമുണ്ടെങ്കിൽ 60% ഉൽപ്പന്നം 30-45 ദിവസത്തേക്ക് സൂക്ഷിക്കുക.',
    'സ്വകാര്യ ചന്തകളോടൊപ്പം സർക്കാർ താങ്ങുവില (MSP) സംഭരണ കേന്ദ്രങ്ങളും നിരീക്ഷിക്കുക.'
  ]
};

// Localized Risk Categories & Alerts
export const localizedRiskCategories: Record<string, Record<Language, string>> = {
  'Weather & Climate Risk': {
    en: 'Weather & Climate Risk',
    ta: 'வானிலை & பருவநிலை ஆபத்து',
    ml: 'കാലാവസ്ഥാ അപായ സാധ്യത'
  },
  'Soil Moisture & Water Security': {
    en: 'Soil Moisture & Water Security',
    ta: 'மண் ஈரப்பதம் & நீர் பாதுகாப்பு',
    ml: 'മണ്ണിലെ ഈർപ്പവും ജലസുരക്ഷയും'
  },
  'Crop Stage Vulnerability': {
    en: 'Crop Stage Vulnerability',
    ta: 'பயிர் வளர்ச்சி நிலை பாதிப்பு',
    ml: 'വിള വളർച്ചാ ഘട്ട ലോലത'
  },
  'Market Price Volatility': {
    en: 'Market Price Volatility',
    ta: 'சந்தை விலை ஏற்ற இறக்க ஆபத்து',
    ml: 'വിപണി വില ചാഞ്ചാട്ട സാധ്യത'
  }
};

export function getLocalizedRiskCategory(cat: string, lang: Language): string {
  return localizedRiskCategories[cat]?.[lang] || cat;
}

export function getLocalizedRiskLevel(level: string, lang: Language): string {
  const l = level.toLowerCase();
  if (lang === 'ta') {
    if (l === 'high') return 'உயர் ஆபத்து';
    if (l === 'elevated') return 'அதிகரித்த ஆபத்து';
    if (l === 'moderate') return 'மிதமான ஆபத்து';
    return 'குறைந்த ஆபத்து';
  }
  if (lang === 'ml') {
    if (l === 'high') return 'ഉയർന്ന അപായം';
    if (l === 'elevated') return 'ഉയരുന്ന അപായം';
    if (l === 'moderate') return 'മിതമായ അപായം';
    return 'കുറഞ്ഞ അപായം';
  }
  return `${level.toUpperCase()} RISK`;
}

export function getLocalizedRiskAlert(
  title: string,
  desc: string,
  mitigation: string,
  lang: Language
): { title: string; desc: string; mitigation: string } {
  if (lang === 'en') return { title, desc, mitigation };

  if (lang === 'ta') {
    if (title.includes('Temperature') || title.includes('Heat')) {
      return {
        title: 'பகலில் அதிக வெப்பநிலை',
        desc: 'உயர்ந்த வெப்பநிலை பயிரின் ஆவியாதல் வீதத்தை அதிகரிக்கிறது மற்றும் மண்ணின் மேல்மட்ட ஈரப்பதத்தை விரைவாகக் குறைக்கிறது.',
        mitigation: 'அதிகாலை அல்லது சூரிய மறைவிற்குப் பின் இலகுவான நீர்ப்பாசனம் செய்யவும்; வேர்ப்பகுதியில் ஈரப்பதம் பாதுகாக்க மூடாக்கு இடவும்.'
      };
    }
    if (title.includes('Wind') || title.includes('Foliar')) {
      return {
        title: 'காற்றின் வேகம் - மருந்து தெளிப்பு அபாயம்',
        desc: 'அதிக காற்று மருந்து தெளிப்பை சிதறடித்து வீணாக்கும்.',
        mitigation: 'காற்றின் வேகம் தணியும் வரை ரசாயன தெளிப்பை ஒத்திவைக்கவும்.'
      };
    }
    return {
      title,
      desc,
      mitigation
    };
  }

  // Malayalam (ml)
  if (title.includes('Temperature') || title.includes('Heat')) {
    return {
      title: 'പകൽ സമയത്തെ ഉയർന്ന താപനില',
      desc: 'കൂടിയ താപനില കാരണം ചെടികളിൽ നിന്ന് ജലം വേഗത്തിൽ ബാഷ്പീകരിക്കപ്പെടുകയും ഉപരിതല ഈർപ്പം കുറയുകയും ചെയ്യുന്നു.',
      mitigation: 'അതിരാവിലെയോ സൂര്യാസ്തമയത്തിനു ശേഷമോ നേരിയ നന നൽകുക; വേരുകളിൽ ഈർപ്പം നിലനിർത്താൻ പുതയിടുക.'
    };
  }
  if (title.includes('Wind') || title.includes('Foliar')) {
    return {
      title: 'കാറ്റിന്റെ വേഗത - മരുന്ന് തളിക്കൽ അപായം',
      desc: 'ശക്തമായ കാറ്റിൽ മരുന്ന് തളിക്കുന്നത് മരുന്ന് പാഴാകാനും സമീപ വിളകൾക്ക് കേടുവരുത്താനും ഇടയാക്കും.',
      mitigation: 'കാറ്റ് കുറയുന്നത് വരെ സ്പ്രേ ചെയ്യുന്നത് നിർത്തിവെക്കുക.'
    };
  }
  return { title, desc, mitigation };
}
