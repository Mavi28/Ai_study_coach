import Question from '../models/Question.js';
import Document from '../models/Document.js';

export const getStrengthsAndWeaknesses = async (req, res) => {
  try {
    console.log('\n🔍 Analyzing strengths and weaknesses...');

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'GROQ_API_KEY not configured' });
    }

    // Fetch all user's questions and performance data
    const questions = await Question.find({ userId: req.user.userId });
    
    if (questions.length === 0) {
      return res.json({
        data: null,
      });
    }

    // Analyze performance by topic
    const topicStats = {};
    questions.forEach(q => {
      const topic = q.topic || 'General';
      if (!topicStats[topic]) {
        topicStats[topic] = {
          correct: 0,
          total: 0,
          scores: [],
          questions: [],
        };
      }
      topicStats[topic].total++;
      topicStats[topic].questions.push(q);
      
      if (q.userFeedback?.helpful) {
        topicStats[topic].correct++;
        topicStats[topic].scores.push(100);
      } else if (q.userFeedback?.rating) {
        topicStats[topic].scores.push(q.userFeedback.rating * 20);
      } else {
        topicStats[topic].scores.push(50);
      }
    });

    // Calculate scores per topic
    const topicAnalysis = Object.entries(topicStats).map(([topic, stats]) => ({
      topic,
      score: Math.round(stats.scores.reduce((a, b) => a + b, 0) / stats.scores.length),
      questionsCorrect: stats.correct,
      totalQuestions: stats.total,
      assessmentCount: Math.ceil(stats.total / 5),
      avgScore: Math.round(stats.scores.reduce((a, b) => a + b, 0) / stats.scores.length),
    })).sort((a, b) => b.score - a.score);

    const strengths = topicAnalysis.filter(t => t.score >= 75);
    const weaknesses = topicAnalysis.filter(t => t.score < 75).sort((a, b) => a.score - b.score);
    const overallScore = Math.round(topicAnalysis.reduce((a, b) => a + b.score, 0) / topicAnalysis.length);

    // Prepare data for Groq analysis
    const analysisData = JSON.stringify({
      strengths: strengths.slice(0, 5).map(s => ({ topic: s.topic, score: s.score })),
      weaknesses: weaknesses.slice(0, 5).map(w => ({ topic: w.topic, score: w.score })),
      overallScore,
      totalAssessments: questions.length,
    });

    const prompt = `Analyze this student's performance data and provide detailed insights.

${analysisData}

Based on this data, provide a comprehensive analysis in this exact JSON format (no markdown):
{
  "strengths": [
    {
      "topic": "Topic name",
      "score": 85,
      "feedback": "Positive feedback about this strength"
    }
  ],
  "weaknesses": [
    {
      "topic": "Topic name",
      "score": 45,
      "recommendation": "Specific improvement strategy for this weakness"
    }
  ],
  "performanceSummary": "1-2 sentence overall performance summary",
  "actionItems": [
    {
      "title": "Action title",
      "description": "Specific action to improve"
    }
  ],
  "improvementRate": "Current improvement percentage",
  "mostImprovedTopic": "Topic with most improvement",
  "scoreDistribution": {
    "excellent": 2,
    "good": 1,
    "fair": 1,
    "poor": 1
  },
  "detailedBreakdown": [
    {
      "topic": "Topic name",
      "score": 65,
      "attempts": 3,
      "avgScore": 65
    }
  ]
}

Make analysis specific and actionable.`;

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
        temperature: 0.7,
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ Groq error:', error);
      // Return basic analysis without Groq insights
      return res.json({
        data: {
          strengths: strengths.map(s => ({
            topic: s.topic,
            score: s.score,
            questionsCorrect: s.questionsCorrect,
            totalQuestions: s.totalQuestions,
            assessmentCount: s.assessmentCount,
            feedback: `Good understanding of ${s.topic}`,
          })),
          weaknesses: weaknesses.map(w => ({
            topic: w.topic,
            score: w.score,
            questionsCorrect: w.questionsCorrect,
            totalQuestions: w.totalQuestions,
            assessmentCount: w.assessmentCount,
            recommendation: `Focus on improving ${w.topic} with more practice`,
          })),
          overallScore,
          totalAssessments: questions.length,
          performanceSummary: 'Keep up your learning journey!',
          actionItems: [],
          improvementRate: '5-10%',
          mostImprovedTopic: strengths[0]?.topic || 'N/A',
          scoreDistribution: {
            excellent: strengths.length,
            good: 0,
            fair: 0,
            poor: weaknesses.length,
          },
          detailedBreakdown: topicAnalysis,
        },
      });
    }

    const data = await response.json();
    const responseText = data.choices?.[0]?.message?.content || '';

    let analysisData_parsed;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisData_parsed = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found');
      }
    } catch (parseError) {
      console.error('Parse error, using default analysis');
      analysisData_parsed = {};
    }

    console.log('✅ Analysis complete');

    res.json({
      data: {
        strengths: (analysisData_parsed.strengths || []).map(s => ({
          ...s,
          questionsCorrect: topicAnalysis.find(t => t.topic === s.topic)?.questionsCorrect || 0,
          totalQuestions: topicAnalysis.find(t => t.topic === s.topic)?.totalQuestions || 0,
          assessmentCount: topicAnalysis.find(t => t.topic === s.topic)?.assessmentCount || 0,
        })),
        weaknesses: (analysisData_parsed.weaknesses || []).map(w => ({
          ...w,
          questionsCorrect: topicAnalysis.find(t => t.topic === w.topic)?.questionsCorrect || 0,
          totalQuestions: topicAnalysis.find(t => t.topic === w.topic)?.totalQuestions || 0,
          assessmentCount: topicAnalysis.find(t => t.topic === w.topic)?.assessmentCount || 0,
        })),
        overallScore: analysisData_parsed.overallScore || overallScore,
        totalAssessments: questions.length,
        performanceSummary: analysisData_parsed.performanceSummary || 'Keep studying!',
        actionItems: analysisData_parsed.actionItems || [],
        improvementRate: analysisData_parsed.improvementRate || '5-10%',
        mostImprovedTopic: analysisData_parsed.mostImprovedTopic || strengths[0]?.topic || 'N/A',
        scoreDistribution: analysisData_parsed.scoreDistribution || {
          excellent: strengths.length,
          good: 0,
          fair: 0,
          poor: weaknesses.length,
        },
        detailedBreakdown: analysisData_parsed.detailedBreakdown || topicAnalysis,
      },
    });

  } catch (error) {
    console.error('❌ Analysis error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

export const generateWeaknessImprovement = async (req, res) => {
  try {
    const { topic } = req.body;

    if (!topic) {
      return res.status(400).json({ error: 'Topic required' });
    }

    console.log(`🎯 Generating improvement plan for: ${topic}`);

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'GROQ_API_KEY not configured' });
    }

    // Get related questions for this topic
    const relatedQuestions = await Question.find({
      userId: req.user.userId,
      topic: topic,
    }).limit(10);

    const questionSummary = relatedQuestions
      .map(q => `Q: ${q.question.substring(0, 100)}`)
      .join('\n');

    const prompt = `Create a detailed 7-day improvement plan for mastering: "${topic}"

Related questions the student struggled with:
${questionSummary || 'General knowledge gaps'}

Generate a specific, actionable improvement plan in this JSON format (no markdown):
{
  "goal": "Clear learning goal",
  "dailyPlans": [
    {
      "day": 1,
      "theme": "Daily theme",
      "activities": ["Activity 1", "Activity 2", "Activity 3"],
      "timeRequired": "45 minutes",
      "resources": ["Resource 1", "Resource 2"]
    }
  ],
  "techniques": [
    {
      "name": "Technique name",
      "description": "How to use it",
      "frequency": "When to practice"
    }
  ],
  "milestones": [
    {
      "day": 3,
      "goal": "What to achieve"
    }
  ],
  "assessment": "How to test mastery"
}

Make it specific to ${topic} and based on proven learning science.`;

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
      return res.status(500).json({ error: 'Failed to generate plan' });
    }

    const data = await response.json();
    const responseText = data.choices?.[0]?.message?.content || '';

    let planData;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        planData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found');
      }
    } catch (parseError) {
      console.error('Parse error');
      return res.status(500).json({ error: 'Failed to parse improvement plan' });
    }

    console.log('✅ Plan generated');

    res.json({
      plan: {
        topic,
        goal: planData.goal || `Master ${topic}`,
        dailyPlans: planData.dailyPlans || [],
        techniques: planData.techniques || [],
        milestones: planData.milestones || [],
        assessment: planData.assessment || 'Take a quiz on this topic',
      },
    });

  } catch (error) {
    console.error('❌ Plan generation error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

export default {
  getStrengthsAndWeaknesses,
  generateWeaknessImprovement,
};