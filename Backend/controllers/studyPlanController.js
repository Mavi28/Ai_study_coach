import Document from '../models/Document.js';

export const generateSmartStudyPlan = async (req, res) => {
  try {
    const { userAnswers, selectedDocuments } = req.body;

    console.log('\n🤖 Generating smart study plan with Groq...');

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'GROQ_API_KEY not configured' });
    }

    // Get document info
    const docs = await Document.find({
      _id: { $in: selectedDocuments },
      userId: req.user.userId,
    }).select('fileName topics');

    const docInfo = docs.map(d => `${d.fileName} (Topics: ${d.topics?.join(', ') || 'general'})`).join(', ');

    const prompt = `You are an expert educational psychologist and study coach. Based on the user's learning profile, create a personalized study plan.

USER LEARNING PROFILE:
- Learning Style: ${userAnswers.learningStyle || 'Not specified'}
- Study Goal: ${userAnswers.studyGoal || 'Not specified'}
- Daily Time Available: ${userAnswers.timeAvailable || 'Not specified'}
- Pace Preference: ${userAnswers.pacePreference || 'Not specified'}
- Current Knowledge Level: ${userAnswers.strengths || 'Not specified'}
- Documents to Study: ${docInfo}

Create a REAL, actionable study plan using evidence-based learning science principles. Include:
1. Spaced repetition for long-term retention
2. Active recall practices
3. Interleaving techniques
4. Deliberate practice methods
5. Feynman Technique elements
6. Pomodoro-based time management

Return ONLY valid JSON (no markdown, no code blocks):
{
  "overview": "Brief overview matching their learning style and goals",
  "recommendedMethod": "Specific study method based on their style (e.g., 'For visual learners: use mind maps and diagrams. For auditory: explain concepts aloud. For reading/writing: detailed notes. For kinesthetic: hands-on practice')",
  "weeklySchedule": [
    {
      "day": "Monday",
      "focus": "Topic focus",
      "duration": "Time needed",
      "technique": "Study technique to use"
    }
  ],
  "dailyRoutine": [
    {
      "time": "8:00 AM",
      "activity": "Activity description",
      "tip": "Quick tip"
    }
  ],
  "studyTechniques": [
    {
      "name": "Technique name",
      "description": "How to use it",
      "whenToUse": "When it's most effective"
    }
  ],
  "milestones": [
    {
      "week": "Week 1",
      "goal": "Specific measurable goal"
    }
  ],
  "tipsForSuccess": [
    "Tip 1 tailored to their learning style",
    "Tip 2 addressing their goal"
  ]
}

Make sure ALL advice is personalized to their specific learning style, goals, and available time.`;

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
        max_tokens: 3000,
        temperature: 0.9,
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ Groq error:', error);
      return res.status(500).json({ error: 'Failed to generate study plan' });
    }

    const data = await response.json();
    const responseText = data.choices?.[0]?.message?.content || '';

    console.log('📝 Parsing study plan...');

    // Parse JSON
    let planData;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found');
      }
      planData = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error('❌ Parse error:', parseError.message);
      return res.status(500).json({ error: 'Failed to parse study plan' });
    }

    console.log('✅ Study plan generated');

    res.json({
      plan: {
        overview: planData.overview || 'Personalized study plan created',
        recommendedMethod: planData.recommendedMethod || 'Mixed method approach',
        weeklySchedule: planData.weeklySchedule || [],
        dailyRoutine: planData.dailyRoutine || [],
        studyTechniques: planData.studyTechniques || [],
        milestones: planData.milestones || [],
        tipsForSuccess: planData.tipsForSuccess || [],
      },
    });

  } catch (error) {
    console.error('❌ Study plan error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

export default {
  generateSmartStudyPlan,
};