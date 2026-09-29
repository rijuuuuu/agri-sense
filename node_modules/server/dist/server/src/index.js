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
import { locationRouter } from './routes/location.routes.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { healthRouter } from './routes/health.routes.js';
dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const possibleClientPaths = [
    path.resolve(process.cwd(), 'client/dist'),
    path.resolve(process.cwd(), '../client/dist'),
    path.resolve(__dirname, '../../../../client/dist'),
    path.resolve(__dirname, '../../../client/dist'),
    path.resolve(__dirname, '../../client/dist')
];
const clientDistPath = possibleClientPaths.find(p => fs.existsSync(p)) || path.resolve(process.cwd(), 'client/dist');
const app = express();
const port = process.env.PORT || 3001;
// Global Middleware
app.use(cors({
    origin: true,
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
// Request logging middleware (excluding sensitive tokens)
app.use((req, _res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.path}`);
    next();
});
// Mount Domain API Routers
app.use('/api/health', healthRouter);
app.use('/api/farmer', farmRouter);
app.use('/api/weather', weatherRouter);
app.use('/api/copilot', copilotRouter);
app.use('/api/crops', cropRouter);
app.use('/api/actions', actionRouter);
app.use('/api/economics', economicsRouter);
app.use('/api/market', marketRouter);
app.use('/api/risk', riskRouter);
app.use('/api/location', locationRouter);
// Static frontend assets serving
if (fs.existsSync(clientDistPath)) {
    app.use(express.static(clientDistPath));
}
// 404 Route Handler for unmatched /api requests
app.all('/api/*', (req, res) => {
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
// SPA Fallback for client-side routing
if (fs.existsSync(clientDistPath)) {
    app.get('*', (_req, res) => {
        res.sendFile(path.join(clientDistPath, 'index.html'));
    });
}
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
    console.log(`🌱 AgriSense Full Web Application & API listening on http://localhost:${port}`);
    console.log(`🌐 Static Web Frontend: ${fs.existsSync(clientDistPath) ? `ACTIVE (${clientDistPath})` : 'NOT FOUND (Run client build)'}`);
    console.log(`📡 Open-Meteo Integration: READY`);
    console.log(`🤖 Gemini AI Copilot: ${process.env.GEMINI_API_KEY ? 'LIVE (@google/genai Connected)' : 'Awaiting GEMINI_API_KEY in server/.env'}`);
});
