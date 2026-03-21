import express from 'express';
import authMiddleware from '../middleware/auth.js';
import { uploadMiddleware } from '../utils/multer.js';
import {
  uploadDocument,
  getDocuments,
  getDocument,
  deleteDocument,
} from '../controllers/documentController.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// POST /api/documents/upload - Upload a PDF
router.post('/upload', uploadMiddleware, uploadDocument);

// GET /api/documents - Get all user's documents
router.get('/', getDocuments);

// GET /api/documents/:documentId - Get specific document
router.get('/:documentId', getDocument);

// DELETE /api/documents/:documentId - Delete document
router.delete('/:documentId', deleteDocument);

export default router;