import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  Sliders, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldAlert, 
  Droplets,
  Layers,
  Sparkles,
  PieChart,
  Users
} from 'lucide-react';
import type { Farm, CropCycle, WhatIfResult, ResourceRequirement } from '@agrisense/shared';
import type { Language, Translations } from '../../i18n/translations.js';
import { getLocalizedCropName } from '../../i18n/cropNames.js';

interface EconomicsViewProps {
  farm: Farm | null;
  activeCycle: CropCycle | null;
  language: Language;
  t: Translations;
}

export const EconomicsView: React.FC<EconomicsViewProps> = ({ 
  farm, 
  activeCycle, 
  language, 
  t 
}) => {
  // Input parameters
  const [areaAcres, setAreaAcres] = useState<number>(farm?.totalAreaAcres || 3.5);
  const [expectedYieldKgPerAcre, setExpectedYieldKgPerAcre] = useState<number>(activeCycle?.crop?.averageYieldPerAcreKg || 1800);
  const [sellingPricePerKg, setSellingPricePerKg] = useState<number>(24);

  const [seedCostPerAcre, setSeedCostPerAcre] = useState<number>(2500);
  const [fertilizerCostPerAcre, setFertilizerCostPerAcre] = useState<number>(4500);
  const [pesticideCostPerAcre, setPesticideCostPerAcre] = useState<number>(2000);
  const [labourCostPerAcre, setLabourCostPerAcre] = useState<number>(3500);
  const [irrigationCostPerAcre, setIrrigationCostPerAcre] = useState<number>(1500);
  const [otherCostPerAcre, setOtherCostPerAcre] = useState<number>(1000);

  // What-If Sliders
  const [priceVariationPct, setPriceVariationPct] = useState<number>(0);
  const [yieldVariationPct, setYieldVariationPct] = useState<number>(0);
  const [costVariationPct, setCostVariationPct] = useState<number>(0);
  const [irrigationReductionPct, setIrrigationReductionPct] = useState<number>(0);

  const [result, setResult] = useState<WhatIfResult | null>(null);
  const [resources, setResources] = useState<ResourceRequirement | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'simulator' | 'resources'>('simulator');

  const runCalculation = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/economics/what-if', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          areaAcres,
          expectedYieldKgPerAcre,
          sellingPricePerKg,
          seedCostPerAcre,
          fertilizerCostPerAcre,
          pesticideCostPerAcre,
          labourCostPerAcre,
          irrigationCostPerAcre,
          otherCostPerAcre,
          priceVariationPct,
          yieldVariationPct,
          costVariationPct,
          irrigationReductionPct
        })
      });

      const json = await res.json();
      if (json.success) {
        setResult(json.data);
      }
    } catch (err) {
      console.error('Calculation error', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchResources = async () => {
    try {
      const res = await fetch('/api/economics/resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          areaAcres,
          waterRequirementLevel: activeCycle?.crop?.waterRequirementLevel || 'medium',
          estimatedCostPerAcre: (seedCostPerAcre + fertilizerCostPerAcre + pesticideCostPerAcre + labourCostPerAcre + irrigationCostPerAcre + otherCostPerAcre) || 15000
        })
      });
      const json = await res.json();
      if (json.success) {
        setResources(json.data);
      }
    } catch (err) {
      console.error('Resource fetch error', err);
    }
  };

  useEffect(() => {
    runCalculation();
  }, [
    areaAcres, 
    expectedYieldKgPerAcre, 
    sellingPricePerKg,
    seedCostPerAcre,
    fertilizerCostPerAcre,
    pesticideCostPerAcre,
    labourCostPerAcre,
    irrigationCostPerAcre,
    otherCostPerAcre,
    priceVariationPct,
    yieldVariationPct,
    costVariationPct,
    irrigationReductionPct
  ]);

  useEffect(() => {
    fetchResources();
  }, [areaAcres, seedCostPerAcre, fertilizerCostPerAcre, pesticideCostPerAcre, labourCostPerAcre, irrigationCostPerAcre]);

  const cropId = activeCycle?.cropId || 'crop-wheat';
  const cropName = getLocalizedCropName(cropId, language);

  const getLocalizedRiskRating = (riskAssessment: string) => {
    if (language === 'ta') {
      if (riskAssessment === 'severe_loss_risk') return 'உயர் ஆபத்து';
      if (riskAssessment === 'moderate_risk') return 'மிதமான ஆபத்து';
      return 'குறைந்த ஆபத்து';
    }
    if (language === 'ml') {
      if (riskAssessment === 'severe_loss_risk') return 'ഉയർന്ന അപായം';
      if (riskAssessment === 'moderate_risk') return 'മിതമായ അപായം';
      return 'കുറഞ്ഞ അപായം';
    }
    if (riskAssessment === 'severe_loss_risk') return 'Severe Risk';
    if (riskAssessment === 'moderate_risk') return 'Moderate Risk';
    return 'Favorable';
  };

  const getLocalizedGuidance = () => {
    if (!result) return '';
    return result.delta.recommendation;
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header */}
      <div className="card card-elevated" style={{ borderLeft: '4px solid var(--primary-600)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <DollarSign size={24} color="var(--primary-600)" />
              {cropName}: {t.economics.title}
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              {t.economics.subtitle}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <button 
              type="button" 
              onClick={() => setActiveTab('simulator')} 
              className={`btn ${activeTab === 'simulator' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.82rem', padding: '0.4rem 0.8rem' }}
            >
              <Sliders size={14} />
              <span>{language === 'ta' ? 'வருமான உருவகப்படுத்துதல்' : 'What-If Simulator'}</span>
            </button>
            <button 
              type="button" 
              onClick={() => setActiveTab('resources')} 
              className={`btn ${activeTab === 'resources' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.82rem', padding: '0.4rem 0.8rem' }}
            >
              <Droplets size={14} />
              <span>{language === 'ta' ? 'வள மேலாண்மை' : 'Resource Allocation'}</span>
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'resources' && resources ? (
        <div className="card">
          <h3 style={{ fontSize: '1.15rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Droplets size={18} color="var(--sky-blue)" />
            <span>{language === 'ta' ? 'பண்ணை வளங்களின் ஒதுக்கீடு மற்றும் தேவைகள்' : 'Agronomic Resource Allocation & Farm Inputs'}</span>
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div style={{ padding: '0.85rem', background: 'var(--bg-app)', borderRadius: 'var(--radius-md)', borderLeft: '4px solid var(--sky-blue)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{language === 'ta' ? 'மொத்த பாசன நீர் தேவை' : 'Total Irrigation Water Requirement'}</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--sky-blue)', marginTop: '0.2rem' }}>
                {(resources.totalWaterLiters / 1000).toLocaleString()} kL
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                {(resources.waterLitersPerAcre / 1000).toLocaleString()} kL / {t.common.acres} (~{Math.round(resources.waterLitersPerAcre / 4047)} mm)
              </div>
            </div>

            <div style={{ padding: '0.85rem', background: 'var(--bg-app)', borderRadius: 'var(--radius-md)', borderLeft: '4px solid var(--primary-600)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{language === 'ta' ? 'NPK ஊட்டச்சத்து பரிந்துரை' : 'NPK Nutrient Requirement (Total)'}</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary-700)', marginTop: '0.2rem' }}>
                {resources.totalFertilizerKg.nitrogenKg}N : {resources.totalFertilizerKg.phosphorusKg}P : {resources.totalFertilizerKg.potassiumKg}K kg
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                {resources.fertilizerKgPerAcre.nitrogenKg}-{resources.fertilizerKgPerAcre.phosphorusKg}-{resources.fertilizerKgPerAcre.potassiumKg} kg/acre ICAR calibrated
              </div>
            </div>

            <div style={{ padding: '0.85rem', background: 'var(--bg-app)', borderRadius: 'var(--radius-md)', borderLeft: '4px solid var(--harvest-amber)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{language === 'ta' ? 'வேளாண் மனித உழைப்பு நாட்கள்' : 'Total Labor Allocation'}</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--harvest-amber)', marginTop: '0.2rem' }}>
                {resources.totalLaborPersonDays} {language === 'ta' ? 'மனித நாட்கள்' : 'Person-Days'}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                {resources.laborPersonDaysPerAcre} days/acre across lifecycle
              </div>
            </div>

            <div style={{ padding: '0.85rem', background: 'var(--bg-app)', borderRadius: 'var(--radius-md)', borderLeft: '4px solid var(--primary-700)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{language === 'ta' ? 'மொத்த நடைமுறை நிதித் தேவை' : 'Operational Working Capital'}</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.2rem' }}>
                ₹{resources.totalBudgetRequired.toLocaleString()}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                For {areaAcres} {t.common.acres} holding
              </div>
            </div>
          </div>

          <h4 style={{ fontSize: '0.95rem', marginBottom: '0.65rem' }}>{language === 'ta' ? 'உள்ளீட்டுச் செலவுப் பகிர்வு' : 'Input Cost Allocation Breakdown'}</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
            {resources.breakdown.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem' }}>
                <span style={{ width: '220px', flexShrink: 0, fontWeight: 500 }}>{item.category}</span>
                <div style={{ flex: 1, height: '8px', background: 'var(--border-subtle)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                  <div style={{ width: `${item.percentage * 3.5}%`, height: '100%', background: 'var(--primary-600)', borderRadius: 'var(--radius-full)' }} />
                </div>
                <span style={{ width: '90px', textAlign: 'right', fontWeight: 700 }}>₹{item.amount.toLocaleString()}</span>
                <span style={{ width: '45px', textAlign: 'right', color: 'var(--text-muted)' }}>({item.percentage}%)</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid-cols-2">
          {/* Left Column: Baseline Farm Operational Inputs */}
          <div className="card">
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>{t.economics.baselineTitle}</h3>
            
            <div className="grid-cols-2" style={{ gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div className="form-group">
                <label className="form-label">{t.economics.plantedArea}</label>
                <input 
                  type="number" 
                  step="0.5" 
                  min="0.5" 
                  className="form-input" 
                  value={areaAcres} 
                  onChange={e => setAreaAcres(Number(e.target.value))} 
                />
              </div>
              <div className="form-group">
                <label className="form-label">{t.economics.yieldPerAcre}</label>
                <input 
                  type="number" 
                  step="50" 
                  className="form-input" 
                  value={expectedYieldKgPerAcre} 
                  onChange={e => setExpectedYieldKgPerAcre(Number(e.target.value))} 
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">{t.economics.sellingPrice}</label>
              <input 
                type="number" 
                step="0.5" 
                className="form-input" 
                value={sellingPricePerKg} 
                onChange={e => setSellingPricePerKg(Number(e.target.value))} 
              />
            </div>

            <h4 style={{ fontSize: '0.9rem', marginTop: '1rem', marginBottom: '0.65rem' }}>
              {t.economics.inputCostHeader}
            </h4>

            <div className="grid-cols-2" style={{ gap: '0.65rem' }}>
              <div className="form-group">
                <label className="form-label">{t.economics.seeds}</label>
                <input 
                  type="number" 
                  className="form-input" 
                  value={seedCostPerAcre} 
                  onChange={e => setSeedCostPerAcre(Number(e.target.value))} 
                />
              </div>
              <div className="form-group">
                <label className="form-label">{t.economics.fertilizer}</label>
                <input 
                  type="number" 
                  className="form-input" 
                  value={fertilizerCostPerAcre} 
                  onChange={e => setFertilizerCostPerAcre(Number(e.target.value))} 
                />
              </div>
              <div className="form-group">
                <label className="form-label">{t.economics.pesticides}</label>
                <input 
                  type="number" 
                  className="form-input" 
                  value={pesticideCostPerAcre} 
                  onChange={e => setPesticideCostPerAcre(Number(e.target.value))} 
                />
              </div>
              <div className="form-group">
                <label className="form-label">{t.economics.labour}</label>
                <input 
                  type="number" 
                  className="form-input" 
                  value={labourCostPerAcre} 
                  onChange={e => setLabourCostPerAcre(Number(e.target.value))} 
                />
              </div>
              <div className="form-group">
                <label className="form-label">{t.economics.irrigation}</label>
                <input 
                  type="number" 
                  className="form-input" 
                  value={irrigationCostPerAcre} 
                  onChange={e => setIrrigationCostPerAcre(Number(e.target.value))} 
                />
              </div>
              <div className="form-group">
                <label className="form-label">{t.economics.machineryOther}</label>
                <input 
                  type="number" 
                  className="form-input" 
                  value={otherCostPerAcre} 
                  onChange={e => setOtherCostPerAcre(Number(e.target.value))} 
                />
              </div>
            </div>
          </div>

          {/* Right Column: What-If Stress-Test Sliders */}
          <div className="card" style={{ background: 'var(--bg-surface-elevated)' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Sliders size={18} color="var(--sky-blue)" />
              {t.economics.slidersTitle}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
              {/* Irrigation Reduction Sensitivity Slider */}
              <div style={{ padding: '0.65rem 0.85rem', background: 'rgba(59, 130, 246, 0.06)', borderRadius: 'var(--radius-md)', borderLeft: '3px solid var(--sky-blue)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                  <span style={{ fontWeight: 600 }}>💧 {language === 'ta' ? 'பாசன நீர் குறைப்பு (FAO-33)' : 'Irrigation Reduction Scenario'}</span>
                  <strong style={{ color: irrigationReductionPct > 0 ? 'var(--harvest-amber)' : 'var(--text-main)' }}>
                    {irrigationReductionPct > 0 ? `-${irrigationReductionPct}% Water` : 'Full Irrigation (100%)'}
                  </strong>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="50" 
                  step="5" 
                  value={irrigationReductionPct} 
                  onChange={e => setIrrigationReductionPct(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--sky-blue)' }} 
                />
                {result?.simulated?.yieldLossFromWaterStressPct && (
                  <div style={{ fontSize: '0.74rem', color: 'var(--status-warning)', marginTop: '0.25rem' }}>
                    ⚠️ Reduces pumping costs; expected yield impact: -{result.simulated.yieldLossFromWaterStressPct}%
                  </div>
                )}
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                  <span>{t.economics.priceVar}</span>
                  <strong style={{ color: priceVariationPct < 0 ? 'var(--status-urgent)' : 'var(--primary-700)' }}>
                    {priceVariationPct > 0 ? `+${priceVariationPct}` : priceVariationPct}%
                  </strong>
                </div>
                <input 
                  type="range" 
                  min="-50" 
                  max="50" 
                  step="5" 
                  value={priceVariationPct} 
                  onChange={e => setPriceVariationPct(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--sky-blue)' }} 
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                  <span>{t.economics.yieldVar}</span>
                  <strong style={{ color: yieldVariationPct < 0 ? 'var(--status-urgent)' : 'var(--primary-700)' }}>
                    {yieldVariationPct > 0 ? `+${yieldVariationPct}` : yieldVariationPct}%
                  </strong>
                </div>
                <input 
                  type="range" 
                  min="-50" 
                  max="50" 
                  step="5" 
                  value={yieldVariationPct} 
                  onChange={e => setYieldVariationPct(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--harvest-amber)' }} 
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                  <span>{t.economics.costVar}</span>
                  <strong style={{ color: costVariationPct > 0 ? 'var(--status-urgent)' : 'var(--primary-700)' }}>
                    {costVariationPct > 0 ? `+${costVariationPct}` : costVariationPct}%
                  </strong>
                </div>
                <input 
                  type="range" 
                  min="-20" 
                  max="60" 
                  step="5" 
                  value={costVariationPct} 
                  onChange={e => setCostVariationPct(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--status-urgent)' }} 
                />
              </div>

              {/* Quick Scenario Preset Buttons */}
              <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.85rem' }}>
                <button 
                  type="button" 
                  onClick={() => { setIrrigationReductionPct(20); setPriceVariationPct(0); setYieldVariationPct(0); setCostVariationPct(0); }} 
                  className="btn btn-secondary btn-wrap" 
                  style={{ fontSize: '0.74rem', padding: '0.3rem 0.6rem' }}
                >
                  💧 -20% Water
                </button>
                <button 
                  type="button" 
                  onClick={() => { setIrrigationReductionPct(0); setPriceVariationPct(-15); setYieldVariationPct(0); setCostVariationPct(0); }} 
                  className="btn btn-secondary btn-wrap" 
                  style={{ fontSize: '0.74rem', padding: '0.3rem 0.6rem' }}
                >
                  {t.economics.scenarioPriceDrop}
                </button>
                <button 
                  type="button" 
                  onClick={() => { setIrrigationReductionPct(0); setPriceVariationPct(0); setYieldVariationPct(-20); setCostVariationPct(0); }} 
                  className="btn btn-secondary" 
                  style={{ fontSize: '0.74rem', padding: '0.3rem 0.6rem' }}
                >
                  {t.economics.scenarioYieldLoss}
                </button>
                <button 
                  type="button" 
                  onClick={() => { setIrrigationReductionPct(0); setPriceVariationPct(0); setYieldVariationPct(0); setCostVariationPct(0); }} 
                  className="btn btn-secondary" 
                  style={{ fontSize: '0.74rem', padding: '0.3rem 0.6rem' }}
                >
                  {t.economics.resetBase}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Output / Comparison Card */}
      {result && (
        <div className="card card-elevated">
          <h3 style={{ fontSize: '1.15rem', marginBottom: '1rem' }}>{t.economics.resultsTitle}</h3>

          <div className="grid-cols-4">
            <div style={{ padding: '0.75rem', background: 'var(--bg-app)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{t.economics.estRevenue}</div>
              <div style={{ fontSize: '1.35rem', fontWeight: 800 }}>₹{Math.round(result.simulated.grossRevenue).toLocaleString()}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                {t.economics.baselinePrefix}: ₹{Math.round(result.baseline.grossRevenue).toLocaleString()}
              </div>
            </div>

            <div style={{ padding: '0.75rem', background: 'var(--bg-app)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{t.economics.prodCost}</div>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--status-urgent)' }}>
                ₹{Math.round(result.simulated.totalCost).toLocaleString()}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                {t.economics.baselinePrefix}: ₹{Math.round(result.baseline.totalCost).toLocaleString()}
              </div>
            </div>

            <div style={{ padding: '0.75rem', background: 'var(--bg-app)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{t.economics.grossMargin}</div>
              <div style={{ 
                fontSize: '1.35rem', 
                fontWeight: 800, 
                color: result.simulated.grossMargin >= 0 ? 'var(--primary-700)' : 'var(--status-urgent)' 
              }}>
                ₹{Math.round(result.simulated.grossMargin).toLocaleString()}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                {t.economics.shiftPrefix}: ₹{Math.round(result.simulated.marginPerAcre).toLocaleString()}{t.common.perAcre}
              </div>
            </div>

            <div style={{ padding: '0.75rem', background: 'var(--bg-app)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{t.economics.breakeven}</div>
              <div style={{ fontSize: '1.35rem', fontWeight: 800 }}>
                ₹{result.simulated.breakevenPricePerKg.toFixed(2)} / {t.common.kg}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                {t.economics.riskRating}: <strong>{getLocalizedRiskRating(result.delta.riskAssessment)}</strong>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', background: result.simulated.grossMargin >= 0 ? 'var(--primary-50)' : 'var(--status-urgent-bg)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: result.simulated.grossMargin >= 0 ? 'var(--primary-800)' : 'var(--status-urgent)', marginBottom: '0.2rem' }}>
              {t.economics.decisionGuidance}
            </div>
            <div style={{ fontSize: '0.88rem', color: result.simulated.grossMargin >= 0 ? 'var(--primary-900)' : 'var(--status-urgent)' }}>
              {getLocalizedGuidance()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
