import Question from '../models/Question.js';
import Document from '../models/Document.js';

// Generate quiz with Groq
export const generateQuizWithGroq = async (req, res) => {
  try {
    const { documentId, documentContent, difficulty, numQuestions } = req.body;

    if (!documentId || !documentContent) {
      return res.status(400).json({ error: 'Missing documentId or content' });
    }

    console.log(`\n🤖 Generating ${difficulty} quiz with ${numQuestions} questions...`);

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'GROQ_API_KEY not configured' });
    }

    // Prepare content for Groq
    const contentSample = documentContent.substring(0, 3000); // First 3000 chars

    const prompt = `You are an expert quiz creator. Generate exactly ${numQuestions} multiple choice questions based on this document content.

DOCUMENT CONTENT:
${contentSample}

DIFFICULTY LEVEL: ${difficulty.toUpperCase()}
- Easy: Basic comprehension questions
- Medium: Application and analysis questions
- Hard: Critical thinking and synthesis questions

REQUIREMENTS:
1. Generate ${numQuestions} UNIQUE questions with VARIED difficulty levels
2. Each question MUST have 4 DIFFERENT options (not all the same!)
3. Exactly ONE correct answer per question
4. Include brief explanation for why the answer is correct
5. Questions should test different aspects: comprehension, analysis, application

Return ONLY valid JSON (no markdown, no code blocks, just raw JSON):
{
  "questions": [
    {
      "id": 0,
      "question": "Full question text here?",
      "options": ["Option A - different from others", "Option B - completely different", "Option C - distinct answer", "Option D - unique option"],
      "correctIndex": 0,
      "explanation": "Why this is correct based on the document"
    }
  ]
}

IMPORTANT: Make sure each option is COMPLETELY DIFFERENT from the others. No similar or duplicate options!`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'user', content: prompt }
        ],
        max_tokens: 2000,
        temperature: 0.8,
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ Groq error:', error);
      return res.status(500).json({ error: 'Failed to generate quiz' });
    }

    const data = await response.json();
    const responseText = data.choices?.[0]?.message?.content || '';

    console.log('📝 Parsing Groq response...');

    // Parse JSON from response
    let quizData;
    try {
      // Try to extract JSON from response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      quizData = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error('❌ JSON parse error:', parseError.message);
      console.log('Response text:', responseText.substring(0, 200));
      return res.status(500).json({ error: 'Failed to parse quiz data' });
    }

    if (!quizData.questions || quizData.questions.length === 0) {
      return res.status(500).json({ error: 'No questions generated' });
    }

    console.log(`✅ Generated ${quizData.questions.length} questions`);

    // Validate questions
    const validQuestions = quizData.questions.map((q, idx) => {
      // Ensure correct index is valid
      const correctIdx = q.correctIndex !== undefined ? q.correctIndex : 0;
      const validIdx = Math.min(correctIdx, (q.options || []).length - 1);

      return {
        id: idx,
        question: q.question || `Question ${idx + 1}`,
        options: q.options && q.options.length === 4 
          ? q.options 
          : ['Option A', 'Option B', 'Option C', 'Option D'], // Fallback
        correctIndex: validIdx,
        explanation: q.explanation || 'Good question!',
      };
    });

    res.json({
      questions: validQuestions,
      difficulty: difficulty,
      count: validQuestions.length,
    });

  } catch (error) {
    console.error('❌ Quiz generation error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

// Existing ask question function (unchanged)
export const askQuestion = async (req, res) => {
  try {
    const { documentId, question } = req.body;

    if (!documentId || !question) {
      return res.status(400).json({ error: 'Missing documentId or question' });
    }

    console.log(`\n❓ Question: "${question}"`);

    const document = await Document.findOne({
      _id: documentId,
      userId: req.user.userId,
    });

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    if (document.processingStatus !== 'completed') {
      return res.status(400).json({ error: 'Document still processing' });
    }

    const { processQuestionWithRAG } = await import('../services/ragService.js');
    const result = await processQuestionWithRAG(question, document.chunks || []);

    const questionRecord = new Question({
      userId: req.user.userId,
      documentId: documentId,
      question: question,
      answer: result.answer || 'No answer generated',
      topic: document.topics?.[0] || 'general',
      processingTime: result.processingTime || 0,
    });

    await questionRecord.save();

    console.log(`✅ Answer saved\n`);

    res.json({
      answer: result.answer,
      sourceChunks: result.sourceChunks || [],
      processingTime: result.processingTime,
    });

  } catch (error) {
    console.error('❌ Question error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

export const askGeneralQuestion = async (req, res) => {
  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({ error: 'Question required' });
    }

    const documents = await Document.find({
      userId: req.user.userId,
      processingStatus: 'completed',
    });

    if (documents.length === 0) {
      return res.json({
        answer: 'No documents available to search.',
        sourceChunks: [],
      });
    }

    let allChunks = [];
    documents.forEach(doc => {
      if (doc.chunks) {
        allChunks = allChunks.concat(doc.chunks);
      }
    });

    if (allChunks.length === 0) {
      return res.json({
        answer: 'No content available to search.',
        sourceChunks: [],
      });
    }

    const { processQuestionWithRAG } = await import('../services/ragService.js');
    const result = await processQuestionWithRAG(question, allChunks);

    res.json({
      answer: result.answer,
      sourceChunks: result.sourceChunks || [],
      processingTime: result.processingTime,
    });

  } catch (error) {
    console.error('❌ General question error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

export const getQuestionHistory = async (req, res) => {
  try {
    const { documentId } = req.query;

    let query = { userId: req.user.userId };
    if (documentId) {
      query.documentId = documentId;
    }

    const questions = await Question.find(query)
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ questions });
  } catch (error) {
    console.error('❌ History error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

export const rateAnswer = async (req, res) => {
  try {
    const { questionId } = req.params;
    const { helpful, rating, comment } = req.body;

    const question = await Question.findOneAndUpdate(
      { _id: questionId, userId: req.user.userId },
      {
        userFeedback: {
          helpful: helpful || false,
          rating: rating || 0,
          comment: comment || '',
        },
      },
      { new: true }
    );

    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    res.json({ message: 'Rating saved', question });
  } catch (error) {
    console.error('❌ Rating error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

export default {
  generateQuizWithGroq,
  askQuestion,
  askGeneralQuestion,
  getQuestionHistory,
  rateAnswer,
};