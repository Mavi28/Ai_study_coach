import Document from '../models/Document.js';
import { processPDF } from '../services/pdfService.js';
import { generateDocumentEmbeddings } from '../services/ragService.js';
import fs from 'fs';

// Upload and process document
export const uploadDocument = async (req, res) => {
  try {
    console.log('📤 Upload request received');
    
    if (!req.file) {
      console.log('❌ No file provided');
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log(`📄 File: ${req.file.originalname}, Size: ${req.file.size} bytes`);
    const filePath = req.file.path;

    // Create document record
    const document = new Document({
      userId: req.user.userId,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      processingStatus: 'processing',
    });

    await document.save();
    console.log(`✅ Document created with ID: ${document._id}`);

    // Send response immediately
    res.status(201).json({
      message: 'Document uploaded successfully!',
      documentId: document._id,
      status: 'processing',
    });

    // Process PDF in background (don't wait)
    processPDFInBackground(document._id, filePath);

  } catch (error) {
    console.error('❌ Upload error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Process PDF in background
const processPDFInBackground = async (documentId, filePath) => {
  try {
    console.log(`\n⚡ Starting FAST background processing for document ${documentId}`);
    
    // Extract text and chunks (FAST!)
    const { fullText, chunks, totalPages, totalChunks, topics } = await processPDF(filePath);

    console.log(`✅ PDF processed: ${totalChunks} chunks from ${totalPages} pages`);

    // Generate embeddings (INSTANT!)
    console.log('⚡ Generating embeddings...');
    const chunksWithEmbeddings = await generateDocumentEmbeddings(chunks);

    console.log(`✅ Embeddings generated for ${chunksWithEmbeddings.length} chunks`);

    // Update document
    const document = await Document.findByIdAndUpdate(
      documentId,
      {
        fullText,
        chunks: chunksWithEmbeddings,
        totalPages,
        totalChunks,
        topics,
        processingStatus: 'completed',
      },
      { new: true }
    );

    console.log(`✅ Document ${documentId} ready to use!`);

    // Clean up uploaded file
    try {
      fs.unlinkSync(filePath);
      console.log('🗑️ Temp file cleaned up');
    } catch (err) {
      console.error('Warning: Could not delete file:', err.message);
    }

  } catch (error) {
    console.error(`❌ Error processing document ${documentId}:`, error.message);
    
    try {
      await Document.findByIdAndUpdate(documentId, {
        processingStatus: 'failed',
        processingError: error.message,
      });
      console.log('⚠️ Document marked as failed');
    } catch (updateError) {
      console.error('Error updating status:', updateError.message);
    }

    // Clean up file
    try {
      fs.unlinkSync(filePath);
    } catch (err) {
      console.error('Could not delete file:', err.message);
    }
  }
};

// Get user's documents
export const getDocuments = async (req, res) => {
  try {
    const documents = await Document.find({ userId: req.user.userId })
      .select('fileName uploadedAt totalPages totalChunks topics processingStatus')
      .sort({ uploadedAt: -1 });

    console.log(`📚 Retrieved ${documents.length} documents`);
    res.json({ documents });
  } catch (error) {
    console.error('❌ Error fetching documents:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get single document
export const getDocument = async (req, res) => {
  try {
    const document = await Document.findOne({
      _id: req.params.documentId,
      userId: req.user.userId,
    });

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    res.json({ document });
  } catch (error) {
    console.error('❌ Error fetching document:', error);
    res.status(500).json({ error: error.message });
  }
};

// Delete document
export const deleteDocument = async (req, res) => {
  try {
    const document = await Document.findOneAndDelete({
      _id: req.params.documentId,
      userId: req.user.userId,
    });

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    console.log(`🗑️ Deleted document ${req.params.documentId}`);
    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting document:', error);
    res.status(500).json({ error: error.message });
  }
};

export default {
  uploadDocument,
  getDocuments,
  getDocument,
  deleteDocument,
};