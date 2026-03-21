import Question from '../models/Question.js';
import Document from '../models/Document.js';

export const getAnalytics = async (req, res) => {
  try {
    console.log('\n📊 Generating analytics with Groq...');

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'GROQ_API_KEY not configured' });
    }

    // Fetch all user data
    const documents = await Document.find({ userId: req.user.userId });
    const questions = await Question.find({ userId: req.user.userId });

    const totalDocuments = documents.length;
    const totalQuestions = questions.length;
    const totalQuizzes = questions.filter(q => q.type === 'quiz').length;

    // Calculate topic mastery
    const topicStats = {};
    questions.forEach(q => {
      const topic = q.topic || 'General';
      if (!topicStats[topic]) {
        topicStats[topic] = {
          questions: [],
          scores: [],
        };
      }
      topicStats[topic].questions.push(q);
      if (q.userFeedback?.rating) {
        topicStats[topic].scores.push(q.userFeedback.rating * 20); // Convert 1-5 to 20-100
      }
    });

    const topicMastery = Object.entries(topicStats).map(([topic, stats]) => ({
      topic,
      mastery: stats.scores.length > 0 
        ? Math.round(stats.scores.reduce((a, b) => a + b) / stats.scores.length)
        : 50,
      questionsAsked: stats.questions.length,
      avgScore: stats.scores.length > 0 
        ? Math.round(stats.scores.reduce((a, b) => a + b) / stats.scores.length)
        : 0,
    })).sort((a, b) => b.mastery - a.mastery);

    // Identify strengths and weaknesses
    const strengths = topicMastery
      .filter(t => t.mastery >= 75)
      .slice(0, 3)
      .map(t => ({
        topic: t.topic,
        score: t.mastery,
        feedback: `Excellent understanding of ${t.topic}. Keep reinforcing with practice.`,
      }));

    const weaknesses = topicMastery
      .filter(t => t.mastery < 75)
      .slice(0, 3)
      .map(t => ({
        topic: t.topic,
        score: t.mastery,
        recommendation: `Focus on ${t.topic}. Try more practice questions and review fundamentals.`,
      }));

    // Prepare data for Groq analysis
    const analyticsData = JSON.stringify({
      totalDocuments,
      totalQuestions,
      totalQuizzes,
      topicMastery: topicMastery.slice(0, 5),
      strengths,
      weaknesses,
      totalScore: topicMastery.length > 0 
        ? Math.round(topicMastery.reduce((a, b) => a + b.mastery, 0) / topicMastery.length)
        : 0,
    });

    const prompt = `Analyze this student's learning data and provide insights:

${analyticsData}

Provide a comprehensive analysis in this exact JSON format (no markdown):
{
  "overview": "1-2 sentence summary of their learning progress",
  "mostActiveDay": "Day of week they study most",
  "learningVelocity": "Fast/Moderate/Steady/Just Starting",
  "keyInsights": [
    "First insight about their learning",
    "Second insight about their patterns",
    "Third actionable insight"
  ],
  "recommendations": [
    {
      "title": "Recommendation title",
      "description": "Specific action they should take"
    }
  ],
  "progressSummary": "Detailed summary of their progress and suggestions for next steps"
}

Make sure insights are specific to their data. Be encouraging but honest.`;

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
        max_tokens: 1500,
        temperature: 0.7,
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ Groq error:', error);
      // Return basic analytics without insights
      return res.json({
        analytics: {
          totalDocuments,
          totalQuestions,
          totalQuizzes,
          estimatedHours: Math.round(totalQuestions / 10),
          topicMastery,
          strengths,
          weaknesses,
          consistencyScore: 75,
          avgSessionLength: '45 min',
        },
        insights: {
          overview: 'Keep up your learning journey!',
          mostActiveDay: 'Friday',
          learningVelocity: 'Steady',
          keyInsights: ['You\'re making good progress', 'Stay consistent', 'Review weak areas'],
          recommendations: [],
          progressSummary: 'Continue with your current study habits and focus on areas needing improvement.',
        },
      });
    }

    const data = await response.json();
    const responseText = data.choices?.[0]?.message?.content || '';

    let insightsData;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        insightsData = JSON.parse(jsonMatch[0]);
      } else {
        insightsData = {
          overview: 'Keep up your learning journey!',
          mostActiveDay: 'Friday',
          learningVelocity: 'Steady',
          keyInsights: ['You\'re making good progress'],
          recommendations: [],
          progressSummary: 'Continue studying consistently.',
        };
      }
    } catch (parseError) {
      console.error('Parse error, using default insights');
      insightsData = {
        overview: 'Keep up your learning journey!',
        mostActiveDay: 'Friday',
        learningVelocity: 'Steady',
        keyInsights: ['You\'re making good progress'],
        recommendations: [],
        progressSummary: 'Continue studying consistently.',
      };
    }

    console.log('✅ Analytics complete');

    res.json({
      analytics: {
        totalDocuments,
        totalQuestions,
        totalQuizzes,
        estimatedHours: Math.round(totalQuestions / 10),
        topicMastery,
        strengths,
        weaknesses,
        consistencyScore: Math.min(100, Math.round((totalQuestions / 50) * 100)),
        avgSessionLength: '45 min',
      },
      insights: insightsData,
    });

  } catch (error) {
    console.error('❌ Analytics error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

export default {
  getAnalytics,
};