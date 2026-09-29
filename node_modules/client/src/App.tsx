import { useState, useEffect } from 'react';
import { 
  Sprout, 
  Bot, 
  CheckCircle2, 
  TrendingUp, 
  DollarSign, 
  ShieldAlert, 
  Layers, 
  Stethoscope, 
  Home,
  Menu,
  X,
  Settings,
  ArrowLeft
} from 'lucide-react';

import { Header } from './components/Header.js';
import { OnboardingModal } from './features/onboarding/OnboardingModal.js';
import { DashboardView } from './features/dashboard/DashboardView.js';
import { CopilotView } from './features/copilot/CopilotView.js';
import { CropRecommendationView } from './features/crop-recommendation/CropRecommendationView.js';
import { CropLifecycleView } from './features/lifecycle/CropLifecycleView.js';
import { ActionsView } from './features/actions/ActionsView.js';
import { CropHealthView } from './features/health/CropHealthView.js';
import { MarketView } from './features/market/MarketView.js';
import { EconomicsView } from './features/economics/EconomicsView.js';
import { RiskView } from './features/risk/RiskView.js';

import { translations, type Language } from './i18n/translations.js';

import type { 
  FarmerProfile, 
  Farm, 
  SoilProfile, 
  WaterProfile, 
  CropCycle, 
  CropReference, 
  WeatherDataPayload, 
  FarmTask,
  CropStage,
  UserLocationInfo
} from '@agrisense/shared';

export function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  // Trilingual state: English ('en'), Tamil ('ta'), Malayalam ('ml')
  const [language, setLanguage] = useState<Language>('ta');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // Core Data States
  const [farmer, setFarmer] = useState<FarmerProfile | null>(null);
  const [farm, setFarm] = useState<Farm | null>(null);
  const [soil, setSoil] = useState<SoilProfile | null>(null);
  const [water, setWater] = useState<WaterProfile | null>(null);
  const [activeCycle, setActiveCycle] = useState<CropCycle | null>(null);
  const [crops, setCrops] = useState<CropReference[]>([]);
  const [weather, setWeather] = useState<WeatherDataPayload | null>(null);
  const [tasks, setTasks] = useState<FarmTask[]>([]);
  const [copilotInitialPrompt, setCopilotInitialPrompt] = useState<string | undefined>(undefined);

  // Geolocation States
  const [currentLocation, setCurrentLocation] = useState<UserLocationInfo | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const t = translations[language] || translations.en;

  // Toggle Dark/Light Theme
  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
  };

  // Language Selection handler (English, Tamil, Malayalam)
  const handleSelectLanguage = (lang: Language) => {
    setLanguage(lang);
  };

  // Load Initial Farm Profile and Catalog
  const loadProfile = async () => {
    try {
      const res = await fetch('/api/farmer/profile');
      const json = await res.json();
      if (json.success && json.data) {
        setFarmer(json.data.farmer);
        setFarm(json.data.farm);
        setSoil(json.data.soil);
        setWater(json.data.water);
        setActiveCycle(json.data.activeCycle);
        setCrops(json.data.crops || []);

        if (!json.data.farmer) {
          setIsProfileModalOpen(true);
        }
      }
    } catch (err) {
      console.error('Failed to load profile', err);
    }
  };

  // Load Real-Time Weather (optionally for detected GPS coordinates)
  const loadWeather = async (lat?: number, lon?: number, district?: string) => {
    try {
      let url = '/api/weather/current-and-forecast';
      if (lat !== undefined && lon !== undefined) {
        url += `?lat=${lat}&lon=${lon}${district ? `&district=${encodeURIComponent(district)}` : ''}`;
      }
      const res = await fetch(url);
      const json = await res.json();
      if (json.success) {
        setWeather(json.data);
      }
    } catch (err) {
      console.error('Failed to load weather', err);
    }
  };

  // Browser Geolocation Permission & Regional Resolution
  const detectLocation = (showErrorFeedback = false) => {
    if (!navigator.geolocation) {
      if (showErrorFeedback) {
        setLocationError('Geolocation is not supported by your browser.');
      }
      return;
    }

    setIsLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(`/api/location/lookup?lat=${latitude}&lon=${longitude}`);
          const json = await res.json();
          if (json.success && json.data) {
            const loc: UserLocationInfo = json.data;
            setCurrentLocation(loc);
            loadWeather(latitude, longitude, loc.district);
          }
        } catch (err) {
          console.error('Failed to reverse-geocode location:', err);
          setCurrentLocation({
            latitude,
            longitude,
            district: 'Detected Field',
            state: 'Tamil Nadu',
            country: 'India',
            isGpsDetected: true
          });
          loadWeather(latitude, longitude, 'Detected Field');
        } finally {
          setIsLocating(false);
        }
      },
      (err) => {
        setIsLocating(false);
        console.warn('Geolocation permission not granted or error:', err.message);
        if (showErrorFeedback) {
          setLocationError(err.code === 1 ? 'Location permission was denied in browser settings.' : err.message);
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  // Load Today's Farm Actions
  const loadTasks = async () => {
    try {
      const res = await fetch('/api/actions/today');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setTasks(json.data);
      }
    } catch (err) {
      console.error('Failed to load tasks', err);
    }
  };

  useEffect(() => {
    const init = async () => {
      await Promise.all([loadProfile(), loadWeather(), loadTasks()]);
      // Attempt location detection on startup
      detectLocation(false);
    };
    init();
  }, []);

  // Toggle Task Completion Status
  const handleToggleTask = async (taskId: string) => {
    setTasks(prev => prev.map(task => task.id === taskId ? { ...task, completed: !task.completed } : task));
    try {
      await fetch(`/api/actions/${taskId}/toggle`, { method: 'PATCH' });
    } catch (err) {
      console.error('Failed to toggle task', err);
    }
  };

  // Update Crop Stage
  const handleUpdateStage = async (stage: CropStage) => {
    if (!activeCycle) return;
    try {
      const res = await fetch(`/api/farmer/crop-cycle/${activeCycle.id}/stage`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage })
      });
      const json = await res.json();
      if (json.success) {
        setActiveCycle(prev => prev ? { ...prev, currentStage: stage } : null);
        loadTasks();
      }
    } catch (err) {
      console.error('Failed to update stage', err);
    }
  };

  // Select Crop to Plant
  const handleSelectCropToPlant = async (cropId: string) => {
    const selectedCrop = crops.find(c => c.id === cropId);
    if (!selectedCrop || !farm) return;

    setActiveCycle({
      id: `cycle-${Date.now()}`,
      farmId: farm.id,
      cropId: selectedCrop.id,
      crop: selectedCrop,
      sowingDate: new Date().toISOString().split('T')[0],
      expectedHarvestDate: new Date(Date.now() + 110 * 86400000).toISOString().split('T')[0],
      currentStage: 'planning',
      plantedAreaAcres: farm.totalAreaAcres,
      status: 'active'
    });

    setActiveTab('dashboard');
    loadTasks();
  };

  const handleOpenCopilotWithPrompt = (prompt: string) => {
    setCopilotInitialPrompt(prompt);
    setActiveTab('copilot');
  };

  const handleSaveProfileSuccess = (data: any) => {
    setFarmer(data.farmer);
    setFarm(data.farm);
    setSoil(data.soil);
    setWater(data.water);
    setActiveCycle(data.activeCycle);
    loadWeather();
    loadTasks();
  };

  const navItems = [
    { id: 'dashboard', label: t.nav.dashboard, icon: Home },
    { id: 'copilot', label: t.nav.copilot, icon: Bot },
    { id: 'actions', label: t.nav.actions, icon: CheckCircle2 },
    { id: 'lifecycle', label: t.nav.lifecycle, icon: Layers },
    { id: 'market', label: t.nav.market, icon: TrendingUp },
    { id: 'economics', label: t.nav.economics, icon: DollarSign },
    { id: 'risk', label: t.nav.risk, icon: ShieldAlert },
    { id: 'recommendations', label: t.nav.recommendations, icon: Sprout },
    { id: 'health', label: t.nav.health, icon: Stethoscope }
  ];

  return (
    <div className="app-container">
      {/* Top Header with Trilingual Switcher (EN | TA | ML), GPS & Controls */}
      <Header 
        theme={theme}
        onToggleTheme={toggleTheme}
        activeFarm={farm}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        language={language}
        onSelectLanguage={handleSelectLanguage}
        currentLocation={currentLocation}
        isLocating={isLocating}
        onDetectLocation={() => detectLocation(true)}
      />

      {/* Main Body Layout */}
      <main className="main-content">
        {/* Geolocation Notice / Error Banner */}
        {locationError && (
          <div style={{
            margin: '0 0 1rem 0',
            padding: '0.65rem 1rem',
            background: 'var(--status-urgent-bg)',
            color: 'var(--status-urgent)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.85rem'
          }}>
            <span>📍 {locationError}</span>
            <button 
              type="button" 
              onClick={() => setLocationError(null)} 
              className="btn btn-ghost" 
              style={{ padding: '0.1rem 0.5rem', fontSize: '0.8rem' }}
            >
              ✕
            </button>
          </div>
        )}

        {/* Navigation Tabs Bar for Desktop */}
        <div className="hide-on-mobile" style={{
          display: 'flex',
          gap: '0.4rem',
          overflowX: 'auto',
          paddingBottom: '0.5rem',
          marginBottom: '1.25rem',
          borderBottom: '1px solid var(--border-subtle)',
          width: '100%',
          maxWidth: '100%'
        }}>
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`btn ${isActive ? 'btn-primary' : 'btn-secondary'}`}
                style={{
                  fontSize: '0.85rem',
                  padding: '0.5rem 0.95rem',
                  whiteSpace: 'nowrap',
                  borderRadius: 'var(--radius-md)'
                }}
                id={`tab-btn-${item.id}`}
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Mobile View Active Module Header Banner (when navigating away from dashboard) */}
        {activeTab !== 'dashboard' && (
          <div className="mobile-active-module-bar show-on-mobile-only">
            <button 
              type="button" 
              onClick={() => setActiveTab('dashboard')} 
              className="btn btn-secondary"
              style={{ padding: '0.3rem 0.6rem', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
              title="Back to Dashboard"
            >
              <ArrowLeft size={14} />
              <span>{t.nav.dashboard}</span>
            </button>
            <div className="module-badge">
              {(() => {
                const currentNav = navItems.find(i => i.id === activeTab);
                if (!currentNav) return null;
                const Icon = currentNav.icon;
                return (
                  <>
                    <Icon size={16} color="var(--primary-600)" />
                    <span>{currentNav.label}</span>
                  </>
                );
              })()}
            </div>
            <button 
              type="button" 
              onClick={() => setIsMobileDrawerOpen(true)} 
              className="btn btn-secondary"
              style={{ padding: '0.3rem 0.5rem', fontSize: '0.75rem' }}
              title="All Modules"
            >
              <Menu size={14} />
            </button>
          </div>
        )}

        {/* Tab Views */}
        {activeTab === 'dashboard' && (
          <DashboardView 
            farmer={farmer}
            farm={farm}
            soil={soil}
            water={water}
            activeCycle={activeCycle}
            weather={weather}
            tasks={tasks}
            onToggleTask={handleToggleTask}
            onNavigate={setActiveTab}
            onOpenCopilotWithPrompt={handleOpenCopilotWithPrompt}
            language={language}
            t={t}
            currentLocation={currentLocation}
            onDetectLocation={() => detectLocation(true)}
          />
        )}

        {activeTab === 'actions' && (
          <ActionsView 
            tasks={tasks}
            onToggleTask={handleToggleTask}
            language={language}
            t={t}
          />
        )}

        {activeTab === 'copilot' && (
          <CopilotView 
            farmer={farmer}
            farm={farm}
            soil={soil}
            water={water}
            activeCycle={activeCycle}
            weather={weather}
            tasks={tasks}
            currentLocation={currentLocation}
            initialPrompt={copilotInitialPrompt}
            onClearInitialPrompt={() => setCopilotInitialPrompt(undefined)}
            language={language}
            t={t}
            onNavigate={setActiveTab}
            onUpdateStage={handleUpdateStage}
            onToggleTask={handleToggleTask}
            onDetectLocation={() => detectLocation(true)}
            onSelectLanguage={handleSelectLanguage}
            onOpenProfile={() => setIsProfileModalOpen(true)}
          />
        )}

        {activeTab === 'recommendations' && (
          <CropRecommendationView 
            farm={farm}
            soil={soil}
            water={water}
            onSelectCropToPlant={handleSelectCropToPlant}
            language={language}
            t={t}
          />
        )}

        {activeTab === 'lifecycle' && (
          <CropLifecycleView 
            activeCycle={activeCycle}
            onUpdateStage={handleUpdateStage}
            language={language}
            t={t}
          />
        )}

        {activeTab === 'health' && (
          <CropHealthView 
            activeCycle={activeCycle}
            language={language}
            t={t}
          />
        )}

        {activeTab === 'market' && (
          <MarketView 
            language={language}
            t={t}
            currentLocation={currentLocation}
            onDetectLocation={() => detectLocation(true)}
          />
        )}

        {activeTab === 'economics' && (
          <EconomicsView 
            farm={farm}
            activeCycle={activeCycle}
            language={language}
            t={t}
          />
        )}

        {activeTab === 'risk' && (
          <RiskView 
            farm={farm}
            activeCycle={activeCycle}
            language={language}
            t={t}
          />
        )}
      </main>

      {/* Mobile Ergonomic Bottom Navigation Bar */}
      <nav className="bottom-nav-mobile" aria-label="Mobile Navigation">
        <button 
          type="button" 
          onClick={() => setActiveTab('dashboard')} 
          className={`bottom-nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
          id="mobile-nav-dashboard"
        >
          <Home size={19} />
          <span>{t.nav.dashboard}</span>
        </button>

        <button 
          type="button" 
          onClick={() => setActiveTab('actions')} 
          className={`bottom-nav-btn ${activeTab === 'actions' ? 'active' : ''}`}
          id="mobile-nav-actions"
        >
          <CheckCircle2 size={19} />
          <span>{t.nav.actions}</span>
        </button>

        {/* Center Prominent AI Copilot Pill */}
        <button 
          type="button" 
          onClick={() => setActiveTab('copilot')} 
          className={`bottom-nav-btn bottom-nav-btn-highlight ${activeTab === 'copilot' ? 'active' : ''}`}
          id="mobile-nav-copilot"
          title="AgriSense AI Copilot"
        >
          <Bot size={24} />
        </button>

        <button 
          type="button" 
          onClick={() => setActiveTab('market')} 
          className={`bottom-nav-btn ${activeTab === 'market' ? 'active' : ''}`}
          id="mobile-nav-market"
        >
          <TrendingUp size={19} />
          <span>{t.nav.market}</span>
        </button>

        {/* More Menu Drawer Trigger */}
        <button 
          type="button" 
          onClick={() => setIsMobileDrawerOpen(true)} 
          className={`bottom-nav-btn ${!['dashboard', 'actions', 'copilot', 'market'].includes(activeTab) ? 'active' : ''}`}
          id="mobile-nav-more"
        >
          <Menu size={19} />
          <span>{language === 'ta' ? 'கூடுதல்' : language === 'ml' ? 'കൂടുതൽ' : 'More'}</span>
        </button>
      </nav>

      {/* Mobile Slide-Up Navigation Sheet (All 9 Tools Accessible) */}
      {isMobileDrawerOpen && (
        <div 
          className="mobile-drawer-overlay" 
          onClick={() => setIsMobileDrawerOpen(false)}
        >
          <div 
            className="mobile-drawer-sheet" 
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sprout size={20} color="var(--primary-600)" />
                <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>
                  {language === 'ta' ? 'அனைத்து அம்சங்கள்' : language === 'ml' ? 'എല്ലാ സേവനങ്ങളും' : 'All AgriSense Modules'}
                </span>
              </div>
              <button 
                type="button" 
                onClick={() => setIsMobileDrawerOpen(false)}
                className="btn btn-secondary"
                style={{ padding: '0.35rem 0.6rem', borderRadius: 'var(--radius-full)' }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.65rem' }}>
              {navItems.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setActiveTab(item.id);
                      setIsMobileDrawerOpen(false);
                    }}
                    className={`btn ${isActive ? 'btn-primary' : 'btn-secondary'}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-start',
                      gap: '0.65rem',
                      padding: '0.75rem 0.85rem',
                      fontSize: '0.85rem',
                      borderRadius: 'var(--radius-md)',
                      textAlign: 'left',
                      minWidth: 0
                    }}
                  >
                    <Icon size={18} style={{ flexShrink: 0 }} />
                    <span style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Farm Settings Quick Link */}
            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem' }}>
              <button
                type="button"
                onClick={() => {
                  setIsMobileDrawerOpen(false);
                  setIsProfileModalOpen(true);
                }}
                className="btn btn-secondary"
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  padding: '0.65rem',
                  fontSize: '0.88rem'
                }}
              >
                <Settings size={16} />
                <span>{language === 'ta' ? 'பண்ணை சுயவிவரம் மற்றும் அமைப்புகள்' : language === 'ml' ? 'ഫാം പ്രൊഫൈലും ക്രമീകരണങ്ങളും' : 'Farm Profile & Settings'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Onboarding & Profile Modal */}
      <OnboardingModal 
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        farmer={farmer}
        farm={farm}
        soil={soil}
        water={water}
        activeCycle={activeCycle}
        crops={crops}
        onSaveSuccess={handleSaveProfileSuccess}
        language={language}
        t={t}
        currentLocation={currentLocation}
      />
    </div>
  );
}

export default App;
