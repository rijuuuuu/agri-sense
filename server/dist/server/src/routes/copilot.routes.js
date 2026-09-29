import { Router } from 'express';
import { askFarmCopilot } from '../services/ai/gemini.service.js';
import { dbStore } from '../services/db/store.js';
export const copilotRouter = Router();
// Retrieve conversation history
copilotRouter.get('/history', (_req, res) => {
    const messages = dbStore.getMessages();
    res.json({
        success: true,
        data: messages,
        provenance: {
            source: 'AgriSense Copilot History Store',
            timestamp: new Date().toISOString(),
            mode: 'LIVE'
        }
    });
});
// Clear conversation history
const clearHistoryHandler = (_req, res) => {
    dbStore.clearMessages();
    res.json({
        success: true,
        data: [],
        message: 'Conversation history cleared.',
        provenance: {
            source: 'AgriSense Copilot History Store',
            timestamp: new Date().toISOString(),
            mode: 'LIVE'
        }
    });
};
copilotRouter.delete('/history', clearHistoryHandler);
copilotRouter.post('/clear', clearHistoryHandler);
// Post a question to Farm Copilot
copilotRouter.post('/chat', async (req, res) => {
    try {
        const { question, language, location } = req.body;
        if (!question || typeof question !== 'string') {
            res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_INPUT',
                    message: 'Question must be a non-empty string.',
                    userFacingMessage: 'Please enter a valid farming question.'
                },
                provenance: {
                    source: 'AgriSense API Gateway',
                    timestamp: new Date().toISOString(),
                    mode: 'LIVE'
                }
            });
            return;
        }
        // Save user message to history
        const userMsg = {
            id: `msg-user-${Date.now()}`,
            conversationId: 'default-conv',
            role: 'user',
            content: question,
            createdAt: new Date().toISOString()
        };
        dbStore.addMessage(userMsg);
        // Generate grounded Copilot response with location awareness
        const result = await askFarmCopilot(question, language, location);
        res.json({
            success: true,
            data: result.message,
            provenance: result.provenance
        });
    }
    catch (err) {
        const msg = err instanceof Error ? err.message : 'Copilot error';
        res.status(500).json({
            success: false,
            error: {
                code: 'COPILOT_PROCESSING_ERROR',
                message: msg,
                userFacingMessage: 'AgriSense Copilot is momentarily unavailable. Please retry in a few moments.'
            },
            provenance: {
                source: 'AgriSense Copilot Service',
                timestamp: new Date().toISOString(),
                mode: 'LIVE'
            }
        });
    }
});
