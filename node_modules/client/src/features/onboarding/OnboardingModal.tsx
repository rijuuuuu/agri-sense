import React, { useState } from 'react';
import { X, Save, CheckCircle2, Sprout, Droplets, MapPin, DollarSign } from 'lucide-react';
import type { 
  FarmerProfile, 
  Farm, 
  SoilProfile, 
  WaterProfile, 
  CropCycle, 
  CropReference,
  SoilType,
  WaterSource,
  WaterAvailability,
  IrrigationMethod,
  CropStage,
  UserLocationInfo
} from '@agrisense/shared';
import type { Language, Translations } from '../../i18n/translations.js';
import { 
  getLocalizedCropName, 
  getLocalizedSoilType, 
  getLocalizedWaterSource, 
  getLocalizedWaterAvailability, 
  getLocalizedIrrigationMethod, 
  getLocalizedStage 
} from '../../i18n/cropNames.js';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  farmer: FarmerProfile | null;
  farm: Farm | null;
  soil: SoilProfile | null;
  water: WaterProfile | null;
  activeCycle: CropCycle | null;
  crops: CropReference[];
  onSaveSuccess: (data: any) => void;
  language: Language;
  t: Translations;
  currentLocation?: UserLocationInfo | null;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  farmer,
  farm,
  soil,
  water,
  activeCycle,
  crops,
  onSaveSuccess,
  language,
  t,
  currentLocation
}) => {
  if (!isOpen) return null;

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form States - Zero Fake Data Defaults
  const [fullName, setFullName] = useState(farmer?.fullName || '');
  const [phoneNumber, setPhoneNumber] = useState(farmer?.phoneNumber || '');
  const [preferredLanguage, setPreferredLanguage] = useState(farmer?.preferredLanguage || language);
  const [farmingExperienceYears, setFarmingExperienceYears] = useState(farmer?.farmingExperienceYears ?? 5);
  const [approximateBudget, setApproximateBudget] = useState(farmer?.approximateBudget ?? 50000);

  const [farmName, setFarmName] = useState(farm?.farmName || '');
  const [totalAreaAcres, setTotalAreaAcres] = useState(farm?.totalAreaAcres ?? 2.5);
  const [villageDistrict, setVillageDistrict] = useState(farm?.villageDistrict || currentLocation?.district || '');
  const [stateProvince, setStateProvince] = useState(farm?.stateProvince || currentLocation?.state || '');
  const [latitude, setLatitude] = useState(farm?.latitude ?? (currentLocation?.latitude ?? 11.6643));
  const [longitude, setLongitude] = useState(farm?.longitude ?? (currentLocation?.longitude ?? 78.1460));
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [locationSearchMessage, setLocationSearchMessage] = useState<string | null>(null);

  const handleSearchLocation = async () => {
    if (!villageDistrict.trim()) {
      setLocationSearchMessage('Please enter a district or city name first.');
      return;
    }
    setIsSearchingLocation(true);
    setLocationSearchMessage(null);
    try {
      const res = await fetch(`/api/location/search?q=${encodeURIComponent(villageDistrict.trim())}`);
      const json = await res.json();
      if (json.success && json.data) {
        setLatitude(Number(json.data.latitude.toFixed(4)));
        setLongitude(Number(json.data.longitude.toFixed(4)));
        if (json.data.state && !stateProvince) {
          setStateProvince(json.data.state);
        }
        setLocationSearchMessage(`✓ Found: ${json.data.name}, ${json.data.state || ''} (${json.data.latitude.toFixed(3)}, ${json.data.longitude.toFixed(3)})`);
      } else {
        setLocationSearchMessage('Location not found. Please verify spelling or enter latitude & longitude manually.');
      }
    } catch {
      setLocationSearchMessage('Failed to query geocoding service.');
    } finally {
      setIsSearchingLocation(false);
    }
  };

  const handleUseGps = () => {
    if (!navigator.geolocation) {
      setLocationSearchMessage('Geolocation is not supported in this browser.');
      return;
    }
    setIsSearchingLocation(true);
    setLocationSearchMessage(null);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lon } = pos.coords;
        setLatitude(Number(lat.toFixed(4)));
        setLongitude(Number(lon.toFixed(4)));
        try {
          const res = await fetch(`/api/location/lookup?lat=${lat}&lon=${lon}`);
          const json = await res.json();
          if (json.success && json.data) {
            setVillageDistrict(json.data.district || villageDistrict);
            setStateProvince(json.data.state || stateProvince);
            setLocationSearchMessage(`✓ GPS Coordinates detected: ${json.data.district}, ${json.data.state}`);
          }
        } catch {
          setLocationSearchMessage(`✓ GPS Coordinates detected: ${lat.toFixed(3)}, ${lon.toFixed(3)}`);
        } finally {
          setIsSearchingLocation(false);
        }
      },
      (err) => {
        setIsSearchingLocation(false);
        setLocationSearchMessage(`GPS Error: ${err.message}`);
      },
      { timeout: 8000 }
    );
  };

  const [soilType, setSoilType] = useState<SoilType>(soil?.soilType || 'alluvial');
  const [soilPh, setSoilPh] = useState(soil?.phLevel || 6.8);
  const [drainageQuality, setDrainageQuality] = useState(soil?.drainageQuality || 'well_drained');

  const [waterSource, setWaterSource] = useState<WaterSource>(water?.waterSource || 'borewell');
  const [waterAvailability, setWaterAvailability] = useState<WaterAvailability>(water?.availabilityStatus || 'sufficient');
  const [irrigationMethod, setIrrigationMethod] = useState<IrrigationMethod>(water?.irrigationMethod || 'drip');

  const [cropId, setCropId] = useState(activeCycle?.cropId || 'crop-wheat');
  const [currentStage, setCurrentStage] = useState<CropStage>(activeCycle?.currentStage || 'vegetative');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        fullName,
        phoneNumber,
        preferredLanguage,
        farmingExperienceYears,
        approximateBudget,
        farmName,
        totalAreaAcres,
        villageDistrict,
        stateProvince,
        latitude,
        longitude,
        soilType,
        soilPh,
        drainageQuality,
        waterSource,
        waterAvailability,
        irrigationMethod,
        cropId,
        currentStage
      };

      const res = await fetch('/api/farmer/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.userFacingMessage || 'Failed to update farm profile');
      }

      onSaveSuccess(json.data);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred while saving.');
    } finally {
      setLoading(false);
    }
  };

  const soilTypeOptions: SoilType[] = ['alluvial', 'black', 'red', 'clay_loam', 'sandy_loam', 'silt_loam', 'laterite'];
  const waterSourceOptions: WaterSource[] = ['borewell', 'canal', 'open_well', 'river', 'farm_pond', 'rainfed'];
  const waterAvailabilityOptions: WaterAvailability[] = ['abundant', 'sufficient', 'limited', 'scarce'];
  const irrigationOptions: IrrigationMethod[] = ['drip', 'sprinkler', 'flood', 'furrow', 'rainfed_only'];
  const stageOptions: CropStage[] = ['planning', 'planting', 'germination', 'vegetative', 'flowering', 'fruiting', 'harvest', 'selling'];

  return (
    <div className="modal-overlay">
      <div className="card card-elevated modal-dialog">
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.85rem', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sprout size={22} color="var(--primary-600)" />
              {farmer ? t.onboarding.modalTitleEdit : t.onboarding.modalTitleNew}
            </h2>
            <p style={{ fontSize: '0.85rem' }}>
              {t.onboarding.modalSubtitle}
            </p>
          </div>
          <button type="button" onClick={onClose} className="btn btn-secondary" style={{ padding: '0.35rem' }}>
            <X size={18} />
          </button>
        </div>

        {/* Step Indicators */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <button 
            type="button" 
            onClick={() => setStep(1)} 
            className={`btn ${step === 1 ? 'btn-primary' : 'btn-secondary'}`}
            style={{ flex: 1, fontSize: '0.8rem', padding: '0.4rem' }}
          >
            {t.onboarding.step1}
          </button>
          <button 
            type="button" 
            onClick={() => setStep(2)} 
            className={`btn ${step === 2 ? 'btn-primary' : 'btn-secondary'}`}
            style={{ flex: 1, fontSize: '0.8rem', padding: '0.4rem' }}
          >
            {t.onboarding.step2}
          </button>
          <button 
            type="button" 
            onClick={() => setStep(3)} 
            className={`btn ${step === 3 ? 'btn-primary' : 'btn-secondary'}`}
            style={{ flex: 1, fontSize: '0.8rem', padding: '0.4rem' }}
          >
            {t.onboarding.step3}
          </button>
        </div>

        {error && (
          <div style={{ padding: '0.65rem 1rem', background: 'var(--status-urgent-bg)', color: 'var(--status-urgent)', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.85rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* STEP 1: Farmer & Farm Core */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="grid-cols-2">
                <div className="form-group">
                  <label className="form-label">{t.onboarding.farmerName}</label>
                  <input 
                    type="text" 
                    required 
                    className="form-input" 
                    value={fullName} 
                    onChange={e => setFullName(e.target.value)} 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">{t.onboarding.phone}</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={phoneNumber} 
                    onChange={e => setPhoneNumber(e.target.value)} 
                  />
                </div>
              </div>

              <div className="grid-cols-2">
                <div className="form-group">
                  <label className="form-label">{t.onboarding.experience}</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    value={farmingExperienceYears} 
                    onChange={e => setFarmingExperienceYears(Number(e.target.value))} 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">{t.onboarding.languageLabel}</label>
                  <select 
                    className="form-select" 
                    value={preferredLanguage} 
                    onChange={e => setPreferredLanguage(e.target.value as any)}
                  >
                    <option value="en">English</option>
                    <option value="ta">தமிழ் (Tamil)</option>
                    <option value="ml">മലയാളം (Malayalam)</option>
                    <option value="hi">हिन्दी (Hindi)</option>
                    <option value="pa">ਪੰਜਾਬੀ (Punjabi)</option>
                    <option value="te">తెలుగు (Telugu)</option>
                  </select>
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
                <div className="grid-cols-2">
                  <div className="form-group">
                    <label className="form-label">{t.onboarding.farmName}</label>
                    <input 
                      type="text" 
                      required 
                      className="form-input" 
                      value={farmName} 
                      onChange={e => setFarmName(e.target.value)} 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t.onboarding.landArea}</label>
                    <input 
                      type="number" 
                      step="0.1" 
                      required 
                      className="form-input" 
                      value={totalAreaAcres} 
                      onChange={e => setTotalAreaAcres(Number(e.target.value))} 
                    />
                  </div>
                </div>

                <div className="grid-cols-2">
                  <div className="form-group">
                    <label className="form-label">{t.onboarding.district}</label>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <input 
                        type="text" 
                        required 
                        className="form-input" 
                        value={villageDistrict} 
                        onChange={e => setVillageDistrict(e.target.value)} 
                        placeholder={language === 'ta' ? 'எ.கா. சேலம் / கோயம்புத்தூர்' : language === 'ml' ? 'ഉദാ: വയനാട് / പാലക്കാട്' : 'e.g. Salem, Wayanad, Karnal'}
                      />
                      <button
                        type="button"
                        onClick={handleSearchLocation}
                        disabled={isSearchingLocation}
                        className="btn btn-secondary"
                        style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem', whiteSpace: 'nowrap' }}
                        title="Search coordinates for this district or town"
                      >
                        {isSearchingLocation ? '...' : (language === 'ta' ? 'தேடு' : language === 'ml' ? 'തിരയുക' : 'Find')}
                      </button>
                      <button
                        type="button"
                        onClick={handleUseGps}
                        disabled={isSearchingLocation}
                        className="btn btn-secondary"
                        style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem', whiteSpace: 'nowrap' }}
                        title="Detect coordinates via device GPS"
                      >
                        GPS
                      </button>
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t.onboarding.state}</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={stateProvince} 
                      onChange={e => setStateProvince(e.target.value)} 
                      placeholder={language === 'ta' ? 'எ.கா. தமிழ்நாடு' : language === 'ml' ? 'ഉദാ: കേരളം' : 'e.g. Tamil Nadu, Kerala'}
                    />
                  </div>
                </div>

                {locationSearchMessage && (
                  <div style={{ 
                    fontSize: '0.8rem', 
                    padding: '0.4rem 0.6rem', 
                    borderRadius: 'var(--radius-sm)', 
                    background: locationSearchMessage.startsWith('✓') ? 'rgba(34, 197, 94, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                    color: locationSearchMessage.startsWith('✓') ? 'var(--primary-700)' : 'var(--status-urgent)',
                    marginBottom: '0.5rem'
                  }}>
                    {locationSearchMessage}
                  </div>
                )}

                <div className="grid-cols-2">
                  <div className="form-group">
                    <label className="form-label">{t.onboarding.latitude}</label>
                    <input 
                      type="number" 
                      step="0.0001" 
                      className="form-input" 
                      value={latitude} 
                      onChange={e => setLatitude(Number(e.target.value))} 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t.onboarding.longitude}</label>
                    <input 
                      type="number" 
                      step="0.0001" 
                      className="form-input" 
                      value={longitude} 
                      onChange={e => setLongitude(Number(e.target.value))} 
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button type="button" onClick={() => setStep(2)} className="btn btn-primary">
                  {t.onboarding.nextBtn}
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Soil & Water */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--primary-800)' }}>
                {t.onboarding.soilTitle}
              </h4>
              
              <div className="grid-cols-3">
                <div className="form-group">
                  <label className="form-label">{t.onboarding.soilType}</label>
                  <select 
                    className="form-select" 
                    value={soilType} 
                    onChange={e => setSoilType(e.target.value as SoilType)}
                  >
                    {soilTypeOptions.map(st => (
                      <option key={st} value={st}>{getLocalizedSoilType(st, language)}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">{t.onboarding.soilPh}</label>
                  <input 
                    type="number" 
                    step="0.1" 
                    min="4" 
                    max="9.5" 
                    className="form-input" 
                    value={soilPh} 
                    onChange={e => setSoilPh(Number(e.target.value))} 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">{t.onboarding.drainage}</label>
                  <select 
                    className="form-select" 
                    value={drainageQuality} 
                    onChange={e => setDrainageQuality(e.target.value as any)}
                  >
                    <option value="well_drained">{language === 'ta' ? 'நல்ல வடிகால்' : language === 'ml' ? 'നല്ല നീർവാർച്ച' : 'Well Drained'}</option>
                    <option value="moderate">{language === 'ta' ? 'மிதமான வடிகால்' : language === 'ml' ? 'മിതമായ നീർവാർച്ച' : 'Moderate'}</option>
                    <option value="poor">{language === 'ta' ? 'குறைந்த வடிகால் (நீர் தேங்கும்)' : language === 'ml' ? 'കുറഞ്ഞ നീർവാർച്ച (വെള്ളക്കെട്ട്)' : 'Poor (Waterlogging)'}</option>
                    <option value="excessive">{language === 'ta' ? 'அதிக வடிகால் (மணல்)' : language === 'ml' ? 'കൂടിയ നീർവാർച്ച (മണൽ)' : 'Excessive (Sandy)'}</option>
                  </select>
                </div>
              </div>

              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--primary-800)', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
                {t.onboarding.waterTitle}
              </h4>

              <div className="grid-cols-3">
                <div className="form-group">
                  <label className="form-label">{t.onboarding.waterSource}</label>
                  <select 
                    className="form-select" 
                    value={waterSource} 
                    onChange={e => setWaterSource(e.target.value as WaterSource)}
                  >
                    {waterSourceOptions.map(ws => (
                      <option key={ws} value={ws}>{getLocalizedWaterSource(ws, language)}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">{t.onboarding.waterAvailability}</label>
                  <select 
                    className="form-select" 
                    value={waterAvailability} 
                    onChange={e => setWaterAvailability(e.target.value as WaterAvailability)}
                  >
                    {waterAvailabilityOptions.map(wa => (
                      <option key={wa} value={wa}>{getLocalizedWaterAvailability(wa, language)}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">{t.onboarding.irrigationMethod}</label>
                  <select 
                    className="form-select" 
                    value={irrigationMethod} 
                    onChange={e => setIrrigationMethod(e.target.value as IrrigationMethod)}
                  >
                    {irrigationOptions.map(im => (
                      <option key={im} value={im}>{getLocalizedIrrigationMethod(im, language)}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
                <button type="button" onClick={() => setStep(1)} className="btn btn-secondary">
                  {t.onboarding.backBtn}
                </button>
                <button type="button" onClick={() => setStep(3)} className="btn btn-primary">
                  {t.onboarding.nextBtn}
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Standing Crop & Budget */}
          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--primary-800)' }}>
                {t.onboarding.cropTitle}
              </h4>

              <div className="grid-cols-2">
                <div className="form-group">
                  <label className="form-label">{t.onboarding.currentCrop}</label>
                  <select 
                    className="form-select" 
                    value={cropId} 
                    onChange={e => setCropId(e.target.value)}
                  >
                    {crops.length > 0 ? (
                      crops.map(c => (
                        <option key={c.id} value={c.id}>
                          {getLocalizedCropName(c.id, language)}
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="crop-wheat">{getLocalizedCropName('crop-wheat', language)}</option>
                        <option value="crop-rice">{getLocalizedCropName('crop-rice', language)}</option>
                        <option value="crop-cotton">{getLocalizedCropName('crop-cotton', language)}</option>
                        <option value="crop-mustard">{getLocalizedCropName('crop-mustard', language)}</option>
                        <option value="crop-tomato">{getLocalizedCropName('crop-tomato', language)}</option>
                      </>
                    )}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">{t.onboarding.currentStage}</label>
                  <select 
                    className="form-select" 
                    value={currentStage} 
                    onChange={e => setCurrentStage(e.target.value as CropStage)}
                  >
                    {stageOptions.map(stg => (
                      <option key={stg} value={stg}>{getLocalizedStage(stg, language)}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group" style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
                <label className="form-label">{t.onboarding.workingBudget}</label>
                <input 
                  type="number" 
                  step="5000" 
                  className="form-input" 
                  value={approximateBudget} 
                  onChange={e => setApproximateBudget(Number(e.target.value))} 
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.25rem' }}>
                  {t.onboarding.workingBudgetHelp}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
                <button type="button" onClick={() => setStep(2)} className="btn btn-secondary">
                  {t.onboarding.backBtn}
                </button>
                <button type="submit" disabled={loading} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Save size={16} />
                  {loading ? t.onboarding.savingBtn : t.onboarding.saveBtn}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
