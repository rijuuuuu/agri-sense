import React, { useState, useEffect } from 'react';
import { Sprout, CheckCircle, AlertCircle, Droplets, Calendar, DollarSign, Layers } from 'lucide-react';
import type { Farm, SoilProfile, WaterProfile, AgriculturalSeason } from '@agrisense/shared';
import type { Language, Translations } from '../../i18n/translations.js';
import { 
  getLocalizedCropName, 
  getLocalizedSoilType, 
  getLocalizedWaterSource, 
  getLocalizedWaterAvailability 
} from '../../i18n/cropNames.js';

interface CropRecommendationItem {
  crop: {
    id: string;
    commonName: string;
    category: string;
    suitableSeasons: string[];
    durationDaysMin: number;
    durationDaysMax: number;
    waterRequirementLevel: string;
    estimatedCostPerAcre: number;
    description: string;
  };
  suitabilityScorePct: number;
  suitabilityLevel: 'Highly Suitable' | 'Potentially Suitable' | 'Moderate Suitability';
  reasons: string[];
  seasonSuitability: string;
  soilSuitability: string;
  waterSuitability: string;
  budgetFit: string;
  estimatedGrossMarginPerAcre: number;
  potentialRisks: string[];
  marketOutlook: string;
}

interface CropRecommendationViewProps {
  farm: Farm | null;
  soil: SoilProfile | null;
  water: WaterProfile | null;
  onSelectCropToPlant: (cropId: string) => void;
  language: Language;
  t: Translations;
}

export const CropRecommendationView: React.FC<CropRecommendationViewProps> = ({
  farm,
  soil,
  water,
  onSelectCropToPlant,
  language,
  t
}) => {
  const [season, setSeason] = useState<AgriculturalSeason>('rabi');
  const [recommendations, setRecommendations] = useState<CropRecommendationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const locSoil = getLocalizedSoilType(soil?.soilType || 'alluvial', language);
  const locWaterSource = getLocalizedWaterSource(water?.waterSource || 'borewell', language);
  const locWaterAvail = getLocalizedWaterAvailability(water?.availabilityStatus || 'sufficient', language);

  const fetchRecommendations = async (selectedSeason: AgriculturalSeason) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/crops/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          soilType: soil?.soilType || 'alluvial',
          soilPh: soil?.phLevel || 6.8,
          waterAvailability: water?.availabilityStatus || 'sufficient',
          season: selectedSeason
        })
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.userFacingMessage || 'Failed to fetch recommendations');
      }

      setRecommendations(json.data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error calculating crop matches');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations(season);
  }, [season, soil, water]);

  const getLocalizedSuitabilityLevel = (level: string) => {
    if (language === 'ta') {
      if (level.includes('Highly')) return 'மிகவும் பொருத்தமானது';
      if (level.includes('Potentially')) return 'பொருத்தமான வாய்ப்பு';
      return 'மிதமான பொருத்தம்';
    }
    if (language === 'ml') {
      if (level.includes('Highly')) return 'വളരെ അനുയോജ്യം';
      if (level.includes('Potentially')) return 'അനുയോജ്യമായ സാധ്യത';
      return 'മിതമായ യോജ്യത';
    }
    return level;
  };

  const localizeReason = (r: string) => {
    if (language === 'ta') {
      if (r.includes('Optimal soil match')) return 'மண்ணின் தன்மைக்கு சிறந்த பொருத்தம்';
      if (r.includes('Sufficient water resource fit')) return 'போதுமான நீர் வள ஆதாரம் உள்ளது';
      if (r.includes('season')) return 'தேர்ந்தெடுக்கப்பட்ட பருவத்திற்கு ஏற்றது';
      if (r.includes('drainage')) return 'மண்ணின் வடிகால் தன்மைக்கு உகந்தது';
      return r;
    }
    if (language === 'ml') {
      if (r.includes('Optimal soil match')) return 'മണ്ണിന്റെ ഘടനയ്ക്ക് ഏറ്റവും അനുയോജ്യം';
      if (r.includes('Sufficient water resource fit')) return 'ലഭ്യമായ ജലസ്രോതസ്സിന് അനുയോജ്യമായ വിള';
      if (r.includes('season')) return 'തിരഞ്ഞെടുത്ത സീസണിന് അനുയോജ്യം';
      if (r.includes('drainage')) return 'മണ്ണിലെ നീർവാർച്ചയ്ക്ക് ഇണങ്ങിയത്';
      return r;
    }
    return r;
  };

  const localizeRisk = (riskText: string) => {
    if (language === 'ta') {
      if (riskText.includes('heat') || riskText.includes('Heat')) return 'மார்ச் மாதத்தில் திடீர் வெப்ப உயர்வு தானிய எடையைக் குறைக்கலாம்.';
      if (riskText.includes('pest') || riskText.includes('borer')) return 'காய் துளைப்பான் மற்றும் பூச்சித் தாக்குதல் முன்னெச்சரிக்கை தேவை.';
      if (riskText.includes('water') || riskText.includes('waterlogging')) return 'அதிக நீர் தேக்கம் வேர் அழுகலை உண்டாக்கலாம்.';
      return riskText;
    }
    if (language === 'ml') {
      if (riskText.includes('heat') || riskText.includes('Heat')) return 'മാർച്ച് മാസത്തിലെ കടുത്ത ചൂട് ധാന്യങ്ങളുടെ ഭാരത്തെ ബാധിക്കാം.';
      if (riskText.includes('pest') || riskText.includes('borer')) return 'കീടബാധയും പുഴുക്കളുടെ ആക്രമണവും ശ്രദ്ധിക്കേണ്ടതുണ്ട്.';
      if (riskText.includes('water') || riskText.includes('waterlogging')) return 'വെള്ളക്കെട്ട് ഉണ്ടായാൽ വേരഴുകൽ സാധ്യത.';
      return riskText;
    }
    return riskText;
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header & Constraints Card */}
      <div className="card card-elevated" style={{ borderLeft: '4px solid var(--primary-600)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sprout size={24} color="var(--primary-600)" />
              {t.recommendations.title}
            </h2>
            <p style={{ fontSize: '0.9rem', maxWidth: '750px' }}>
              {t.recommendations.subtitle}
            </p>
          </div>

          {/* Season Switcher */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{t.recommendations.targetSeason}:</span>
            <select 
              className="form-select" 
              value={season} 
              onChange={e => setSeason(e.target.value as AgriculturalSeason)}
              style={{ width: 'auto', padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
            >
              <option value="rabi">{t.recommendations.seasons.rabi}</option>
              <option value="kharif">{t.recommendations.seasons.kharif}</option>
              <option value="zaid">{t.recommendations.seasons.zaid}</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '0.82rem', color: 'var(--text-secondary)', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem' }}>
          <span>{t.recommendations.fieldLocation}: <strong>{farm ? `${farm.villageDistrict}, ${farm.stateProvince}` : (language === 'ta' ? 'அமைக்கப்படவில்லை' : language === 'ml' ? 'സജ്ജീകരിച്ചിട്ടില്ല' : 'Not configured')}</strong></span>
          <span>{t.recommendations.soilLabel}: <strong>{soil ? `${locSoil} (pH ${soil.phLevel})` : '--'}</strong></span>
          <span>{t.recommendations.waterLabel}: <strong>{water ? `${locWaterSource} (${locWaterAvail})` : '--'}</strong></span>
          <span>{t.recommendations.areaLabel}: <strong>{farm ? `${farm.totalAreaAcres} ${t.common.acres}` : '--'}</strong></span>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          {t.recommendations.evaluating}
        </div>
      ) : error ? (
        <div style={{ padding: '1rem', background: 'var(--status-urgent-bg)', color: 'var(--status-urgent)', borderRadius: 'var(--radius-md)' }}>
          {error}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {recommendations.map(item => {
            const locCropName = getLocalizedCropName(item.crop.id, language);
            const locSuitLevel = getLocalizedSuitabilityLevel(item.suitabilityLevel);

            return (
              <div 
                key={item.crop.id} 
                className="card"
                style={{ 
                  borderLeft: item.suitabilityScorePct >= 75 ? '5px solid var(--primary-600)' : '5px solid var(--harvest-gold)',
                  transition: 'transform var(--transition-fast)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{locCropName}</h3>
                      <span className="badge badge-not-configured" style={{ fontSize: '0.7rem' }}>
                        {item.crop.category.toUpperCase()}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.88rem' }}>{item.crop.description}</p>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span className={`badge ${item.suitabilityScorePct >= 75 ? 'badge-live' : 'badge-demo'}`} style={{ fontSize: '0.85rem', padding: '0.35rem 0.75rem' }}>
                      {locSuitLevel} ({item.suitabilityScorePct}%)
                    </span>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                      {t.recommendations.estMargin}: <strong style={{ color: 'var(--primary-700)' }}>~₹{item.estimatedGrossMarginPerAcre.toLocaleString()}{t.common.perAcre}</strong>
                    </div>
                  </div>
                </div>

                {/* Suitability Reasons */}
                <div style={{ marginBottom: '0.75rem' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.3rem' }}>
                    {t.recommendations.reasonsTitle}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {item.reasons.map((r, idx) => (
                      <span key={idx} style={{ 
                        fontSize: '0.78rem', 
                        background: 'var(--primary-50)', 
                        color: 'var(--primary-800)', 
                        padding: '0.2rem 0.5rem', 
                        borderRadius: 'var(--radius-sm)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem'
                      }}>
                        <CheckCircle size={12} color="var(--primary-600)" />
                        {localizeReason(r)}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Metric Indicators */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.5rem', background: 'var(--bg-app)', padding: '0.75rem', borderRadius: 'var(--radius-md)', marginBottom: '0.75rem' }}>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{t.recommendations.duration}</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{item.crop.durationDaysMin} - {item.crop.durationDaysMax} {t.common.days}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{t.recommendations.waterNeed}</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{item.waterSuitability}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{t.recommendations.estCost}</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{item.budgetFit}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{t.recommendations.marketOutlook}</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{item.marketOutlook}</div>
                  </div>
                </div>

                {/* Risks & Selection CTA */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem' }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem', maxWidth: '600px' }}>
                    <AlertCircle size={14} color="var(--harvest-amber)" />
                    <span>{t.recommendations.keyRisk}: {localizeRisk(item.potentialRisks[0] || '')}</span>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => onSelectCropToPlant(item.crop.id)} 
                    className="btn btn-secondary"
                    style={{ fontSize: '0.85rem', padding: '0.45rem 0.9rem' }}
                  >
                    {language === 'ta' ? `${locCropName.split(' ')[0]} - பயிரிட தேர்ந்தெடுக்கவும் →` :
                     language === 'ml' ? `${locCropName.split(' ')[0]} - കൃഷി ചെയ്യാൻ തിരഞ്ഞെടുക്കുക →` :
                     `Plant ${item.crop.commonName.split(' ')[0]} on Farm →`}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
