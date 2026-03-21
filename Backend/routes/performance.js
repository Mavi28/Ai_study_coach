import express from 'express';
import {
  getStrengthsAndWeaknesses,
  generateWeaknessImprovement,
} from '../controllers/performanceController.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// GET /api/performance/strengths-weaknesses - Get real analysis
router.get('/strengths-weaknesses', authMiddleware, getStrengthsAndWeaknesses);

// POST /api/performance/improvement-plan - Generate improvement plan for weak topic
router.post('/improvement-plan', authMiddleware, generateWeaknessImprovement);

export default router;