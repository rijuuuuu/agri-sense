import type { 
  WeatherDataPayload, 
  WeatherCondition, 
  DailyForecast, 
  AgriculturalAdvisory,
  DataProvenance
} from '@agrisense/shared';

interface CachedWeather {
  timestamp: number;
  data: WeatherDataPayload;
}

const cache = new Map<string, CachedWeather>();
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

// WMO Weather interpretation code map
function getWeatherDescription(code: number): string {
  if (code === 0) return 'Clear sky';
  if (code === 1 || code === 2) return 'Mainly clear / partly cloudy';
  if (code === 3) return 'Overcast';
  if (code === 45 || code === 48) return 'Foggy';
  if (code >= 51 && code <= 55) return 'Drizzle';
  if (code >= 61 && code <= 65) return 'Rain showers';
  if (code >= 71 && code <= 77) return 'Snow fall';
  if (code >= 80 && code <= 82) return 'Heavy rain showers';
  if (code >= 95) return 'Thunderstorm';
  return 'Cloudy';
}

export async function fetchFarmWeather(
  latitude: number, 
  longitude: number, 
  villageDistrict: string
): Promise<{ payload: WeatherDataPayload; provenance: DataProvenance }> {
  const cacheKey = `${latitude.toFixed(3)},${longitude.toFixed(3)}`;
  const now = Date.now();

  const cached = cache.get(cacheKey);
  if (cached && (now - cached.timestamp < CACHE_TTL_MS)) {
    return {
      payload: cached.data,
      provenance: {
        source: 'Open-Meteo REST API (Cached)',
        timestamp: new Date(cached.timestamp).toISOString(),
        mode: 'LIVE',
        cached: true
      }
    };
  }

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,precipitation,rain,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max&timezone=auto`;

  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!response.ok) {
      throw new Error(`Open-Meteo API returned HTTP status ${response.status}`);
    }

    const data = await response.json();
    const currentRaw = data.current;
    const dailyRaw = data.daily;

    const current: WeatherCondition = {
      temperatureCelsius: currentRaw.temperature_2m,
      humidityPct: currentRaw.relative_humidity_2m,
      rainfallMm: currentRaw.precipitation || currentRaw.rain || 0,
      rainProbabilityPct: dailyRaw.precipitation_probability_max?.[0] || 0,
      windSpeedKmh: currentRaw.wind_speed_10m,
      weatherCode: currentRaw.weather_code,
      weatherDescription: getWeatherDescription(currentRaw.weather_code)
    };

    const daily: DailyForecast[] = (dailyRaw.time || []).slice(0, 7).map((date: string, i: number) => ({
      date,
      tempMax: dailyRaw.temperature_2m_max[i],
      tempMin: dailyRaw.temperature_2m_min[i],
      precipitationMm: dailyRaw.precipitation_sum[i],
      precipitationProbability: dailyRaw.precipitation_probability_max[i] || 0,
      condition: getWeatherDescription(dailyRaw.weather_code[i]),
      weatherCode: dailyRaw.weather_code[i]
    }));

    // Agricultural Interpretation Layer
    const advisory = interpretAgriculturalWeather(current, daily);

    const payload: WeatherDataPayload = {
      current,
      daily,
      advisory,
      farmLocation: {
        villageDistrict,
        latitude,
        longitude
      }
    };

    cache.set(cacheKey, { timestamp: now, data: payload });

    return {
      payload,
      provenance: {
        source: 'Open-Meteo REST API v1',
        timestamp: new Date().toISOString(),
        mode: 'LIVE',
        cached: false
      }
    };
  } catch (err: any) {
    console.error('[WeatherService] Open-Meteo request failed:', err?.message || err);
    throw new Error(`Open-Meteo weather service unavailable: ${err?.message || 'Network timeout or connection error'}`);
  }
}


// Deterministic Agro-Meteorological Rule Engine
export function interpretAgriculturalWeather(
  current: WeatherCondition, 
  daily: DailyForecast[]
): AgriculturalAdvisory {
  const next24hRainProb = daily[0]?.precipitationProbability || current.rainProbabilityPct;
  const next3DaysRain = daily.slice(0, 3).reduce((acc, d) => acc + d.precipitationMm, 0);

  // 1. Irrigation Decision
  let irrigationStatus: 'proceed' | 'caution' | 'postpone' | 'emergency' = 'proceed';
  let irrigationAdvice = 'Normal irrigation schedule recommended. Soil moisture balance is stable.';

  if (next24hRainProb >= 60 || current.rainfallMm > 5) {
    irrigationStatus = 'postpone';
    irrigationAdvice = `Postpone irrigation: ${next24hRainProb}% chance of rain within 24 hours (${next3DaysRain.toFixed(1)}mm projected). Prevent waterlogging.`;
  } else if (next24hRainProb >= 35) {
    irrigationStatus = 'caution';
    irrigationAdvice = 'Moderate rain probability. Consider deficit or partial irrigation, monitoring topsoil moisture.';
  } else if (current.temperatureCelsius > 35 && current.humidityPct < 30) {
    irrigationStatus = 'caution';
    irrigationAdvice = 'High evapotranspiration due to dry heat. Early morning or evening drip irrigation strongly advised.';
  }

  // 2. Spraying Decision (Wind + Rain)
  let isSuitable = true;
  let reason = 'Weather conditions are optimal for foliar spray and fertilizer application.';

  if (current.windSpeedKmh > 20) {
    isSuitable = false;
    reason = `Wind speed is high (${current.windSpeedKmh.toFixed(1)} km/h). Spray drift will cause chemical loss and uneven coverage.`;
  } else if (next24hRainProb > 50) {
    isSuitable = false;
    reason = 'Rain expected within 24 hours. Foliar sprays will likely be washed off before plant absorption.';
  } else if (current.temperatureCelsius > 34) {
    isSuitable = false;
    reason = 'High midday heat may cause leaf scorch when applying emulsifiable chemical sprays.';
  }

  // 3. Heat Stress Alert
  let heatLevel: 'normal' | 'moderate' | 'severe' = 'normal';
  let heatMessage = 'Temperatures are within normal physiological thresholds.';
  if (current.temperatureCelsius >= 38) {
    heatLevel = 'severe';
    heatMessage = 'Severe heatwave alert. Pollen sterility and leaf scorch risk for flowering crops.';
  } else if (current.temperatureCelsius >= 34) {
    heatLevel = 'moderate';
    heatMessage = 'Elevated temperatures. Ensure adequate soil root-zone hydration.';
  }

  // 4. Rain & Waterlogging Risk
  let rainRiskLevel: 'none' | 'light' | 'heavy' | 'waterlogging_risk' = 'none';
  let rainMessage = 'No excessive rainfall risks detected.';
  if (next3DaysRain > 45) {
    rainRiskLevel = 'waterlogging_risk';
    rainMessage = `Critical rainfall alert: ${next3DaysRain.toFixed(1)}mm expected. Clear field drainage channels immediately.`;
  } else if (next3DaysRain > 15) {
    rainRiskLevel = 'heavy';
    rainMessage = 'Substantial rain forecast over the next 72 hours. Check furrows and low-lying field zones.';
  } else if (next24hRainProb > 30) {
    rainRiskLevel = 'light';
    rainMessage = 'Light showers possible. Good for vegetative growth.';
  }

  return {
    irrigationNotice: { status: irrigationStatus, advice: irrigationAdvice },
    sprayingNotice: { isSuitable, reason },
    heatStressAlert: { level: heatLevel, message: heatMessage },
    rainRiskWarning: { level: rainRiskLevel, message: rainMessage }
  };
}
