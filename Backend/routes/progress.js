import express from 'express';
import { getAnalytics } from '../controllers/progressController.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// GET /api/progress/analytics - Get real analytics
router.get('/analytics', authMiddleware, getAnalytics);

export default router;