import React from 'react';
import { 
  Layers, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  ArrowRight, 
  Sprout, 
  Sparkles,
  AlertTriangle,
  Compass
} from 'lucide-react';
import type { CropCycle, CropStage } from '@agrisense/shared';
import type { Language, Translations } from '../../i18n/translations.js';
import { getLocalizedCropName } from '../../i18n/cropNames.js';

interface CropLifecycleViewProps {
  activeCycle: CropCycle | null;
  onUpdateStage: (stage: CropStage) => void;
  language: Language;
  t: Translations;
}

const STAGE_KEYS: CropStage[] = [
  'planning',
  'planting',
  'germination',
  'vegetative',
  'flowering',
  'fruiting',
  'harvest',
  'selling'
];

export const CropLifecycleView: React.FC<CropLifecycleViewProps> = ({
  activeCycle,
  onUpdateStage,
  language,
  t
}) => {
  const currentStage = activeCycle?.currentStage || 'vegetative';
  const cropId = activeCycle?.cropId || 'crop-wheat';
  const cropName = getLocalizedCropName(cropId, language);

  const sowingDateStr = activeCycle?.sowingDate || new Date().toISOString().split('T')[0];
  const harvestDateStr = activeCycle?.expectedHarvestDate || new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0];

  const sowingDate = new Date(sowingDateStr);
  const harvestDate = new Date(harvestDateStr);
  const now = new Date();

  const daysElapsed = Math.max(0, Math.floor((now.getTime() - sowingDate.getTime()) / (1000 * 60 * 60 * 24)));
  const totalDays = Math.max(1, Math.floor((harvestDate.getTime() - sowingDate.getTime()) / (1000 * 60 * 60 * 24)));
  const daysRemaining = Math.max(0, Math.floor((harvestDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  const progressPct = Math.min(100, Math.max(0, Math.round((daysElapsed / totalDays) * 100)));

  // Harvest Window: 10 days before and after expected harvest
  const windowStart = new Date(harvestDate.getTime() - 7 * 86400000).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  const windowEnd = new Date(harvestDate.getTime() + 7 * 86400000).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

  const currentStageIndex = STAGE_KEYS.indexOf(currentStage);
  const nextStageKey = currentStageIndex < STAGE_KEYS.length - 1 ? STAGE_KEYS[currentStageIndex + 1] : null;
  const nextStageInfo = nextStageKey ? t.lifecycle.stages[nextStageKey] : null;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header */}
      <div className="card card-elevated" style={{ borderLeft: '4px solid var(--primary-600)' }}>
        <h2 style={{ fontSize: '1.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
          <Layers size={22} color="var(--primary-600)" />
          {cropName}: {t.lifecycle.title}
        </h2>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          {t.lifecycle.subtitle}
        </p>
      </div>

      {/* Dynamic Crop Timeline & Lifecycle Telemetry */}
      <div className="card" style={{ background: 'linear-gradient(135deg, rgba(22, 163, 74, 0.05), rgba(59, 130, 246, 0.05))' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {language === 'ta' ? 'நடவு முதல் அறுவடை வரை' : language === 'ml' ? 'നടീൽ മുതൽ വിളവെടുപ്പ് വരെ' : 'Planting to Harvest Timeline'}
            </span>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.2rem' }}>
              {daysElapsed} {language === 'ta' ? 'நாட்கள் முடிவடைந்தன' : language === 'ml' ? 'ദിവസങ്ങൾ കഴിഞ്ഞു' : 'Days Elapsed'} • {daysRemaining} {language === 'ta' ? 'நாட்கள் மீதமுள்ளன' : language === 'ml' ? 'ദിവസങ്ങൾ ബാക്കി' : 'Days Remaining'}
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {language === 'ta' ? 'எதிர்பார்க்கப்படும் அறுவடை காலம்' : language === 'ml' ? 'പ്രതീക്ഷിക്കുന്ന വിളവെടുപ്പ് കാലം' : 'Harvest Window'}
            </span>
            <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--primary-700)' }}>
              📅 {windowStart} – {windowEnd}
            </div>
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div style={{ width: '100%', height: '10px', background: 'var(--border-subtle)', borderRadius: 'var(--radius-full)', overflow: 'hidden', marginBottom: '0.85rem' }}>
          <div 
            style={{ 
              width: `${progressPct}%`, 
              height: '100%', 
              background: 'linear-gradient(90deg, var(--primary-600), var(--harvest-gold))', 
              borderRadius: 'var(--radius-full)',
              transition: 'width 0.4s ease'
            }} 
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.65rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem' }}>
          <div style={{ padding: '0.4rem', background: 'var(--bg-app)', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{language === 'ta' ? 'விதைத்த தேதி' : language === 'ml' ? 'വിത്ത് വിതച്ച തീയതി' : 'Sowing Date'}</div>
            <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>{sowingDateStr}</div>
          </div>
          <div style={{ padding: '0.4rem', background: 'var(--bg-app)', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{language === 'ta' ? 'தற்போதைய நிலை' : language === 'ml' ? 'ഇപ്പോഴത്തെ ഘട്ടം' : 'Current Stage'}</div>
            <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--primary-700)' }}>{t.lifecycle.stages[currentStage]?.title || currentStage}</div>
          </div>
          <div style={{ padding: '0.4rem', background: 'var(--bg-app)', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{language === 'ta' ? 'அடுத்த கட்டம்' : language === 'ml' ? 'അടുത്ത ഘട്ടം' : 'Upcoming Stage'}</div>
            <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>{nextStageInfo ? nextStageInfo.title : 'Harvest Complete'}</div>
          </div>
          <div style={{ padding: '0.4rem', background: 'var(--bg-app)', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{language === 'ta' ? 'பயிரிடப்பட்ட பரப்பு' : language === 'ml' ? 'കൃഷി വിസ്തൃതി' : 'Planted Acreage'}</div>
            <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>{activeCycle?.plantedAreaAcres || 3.5} {t.common.acres}</div>
          </div>
        </div>
      </div>

      {/* Upcoming Stage Key Activities Banner */}
      {nextStageInfo && (
        <div className="card" style={{ borderLeft: '4px solid var(--sky-blue)', background: 'rgba(59, 130, 246, 0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <Compass size={18} color="var(--sky-blue)" />
            <span style={{ fontWeight: 700, fontSize: '0.92rem' }}>
              {language === 'ta' ? 'அடுத்த கட்டத்திற்கான ஆயத்தப் பணிகள்' : language === 'ml' ? 'അടുത്ത ഘട്ടത്തിനായുള്ള മുന്നൊരുക്കങ്ങൾ' : 'Preparatory Activities for Upcoming Stage'}: {nextStageInfo.title}
            </span>
          </div>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: 0 }}>
            {nextStageInfo.guidance}
          </p>
        </div>
      )}

      {/* Interactive 8-Stage Pipeline */}
      <div className="card">
        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>{t.lifecycle.clickToSet}</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.85rem' }}>
          {STAGE_KEYS.map((stageKey, idx) => {
            const isCurrent = stageKey === currentStage;
            const currentIndex = STAGE_KEYS.indexOf(currentStage);
            const isPast = idx < currentIndex;
            const stageInfo = t.lifecycle.stages[stageKey];

            if (!stageInfo) return null;

            return (
              <div 
                key={stageKey}
                onClick={() => onUpdateStage(stageKey)}
                style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  border: isCurrent ? '2px solid var(--primary-600)' : '1px solid var(--border-subtle)',
                  background: isCurrent ? 'var(--primary-50)' : isPast ? 'var(--bg-app)' : 'var(--bg-surface)',
                  transition: 'all var(--transition-fast)',
                  boxShadow: isCurrent ? '0 4px 12px rgba(22, 163, 74, 0.15)' : 'none'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.92rem', color: isCurrent ? 'var(--primary-800)' : 'var(--text-main)' }}>
                    {stageInfo.title}
                  </span>
                  {isCurrent ? (
                    <span className="badge badge-live">{t.lifecycle.activeNow}</span>
                  ) : isPast ? (
                    <span className="badge badge-not-configured" style={{ fontSize: '0.65rem' }}>{t.lifecycle.completed}</span>
                  ) : (
                    <span className="badge badge-not-configured" style={{ fontSize: '0.65rem' }}>{t.lifecycle.upcoming}</span>
                  )}
                </div>

                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                  {stageInfo.subtitle}
                </div>

                <p style={{ fontSize: '0.82rem', marginBottom: '0.5rem' }}>
                  {stageInfo.guidance}
                </p>

                <div style={{ fontSize: '0.75rem', color: 'var(--status-warning)', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.35rem' }}>
                  <strong>{t.lifecycle.criticalNotice}:</strong> {stageInfo.criticalWatch}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
