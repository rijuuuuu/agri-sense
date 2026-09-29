# 🌱 AgriSense — AI-Powered Agricultural Decision-Support Platform

AgriSense is an enterprise-grade agricultural decision-support platform designed to help farmers transform complex, fragmented agricultural data into actionable, high-confidence farming decisions throughout the complete crop lifecycle:

$$\text{LAND} \rightarrow \text{SOIL} \rightarrow \text{WATER} \rightarrow \text{CROP} \rightarrow \text{WEATHER} \rightarrow \text{MANAGEMENT} \rightarrow \text{COST} \rightarrow \text{RISK} \rightarrow \text{MARKET} \rightarrow \text{SELLING}$$

Unlike generic chatbots or disconnected weather apps, AgriSense links physical field telemetry directly to agronomic rules and financial outcomes.

---

## 🚀 Key Modules & System Features

1. **Farmer & Farm Profiler (Phase 2):**
   - Captures land acreage, geographical coordinates (lat/long), agro-climatic zones, and farmer experience.
   - Soil profile: texture (alluvial, black, red, clay loam), pH level, organic matter, and drainage quality.
   - Water security profile: source (borewell, canal, rainfed, farm pond), availability status, and irrigation method (drip, sprinkler, flood).

2. **Open-Meteo Agro-Meteorological Integration (Phase 4):**
   - Real-time 7-day temperature, rainfall probability, humidity, and wind speed forecasts with 30-minute in-memory caching.
   - Agricultural interpretation layer:
     - Automated irrigation status (`proceed`, `caution`, `postpone`) based on precipitation thresholds.
     - Chemical/foliar spray advisories based on wind speed and humidity.
     - Heat stress alerts and waterlogging mitigation warnings.

3. **Grounded AI Farm Copilot (Phase 5):**
   - Context-grounded advisory powered by Google Gemini (Gemini 1.5/2.0 Flash) with transparent local fallback.
   - Grounded strictly in the farmer's standing crop, stage, soil pH, and real-time weather.
   - Strict anti-hallucination guardrails and uncertainty markers; always advises verified consultation with local agricultural extension officers (KVK / Agronomists) for hazardous agrochemicals.

4. **Deterministic Crop Recommendation Engine (Phase 6):**
   - Algorithmic matching against seasonal windows (Kharif, Rabi, Zaid) and soil tolerances.
   - Provides duration, water intensity, management complexity, estimated gross margin per acre, and potential risks without fabricated promises.

5. **Today's Farm Action Center (Phase 7):**
   - Proactive daily decision center prioritizing tasks: irrigation scheduling, stage-specific crop scouting, weather defense, and nutrient application windows.
   - Interactive checklist with complete data provenance and traceability rationale for each task.

6. **8-Stage Crop Lifecycle Management (Phase 8):**
   - Tracks plantings through: `Planning` $\rightarrow$ `Planting` $\rightarrow$ `Germination` $\rightarrow$ `Vegetative` $\rightarrow$ `Flowering` $\rightarrow$ `Fruiting` $\rightarrow$ `Harvest` $\rightarrow$ `Selling`.
   - Adapts management guidance and risk thresholds dynamically as the crop matures.

7. **Market Intelligence (Phase 9):**
   - Transparent 3-state integration architecture: `LIVE` (verified API), `DEMO` (reference APMC benchmarks), and `NOT_CONFIGURED`.
   - Real-time modal prices, min/max rates, price trends (rising/stable/falling), and selling timing considerations.

8. **Deterministic Farm Economics & What-If Simulator (Phase 10):**
   - Pure algorithmic financial calculation (revenue, input costs, gross margin, breakeven rate).
   - Interactive sensitivity sliders: test market price fluctuations ($-30\%$ to $+30\%$), weather-induced yield losses, or input cost inflation to assess farm profitability under uncertainty.

9. **Formula-Based Risk Center (Phase 11):**
   - Multi-factor risk model:
     $$\text{Risk Index} = (\text{Weather} \times 30\%) + (\text{Water Security} \times 25\%) + (\text{Crop Vulnerability} \times 20\%) + (\text{Market Volatility} \times 15\%) + (\text{Input Cost} \times 10\%)$$
   - Active alerts with concrete mitigation defenses and documented methodology.

---

## 🛠️ Architecture & Tech Stack

- **Frontend:** Vite + React 19 + TypeScript.
- **Styling:** Custom Vanilla CSS Design System with CSS Variables, HSL color tokens, dark/light mode toggle, and accessible typography (`Outfit` and `Inter` via Google Fonts).
- **Backend:** Node.js + Express API Gateway with modular domain routers.
- **Shared Layer:** Shared TypeScript domain types and Zod validation schemas (`@agrisense/shared`).
- **Database / Persistence:** PostgreSQL / Supabase SQL schema migrations (`supabase/migrations/`) with Row Level Security (RLS) policies and local persistence store (`data/agrisense_store.json`).
- **Integrations:**
  - Open-Meteo REST API (free, live weather & agro-meteorology).
  - Google Gemini AI (live when `GEMINI_API_KEY` configured, rich grounded fallback when offline).
  - Wholesale Agricultural Mandi Feeds (APMC modal benchmarks).

---

## ⚙️ Environment Configuration

Copy `.env.example` to `server/.env`:

```bash
# Server Port
PORT=3001
NODE_ENV=development

# Google Gemini AI Key (Optional: enables live Gemini Flash Copilot)
GEMINI_API_KEY=

# Supabase Configuration (Optional: required when connecting to remote cloud database)
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Open-Meteo Base URL
OPEN_METEO_BASE_URL=https://api.open-meteo.com/v1

# Market Intelligence Integration Mode: LIVE | DEMO | NOT_CONFIGURED
MARKET_API_MODE=DEMO
MARKET_API_KEY=
```

---

## 💻 Running AgriSense Locally

### 1. Install Dependencies
```bash
npm install --prefix client
npm install --prefix server
```

### 2. Start Both Client and Backend Server
```bash
# Start backend server (Port 3001)
npm run dev --prefix server

# In a separate terminal, start Vite client (Port 5173)
npm run dev --prefix client
```
Open **`http://localhost:5173/`** in your browser.

### 3. Run Automated Unit & Domain Tests
```bash
npm test --prefix server
```
Executes all contract and domain formula tests:
- Baseline farm economics and What-If simulation accuracy.
- Agronomic crop recommendation matrix matching.
- Agro-meteorological irrigation and spraying rule triggers.
- Formula-based weighted risk index computation.
- API gateway health and 404 provenance envelopes.

---

## 🔒 Security & Safety Principles

1. **Zero Secret Exposure:** Client code never has access to external API keys. All calls are secured behind the Express API Gateway.
2. **Multi-Tenant Isolation:** Supabase Row Level Security (RLS) policies ensure farmers can only access their own farm, soil, and task records.
3. **Agrochemical Safety Boundaries:** The AI Copilot explicitly disclaims certainty for acute plant diseases and directs farmers to verified extension specialists (KVK / Agronomists).
4. **Data Transparency:** Every single insight, task, weather alert, and market price is tagged with provenance metadata and its integration state (`LIVE` or `DEMO`).
