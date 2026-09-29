import React from 'react';
import { Sprout, Sun, Moon, MapPin, Globe, Navigation } from 'lucide-react';
import type { Farm, IntegrationMode, UserLocationInfo } from '@agrisense/shared';
import type { Language } from '../i18n/translations.js';

interface HeaderProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  activeFarm: Farm | null;
  onOpenProfile: () => void;
  weatherMode?: IntegrationMode;
  copilotMode?: IntegrationMode;
  language: Language;
  onSelectLanguage: (lang: Language) => void;
  onToggleLanguage?: () => void;
  currentLocation?: UserLocationInfo | null;
  isLocating?: boolean;
  onDetectLocation?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  theme,
  onToggleTheme,
  activeFarm,
  onOpenProfile,
  weatherMode = 'LIVE',
  copilotMode = 'LIVE',
  language,
  onSelectLanguage,
  currentLocation,
  isLocating,
  onDetectLocation
}) => {
  const brandTitle = 
    language === 'ta' ? 'அக்ரிசென்ஸ் (AgriSense)' :
    language === 'ml' ? 'അഗ്രിസെൻസ് (AgriSense)' :
    'AgriSense';

  const brandSubtitle = 
    language === 'ta' ? 'விவசாய முடிவெடுக்கும் AI தளம்' :
    language === 'ml' ? 'കാർഷിക തീരുമാന പിന്തുണാ AI പ്ലാറ്റ്‌ഫോം' :
    'AI Farm Decision-Support';

  const setUpFarmText = 
    language === 'ta' ? 'நிலத்தை அமைக்கவும்' :
    language === 'ml' ? 'കൃഷിയിടം സജ്ജീകരിക്കുക' :
    'Set Up Farm';

  const weatherLabel = 
    language === 'ta' ? 'வானிலை: ' :
    language === 'ml' ? 'കാലാവസ്ഥ: ' :
    'Weather: ';

  const aiLabel = 
    language === 'ta' ? 'AI: ' :
    language === 'ml' ? 'AI സഹായി: ' :
    'Copilot: ';

  return (
    <header className="header-bar">
      <div className="brand-badge" style={{ minWidth: 0, flexShrink: 1 }}>
        <div className="brand-logo-icon" style={{ width: '2.1rem', height: '2.1rem', minWidth: '2.1rem' }}>
          <Sprout size={20} />
        </div>
        <div style={{ minWidth: 0 }}>
          <div className="brand-title" style={{ fontSize: 'clamp(1rem, 3.2vw, 1.3rem)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {brandTitle}
          </div>
          <div className="brand-subtitle hide-on-mobile" style={{ fontSize: '0.7rem' }}>
            {brandSubtitle}
          </div>
        </div>
      </div>

      <div className="header-controls">
        {/* Full 3-Language Selector (English / தமிழ் / മലയാളம்) for Desktop */}
        <div className="hide-on-mobile" style={{
          display: 'flex',
          alignItems: 'center',
          background: 'var(--bg-app)',
          border: '1px solid var(--border-strong)',
          borderRadius: 'var(--radius-full)',
          padding: '2px',
          gap: '1px'
        }}>
          <Globe size={13} style={{ marginLeft: '5px', marginRight: '3px', color: 'var(--primary-600)' }} />
          {([
            { code: 'en', label: 'EN', fullLabel: 'English' },
            { code: 'ta', label: 'தமிழ்', fullLabel: 'தமிழ்' },
            { code: 'ml', label: 'മലയാളം', fullLabel: 'മലയാളം' }
          ] as const).map(item => {
            const isActive = language === item.code;
            return (
              <button
                key={item.code}
                type="button"
                onClick={() => onSelectLanguage(item.code)}
                className={`btn ${isActive ? 'btn-primary' : 'btn-ghost'}`}
                style={{
                  padding: '0.2rem 0.5rem',
                  fontSize: '0.76rem',
                  fontWeight: isActive ? 700 : 500,
                  borderRadius: 'var(--radius-full)',
                  height: 'auto',
                  minHeight: 'unset',
                  whiteSpace: 'nowrap'
                }}
                id={`lang-btn-${item.code}`}
                title={`Switch language to ${item.fullLabel}`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Compact Mobile Language Switcher */}
        <div className="show-on-mobile-only" style={{
          display: 'flex',
          alignItems: 'center',
          background: 'var(--bg-app)',
          border: '1px solid var(--border-strong)',
          borderRadius: 'var(--radius-full)',
          padding: '0.2rem 0.4rem',
          gap: '0.2rem'
        }}>
          <Globe size={12} style={{ color: 'var(--primary-600)', flexShrink: 0 }} />
          <select
            value={language}
            onChange={(e) => onSelectLanguage(e.target.value as Language)}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '0.75rem',
              fontWeight: 700,
              color: 'var(--text-main)',
              outline: 'none',
              cursor: 'pointer',
              padding: 0,
              maxWidth: '54px'
            }}
            id="mobile-lang-select"
            title="Select Language"
          >
            <option value="en">EN</option>
            <option value="ta">தமிழ்</option>
            <option value="ml">മലയാളം</option>
          </select>
        </div>

        {/* GPS Location Status & Trigger Button */}
        {onDetectLocation && (
          <button 
            type="button" 
            onClick={onDetectLocation} 
            disabled={isLocating}
            className={`btn ${currentLocation?.isGpsDetected ? 'btn-secondary' : 'btn-primary'}`}
            style={{ 
              padding: '0.28rem 0.55rem', 
              fontSize: '0.76rem', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.3rem',
              borderColor: currentLocation?.isGpsDetected ? 'var(--primary-600)' : undefined,
              borderRadius: 'var(--radius-md)',
              minWidth: 0,
              flexShrink: 1
            }}
            title={currentLocation ? `Detected GPS Coordinates: ${currentLocation.latitude.toFixed(2)}°N, ${currentLocation.longitude.toFixed(2)}°E. Click to refresh.` : 'Click to detect your location via browser GPS'}
            id="detect-gps-header-btn"
          >
            <Navigation 
              size={13} 
              style={{
                color: currentLocation?.isGpsDetected ? 'var(--primary-600)' : 'currentColor',
                animation: isLocating ? 'spin 1.2s linear infinite' : 'none'
              }} 
            />
            <span style={{ fontWeight: 600, maxWidth: '75px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {isLocating 
                ? (language === 'ta' ? 'கண்டறி...' : language === 'ml' ? 'തിരയുന്നു...' : 'Locating...')
                : currentLocation?.district 
                  ? currentLocation.district
                  : (language === 'ta' ? 'ஜிபிஎஸ்' : language === 'ml' ? 'ജിപിഎസ്' : 'GPS')}
            </span>
            {currentLocation?.isGpsDetected && (
              <span 
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--primary-500)',
                  display: 'inline-block',
                  boxShadow: '0 0 6px var(--primary-500)'
                }} 
                title="GPS Location Active"
              />
            )}
          </button>
        )}

        {/* Active Farm Switch / Profile Button */}
        <button 
          type="button" 
          onClick={onOpenProfile} 
          className="btn btn-secondary"
          style={{ 
            padding: '0.28rem 0.55rem', 
            fontSize: '0.76rem', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.3rem',
            borderRadius: 'var(--radius-md)',
            minWidth: 0,
            flexShrink: 1
          }}
          title="View and Edit Farm Profile"
        >
          <MapPin size={13} color="var(--primary-600)" style={{ flexShrink: 0 }} />
          <span style={{ fontWeight: 600, maxWidth: '65px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {activeFarm ? activeFarm.farmName : setUpFarmText}
          </span>
        </button>

        {/* Integration Status Badges (Hidden on mobile to save space) */}
        <div className="hide-on-mobile" style={{ gap: '0.35rem' }}>
          <span className={`badge ${weatherMode === 'LIVE' ? 'badge-live' : weatherMode === 'NOT_CONFIGURED' ? 'badge-not-configured' : 'badge-demo'}`} title="Weather Data Status">
            {weatherLabel}{weatherMode}
          </span>
          <span className={`badge ${copilotMode === 'LIVE' ? 'badge-live' : copilotMode === 'NOT_CONFIGURED' ? 'badge-not-configured' : 'badge-demo'}`} title="Gemini AI Integration Status">
            {aiLabel}{copilotMode}
          </span>
        </div>

        {/* Theme Toggle Button */}
        <button 
          type="button" 
          onClick={onToggleTheme} 
          className="btn btn-secondary"
          style={{ padding: '0.35rem 0.5rem', borderRadius: 'var(--radius-md)' }}
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
          id="theme-toggle-btn"
        >
          {theme === 'light' ? <Moon size={15} /> : <Sun size={15} color="var(--harvest-gold)" />}
        </button>
      </div>
    </header>
  );
};

