// ⚡ RAG Service - Direct Groq API via fetch (with llama-2-70b-chat)

const simpleHash = (text) => {
  if (!text) return [0];
  let hash = 0;
  for (let i = 0; i < Math.min(text.length, 1000); i++) {
    const char = text.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return [hash / 1000];
};

const cosineSimilarity = (a, b) => {
  if (!a || !b || a.length === 0 || b.length === 0) return 0;
  const dotProduct = a.reduce((sum, val, i) => sum + val * (b[i] || 0), 0);
  const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  if (magnitudeA === 0 || magnitudeB === 0) return 0;
  return dotProduct / (magnitudeA * magnitudeB);
};

export const findRelevantChunks = (question, chunks, topK = 3) => {
  if (!chunks || chunks.length === 0) {
    return [];
  }

  const questionEmbedding = simpleHash(question);
  
  const scored = chunks.map((chunk) => {
    let text = chunk.text || chunk || '';
    if (typeof chunk === 'string') {
      text = chunk;
    }
    
    const embedding = chunk.embedding || simpleHash(text);
    const score = cosineSimilarity(questionEmbedding, embedding);
    
    return {
      text: String(text),
      embedding: embedding,
      score: score,
    };
  });
  
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .filter(c => c.score > -1);
};

export const generateDocumentEmbeddings = async (chunks) => {
  if (!chunks || chunks.length === 0) {
    return [];
  }

  return chunks.map(chunk => {
    let text = chunk.text || chunk || '';
    if (typeof chunk === 'string') {
      text = chunk;
    }
    
    return {
      text: String(text),
      embedding: simpleHash(String(text)),
    };
  });
};

// ⚡ Direct Groq API call via fetch with LLAMA-2
export const generateAnswerWithGroq = async (question, context) => {
  try {
    if (!context || String(context).trim().length === 0) {
      return 'I could not find relevant information to answer your question.';
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      console.error('❌ GROQ_API_KEY not set');
      return 'Error: GROQ_API_KEY not configured';
    }

    console.log('🤖 Calling Groq API...');
    
    const contextStr = String(context).substring(0, 2000);
    const prompt = `Based on this context, answer the question briefly and accurately.

Context:
${contextStr}

Question: ${question}

Answer:`;

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
        max_tokens: 300,
        temperature: 0.7,
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Groq API error:', errorData.error);
      return `Error: ${errorData.error?.message || 'API error'}`;
    }

    const data = await response.json();
    const answer = data.choices?.[0]?.message?.content || 'Could not generate answer';
    
    console.log('✅ Groq response received');
    return answer;
  } catch (error) {
    console.error('❌ Groq error:', error.message);
    return `Error: ${error.message}`;
  }
};

export const processQuestionWithRAG = async (question, chunks, sourceChunks = 3) => {
  try {
    console.log(`⚡ Processing question with ${chunks ? chunks.length : 0} chunks`);
    const startTime = Date.now();
    
    if (!chunks || chunks.length === 0) {
      return {
        answer: 'No document data available.',
        sourceChunks: [],
        processingTime: Date.now() - startTime,
      };
    }

    const relevant = findRelevantChunks(question, chunks, sourceChunks);
    
    if (relevant.length === 0) {
      return {
        answer: 'I could not find relevant information to answer this question.',
        sourceChunks: [],
        processingTime: Date.now() - startTime,
      };
    }

    const context = relevant
      .map(c => String(c.text || ''))
      .filter(t => t.length > 0)
      .join('\n\n');

    if (context.trim().length === 0) {
      return {
        answer: 'No valid content found.',
        sourceChunks: [],
        processingTime: Date.now() - startTime,
      };
    }

    const answer = await generateAnswerWithGroq(question, context);

    const processingTime = Date.now() - startTime;
    console.log(`✅ Complete in ${processingTime}ms`);

    return {
      answer,
      sourceChunks: [context.substring(0, 150)],
      processingTime,
    };
  } catch (error) {
    console.error('❌ RAG error:', error.message);
    throw error;
  }
};

export default {
  findRelevantChunks,
  generateDocumentEmbeddings,
  generateAnswerWithGroq,
  processQuestionWithRAG,
};