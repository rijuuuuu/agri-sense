import React, { useState, useEffect } from 'react';
import { ShieldAlert, AlertTriangle, Droplets, CloudSun, TrendingDown, DollarSign, CheckCircle2 } from 'lucide-react';
import type { Farm, CropCycle } from '@agrisense/shared';
import type { Language, Translations } from '../../i18n/translations.js';
import { 
  getLocalizedRiskCategory, 
  getLocalizedRiskLevel, 
  getLocalizedRiskAlert 
} from '../../i18n/localizedEntities.js';

interface RiskCategoryItem {
  category: string;
  score: number;
  weightPct: number;
  status: string;
}

interface ActiveRiskAlert {
  id: string;
  category: string;
  title: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  recommendedMitigation: string;
  dataOrigin: string;
}

interface RiskAnalysisData {
  overallRiskScore: number;
  overallRiskLevel: 'low' | 'moderate' | 'elevated' | 'high';
  methodology: string;
  riskCategories: RiskCategoryItem[];
  activeRisks: ActiveRiskAlert[];
}

interface RiskViewProps {
  farm: Farm | null;
  activeCycle: CropCycle | null;
  language: Language;
  t: Translations;
}

export const RiskView: React.FC<RiskViewProps> = ({ farm, language, t }) => {
  const [data, setData] = useState<RiskAnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRisk = async () => {
      try {
        const res = await fetch('/api/risk/overview');
        const json = await res.json();
        if (json.success) {
          setData(json.data);
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to compute risk analysis');
      } finally {
        setLoading(false);
      }
    };
    fetchRisk();
  }, [farm]);

  const getMethodologyText = (fallback: string) => {
    if (language === 'ta') {
      return 'வானிலை, மண்ணின் ஈரப்பதம், பயிர் நிலை மற்றும் சந்தை விலை காரணிகளின் சூத்திர அடிப்படையிலான கணக்கீடு.';
    }
    if (language === 'ml') {
      return 'കാലാവസ്ഥ, മണ്ണിലെ ഈർപ്പം, വിള വളർച്ച, വിപണി വില എന്നീ ഘടകങ്ങളെ അടിസ്ഥാനമാക്കിയുള്ള സമഗ്ര സൂചിക.';
    }
    return fallback;
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header & Formula Documentation Banner */}
      <div className="card card-elevated" style={{ borderLeft: '4px solid var(--status-urgent)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '0.75rem' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldAlert size={24} color="var(--status-urgent)" />
              {t.risk.title}
            </h2>
            <p style={{ fontSize: '0.9rem' }}>
              {t.risk.subtitle}
            </p>
          </div>

          {data && (
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.risk.riskIndex}</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: data.overallRiskScore >= 50 ? 'var(--status-urgent)' : 'var(--primary-700)' }}>
                {data.overallRiskScore} / 100
              </div>
              <span className={`badge ${data.overallRiskLevel === 'high' ? 'badge-demo' : 'badge-live'}`}>
                {getLocalizedRiskLevel(data.overallRiskLevel, language)}
              </span>
            </div>
          )}
        </div>

        {data && (
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.5rem' }}>
            <strong>{t.risk.methodologyLabel}</strong> {getMethodologyText(data.methodology)}
          </div>
        )}
      </div>

      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          {t.risk.loading}
        </div>
      ) : error ? (
        <div style={{ padding: '1rem', background: 'var(--status-urgent-bg)', color: 'var(--status-urgent)', borderRadius: 'var(--radius-md)' }}>
          {error}
        </div>
      ) : data ? (
        <>
          {/* Category Breakdown Progress Grid */}
          <div className="card">
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>{t.risk.breakdownTitle}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {data.riskCategories.map((cat, idx) => {
                const locCatName = getLocalizedRiskCategory(cat.category, language);
                const locCatStatus = getLocalizedRiskLevel(cat.status, language);
                const weightLabel = language === 'ta' ? 'எடை' : language === 'ml' ? 'ഭാരം' : 'Weight';
                const scoreLabel = language === 'ta' ? 'மதிப்பீடு' : language === 'ml' ? 'സ്കോർ' : 'Score';

                return (
                  <div key={idx} style={{ background: 'var(--bg-app)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                        {locCatName} <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>({weightLabel}: {cat.weightPct}%)</span>
                      </span>
                      <span style={{ fontWeight: 700, fontSize: '0.85rem', color: cat.score >= 60 ? 'var(--status-urgent)' : 'var(--primary-700)' }}>
                        {scoreLabel}: {cat.score}/100 ({locCatStatus})
                      </span>
                    </div>
                    <div style={{ height: '8px', background: 'var(--border-subtle)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                      <div style={{
                        width: `${cat.score}%`,
                        height: '100%',
                        background: cat.score >= 70 ? 'var(--status-urgent)' : cat.score >= 45 ? 'var(--harvest-gold)' : 'var(--primary-600)',
                        borderRadius: 'var(--radius-full)'
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Risk Alerts & Mitigation Recommendations */}
          <div className="card">
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>{t.risk.activeAlertsTitle}</h3>

            {data.activeRisks.length === 0 ? (
              <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--primary-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={20} />
                {t.risk.noRisks}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {data.activeRisks.map(risk => {
                  const locAlert = getLocalizedRiskAlert(risk.title, risk.description, risk.recommendedMitigation, language);
                  const locSeverity = getLocalizedRiskLevel(risk.severity, language);

                  return (
                    <div 
                      key={risk.id}
                      style={{
                        padding: '1rem',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-subtle)',
                        borderLeft: risk.severity === 'critical' ? '5px solid var(--status-urgent)' : '5px solid var(--harvest-gold)',
                        background: 'var(--bg-app)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{locAlert.title}</span>
                        <span className={`badge ${risk.severity === 'critical' ? 'badge-demo' : 'badge-not-configured'}`} style={{ fontSize: '0.7rem' }}>
                          {locSeverity}
                        </span>
                      </div>

                      <p style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                        {locAlert.desc}
                      </p>

                      <div style={{ 
                        fontSize: '0.8rem', 
                        color: 'var(--primary-800)', 
                        background: 'var(--primary-50)', 
                        padding: '0.5rem 0.75rem', 
                        borderRadius: 'var(--radius-sm)',
                        marginBottom: '0.35rem'
                      }}>
                        <strong>{t.risk.mitigationLabel}</strong> {locAlert.mitigation}
                      </div>

                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {t.risk.originLabel} {risk.dataOrigin}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
};
