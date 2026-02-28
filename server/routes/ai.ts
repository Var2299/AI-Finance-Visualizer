import express, { Router } from 'express';
import { getAIInsights } from '../controllers/geminiController.ts';
import { authMiddleware } from '../middleware/auth.ts';

const router: Router = express.Router();

/**
 * AI INSIGHTS ROUTE
 * POST /api/ai/insights
 * Protected route that returns AI-generated financial advice
 * Requires authentication to access user's transaction data
 */
router.post('/insights', authMiddleware, getAIInsights);

export default router;