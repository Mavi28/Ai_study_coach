import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document',
    },
    question: {
      type: String,
      required: true,
    },
    answer: {
      type: String,
      required: true,
    },
    // Which document chunks were used to generate answer
    sourceChunks: [
      {
        chunkIndex: Number,
        chunkText: String,
        similarity: Number, // Relevance score 0-1
      },
    ],
    // User feedback
    userFeedback: {
      helpful: Boolean,
      rating: Number, // 1-5
      comment: String,
    },
    // Metadata
    topic: String,
    processingTime: Number, // milliseconds
  },
  { timestamps: true }
);

// Index for faster queries
questionSchema.index({ userId: 1 });
questionSchema.index({ documentId: 1 });
questionSchema.index({ createdAt: -1 });

const Question = mongoose.model('Question', questionSchema);
export default Question;