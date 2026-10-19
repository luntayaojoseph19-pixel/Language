import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

app.use(express.json());

const ai = new GoogleGenAI();

// Endpoint 1: Generate AI Custom Lesson
app.post('/api/generate-lesson', async (req, res) => {
  const { language = 'Spanish', topic = 'Greetings', level = 'Beginner' } = req.body;

  try {
    const prompt = `You are an expert language curriculum designer.
Generate a structured, authentic micro-lesson for learning ${language} on the topic "${topic}" at level "${level}".

Return ONLY valid JSON matching this schema with NO markdown code fences:
{
  "title": "Short engaging English title",
  "nativeTitle": "Native language title",
  "description": "Engaging 1-2 sentence description",
  "level": "${level}",
  "category": "${topic}",
  "estimatedMinutes": 3,
  "xpReward": 35,
  "cultureTip": "A fascinating 1-sentence cultural or etiquette tip",
  "grammarTip": "A practical 1-sentence grammatical tip",
  "exercises": [
    {
      "id": "ex-1",
      "type": "multiple_choice",
      "instructions": "Select the correct translation",
      "prompt": "Question prompt in English",
      "targetPhrase": "Sentence in ${language}",
      "phoneticSpelling": "[phonetic pronunciation bracketed]",
      "translation": "English translation",
      "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
      "correctIndex": 0,
      "explanation": "Why this answer is correct"
    },
    {
      "id": "ex-2",
      "type": "sentence_builder",
      "instructions": "Assemble the words in order",
      "prompt": "English meaning",
      "targetPhrase": "Sentence in ${language}",
      "translation": "English translation",
      "scrambledTokens": ["word1", "word2", "word3", "word4"],
      "correctTokens": ["word1", "word2", "word3", "word4"],
      "explanation": "Grammar order explanation"
    },
    {
      "id": "ex-3",
      "type": "voice_challenge",
      "instructions": "Tap the mic and speak clearly",
      "prompt": "Speak this phrase:",
      "targetPhrase": "Natural spoken phrase in ${language}",
      "phoneticSpelling": "[phonetic bracketed]",
      "translation": "English translation",
      "pronunciationTip": "Tip on tongue placement, tonic stress, or vowel purity"
    },
    {
      "id": "ex-4",
      "type": "listening_comprehension",
      "instructions": "Listen to the audio and select the meaning",
      "prompt": "What does the speaker express?",
      "targetPhrase": "Phrase in ${language}",
      "phoneticSpelling": "[phonetic bracketed]",
      "translation": "English translation",
      "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
      "correctIndex": 1,
      "explanation": "Contextual usage explanation"
    },
    {
      "id": "ex-5",
      "type": "voice_challenge",
      "instructions": "Speak this conversational phrase",
      "prompt": "Say farewell or courteous remark:",
      "targetPhrase": "Polite natural phrase in ${language}",
      "phoneticSpelling": "[phonetic bracketed]",
      "translation": "English translation",
      "pronunciationTip": "Keep breath steady and rhythm natural"
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    const text = response.text?.trim() || '{}';
    const parsed = JSON.parse(text);

    return res.json({
      success: true,
      lesson: parsed
    });
  } catch (err: any) {
    console.warn('Lesson generation fallback:', err?.message || err);
    return res.status(500).json({
      success: false,
      error: 'AI generation unavailable'
    });
  }
});

// Endpoint 2: Analyze Voice Pronunciation
app.post('/api/analyze-pronunciation', async (req, res) => {
  const { targetPhrase, userTranscript, language, phoneticGuide, level = 'Beginner' } = req.body;

  try {
    const prompt = `You are a native ${language} speech and pronunciation coach.
The learner (level: ${level}) was prompted to say:
"${targetPhrase}"
Phonetic guide: ${phoneticGuide || 'N/A'}

The speech-to-text audio transcript captured:
"${userTranscript || '(silence/inaudible)'}"

Analyze the acoustic fidelity, phoneme accuracy, and fluency.
Return ONLY valid JSON matching this schema:
{
  "overallScore": number (0 to 100, e.g. 92),
  "fluencyScore": number (0 to 100),
  "accuracyScore": number (0 to 100),
  "feedback": "Encouraging, actionable 1-2 sentence coaching advice focusing on mouth posture, accent, or vowel sounds",
  "wordFeedback": [
    {
      "word": "word",
      "status": "perfect" | "good" | "needs_work",
      "tip": "optional short tip"
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    const text = response.text?.trim() || '{}';
    const parsed = JSON.parse(text);
    return res.json(parsed);
  } catch (err: any) {
    console.warn('Pronunciation analysis fallback:', err?.message || err);
    return res.status(500).json({ error: 'AI analysis unavailable' });
  }
});

// Endpoint 3: AI Roleplay Tutor Chat
app.post('/api/ai-tutor-chat', async (req, res) => {
  const { language = 'Spanish', scenario = 'Café Ordering', level = 'Beginner', messages = [] } = req.body;

  try {
    const historyText = messages
      .map((m: any) => `${m.role === 'user' ? 'Learner' : 'Coach'}: ${m.content}`)
      .join('\n');

    const prompt = `You are a friendly, encouraging native ${language} conversational partner.
Scenario: ${scenario}
Learner Level: ${level}

Conversation so far:
${historyText}

Respond as the native partner in the conversation.
Keep your response concise (1-2 sentences), natural, authentic, and appropriate for ${level} level.
Also provide:
1. English translation of your reply
2. Any gentle grammatical or pronunciation correction if the learner made a mistake
3. Three quick suggested responses the learner might reply with in ${language}
4. 1 to 3 key vocabulary words or idioms used in this exchange

Return ONLY valid JSON with this schema:
{
  "reply": "Your reply in ${language}",
  "translation": "English translation",
  "correction": "Optional tip or empty string",
  "suggestedResponses": [
    "Suggested reply 1 in ${language}",
    "Suggested reply 2 in ${language}",
    "Suggested reply 3 in ${language}"
  ],
  "vocabularyUsed": [
    {
      "word": "key word or idiom",
      "translation": "meaning",
      "phonetic": "[phonetic guide]"
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    const text = response.text?.trim() || '{}';
    const parsed = JSON.parse(text);
    return res.json(parsed);
  } catch (err: any) {
    console.warn('Tutor chat fallback:', err?.message || err);
    return res.status(500).json({ error: 'AI tutor chat unavailable' });
  }
});

// Endpoint 4: Summarize Conversation Session
app.post('/api/summarize-session', async (req, res) => {
  const { language = 'Spanish', scenario = 'Conversation', messages = [] } = req.body;

  try {
    const transcript = messages
      .map((m: any) => `${m.role === 'user' ? 'Learner' : 'Coach'}: ${m.content}`)
      .join('\n');

    const prompt = `You are an expert ${language} language coach.
Analyze this completed practice conversation session in ${language} for the scenario "${scenario}":

TRANSCRIPT:
${transcript}

Produce a structured session summary to accelerate the learner's fluency.
Return ONLY valid JSON matching this schema:
{
  "scenarioTitle": "${scenario}",
  "totalExchanges": ${messages.length},
  "overallPerformance": "1-2 sentence warm assessment of the learner's fluency and confidence",
  "usefulVocabulary": [
    { "word": "word", "translation": "translation", "phonetic": "[phonetic]" }
  ],
  "grammarCorrections": [
    { "original": "what learner said or phrasing", "corrected": "more authentic phrasing", "explanation": "why this is better" }
  ],
  "suggestions": [
    "Practical suggestion 1 for next time",
    "Practical suggestion 2 for next time"
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    const text = response.text?.trim() || '{}';
    const parsed = JSON.parse(text);
    return res.json(parsed);
  } catch (err: any) {
    console.warn('Session summary fallback:', err?.message || err);
    return res.status(500).json({ error: 'Session summary unavailable' });
  }
});

// Dev / Production Vite Mount
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`LinguaPulse server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
