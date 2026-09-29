import React, { useState, useEffect, useRef } from 'react';
import { 
  Stethoscope, 
  Upload, 
  AlertCircle, 
  ShieldCheck, 
  CheckCircle2, 
  Info, 
  Camera, 
  RotateCcw,
  Sparkles,
  AlertTriangle,
  FileText,
  Clock
} from 'lucide-react';
import type { CropCycle, DiseaseScanRecord } from '@agrisense/shared';
import type { Language, Translations } from '../../i18n/translations.js';
import { getLocalizedCropName, getLocalizedStage } from '../../i18n/cropNames.js';

interface CropHealthViewProps {
  activeCycle: CropCycle | null;
  language: Language;
  t: Translations;
}

export const CropHealthView: React.FC<CropHealthViewProps> = ({ 
  activeCycle, 
  language, 
  t 
}) => {
  const [affectedPart, setAffectedPart] = useState<'leaves' | 'stem' | 'roots' | 'fruit'>('leaves');
  const [symptomDescription, setSymptomDescription] = useState<string>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [assessing, setAssessing] = useState(false);
  const [assessment, setAssessment] = useState<DiseaseScanRecord | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [scansHistory, setScansHistory] = useState<DiseaseScanRecord[]>([]);
  const [activeTab, setActiveTab] = useState<'diagnose' | 'history'>('diagnose');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const cropId = activeCycle?.cropId || 'crop-wheat';
  const cropName = getLocalizedCropName(cropId, language);
  const rawStage = activeCycle?.currentStage || 'vegetative';
  const stage = getLocalizedStage(rawStage, language);

  // Load Past Scans
  const loadPastScans = async () => {
    try {
      const res = await fetch('/api/health/scans');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setScansHistory(json.data);
      }
    } catch (err) {
      console.error('Failed to load past scans:', err);
    }
  };

  useEffect(() => {
    loadPastScans();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      setError(language === 'ta' ? 'படத்தின் அளவு 8MB-க்கு குறைவாக இருக்க வேண்டும்.' : 'Image size must be under 8MB.');
      return;
    }

    setImageFile(file);
    setError(null);

    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleClearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRunAssessment = async () => {
    setAssessing(true);
    setError(null);

    try {
      const payload: Record<string, any> = {
        farmId: activeCycle?.farmId,
        cropId: activeCycle?.cropId,
        cropName: activeCycle?.crop?.commonName || cropName,
        stage: rawStage,
        affectedPart,
        symptomDescription: symptomDescription.trim() || undefined,
        language
      };

      if (imagePreview) {
        payload.imageBase64 = imagePreview;
        payload.imageMimeType = imageFile?.type || 'image/jpeg';
      }

      const res = await fetch('/api/health/analyze-disease', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error?.userFacingMessage || json.error?.message || 'Failed to complete disease diagnosis');
      }

      setAssessment(json.data);
      loadPastScans();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Disease assessment service unavailable');
    } finally {
      setAssessing(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header */}
      <div className="card card-elevated" style={{ borderLeft: '4px solid var(--primary-600)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <Stethoscope size={24} color="var(--primary-600)" />
              {t.health.title}
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              {t.health.subtitle} ({cropName}, {stage})
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <button 
              type="button" 
              onClick={() => setActiveTab('diagnose')} 
              className={`btn ${activeTab === 'diagnose' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.82rem', padding: '0.4rem 0.8rem' }}
            >
              <Sparkles size={14} />
              <span>{language === 'ta' ? 'புதிய பரிசோதனை' : language === 'ml' ? 'പുതിയ പരിശോധന' : 'New Diagnosis'}</span>
            </button>
            <button 
              type="button" 
              onClick={() => setActiveTab('history')} 
              className={`btn ${activeTab === 'history' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.82rem', padding: '0.4rem 0.8rem' }}
            >
              <Clock size={14} />
              <span>{language === 'ta' ? 'முந்தைய பரிசோதனைகள்' : language === 'ml' ? 'മുൻ പരിശോധനകൾ' : 'Scan History'} ({scansHistory.length})</span>
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'history' ? (
        <div className="card">
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Clock size={18} color="var(--primary-600)" />
            <span>{language === 'ta' ? 'பதிவான பயிர் மருத்துவ ஆய்வுகள்' : language === 'ml' ? 'രേഖപ്പെടുത്തിയ പരിശോധനാ ചരിത്രം' : 'Recorded Plant Health Diagnostic History'}</span>
          </h3>

          {scansHistory.length === 0 ? (
            <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              {language === 'ta' ? 'இதுவரை எந்த மருத்துவப் பரிசோதனைகளும் செய்யப்படவில்லை.' : language === 'ml' ? 'പരിശോധനാ ചരിത്രങ്ങൾ ഒന്നും ലഭ്യമല്ല.' : 'No disease scans recorded yet. Upload a crop photo to run diagnosis.'}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {scansHistory.map(scan => (
                <div 
                  key={scan.id} 
                  style={{
                    padding: '0.85rem 1rem',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-app)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    flexWrap: 'wrap',
                    gap: '0.75rem'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                      <span style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-main)' }}>{scan.condition}</span>
                      <span className="badge badge-live" style={{ fontSize: '0.72rem' }}>
                        {scan.confidencePct}% {scan.confidenceRating}
                      </span>
                    </div>
                    {scan.conditionScientific && (
                      <div style={{ fontSize: '0.82rem', fontStyle: 'italic', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                        {scan.conditionScientific}
                      </div>
                    )}
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {scan.cropName} • {scan.affectedPart} • {new Date(scan.timestamp).toLocaleDateString()}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setAssessment(scan);
                      setActiveTab('diagnose');
                    }}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.78rem', padding: '0.3rem 0.6rem' }}
                  >
                    {language === 'ta' ? 'முழு விபரம்' : language === 'ml' ? 'വിശദാംശങ്ങൾ' : 'View Report'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="grid-cols-2">
          {/* Symptom Input Form */}
          <div className="card">
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>{t.health.step1Title}</h3>

            {error && (
              <div style={{
                margin: '0 0 1rem 0',
                padding: '0.75rem 1rem',
                background: 'var(--status-urgent-bg)',
                color: 'var(--status-urgent)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.85rem'
              }}>
                <AlertTriangle size={16} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">{t.health.affectedPartLabel}</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                {(['leaves', 'stem', 'roots', 'fruit'] as const).map(part => {
                  const isSelected = affectedPart === part;
                  const label = t.health.parts[part];
                  return (
                    <button
                      key={part}
                      type="button"
                      onClick={() => setAffectedPart(part)}
                      className={`btn ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ fontSize: '0.82rem', padding: '0.5rem' }}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                {language === 'ta' ? 'அறிகுறி அல்லது அவதானிப்புகள் (விருப்பத்தேர்வு)' : language === 'ml' ? 'ലക്ഷണങ്ങൾ (ഓപ്ഷണൽ)' : 'Observed Symptoms or Notes (Optional)'}
              </label>
              <textarea 
                className="form-input" 
                rows={2}
                value={symptomDescription}
                onChange={e => setSymptomDescription(e.target.value)}
                placeholder={language === 'ta' ? 'எ.கா: பழைய இலைகளின் ஓரங்களில் மஞ்சள் நிற கருகல், தூள் புள்ளிகள்...' : 'e.g. Yellow margins on lower leaves, small powdery spots on underside...'}
                style={{ resize: 'vertical', fontSize: '0.85rem' }}
              />
            </div>

            {/* Real File Upload & Camera Capture */}
            <div className="form-group">
              <label className="form-label">{t.health.attachPhotoLabel}</label>
              
              <input 
                ref={fileInputRef}
                type="file" 
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                style={{ display: 'none' }}
                id="crop-disease-file-input"
              />

              {imagePreview ? (
                <div style={{
                  position: 'relative',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  border: '2px solid var(--primary-500)',
                  background: 'var(--bg-app)',
                  textAlign: 'center',
                  padding: '0.5rem'
                }}>
                  <img 
                    src={imagePreview} 
                    alt="Uploaded crop symptom" 
                    style={{ maxHeight: '200px', width: 'auto', maxWidth: '100%', objectFit: 'contain', borderRadius: 'var(--radius-sm)' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="btn btn-secondary"
                      style={{ padding: '0.3rem 0.6rem', fontSize: '0.78rem' }}
                    >
                      <RotateCcw size={13} /> {language === 'ta' ? 'மாற்று' : 'Replace'}
                    </button>
                    <button
                      type="button"
                      onClick={handleClearImage}
                      className="btn btn-secondary"
                      style={{ padding: '0.3rem 0.6rem', fontSize: '0.78rem', color: 'var(--status-urgent)' }}
                    >
                      ✕ {language === 'ta' ? 'நீக்கு' : 'Remove'}
                    </button>
                  </div>
                </div>
              ) : (
                <div 
                  style={{
                    border: '2px dashed var(--border-strong)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1.5rem',
                    textAlign: 'center',
                    cursor: 'pointer',
                    background: 'var(--bg-app)',
                    transition: 'border-color var(--transition-fast)'
                  }} 
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <Upload size={24} color="var(--primary-600)" />
                    <Camera size={24} color="var(--primary-600)" />
                  </div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>
                    {t.health.attachClick}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    {t.health.photoFormats} • Max 8MB
                  </div>
                </div>
              )}
            </div>

            <button 
              type="button" 
              onClick={handleRunAssessment}
              disabled={assessing}
              className="btn btn-primary"
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            >
              <Sparkles size={16} />
              <span>{assessing ? t.health.analyzingBtn : t.health.analyzeBtn}</span>
            </button>
          </div>

          {/* Assessment Results Card */}
          <div className="card" style={{ background: 'var(--bg-surface-elevated)' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <ShieldCheck size={18} color="var(--primary-600)" />
              <span>{t.health.step2Title}</span>
            </h3>

            {!assessment ? (
              <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                {t.health.step2Placeholder}
              </div>
            ) : (
              <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '0.95rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <h4 style={{ fontSize: '1.25rem', color: 'var(--text-main)', marginBottom: '0.15rem' }}>
                      {assessment.condition}
                    </h4>
                    {assessment.conditionScientific && (
                      <div style={{ fontSize: '0.85rem', fontStyle: 'italic', color: 'var(--text-secondary)' }}>
                        {assessment.conditionScientific}
                      </div>
                    )}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className="badge badge-live" style={{ fontSize: '0.8rem', padding: '0.25rem 0.6rem' }}>
                      {assessment.confidencePct}% Confidence ({assessment.confidenceRating})
                    </span>
                  </div>
                </div>

                {/* Uncertainty Disclosure */}
                {assessment.uncertaintyFactors && (
                  <div style={{
                    padding: '0.55rem 0.8rem',
                    background: 'rgba(217, 119, 6, 0.08)',
                    borderRadius: 'var(--radius-sm)',
                    borderLeft: '3px solid var(--harvest-amber)',
                    fontSize: '0.82rem',
                    color: 'var(--text-main)'
                  }}>
                    <strong>⚖️ {language === 'ta' ? 'நிச்சயமற்ற தன்மை:' : 'Diagnostic Uncertainty:'}</strong> {assessment.uncertaintyFactors}
                  </div>
                )}

                {/* Observed factors */}
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                    {t.health.observedFactors}
                  </div>
                  <ul style={{ paddingLeft: '1.25rem', margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {assessment.observations.map((obs: string, idx: number) => (
                      <li key={idx} style={{ marginBottom: '0.25rem' }}>{obs}</li>
                    ))}
                  </ul>
                </div>

                {/* Action items */}
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary-800)', marginBottom: '0.35rem' }}>
                    {t.health.practicalSteps}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                    {assessment.recommendedActions.map((act: string, idx: number) => (
                      <div key={idx} style={{ 
                        display: 'flex', 
                        alignItems: 'flex-start', 
                        gap: '0.45rem', 
                        fontSize: '0.85rem',
                        background: 'var(--bg-app)',
                        padding: '0.5rem 0.75rem',
                        borderRadius: 'var(--radius-sm)'
                      }}>
                        <CheckCircle2 size={16} color="var(--primary-600)" style={{ flexShrink: 0, marginTop: '2px' }} />
                        <span>{act}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Prevention Tips if available */}
                {assessment.preventionTips && assessment.preventionTips.length > 0 && (
                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.3rem' }}>
                      🌱 {language === 'ta' ? 'எதிர்கால தடுப்பு முறைகள்' : 'Prevention & Soil Health'}
                    </div>
                    <ul style={{ paddingLeft: '1.25rem', margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      {assessment.preventionTips.map((tip, i) => (
                        <li key={i}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Disclaimer */}
                <div style={{ 
                  fontSize: '0.76rem', 
                  color: 'var(--text-muted)', 
                  borderTop: '1px solid var(--border-subtle)', 
                  paddingTop: '0.5rem',
                  fontStyle: 'italic',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.35rem'
                }}>
                  <Info size={14} style={{ flexShrink: 0, marginTop: '1px' }} />
                  <span>{assessment.safetyNotice || t.health.safetyNotice}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
