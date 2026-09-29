import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  Send, 
  User, 
  Sparkles, 
  ArrowRight, 
  MapPin, 
  Sprout, 
  CloudSun, 
  CheckCircle2, 
  Layers, 
  TrendingUp, 
  RotateCcw,
  Zap,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Info,
  Scale,
  ShieldAlert
} from 'lucide-react';
import type { 
  CopilotMessage, 
  CopilotAction, 
  Farm, 
  FarmerProfile,
  SoilProfile,
  WaterProfile,
  CropCycle, 
  WeatherDataPayload,
  FarmTask,
  UserLocationInfo,
  CropStage
} from '@agrisense/shared';
import type { Language, Translations } from '../../i18n/translations.js';
import { getLocalizedCropName, getLocalizedStage } from '../../i18n/cropNames.js';
import { getLocalizedWeatherDescription } from '../../i18n/localizedEntities.js';

interface CopilotViewProps {
  farmer?: FarmerProfile | null;
  farm: Farm | null;
  soil?: SoilProfile | null;
  water?: WaterProfile | null;
  activeCycle: CropCycle | null;
  weather: WeatherDataPayload | null;
  tasks?: FarmTask[];
  currentLocation?: UserLocationInfo | null;
  initialPrompt?: string;
  onClearInitialPrompt?: () => void;
  language: Language;
  t: Translations;
  onNavigate: (tab: string) => void;
  onUpdateStage: (stage: CropStage) => void;
  onToggleTask: (taskId: string) => void;
  onDetectLocation?: () => void;
  onSelectLanguage?: (lang: Language) => void;
  onOpenProfile?: () => void;
}

const MarkdownMessageBody: React.FC<{ content: string; isUser: boolean }> = ({ content, isUser }) => {
  if (isUser) {
    return <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{content}</div>;
  }

  const lines = content.split('\n');
  const renderedElements: React.ReactNode[] = [];
  let inBlockquote = false;
  let blockquoteLines: string[] = [];

  const flushBlockquote = (key: number) => {
    if (blockquoteLines.length > 0) {
      const bqText = blockquoteLines.join('\n');
      const isWarning = bqText.includes('⚠️') || bqText.toLowerCase().includes('uncertainty') || bqText.toLowerCase().includes('അനിശ്ചിതത്വം') || bqText.toLowerCase().includes('நிச்சயமற்ற');
      renderedElements.push(
        <div 
          key={`bq-${key}`}
          style={{
            margin: '0.65rem 0',
            padding: '0.65rem 0.85rem',
            borderRadius: 'var(--radius-md)',
            background: isWarning ? 'rgba(217, 119, 6, 0.1)' : 'rgba(59, 130, 246, 0.08)',
            borderLeft: isWarning ? '4px solid var(--harvest-amber)' : '4px solid var(--sky-blue)',
            color: 'var(--text-main)',
            fontSize: '0.86rem',
            lineHeight: 1.45
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.45rem' }}>
            <span style={{ flexShrink: 0, marginTop: '1px' }}>{isWarning ? '⚠️' : 'ℹ️'}</span>
            <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontWeight: 500 }}>
              {bqText.replace(/^>\s*/, '').replace(/^⚠️\s*/, '')}
            </div>
          </div>
        </div>
      );
      blockquoteLines = [];
      inBlockquote = false;
    }
  };

  lines.forEach((line, idx) => {
    if (line.startsWith('>')) {
      inBlockquote = true;
      blockquoteLines.push(line.replace(/^>\s*/, ''));
    } else {
      if (inBlockquote) {
        flushBlockquote(idx);
      }
      
      if (line.startsWith('### ')) {
        renderedElements.push(
          <div key={`h3-${idx}`} style={{ fontWeight: 800, fontSize: '0.98rem', color: 'var(--text-main)', marginTop: idx > 0 ? '0.65rem' : '0', marginBottom: '0.35rem' }}>
            {line.replace('### ', '')}
          </div>
        );
      } else if (line.startsWith('**') && line.endsWith('**') && line.length < 60) {
        renderedElements.push(
          <div key={`subh-${idx}`} style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-main)', marginTop: '0.45rem', marginBottom: '0.2rem' }}>
            {line.replace(/\*\*/g, '')}
          </div>
        );
      } else {
        renderedElements.push(
          <div key={`p-${idx}`} style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', minHeight: line.trim() ? undefined : '0.4rem' }}>
            {line}
          </div>
        );
      }
    }
  });

  if (inBlockquote) {
    flushBlockquote(lines.length);
  }

  return <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>{renderedElements}</div>;
};

export const CopilotView: React.FC<CopilotViewProps> = ({
  farmer,
  farm,
  soil,
  water,
  activeCycle,
  weather,
  tasks = [],
  currentLocation,
  initialPrompt,
  onClearInitialPrompt,
  language,
  t,
  onNavigate,
  onUpdateStage,
  onToggleTask,
  onDetectLocation,
  onSelectLanguage,
  onOpenProfile
}) => {
  const [messages, setMessages] = useState<CopilotMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showModelDetails, setShowModelDetails] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const cropId = activeCycle?.cropId || 'crop-wheat';
  const cropName = getLocalizedCropName(cropId, language);
  const rawStage = (activeCycle?.currentStage || 'vegetative') as CropStage;
  const stage = getLocalizedStage(rawStage, language);
  const weatherDesc = weather ? getLocalizedWeatherDescription(weather.current.weatherDescription, language) : '';
  const farmerName = farmer?.fullName || (language === 'ta' ? 'விவசாயி' : language === 'ml' ? 'കർഷകൻ' : 'Farmer');
  const farmName = farm?.farmName || (language === 'ta' ? 'பண்ணை' : language === 'ml' ? 'കൃഷിയിടം' : 'Primary Farm');
  const pendingTasksCount = tasks.filter(t => !t.completed).length;

  // Load conversation history or construct welcoming context message
  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/copilot/history');
      const json = await res.json();
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        setMessages(json.data);
      } else {
        let welcomeContent = '';
        let citations: string[] = [];

        if (language === 'ta') {
          welcomeContent = `வணக்கம் **${farmerName}**! நான் உங்கள் **அக்ரிசென்ஸ் விவசாய AI வழிகாட்டி**.

உங்கள் **${farmName}** (${currentLocation?.district || farm?.villageDistrict || 'உள்ளூர்'}, ${currentLocation?.state || farm?.stateProvince || 'தமிழ்நாடு'}) பண்ணை நிலவரம்:
- **பயிர்:** ${cropName} (${stage})
- **வானிலை:** ${weather ? `${weather.current.temperatureCelsius}°C, ${weatherDesc}` : 'நேரடி அளவீடு'}
- **இன்றைய பணிகள்:** ${pendingTasksCount} பணிகள் உள்ளன

பாசனம், உரம், பயிர் பரிந்துரை அல்லது சந்தை விலை குறித்து என்னிடம் கேட்கலாம்!`;
        } else if (language === 'ml') {
          welcomeContent = `നമസ്കാരം **${farmerName}**! ഞാൻ നിങ്ങളുടെ **അഗ്രിസെൻസ് കാർഷിക AI സഹായി**.

നിങ്ങളുടെ **${farmName}** (${currentLocation?.district || farm?.villageDistrict || 'പ്രാദേശികം'}, ${currentLocation?.state || farm?.stateProvince || 'കേരളം'}) കൃഷിയിട വിവരങ്ങൾ:
- **വിള:** ${cropName} (${stage})
- **കാലാവസ്ഥ:** ${weather ? `${weather.current.temperatureCelsius}°C, ${weatherDesc}` : 'തത്സമയം'}
- **ഇന്നത്തെ ജോലികൾ:** ${pendingTasksCount} ജോലികൾ ഉണ്ട്

നന, വളം, വിപണി നിരക്കുകൾ അല്ലെങ്കിൽ വിള ശുപാർശകൾ എന്നിവയെക്കുറിച്ച് എന്ത് സംശയവും ചോദിക്കാം!`;
        } else {
          welcomeContent = `Hello **${farmerName}**! I am your **AgriSense Farm Copilot**.

I'm ready to assist with your farm in **${currentLocation?.district || farm?.villageDistrict || 'your area'}, ${currentLocation?.state || farm?.stateProvince || ''}**:
- **Standing Crop:** ${cropName} (${stage})
- **Weather:** ${weather ? `${weather.current.temperatureCelsius}°C, ${weather.current.weatherDescription}` : 'Live telemetry active'}
- **Tasks Today:** ${pendingTasksCount} tasks scheduled

Ask me any questions about your irrigation, spraying, crop recommendations, or market prices!`;
        }

        citations = [];

        setMessages([
          {
            id: 'welcome-msg',
            conversationId: 'default-conv',
            role: 'assistant',
            content: welcomeContent,
            createdAt: new Date().toISOString(),
            groundingCitations: citations,
            action: { type: 'navigate', target: 'dashboard', label: 'View Farm Dashboard' }
          }
        ]);
      }
    } catch (err) {
      console.error('Failed to load copilot history', err);
    }
  };

  const handleClearHistory = async () => {
    try {
      await fetch('/api/copilot/history', { method: 'DELETE' });
      await fetchHistory();
    } catch (err) {
      console.error('Failed to clear copilot history', err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [language]);

  // Handle passed initial prompt from other views
  useEffect(() => {
    if (initialPrompt) {
      sendMessage(initialPrompt);
      if (onClearInitialPrompt) onClearInitialPrompt();
    }
  }, [initialPrompt]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleExecuteAction = (act: CopilotAction) => {
    switch (act.type) {
      case 'navigate':
        if (act.target) onNavigate(act.target);
        break;
      case 'update_stage':
        if (act.target) onUpdateStage(act.target as CropStage);
        break;
      case 'complete_task':
        if (act.target) onToggleTask(act.target);
        break;
      case 'detect_location':
        if (onDetectLocation) onDetectLocation();
        break;
      case 'switch_language':
        if (act.target && onSelectLanguage) onSelectLanguage(act.target as Language);
        break;
      case 'open_modal':
        if (onOpenProfile) onOpenProfile();
        break;
      default:
        break;
    }
  };

  const sendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    const userText = textToSend.trim();
    setInput('');
    setError(null);
    setLoading(true);

    const tempUserMsg: CopilotMessage = {
      id: `temp-${Date.now()}`,
      conversationId: 'default-conv',
      role: 'user',
      content: userText,
      createdAt: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempUserMsg]);

    try {
      const activeLocation = {
        district: currentLocation?.district || farm?.villageDistrict,
        state: currentLocation?.state || farm?.stateProvince,
        latitude: currentLocation?.latitude || farm?.latitude,
        longitude: currentLocation?.longitude || farm?.longitude,
        farmName: farm?.farmName
      };

      const res = await fetch('/api/copilot/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          question: userText, 
          language,
          location: activeLocation
        })
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.userFacingMessage || 'Failed to get response');
      }

      setMessages(prev => [...prev, json.data]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error communicating with AgriSense Copilot');
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const quickChips = [
    { label: language === 'ta' ? '👋 வணக்கம்' : language === 'ml' ? '👋 നമസ്കാരം' : '👋 Hi Copilot', query: 'hi' },
    { label: language === 'ta' ? '🌾 பரிந்துரை காரணிகள்' : language === 'ml' ? '🌾 വിള ശുപാർശ ഘടകങ്ങൾ' : '🌾 Why was this crop recommended?', query: 'Why was this crop recommended for my farm?' },
    { label: language === 'ta' ? '🌦️ வானிலை காரணிகள் தாக்கம்' : language === 'ml' ? '🌦️ കാലാവസ്ഥ സ്വാധീനം' : '🌦️ How weather affects recommendations', query: 'How does the current weather affect irrigation and spraying recommendations?' },
    { label: language === 'ta' ? '🛡️ ஆபத்துக் குறியீடு விளக்கம்' : language === 'ml' ? '🛡️ അപായ സാധ്യത അവലോകനം' : '🛡️ Explain Farm Risk Score', query: 'Explain my farm risk score and active drivers' },
    { label: language === 'ta' ? '📉 விலை 10% குறைந்தால் என்னவாகும்?' : language === 'ml' ? '📉 വില 10% കുറഞ്ഞാൽ?' : '📉 What if market price drops 10%?', query: 'What happens to my farm profit if market price drops 10%?' },
    { label: language === 'ta' ? '⚖️ தரவு நிச்சயமற்ற தன்மை' : language === 'ml' ? '⚖️ ഡാറ്റാ കൃത്യതയും പരിമിതികളും' : '⚖️ What uncertainty exists in the data?', query: 'What uncertainty exists in weather and mandi data?' },
    { label: language === 'ta' ? '💧 இன்று பாசனம் செய்யலாமா?' : language === 'ml' ? '💧 ഇന്ന് നനയ്ക്കണമോ?' : '💧 Should I irrigate today?', query: 'Should I irrigate today?' },
    { label: language === 'ta' ? '💰 சந்தை நிலவரம்' : language === 'ml' ? '💰 വിപണി നിരക്കുകൾ' : '💰 State Mandi Rates', query: `What are the market prices in ${currentLocation?.state || farm?.stateProvince || 'Tamil Nadu'}?` },
    { label: language === 'ta' ? '🌱 பயிர் நிலையை மாற்று' : language === 'ml' ? '🌱 വിള ഘട്ടം മാറ്റുക' : '🌱 Update Crop Stage', query: 'Update crop stage to flowering' },
    { label: language === 'ta' ? '🚜 இன்றைய பணிகள்' : language === 'ml' ? '🚜 ഇന്നത്തെ ജോലികൾ' : "🚜 Today's Farm Tasks", query: 'What tasks do I have scheduled for today?' },
    { label: language === 'ta' ? '🩺 இலை மஞ்சள் நிற மாற்றம்' : language === 'ml' ? '🩺 இല മഞ്ഞളിപ്പ് കാരണം' : '🩺 Yellow Leaves Cause', query: 'Why are the lower leaves turning yellow on my crop?' }
  ];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', height: 'calc(100dvh - 165px)', minHeight: '460px', width: '100%', maxWidth: '100%', overflowX: 'hidden' }}>
      {/* 1. Context Telemetry Strip */}
      <div className="card" style={{ 
        padding: '0.75rem 1.15rem', 
        background: 'linear-gradient(135deg, rgba(22, 163, 74, 0.08), rgba(217, 119, 6, 0.08))', 
        borderLeft: '4px solid var(--primary-600)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.65rem'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.65rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ 
              width: '36px', 
              height: '36px', 
              borderRadius: 'var(--radius-full)', 
              background: 'linear-gradient(135deg, var(--primary-600), var(--harvest-amber))', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: '#fff',
              boxShadow: '0 2px 8px rgba(22, 163, 74, 0.3)'
            }}>
              <Bot size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span>{t.copilot.title}</span>
                <span className="badge badge-live" style={{ fontSize: '0.7rem', padding: '0.15rem 0.45rem' }}>
                  <Zap size={10} /> Active & Grounded
                </span>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Connected to <strong>{farmerName}</strong>'s holding: <strong>{farmName}</strong>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.45rem', alignItems: 'center' }}>
            {/* Clear Chat Button */}
            <button
              type="button"
              onClick={handleClearHistory}
              className="btn btn-secondary"
              style={{
                padding: '0.28rem 0.65rem',
                fontSize: '0.76rem',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                borderRadius: 'var(--radius-md)'
              }}
              title="Clear conversation history"
              id="clear-chat-btn"
            >
              <RotateCcw size={12} color="var(--text-secondary)" />
              <span>{language === 'ta' ? 'அரட்டையை அழி' : language === 'ml' ? 'സംഭാഷണം ഒഴിവാക്കുക' : 'Clear Chat'}</span>
            </button>

            {/* Model Transparency Button */}
            <button
              type="button"
              onClick={() => setShowModelDetails(prev => !prev)}
              className="btn btn-secondary"
              style={{
                padding: '0.28rem 0.65rem',
                fontSize: '0.76rem',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                borderRadius: 'var(--radius-md)'
              }}
            >
              <ShieldCheck size={13} color="var(--primary-600)" />
              <span>Grounded on 6 Live Models</span>
              {showModelDetails ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </button>
          </div>
        </div>

        {/* Live Context Badges */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <span className="badge" style={{ background: 'var(--bg-app)', border: '1px solid var(--border-subtle)', fontSize: '0.76rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Sprout size={12} color="var(--primary-600)" />
            {cropName} ({stage})
          </span>
          <span className="badge" style={{ background: 'var(--bg-app)', border: '1px solid var(--border-subtle)', fontSize: '0.76rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <CloudSun size={12} color="var(--sky-blue)" />
            {weather ? `${weather.current.temperatureCelsius}°C, ${weather.current.rainProbabilityPct}% rain` : 'Weather Telemetry'}
          </span>
          <span className="badge" style={{ background: 'var(--bg-app)', border: '1px solid var(--border-subtle)', fontSize: '0.76rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <MapPin size={12} color="var(--primary-600)" />
            {currentLocation?.district || farm?.villageDistrict || 'Field'}, {currentLocation?.state || farm?.stateProvince || 'State'}
          </span>
          <span className="badge" style={{ background: 'var(--bg-app)', border: '1px solid var(--border-subtle)', fontSize: '0.76rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <CheckCircle2 size={12} color="var(--primary-700)" />
            {pendingTasksCount} Tasks Pending
          </span>
        </div>

        {/* Expandable Model & Uncertainty Details Drawer */}
        {showModelDetails && (
          <div style={{
            marginTop: '0.4rem',
            padding: '0.85rem',
            background: 'var(--bg-app)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-strong)',
            fontSize: '0.8rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.65rem'
          }}>
            <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-main)' }}>
              <Layers size={14} color="var(--primary-600)" />
              Active Agronomic Models & Data Pipelines Grounding Your Copilot:
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.6rem' }}>
              <div style={{ padding: '0.5rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <strong>🌾 Crop Recommendation Engine:</strong> Evaluates Soil pH ({soil?.phLevel || 6.8}), soil type ({soil?.soilType || 'alluvial'}), and seasonal window.
              </div>
              <div style={{ padding: '0.5rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <strong>🛡️ 5-Factor Risk Engine:</strong> Weighted aggregate (Weather 30%, Water 25%, Stage 20%, Market 15%, Cost 10%).
              </div>
              <div style={{ padding: '0.5rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <strong>📊 What-If Economics Model:</strong> Dynamic gross margin, breakeven cost/kg, and price drop shock testing.
              </div>
              <div style={{ padding: '0.5rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <strong>🌦️ Open-Meteo High-Res Radar:</strong> 3-hour grid spatial resolution for rainfall, temperature, and wind.
              </div>
            </div>

            <div style={{
              padding: '0.55rem 0.75rem',
              background: 'rgba(217, 119, 6, 0.09)',
              borderLeft: '3px solid var(--harvest-amber)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-main)',
              lineHeight: 1.45
            }}>
              <strong style={{ color: 'var(--harvest-amber)' }}>⚠️ AgriSense Uncertainty Transparency Policy:</strong>
              <div>Weather telemetry past 24–48 hours carries meteorological variance. APMC Mandi rates represent wholesale terminal yard auctions and may differ from farmgate cash due to grading (FAQ standards), moisture deductions, and freight. Remote disease screening provides probability indicators; on-field scouting is strongly recommended before chemical applications.</div>
            </div>
          </div>
        )}
      </div>

      {/* 2. Chat Conversation Scroll Area */}
      <div className="card" style={{ 
        flex: 1, 
        overflowY: 'auto', 
        padding: '1.25rem', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '1.15rem',
        background: 'var(--bg-app)',
        border: '1px solid var(--border-subtle)'
      }}>
        {messages.map((msg, index) => {
          const isUser = msg.role === 'user';
          return (
            <div 
              key={msg.id || index}
              style={{
                display: 'flex',
                gap: '0.75rem',
                flexDirection: isUser ? 'row-reverse' : 'row',
                alignItems: 'flex-start'
              }}
            >
              {/* Avatar */}
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--radius-full)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                background: isUser ? 'var(--primary-600)' : 'linear-gradient(135deg, var(--primary-700), var(--harvest-amber))',
                color: '#fff',
                boxShadow: isUser ? 'none' : '0 2px 6px rgba(22, 163, 74, 0.25)'
              }}>
                {isUser ? <User size={16} /> : <Bot size={17} />}
              </div>

              {/* Message Bubble Card */}
              <div style={{
                maxWidth: '88%',
                padding: '0.95rem 1.25rem',
                borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                background: isUser ? 'var(--primary-700)' : 'var(--bg-card)',
                color: isUser ? '#ffffff' : 'var(--text-main)',
                boxShadow: 'var(--shadow-sm)',
                border: isUser ? 'none' : '1px solid var(--border-subtle)',
                lineHeight: 1.55,
                fontSize: '0.92rem'
              }}>
                {/* Formatted Message Content */}
                <MarkdownMessageBody content={msg.content} isUser={isUser} />

                {/* Interactive Action Execution Button */}
                {msg.action && (
                  <div style={{ 
                    marginTop: '0.85rem', 
                    paddingTop: '0.75rem', 
                    borderTop: isUser ? '1px solid rgba(255,255,255,0.2)' : '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    flexWrap: 'wrap'
                  }}>
                    <button
                      type="button"
                      onClick={() => handleExecuteAction(msg.action!)}
                      className="btn btn-primary"
                      style={{
                        padding: '0.42rem 0.9rem',
                        fontSize: '0.84rem',
                        fontWeight: 700,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.45rem',
                        borderRadius: 'var(--radius-md)',
                        boxShadow: '0 2px 8px rgba(22, 163, 74, 0.3)'
                      }}
                      id={`action-btn-${index}`}
                    >
                      <Sparkles size={14} />
                      <span>{msg.action.label}</span>
                      <ArrowRight size={13} />
                    </button>
                    <span style={{ fontSize: '0.74rem', color: isUser ? 'rgba(255,255,255,0.8)' : 'var(--text-muted)' }}>
                      (Click to execute directly inside AgriSense)
                    </span>
                  </div>
                )}

              </div>
            </div>
          );
        })}

        {/* Loading Indicator Bubble */}
        {loading && (
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-full)',
              background: 'linear-gradient(135deg, var(--primary-700), var(--harvest-amber))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff'
            }}>
              <Bot size={17} />
            </div>
            <div style={{
              padding: '0.75rem 1.15rem',
              background: 'var(--bg-card)',
              borderRadius: '16px 16px 16px 4px',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.88rem',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <span className="spinner" style={{ width: '14px', height: '14px', borderWidth: '2px' }} />
              <span>Analyzing agronomic models, telemetry, and market conditions...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 3. Quick Chips Bar */}
      <div style={{
        display: 'flex',
        gap: '0.45rem',
        overflowX: 'auto',
        padding: '0.2rem 0',
        whiteSpace: 'nowrap',
        maxWidth: '100%',
        WebkitOverflowScrolling: 'touch'
      }}>
        {quickChips.map((chip, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => sendMessage(chip.query)}
            disabled={loading}
            className="btn btn-secondary"
            style={{
              padding: '0.32rem 0.75rem',
              fontSize: '0.8rem',
              fontWeight: 600,
              borderRadius: 'var(--radius-full)',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-strong)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
              cursor: 'pointer',
              flexShrink: 0
            }}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* 4. Chat Input Bar */}
      <div className="card" style={{ 
        padding: '0.65rem 0.85rem', 
        background: 'var(--bg-surface-elevated)',
        border: '1px solid var(--border-strong)',
        boxShadow: 'var(--shadow-md)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.65rem'
      }}>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            language === 'ta' 
              ? `உங்கள் AI வழிகாட்டியிடம் கேட்கவும் (எ.கா. 'பரிந்துரை காரணிகள்', 'வானிலை தாக்கம்', 'ஆபத்து விளக்கம்')...` 
              : language === 'ml' 
              ? `AI സഹായിയോട് ചോദിക്കുക (ഉദാ: 'ശുപാർശ ഘടകങ്ങൾ', 'കാലാവസ്ഥ സ്വാധീനം', 'റിസ്ക് സ്കോർ')...` 
              : `Ask AgriSense Copilot (e.g. 'why recommended?', 'how weather affects advice', 'explain risk score')...`
          }
          disabled={loading}
          className="form-input"
          style={{
            flex: 1,
            border: 'none',
            background: 'transparent',
            color: 'var(--text-main)',
            padding: '0.5rem 0.65rem',
            fontSize: '0.92rem',
            outline: 'none',
            boxShadow: 'none'
          }}
          id="copilot-query-input"
        />

        <button
          type="button"
          onClick={() => sendMessage(input)}
          disabled={!input.trim() || loading}
          className="btn btn-primary"
          style={{
            padding: '0.55rem 1.1rem',
            fontSize: '0.88rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            borderRadius: 'var(--radius-md)'
          }}
          id="copilot-send-btn"
        >
          <span>{language === 'ta' ? 'அனுப்பு' : language === 'ml' ? 'അയക്കുക' : 'Send'}</span>
          <Send size={15} />
        </button>
      </div>

      {error && (
        <div style={{
          padding: '0.5rem 0.85rem',
          background: 'var(--status-urgent-bg)',
          color: 'var(--status-urgent)',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.82rem'
        }}>
          {error}
        </div>
      )}
    </div>
  );
};
