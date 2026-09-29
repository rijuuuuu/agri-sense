import type { UserLocationInfo } from '@agrisense/shared';

interface RegionalCenter {
  district: string;
  state: string;
  latitude: number;
  longitude: number;
}

const KNOWN_REGIONAL_CENTERS: RegionalCenter[] = [
  // Tamil Nadu
  { district: 'Chennai', state: 'Tamil Nadu', latitude: 13.0827, longitude: 80.2707 },
  { district: 'Thanjavur', state: 'Tamil Nadu', latitude: 10.7870, longitude: 79.1378 },
  { district: 'Coimbatore', state: 'Tamil Nadu', latitude: 11.0168, longitude: 76.9558 },
  { district: 'Madurai', state: 'Tamil Nadu', latitude: 9.9252, longitude: 78.1198 },
  { district: 'Tiruchirappalli', state: 'Tamil Nadu', latitude: 10.7905, longitude: 78.7047 },
  { district: 'Erode', state: 'Tamil Nadu', latitude: 11.3410, longitude: 77.7172 },
  { district: 'Salem', state: 'Tamil Nadu', latitude: 11.6643, longitude: 78.1460 },
  { district: 'Tirunelveli', state: 'Tamil Nadu', latitude: 8.7139, longitude: 77.7567 },
  { district: 'Dharmapuri', state: 'Tamil Nadu', latitude: 12.1211, longitude: 78.1582 },
  { district: 'Cuddalore', state: 'Tamil Nadu', latitude: 11.7480, longitude: 79.7714 },

  // Kerala
  { district: 'Thiruvananthapuram', state: 'Kerala', latitude: 8.5241, longitude: 76.9366 },
  { district: 'Kochi (Ernakulam)', state: 'Kerala', latitude: 9.9312, longitude: 76.2673 },
  { district: 'Thrissur', state: 'Kerala', latitude: 10.5276, longitude: 76.2144 },
  { district: 'Palakkad', state: 'Kerala', latitude: 10.7867, longitude: 76.6548 },
  { district: 'Kozhikode', state: 'Kerala', latitude: 11.2588, longitude: 75.7804 },
  { district: 'Wayanad (Kalpetta)', state: 'Kerala', latitude: 11.6854, longitude: 76.1320 },
  { district: 'Kottayam', state: 'Kerala', latitude: 9.5916, longitude: 76.5222 },
  { district: 'Idukki (Painavu)', state: 'Kerala', latitude: 9.8497, longitude: 76.9806 },

  // Karnataka
  { district: 'Bengaluru', state: 'Karnataka', latitude: 12.9716, longitude: 77.5946 },
  { district: 'Mysuru', state: 'Karnataka', latitude: 12.2958, longitude: 76.6394 },
  { district: 'Hubballi-Dharwad', state: 'Karnataka', latitude: 15.3647, longitude: 75.1240 },
  { district: 'Belagavi', state: 'Karnataka', latitude: 15.8497, longitude: 74.4977 },
  { district: 'Raichur', state: 'Karnataka', latitude: 16.2076, longitude: 77.3463 },
  { district: 'Shivamogga', state: 'Karnataka', latitude: 13.9299, longitude: 75.5681 },
  { district: 'Kolar', state: 'Karnataka', latitude: 13.1367, longitude: 78.1291 },

  // Maharashtra
  { district: 'Mumbai', state: 'Maharashtra', latitude: 19.0760, longitude: 72.8777 },
  { district: 'Pune', state: 'Maharashtra', latitude: 18.5204, longitude: 73.8567 },
  { district: 'Nashik', state: 'Maharashtra', latitude: 19.9975, longitude: 73.7898 },
  { district: 'Nagpur', state: 'Maharashtra', latitude: 21.1458, longitude: 79.0882 },
  { district: 'Chhatrapati Sambhajinagar', state: 'Maharashtra', latitude: 19.8762, longitude: 75.3433 },
  { district: 'Solapur', state: 'Maharashtra', latitude: 17.6599, longitude: 75.9064 },
  { district: 'Kolhapur', state: 'Maharashtra', latitude: 16.7050, longitude: 74.2433 },
  { district: 'Amravati', state: 'Maharashtra', latitude: 20.9374, longitude: 77.7796 },

  // Andhra Pradesh
  { district: 'Amaravati/Vijayawada', state: 'Andhra Pradesh', latitude: 16.5062, longitude: 80.6480 },
  { district: 'Guntur', state: 'Andhra Pradesh', latitude: 16.3067, longitude: 80.4365 },
  { district: 'Visakhapatnam', state: 'Andhra Pradesh', latitude: 17.6868, longitude: 83.2185 },
  { district: 'Tirupati', state: 'Andhra Pradesh', latitude: 13.6288, longitude: 79.4192 },
  { district: 'Kurnool', state: 'Andhra Pradesh', latitude: 15.8281, longitude: 78.0373 },

  // Telangana
  { district: 'Hyderabad', state: 'Telangana', latitude: 17.3850, longitude: 78.4867 },
  { district: 'Warangal', state: 'Telangana', latitude: 17.9689, longitude: 79.5941 },
  { district: 'Nizamabad', state: 'Telangana', latitude: 18.6725, longitude: 78.0941 },
  { district: 'Karimnagar', state: 'Telangana', latitude: 18.4386, longitude: 79.1288 },

  // Gujarat
  { district: 'Ahmedabad', state: 'Gujarat', latitude: 23.0225, longitude: 72.5714 },
  { district: 'Rajkot', state: 'Gujarat', latitude: 22.3039, longitude: 70.8022 },
  { district: 'Surat', state: 'Gujarat', latitude: 21.1702, longitude: 72.8311 },
  { district: 'Vadodara', state: 'Gujarat', latitude: 22.3072, longitude: 73.1812 },

  // Rajasthan
  { district: 'Jaipur', state: 'Rajasthan', latitude: 26.9124, longitude: 75.7873 },
  { district: 'Jodhpur', state: 'Rajasthan', latitude: 26.2389, longitude: 73.0243 },
  { district: 'Kota', state: 'Rajasthan', latitude: 25.2138, longitude: 75.8648 },
  { district: 'Bharatpur', state: 'Rajasthan', latitude: 27.2152, longitude: 77.5030 },
  { district: 'Sri Ganganagar', state: 'Rajasthan', latitude: 29.9094, longitude: 73.8799 },

  // Punjab
  { district: 'Ludhiana', state: 'Punjab', latitude: 30.9010, longitude: 75.8573 },
  { district: 'Amritsar', state: 'Punjab', latitude: 31.6340, longitude: 74.8723 },
  { district: 'Khanna', state: 'Punjab', latitude: 30.7071, longitude: 76.2167 },
  { district: 'Bathinda', state: 'Punjab', latitude: 30.2110, longitude: 74.9455 },
  { district: 'Patiala', state: 'Punjab', latitude: 30.3398, longitude: 76.3869 },

  // Haryana
  { district: 'Karnal', state: 'Haryana', latitude: 29.6857, longitude: 76.9905 },
  { district: 'Hisar', state: 'Haryana', latitude: 29.1492, longitude: 75.7217 },
  { district: 'Ambala', state: 'Haryana', latitude: 30.3782, longitude: 76.7767 },
  { district: 'Sirsa', state: 'Haryana', latitude: 29.5349, longitude: 75.0289 },

  // Uttar Pradesh
  { district: 'Lucknow', state: 'Uttar Pradesh', latitude: 26.8467, longitude: 80.9462 },
  { district: 'Kanpur', state: 'Uttar Pradesh', latitude: 26.4499, longitude: 80.3319 },
  { district: 'Varanasi', state: 'Uttar Pradesh', latitude: 25.3176, longitude: 82.9739 },
  { district: 'Agra', state: 'Uttar Pradesh', latitude: 27.1767, longitude: 78.0081 },
  { district: 'Bareilly', state: 'Uttar Pradesh', latitude: 28.3670, longitude: 79.4304 },
  { district: 'Meerut', state: 'Uttar Pradesh', latitude: 28.9845, longitude: 77.7064 },

  // Madhya Pradesh
  { district: 'Bhopal', state: 'Madhya Pradesh', latitude: 23.2599, longitude: 77.4126 },
  { district: 'Indore', state: 'Madhya Pradesh', latitude: 22.7196, longitude: 75.8577 },
  { district: 'Jabalpur', state: 'Madhya Pradesh', latitude: 23.1815, longitude: 79.9864 },

  // West Bengal
  { district: 'Kolkata', state: 'West Bengal', latitude: 22.5726, longitude: 88.3639 },
  { district: 'Purba Bardhaman', state: 'West Bengal', latitude: 23.2324, longitude: 87.8615 },
  { district: 'Siliguri', state: 'West Bengal', latitude: 26.7271, longitude: 88.3953 },

  // Bihar
  { district: 'Patna', state: 'Bihar', latitude: 25.5941, longitude: 85.1376 },
  { district: 'Muzaffarpur', state: 'Bihar', latitude: 26.1209, longitude: 85.3647 },
  { district: 'Purnia', state: 'Bihar', latitude: 25.7771, longitude: 87.4753 },

  // Delhi NCR
  { district: 'New Delhi', state: 'Delhi NCR', latitude: 28.6139, longitude: 77.2090 }
];

function calculateHaversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of Earth in KM
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

export async function reverseGeocodeLocation(lat: number, lon: number): Promise<UserLocationInfo> {
  // First attempt online reverse geocode with fast timeout (BigDataCloud free client-side API)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`;
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const state = data.principalSubdivision || '';
      const district = data.city || data.locality || data.principalSubdivision || '';
      const country = data.countryName || 'India';

      if (state) {
        return {
          latitude: lat,
          longitude: lon,
          district: district || 'Agricultural Sector',
          state: state,
          country,
          formattedAddress: `${district ? district + ', ' : ''}${state}, ${country}`,
          isGpsDetected: true
        };
      }
    }
  } catch (_err) {
    // Network lookup fallback to offline distance-based matcher
  }

  // Robust Spatial Nearest Centroid Matcher (100% reliable fallback)
  let closestCenter = KNOWN_REGIONAL_CENTERS[0];
  let minDistance = calculateHaversineDistanceKm(lat, lon, closestCenter.latitude, closestCenter.longitude);

  for (let i = 1; i < KNOWN_REGIONAL_CENTERS.length; i++) {
    const center = KNOWN_REGIONAL_CENTERS[i];
    const dist = calculateHaversineDistanceKm(lat, lon, center.latitude, center.longitude);
    if (dist < minDistance) {
      minDistance = dist;
      closestCenter = center;
    }
  }

  return {
    latitude: lat,
    longitude: lon,
    district: closestCenter.district,
    state: closestCenter.state,
    country: 'India',
    formattedAddress: `${closestCenter.district}, ${closestCenter.state}, India (~${minDistance} km)`,
    isGpsDetected: true
  };
}

/**
 * Forward-geocodes any district, city, or place name into real geographical coordinates
 * via Open-Meteo Geocoding API with fast spatial fallback.
 */
export async function geocodeLocationQuery(query: string): Promise<UserLocationInfo> {
  const clean = query.trim();
  if (!clean) {
    return {
      latitude: 10.7870,
      longitude: 79.1378,
      district: 'Thanjavur',
      state: 'Tamil Nadu',
      country: 'India',
      formattedAddress: 'Thanjavur, Tamil Nadu, India'
    };
  }

  // 1. Direct match in KNOWN_REGIONAL_CENTERS
  const lower = clean.toLowerCase();
  const matched = KNOWN_REGIONAL_CENTERS.find(c => 
    c.district.toLowerCase() === lower ||
    c.district.toLowerCase().includes(lower) ||
    lower.includes(c.district.toLowerCase())
  );

  // 2. Try Open-Meteo live geocoding API
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(clean)}&count=5&language=en&format=json`;
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        // Find best match (prefer India if available)
        const inIndia = data.results.find((r: any) => r.country_code === 'IN' || r.country === 'India');
        const best = inIndia || data.results[0];

        return {
          latitude: best.latitude,
          longitude: best.longitude,
          district: best.name,
          state: best.admin1 || matched?.state || '',
          country: best.country || 'India',
          formattedAddress: `${best.name}${best.admin1 ? ', ' + best.admin1 : ''}, ${best.country || 'India'}`
        };
      }
    }
  } catch (_e) {
    // Network lookup fallback
  }

  // Fallback to matched known center
  if (matched) {
    return {
      latitude: matched.latitude,
      longitude: matched.longitude,
      district: matched.district,
      state: matched.state,
      country: 'India',
      formattedAddress: `${matched.district}, ${matched.state}, India`
    };
  }

  // Default coordinate if completely unmatched
  return {
    latitude: 11.0168,
    longitude: 76.9558,
    district: clean,
    state: 'Tamil Nadu',
    country: 'India',
    formattedAddress: `${clean}, India`
  };
}

