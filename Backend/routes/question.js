import express from 'express';
import {
  generateQuizWithGroq,
  askQuestion,
  askGeneralQuestion,
  getQuestionHistory,
  rateAnswer,
} from '../controllers/Questioncontroller.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// POST /api/questions/ask - Ask question about specific document
router.post('/ask', authMiddleware, askQuestion);

// POST /api/questions/ask-general - Ask general question across all documents
router.post('/ask-general', authMiddleware, askGeneralQuestion);

// POST /api/questions/generate-quiz - Generate quiz with Groq
router.post('/generate-quiz', authMiddleware, generateQuizWithGroq);

// GET /api/questions/history - Get question history
router.get('/history', authMiddleware, getQuestionHistory);

// PUT /api/questions/:questionId/rate - Rate an answer
router.put('/:questionId/rate', authMiddleware, rateAnswer);

export default router;