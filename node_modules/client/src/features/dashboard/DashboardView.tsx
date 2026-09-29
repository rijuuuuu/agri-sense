import React from 'react';
import { 
  Sprout, 
  CloudSun, 
  Droplets, 
  Wind, 
  CheckCircle2, 
  Circle, 
  AlertTriangle, 
  ArrowRight, 
  Bot, 
  TrendingUp, 
  ShieldAlert,
  Calendar,
  Layers,
  MapPin,
  Navigation
} from 'lucide-react';
import type { 
  FarmerProfile, 
  Farm, 
  CropCycle, 
  WeatherDataPayload, 
  FarmTask, 
  SoilProfile, 
  WaterProfile, 
  CropStage,
  UserLocationInfo
} from '@agrisense/shared';
import type { Language, Translations } from '../../i18n/translations.js';
import { 
  getLocalizedCropName, 
  getLocalizedSoilType, 
  getLocalizedStage 
} from '../../i18n/cropNames.js';
import { 
  getLocalizedWeatherDescription, 
  getLocalizedAdvisory, 
  getLocalizedTask, 
  getLocalizedPriority, 
  getLocalizedCategory 
} from '../../i18n/localizedEntities.js';

interface DashboardViewProps {
  farmer: FarmerProfile | null;
  farm: Farm | null;
  soil: SoilProfile | null;
  water: WaterProfile | null;
  activeCycle: CropCycle | null;
  weather: WeatherDataPayload | null;
  tasks: FarmTask[];
  onToggleTask: (taskId: string) => void;
  onNavigate: (tab: string) => void;
  onOpenCopilotWithPrompt: (prompt: string) => void;
  language: Language;
  t: Translations;
  currentLocation?: UserLocationInfo | null;
  onDetectLocation?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  farmer,
  farm,
  soil,
  water,
  activeCycle,
  weather,
  tasks,
  onToggleTask,
  onNavigate,
  onOpenCopilotWithPrompt,
  language,
  t,
  currentLocation,
  onDetectLocation
}) => {
  const cropId = activeCycle?.cropId || 'crop-wheat';
  const cropName = getLocalizedCropName(cropId, language);
  const rawStage = activeCycle?.currentStage || 'vegetative';
  const localizedStageText = getLocalizedStage(rawStage, language);
  const advisory = weather?.advisory;

  const pendingTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);

  const locSoil = getLocalizedSoilType(soil?.soilType || 'alluvial', language);

  const localizedAdvisoryData = advisory ? getLocalizedAdvisory(
    advisory.irrigationNotice.status,
    advisory.irrigationNotice.advice,
    advisory.sprayingNotice.isSuitable,
    advisory.sprayingNotice.reason,
    language
  ) : null;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* 1. Farm Overview Hero Header */}
      <div className="card card-elevated" style={{ 
        background: 'linear-gradient(135deg, rgba(21, 128, 61, 0.08), rgba(217, 119, 6, 0.08))', 
        borderLeft: '5px solid var(--primary-600)' 
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
              <span className="badge badge-live">{t.dashboard.fieldStatus}</span>
              {currentLocation?.isGpsDetected ? (
                <span style={{ 
                  fontSize: '0.82rem', 
                  color: 'var(--primary-700)', 
                  background: 'var(--primary-50)',
                  padding: '0.15rem 0.55rem',
                  borderRadius: 'var(--radius-full)',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem'
                }}>
                  <MapPin size={13} color="var(--primary-600)" />
                  📍 {currentLocation.district}, {currentLocation.state}
                </span>
              ) : (
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                  <MapPin size={13} />
                  {farm ? `${farm.villageDistrict}, ${farm.stateProvince}` : (language === 'ta' ? 'இடம் அமைக்கப்படவில்லை' : language === 'ml' ? 'സ്ഥലം സജ്ജീകരിച്ചിട്ടില്ല' : 'Location Not Set')}
                  {onDetectLocation && (
                    <button
                      type="button"
                      onClick={onDetectLocation}
                      className="btn btn-ghost"
                      style={{ padding: '0.1rem 0.4rem', fontSize: '0.75rem', textDecoration: 'underline', color: 'var(--primary-700)' }}
                    >
                      {t.location.detectBtn}
                    </button>
                  )}
                </span>
              )}
            </div>
            <h2 style={{ fontSize: '1.6rem', marginBottom: '0.25rem' }}>
              {farm ? farm.farmName : (language === 'ta' ? 'பண்ணை அமைக்கப்படவில்லை' : language === 'ml' ? 'ഫാം സജ്ജീകരിച്ചിട്ടില്ല' : 'Farm Not Configured')}
            </h2>
            <div className="farmer-meta-chips">
              <span className="farmer-meta-chip">
                <strong>{t.dashboard.farmerLabel}:</strong> {farmer?.fullName || (language === 'ta' ? 'அமைக்கப்படவில்லை' : language === 'ml' ? 'സജ്ജീകരിച്ചിട്ടില്ല' : 'Not Configured')}
              </span>
              <span className="farmer-meta-chip">
                <strong>{t.dashboard.areaLabel}:</strong> {farm ? `${farm.totalAreaAcres} ${t.common.acres}` : '--'}
              </span>
              <span className="farmer-meta-chip">
                <strong>{t.dashboard.soilLabel}:</strong> {soil ? locSoil : '--'}
              </span>
            </div>
          </div>

          <div className="crop-hero-status">
            <div style={{ flex: 1, minWidth: '120px' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {t.dashboard.currentCrop}
              </div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary-700)' }}>
                {cropName || (language === 'ta' ? 'பயிர் தேர்ந்தெடுக்கப்படவில்லை' : language === 'ml' ? 'വിള തിരഞ്ഞെടുത്തിട്ടില്ല' : 'No Active Crop')}
              </div>
              <span className="badge badge-live" style={{ marginTop: '0.2rem' }}>
                {t.dashboard.cropStage}: {activeCycle ? localizedStageText : '--'}
              </span>
            </div>
            <button 
              type="button" 
              onClick={() => onNavigate('lifecycle')} 
              className="btn btn-secondary"
              style={{ fontSize: '0.82rem', padding: '0.45rem 0.8rem', whiteSpace: 'nowrap' }}
              title={t.dashboard.updateStage}
            >
              <Layers size={15} />
              <span>{t.dashboard.updateStage}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Weather & Agro-Advisory Strip */}
      <div className="grid-cols-2">
        {/* Real Weather Telemetry */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
            <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <CloudSun size={20} color="var(--sky-blue)" />
              <span>{t.dashboard.todaysWeather}</span>
              {currentLocation?.district && (
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary-700)', background: 'rgba(22, 163, 74, 0.1)', padding: '0.1rem 0.45rem', borderRadius: 'var(--radius-sm)' }}>
                  📍 {currentLocation.district}
                </span>
              )}
            </h3>
            <span className="badge badge-live">{t.dashboard.openMeteoLive}</span>
          </div>

          {weather ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1 }}>
                  {weather.current.temperatureCelsius}°C
                </span>
                <span style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                  {getLocalizedWeatherDescription(weather.current.weatherDescription, language)}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', textAlign: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem' }}>
                <div style={{ padding: '0.4rem', background: 'var(--bg-app)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{t.dashboard.rainProb}</div>
                  <div style={{ fontWeight: 700, color: 'var(--sky-blue)' }}>{weather.current.rainProbabilityPct}%</div>
                </div>
                <div style={{ padding: '0.4rem', background: 'var(--bg-app)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{t.dashboard.humidity}</div>
                  <div style={{ fontWeight: 700 }}>{weather.current.humidityPct}%</div>
                </div>
                <div style={{ padding: '0.4rem', background: 'var(--bg-app)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{t.dashboard.windSpeed}</div>
                  <div style={{ fontWeight: 700 }}>{weather.current.windSpeedKmh} km/h</div>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ color: 'var(--text-muted)' }}>
              {language === 'ta' ? 'வானிலை தகவல்கள் ஏற்றப்படுகின்றன...' : language === 'ml' ? 'കാലാവസ്ഥ വിവരങ്ങൾ ശേഖരിക്കുന്നു...' : 'Loading live field telemetry...'}
            </div>
          )}
        </div>

        {/* Agricultural Interpretation Layer */}
        <div className="card" style={{ borderLeft: '4px solid var(--harvest-gold)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
            <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Droplets size={20} color="var(--harvest-amber)" />
              {t.dashboard.agroAdvisory}
            </h3>
            <span className="badge badge-live">{t.dashboard.actionAdvisory}</span>
          </div>

          {localizedAdvisoryData ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <div style={{ padding: '0.75rem', background: 'var(--bg-app)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--primary-700)', textTransform: 'uppercase' }}>
                  {t.dashboard.irrigationGuidance} ({localizedAdvisoryData.status})
                </div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-main)', marginTop: '0.2rem' }}>
                  {localizedAdvisoryData.advice}
                </div>
              </div>

              <div style={{ padding: '0.75rem', background: 'var(--bg-app)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ 
                  fontSize: '0.78rem', 
                  fontWeight: 700, 
                  color: advisory?.sprayingNotice.isSuitable ? 'var(--primary-700)' : 'var(--status-warning)', 
                  textTransform: 'uppercase' 
                }}>
                  {t.dashboard.sprayingNotice} ({localizedAdvisoryData.sprayStatus})
                </div>
                <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                  {localizedAdvisoryData.sprayReason}
                </div>
              </div>
            </div>
          ) : (
            <div style={{ color: 'var(--text-muted)' }}>
              {language === 'ta' ? 'விவசாய விதிகள் கணக்கிடப்படுகின்றன...' : language === 'ml' ? 'കാർഷിക നിർദ്ദേശങ്ങൾ തയ്യാറാക്കുന്നു...' : 'Computing agro-meteorological rules...'}
            </div>
          )}
        </div>
      </div>

      {/* 3. Action Center: Today's Farm Actions */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle2 size={22} color="var(--primary-600)" />
              {t.dashboard.actionCenter}
            </h3>
            <p style={{ fontSize: '0.88rem' }}>
              {t.dashboard.actionCenterSubtitle} ({localizedStageText})
            </p>
          </div>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
            {completedTasks.length} / {tasks.length} {t.dashboard.completed}
          </span>
        </div>

        {tasks.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            {t.dashboard.noTasks}
          </div>
        ) : (
          <div>
            {tasks.map(task => {
              const locTask = getLocalizedTask(task, language);
              const locPriority = getLocalizedPriority(task.priority, language);
              const locCategory = getLocalizedCategory(task.category, language);

              return (
                <div 
                  key={task.id} 
                  className="task-item"
                  style={{ 
                    opacity: task.completed ? 0.65 : 1,
                    borderLeft: task.priority === 'high' ? '4px solid var(--status-urgent)' : '4px solid var(--primary-600)'
                  }}
                >
                  <input 
                    type="checkbox" 
                    checked={task.completed} 
                    onChange={() => onToggleTask(task.id)}
                    className="task-checkbox" 
                    id={`chk-${task.id}`}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem', flexWrap: 'wrap' }}>
                      <span style={{ 
                        fontWeight: 700, 
                        fontSize: '0.98rem',
                        textDecoration: task.completed ? 'line-through' : 'none',
                        color: 'var(--text-main)'
                      }}>
                        {locTask.title}
                      </span>
                      <span className={`badge ${task.priority === 'high' ? 'badge-demo' : 'badge-not-configured'}`} style={{ fontSize: '0.68rem', padding: '0.15rem 0.45rem' }}>
                        {locPriority}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        ({locCategory})
                      </span>
                    </div>
                    <p style={{ fontSize: '0.88rem', marginBottom: '0.35rem' }}>
                      {locTask.description}
                    </p>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                      {t.actions.rationaleLabel}: {locTask.rationale}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. AI Farm Copilot Instant Prompts Strip */}
      <div className="card" style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-glass)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Bot size={20} color="var(--harvest-amber)" />
              {t.dashboard.copilotCardTitle}
            </h3>
            <p style={{ fontSize: '0.85rem' }}>
              {t.dashboard.copilotCardSubtitle}
            </p>
          </div>
          <button 
            type="button" 
            onClick={() => onNavigate('copilot')} 
            className="btn btn-primary"
            style={{ fontSize: '0.85rem' }}
          >
            {t.dashboard.openCopilotBtn}
          </button>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {t.copilot.quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onOpenCopilotWithPrompt(prompt)}
              className="btn btn-secondary btn-wrap" style={{ fontSize: '0.82rem', padding: '0.45rem 0.85rem', borderRadius: 'var(--radius-md)', maxWidth: '100%' }}
            >
              💬 "{prompt}"
            </button>
          ))}
        </div>
      </div>

      {/* 5. Quick Modules Navigation Grid */}
      <div className="grid-cols-4">
        <button 
          type="button" 
          onClick={() => onNavigate('recommendations')}
          className="card" 
          style={{ textAlign: 'left', cursor: 'pointer', border: '1px solid var(--border-subtle)' }}
        >
          <Sprout size={24} color="var(--primary-600)" style={{ marginBottom: '0.5rem' }} />
          <h4 style={{ fontSize: '1rem', marginBottom: '0.2rem' }}>{t.nav.recommendations}</h4>
          <p style={{ fontSize: '0.8rem' }}>
            {language === 'ta' ? 'மண், பருவம் & நீர் பொருத்துதல் மேட்ரிக்ஸ்.' : language === 'ml' ? 'മണ്ണ്, സീസൺ, ജലം അനുയോജ്യത പട്ടിക.' : 'Soil, season & water matching matrix.'}
          </p>
        </button>

        <button 
          type="button" 
          onClick={() => onNavigate('market')}
          className="card" 
          style={{ textAlign: 'left', cursor: 'pointer', border: '1px solid var(--border-subtle)' }}
        >
          <TrendingUp size={24} color="var(--harvest-amber)" style={{ marginBottom: '0.5rem' }} />
          <h4 style={{ fontSize: '1rem', marginBottom: '0.2rem' }}>{t.nav.market}</h4>
          <p style={{ fontSize: '0.8rem' }}>
            {language === 'ta' ? 'மண்டி விலைகள், போக்குகள் & விற்பனை நேரம்.' : language === 'ml' ? 'ചന്ത നിരക്കുകൾ, ട്രെൻഡുകൾ, വിൽപ്പന സമയം.' : 'Mandi prices, trends & selling timing.'}
          </p>
        </button>

        <button 
          type="button" 
          onClick={() => onNavigate('economics')}
          className="card" 
          style={{ textAlign: 'left', cursor: 'pointer', border: '1px solid var(--border-subtle)' }}
        >
          <Calendar size={24} color="var(--sky-blue)" style={{ marginBottom: '0.5rem' }} />
          <h4 style={{ fontSize: '1rem', marginBottom: '0.2rem' }}>{t.nav.economics}</h4>
          <p style={{ fontSize: '0.8rem' }}>
            {language === 'ta' ? 'துல்லியமான லாப & உணர்திறன் மாதிரி கணக்கீடு.' : language === 'ml' ? 'ലാഭ സാധ്യതയും ബജറ്റ് വിശകലന മാതൃകയും.' : 'Deterministic margin & sensitivity simulator.'}
          </p>
        </button>

        <button 
          type="button" 
          onClick={() => onNavigate('risk')}
          className="card" 
          style={{ textAlign: 'left', cursor: 'pointer', border: '1px solid var(--border-subtle)' }}
        >
          <ShieldAlert size={24} color="var(--status-urgent)" style={{ marginBottom: '0.5rem' }} />
          <h4 style={{ fontSize: '1rem', marginBottom: '0.2rem' }}>{t.nav.risk}</h4>
          <p style={{ fontSize: '0.8rem' }}>
            {language === 'ta' ? 'சூத்திர அடிப்படையிலான பல காரணி பாதிப்பு ஆய்வு.' : language === 'ml' ? 'വിവിധ ഘടകങ്ങൾ അടിസ്ഥാനമാക്കിയുള്ള അപായ സൂചിക.' : 'Formula-based multi-factor vulnerability.'}
          </p>
        </button>
      </div>
    </div>
  );
};
