import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  MapPin, 
  Info, 
  Landmark, 
  Compass, 
  Scale,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import type { 
  MarketPriceRecord, 
  DataProvenance, 
  StateMarketSummary,
  UserLocationInfo 
} from '@agrisense/shared';
import type { Language, Translations } from '../../i18n/translations.js';
import { getLocalizedCommodity } from '../../i18n/localizedEntities.js';

interface MarketViewProps {
  language: Language;
  t: Translations;
  currentLocation?: UserLocationInfo | null;
  onDetectLocation?: () => void;
}

export const MarketView: React.FC<MarketViewProps> = ({ 
  language, 
  t, 
  currentLocation,
  onDetectLocation 
}) => {
  // Initialize state from detected GPS location if available, otherwise default to Tamil Nadu
  const [selectedState, setSelectedState] = useState<string>(
    currentLocation?.state || 'Tamil Nadu'
  );
  const [prices, setPrices] = useState<MarketPriceRecord[]>([]);
  const [stateSummary, setStateSummary] = useState<StateMarketSummary | null>(null);
  const [sellingConsiderations, setSellingConsiderations] = useState<string[]>([]);
  const [availableStates, setAvailableStates] = useState<{ code: string; name: string }[]>([]);
  const [provenance, setProvenance] = useState<DataProvenance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Sync with detected location if it updates
  useEffect(() => {
    if (currentLocation?.state) {
      setSelectedState(currentLocation.state);
    }
  }, [currentLocation?.state]);

  // Fetch state-informed market intelligence
  useEffect(() => {
    const fetchMarket = async () => {
      setLoading(true);
      setError(null);
      try {
        const query = encodeURIComponent(selectedState);
        const res = await fetch(`/api/market/prices?state=${query}`);
        const json = await res.json();
        if (json.success && json.data) {
          setPrices(json.data.prices || []);
          setStateSummary(json.data.stateSummary || null);
          setSellingConsiderations(json.data.sellingConsiderations || []);
          if (json.data.availableStates) {
            setAvailableStates(json.data.availableStates);
          }
          setProvenance(json.provenance);
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to load market rates');
      } finally {
        setLoading(false);
      }
    };
    fetchMarket();
  }, [selectedState]);

  const isLocationInformed = currentLocation?.isGpsDetected && 
    (currentLocation.state.toLowerCase() === selectedState.toLowerCase() ||
     selectedState.toLowerCase().includes(currentLocation.state.toLowerCase()));

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* 1. Header & Location Integration Status */}
      <div className="card card-elevated" style={{ borderLeft: '4px solid var(--harvest-amber)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '0.75rem' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp size={24} color="var(--harvest-amber)" />
              {t.market.title}
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              {t.market.subtitle}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            {isLocationInformed ? (
              <span className="badge badge-live" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.35rem 0.65rem' }}>
                <Sparkles size={13} />
                {t.market.informedByLocation} ({currentLocation?.district || selectedState})
              </span>
            ) : (
              onDetectLocation && (
                <button
                  type="button"
                  onClick={onDetectLocation}
                  className="btn btn-secondary"
                  style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  <MapPin size={13} color="var(--primary-600)" />
                  {t.location.useMyGps}
                </button>
              )
            )}

            {provenance && (
              <span className={`badge ${provenance.mode === 'LIVE' ? 'badge-live' : 'badge-demo'}`} style={{ fontSize: '0.85rem' }}>
                {provenance.mode === 'LIVE' ? t.market.liveBadge : t.market.demoBadge}
              </span>
            )}
          </div>
        </div>

        {/* State Selection Dropdown Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
          paddingTop: '0.75rem',
          borderTop: '1px solid var(--border-subtle)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
            <label htmlFor="state-selector-select" style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <MapPin size={15} color="var(--primary-600)" />
              {t.market.selectState}:
            </label>
            <select
              id="state-selector-select"
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="form-select"
              style={{
                padding: '0.4rem 0.8rem',
                fontSize: '0.88rem',
                fontWeight: 600,
                borderRadius: 'var(--radius-md)',
                borderColor: 'var(--primary-500)',
                background: 'var(--bg-surface)',
                color: 'var(--text-main)',
                cursor: 'pointer'
              }}
            >
              {availableStates.length > 0 ? (
                availableStates.map(s => (
                  <option key={s.code} value={s.code}>{s.name}</option>
                ))
              ) : (
                <>
                  <option value="Tamil Nadu">Tamil Nadu (தமிழ்நாடு)</option>
                  <option value="Kerala">Kerala (കേരളം)</option>
                  <option value="Karnataka">Karnataka (ಕರ್ನಾಟಕ)</option>
                  <option value="Maharashtra">Maharashtra (महाराष्ट्र)</option>
                  <option value="Punjab">Punjab (ਪੰਜਾਬ)</option>
                  <option value="Haryana">Haryana (हरियाणा)</option>
                  <option value="Uttar Pradesh">Uttar Pradesh (उत्तर प्रदेश)</option>
                  <option value="Andhra Pradesh">Andhra Pradesh (ఆంధ్రప్రదేశ్)</option>
                  <option value="National Benchmark">National Benchmark (All India)</option>
                </>
              )}
            </select>
          </div>

          {provenance && (
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              {t.market.dataSource}: <strong>{provenance.source}</strong> | {t.market.modeLabel}: <strong>{provenance.mode}</strong>
            </div>
          )}
        </div>
      </div>

      {/* 2. State-Specific Market Intelligence Analysis */}
      {stateSummary && (
        <div className="card" style={{ 
          background: 'linear-gradient(135deg, rgba(22, 163, 74, 0.05), rgba(217, 119, 6, 0.06))',
          borderLeft: '4px solid var(--primary-600)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.45rem', margin: 0 }}>
              <Compass size={18} color="var(--primary-600)" />
              {t.market.stateIntelligence}: <span style={{ color: 'var(--primary-700)' }}>{stateSummary.state}</span>
            </h3>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <span className="badge" style={{ fontSize: '0.75rem', background: 'var(--bg-card)', border: '1px solid var(--border-strong)' }}>
                {t.market.arrivalTrend}: <strong>{stateSummary.arrivalTrend.toUpperCase()}</strong>
              </span>
            </div>
          </div>

          <div className="grid-cols-3" style={{ gap: '0.85rem', marginBottom: '0.85rem' }}>
            {/* Regional Focus */}
            <div style={{ padding: '0.75rem', background: 'var(--bg-app)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.76rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Compass size={13} color="var(--primary-600)" />
                {t.market.regionalFocus}
              </div>
              <div style={{ fontSize: '0.86rem', color: 'var(--text-main)', lineHeight: 1.4 }}>
                {stateSummary.regionalFocus}
              </div>
            </div>

            {/* Procurement Policy & MSP */}
            <div style={{ padding: '0.75rem', background: 'var(--bg-app)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.76rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Landmark size={13} color="var(--harvest-amber)" />
                {t.market.procurementPolicy}
              </div>
              <div style={{ fontSize: '0.86rem', color: 'var(--text-main)', lineHeight: 1.4 }}>
                {stateSummary.procurementPolicy}
              </div>
            </div>

            {/* Mandi Quality Advisory */}
            <div style={{ padding: '0.75rem', background: 'var(--bg-app)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.76rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Scale size={13} color="var(--primary-700)" />
                {t.market.mandiAdvisory}
              </div>
              <div style={{ fontSize: '0.86rem', color: 'var(--text-main)', lineHeight: 1.4 }}>
                {stateSummary.mandiAdvisory}
              </div>
            </div>
          </div>

          {/* Top Gainers & Decliners Tags */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', fontSize: '0.82rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.65rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 700, color: 'var(--primary-700)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                <ArrowUpRight size={15} /> Top Traded / Gainers:
              </span>
              {stateSummary.topGainers.map((g, idx) => (
                <span key={idx} className="badge" style={{ background: 'var(--primary-50)', color: 'var(--primary-700)', border: '1px solid var(--border-glass)' }}>
                  {g}
                </span>
              ))}
            </div>

            {stateSummary.topDecliners.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 700, color: 'var(--status-urgent)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                  <ArrowDownRight size={15} /> Supply Pressure / Decliners:
                </span>
                {stateSummary.topDecliners.map((d, idx) => (
                  <span key={idx} className="badge" style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--status-urgent)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                    {d}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. Selling Timing & Mandi Considerations */}
      {sellingConsiderations.length > 0 && (
        <div className="card" style={{ background: 'var(--bg-app)', borderLeft: '4px solid var(--primary-600)' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Info size={16} color="var(--primary-600)" />
            {t.market.sellingConsiderations} ({selectedState})
          </h3>
          <ul style={{ paddingLeft: '1.25rem', margin: 0, fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
            {sellingConsiderations.map((c, idx) => (
              <li key={idx} style={{ marginBottom: '0.3rem' }}>{c}</li>
            ))}
          </ul>
        </div>
      )}

      {/* 4. State Commodity Rates Grid */}
      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          {t.market.loading}
        </div>
      ) : error ? (
        <div style={{ padding: '1rem', background: 'var(--status-urgent-bg)', color: 'var(--status-urgent)', borderRadius: 'var(--radius-md)' }}>
          {error}
        </div>
      ) : (
        <div className="grid-cols-3">
          {prices.map((p, idx) => {
            const locCommodity = getLocalizedCommodity(p.commodity, language);
            const trendLabel = 
              p.trend === 'rising' ? t.market.trendRising :
              p.trend === 'falling' ? t.market.trendFalling :
              t.market.trendStable;

            return (
              <div key={idx} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{locCommodity}</h4>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.2rem',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      color: p.trend === 'rising' ? 'var(--primary-700)' : p.trend === 'falling' ? 'var(--status-urgent)' : 'var(--text-muted)'
                    }}>
                      {p.trend === 'rising' && <TrendingUp size={14} />}
                      {p.trend === 'falling' && <TrendingDown size={14} />}
                      {p.trend === 'stable' && <Minus size={14} />}
                      {trendLabel}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)' }}>
                      ₹{p.modalPricePerQuintal.toLocaleString()}
                    </span>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      {t.market.perQuintal} (₹{(p.modalPricePerQuintal / 100).toFixed(1)}/{t.common.kg})
                    </span>
                  </div>

                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.5rem' }}>
                    <MapPin size={14} color="var(--primary-600)" />
                    <span>{p.marketName}</span>
                    {p.distanceKm && <span style={{ color: 'var(--text-muted)' }}>(~{p.distanceKm} km)</span>}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.5rem' }}>
                  <span>{t.market.minLabel}: ₹{p.minPrice.toLocaleString()}</span>
                  <span>{t.market.maxLabel}: ₹{p.maxPrice.toLocaleString()}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
