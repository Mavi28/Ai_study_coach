import express from 'express';
import { generateSmartStudyPlan } from '../controllers/studyPlanController.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// POST /api/study-plan/generate - Generate smart study plan
router.post('/generate', authMiddleware, generateSmartStudyPlan);

export default router;