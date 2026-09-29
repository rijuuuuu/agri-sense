import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { farmRouter } from './routes/farm.routes.js';
import { weatherRouter } from './routes/weather.routes.js';
import { copilotRouter } from './routes/copilot.routes.js';
import { cropRouter } from './routes/crop.routes.js';
import { actionRouter } from './routes/action.routes.js';
import { economicsRouter } from './routes/economics.routes.js';
import { marketRouter } from './routes/market.routes.js';
import { riskRouter } from './routes/risk.routes.js';
dotenv.config();
const app = express();
const port = process.env.PORT || 3001;
// Global Middleware
app.use(cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
// Request logging middleware (excluding sensitive tokens)
app.use((req, _res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.path}`);
    next();
});
// Root Healthcheck Endpoint
app.get('/api/health', (_req, res) => {
    res.json({
        success: true,
        data: {
            status: 'healthy',
            service: 'AgriSense API Gateway',
            version: '1.0.0',
            timestamp: new Date().toISOString(),
            integrations: {
                weather: { provider: 'Open-Meteo', status: 'ready' },
                gemini: { provider: 'Google GenAI', status: process.env.GEMINI_API_KEY ? 'configured' : 'demo_mode' },
                market: { provider: 'AgriSense Market Engine', status: process.env.MARKET_API_MODE || 'DEMO' },
                database: { provider: process.env.SUPABASE_URL ? 'Supabase' : 'Local Persistence', status: 'ready' }
            }
        },
        provenance: {
            source: 'AgriSense System Telemetry',
            timestamp: new Date().toISOString(),
            mode: 'LIVE'
        }
    });
});
// Mount Domain API Routers
app.use('/api/farmer', farmRouter);
app.use('/api/weather', weatherRouter);
app.use('/api/copilot', copilotRouter);
app.use('/api/crops', cropRouter);
app.use('/api/actions', actionRouter);
app.use('/api/economics', economicsRouter);
app.use('/api/market', marketRouter);
app.use('/api/risk', riskRouter);
// 404 Route Handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: {
            code: 'ROUTE_NOT_FOUND',
            message: `The requested endpoint ${req.method} ${req.path} does not exist.`,
            userFacingMessage: 'Resource not found.'
        },
        provenance: {
            source: 'AgriSense API Router',
            timestamp: new Date().toISOString(),
            mode: 'LIVE'
        }
    });
});
// Global Error Handler
app.use((err, _req, res, _next) => {
    console.error('[AgriSense Error Handler]', err);
    res.status(500).json({
        success: false,
        error: {
            code: 'INTERNAL_SERVER_ERROR',
            message: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred.' : err.message,
            userFacingMessage: 'Our agricultural decision service encountered an issue. Please try again shortly.'
        },
        provenance: {
            source: 'AgriSense System',
            timestamp: new Date().toISOString(),
            mode: 'LIVE'
        }
    });
});
app.listen(port, () => {
    console.log(`🌱 AgriSense Backend API Gateway listening on http://localhost:${port}`);
    console.log(`📡 Open-Meteo Integration: READY`);
    console.log(`🤖 Gemini AI Copilot: ${process.env.GEMINI_API_KEY ? 'LIVE (Configured)' : 'DEMO MODE (Default fallback)'}`);
});
