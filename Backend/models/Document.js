import mongoose from 'mongoose';

// Individual text chunk from a document
const chunkSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  embedding: {
    type: [Number], // Vector of embeddings
    required: true,
  },
  pageNumber: Number,
  chunkIndex: Number,
});

// Document schema
const documentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    fileSize: Number,
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
    // Extracted text content
    fullText: String,
    // Document metadata
    totalPages: Number,
    totalChunks: {
      type: Number,
      default: 0,
    },
    // Topics/keywords extracted from document
    topics: [String],
    // Text chunks with embeddings
    chunks: [chunkSchema],
    // Processing status
    processingStatus: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
    },
    processingError: String,
  },
  { timestamps: true }
);

// Index for faster queries
documentSchema.index({ userId: 1 });
documentSchema.index({ topics: 1 });

const Document = mongoose.model('Document', documentSchema);
export default Document;