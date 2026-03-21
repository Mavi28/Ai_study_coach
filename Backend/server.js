import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import documentRoutes from './routes/document.js';
import questionRoutes from './routes/question.js';
import studyPlanRoutes from './routes/studyPlan.js';
import progressRoutes from './routes/progress.js';
import performanceRoutes from './routes/performance.js';





const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/study-plan', studyPlanRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/performance', performanceRoutes);
// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running ✅', version: '2.0.0 (Phase 2 - RAG)' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📚 Version: 2.0.0 (Phase 2 - RAG System)`);
});