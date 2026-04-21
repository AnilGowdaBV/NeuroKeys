import type { Difficulty } from '../types'
import { pickPracticeParagraph } from '../data/practice'
import { buildSentenceFromWeakKeys } from '../utils/textGenerator'

export interface PracticeRequest {
  weakKeys: string[]
  difficulty: Difficulty
  seed?: string
}

export interface CoachFeedback {
  summary: string
  tips: string[]
  pattern?: string
  detailedMessage: string
  syncScore: number
}


// The backend proxy handles authentication securely on Vercel.
const PROXY_URL = '/api/groq';
const MODEL = 'llama-3.3-70b-versatile';

/**
 * Adaptive mode: large shuffled paragraph pool (`data/practice/adaptive`).
 */
export async function generatePracticeText(req: PracticeRequest): Promise<string> {
  try {
    const prompt = `Generate a typing practice text (approx 50 words) for a typist at "${req.difficulty}" difficulty.
Focus on incorporating these weak keys naturally if provided: ${req.weakKeys.join(', ')}.
${req.seed ? `Theme/topic should be related to: ${req.seed}.` : ''}
The text should be natural and engaging. Do not include any quotes, markdown, intros or outros, just the raw plain text.`;

    const response = await fetch(PROXY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      })
    });

    const data = await response.json();
    if (data.choices && data.choices.length > 0) {
       return data.choices[0].message.content.trim();
    }
  } catch (error) {
    console.error('Error fetching practice text from proxy:', error);
  }

  return pickPracticeParagraph('adaptive');
}

/** Optional extra drill line built from weak keys (not wired by default). */
export function weaveWeakKeySentence(
  weakKeys: string[],
  difficulty: Difficulty,
  seed: string,
): string {
  return buildSentenceFromWeakKeys(weakKeys, difficulty, seed)
}

export async function generateCoachFeedback(input: {
  wpm: number
  accuracy: number
  sessionMissedKeys: string[]
  topWeakKeys: string[]
  neuralSyncScore: number
  mode: string
}): Promise<CoachFeedback> {
  try {
    const prompt = `Analyze this typing session data and provide a personalized, comprehensive coaching report.
Data:
- WPM: ${input.wpm}
- Accuracy: ${input.accuracy}%
- Neural Sync Score (Rhythm Consistency): ${input.neuralSyncScore}%
- Keys Missed THIS SESSION: ${input.sessionMissedKeys.join(', ') || 'None'}
- Top Weak Keys (HISTORICAL): ${input.topWeakKeys.join(', ')}
- Mode: ${input.mode}
- Entropy Seed: ${Math.random().toString(36).substring(7)}

Goal: Analyze their session performance. 
IMPORTANT: High "Neural Sync" (>80%) means they found a flow state. Low (<50%) means their rhythm was erratic, possibly indicating panic or lack of confidence. Mention this in your analysis.

You must respond in strict JSON format matching this structure:
{
  "summary": "1 sentence overall summary",
  "tips": ["dynamic tip 1", "dynamic tip 2", "dynamic tip 3"],
  "pattern": "A specific observation about their rhythm/sync vs errors",
  "detailedMessage": "A long, conversational letter starting with 'Dear user,'. Analyze their rhythm (Sync Score) as well as their accuracy. Explain how their rhythm consistency impacted their speed. Be direct and avoid generic boilerplate. Mention the 'Flow State' if sync is high."
}

Do not include any markdown formatting or extra text outside the JSON.`;

    const response = await fetch(PROXY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        response_format: { type: "json_object" }
      })
    });

    const data = await response.json();
    if (data.choices && data.choices.length > 0) {
       const json = JSON.parse(data.choices[0].message.content.trim());
       return {
         ...json,
         syncScore: input.neuralSyncScore
       } as CoachFeedback;
    }
  } catch (error) {
    console.error('Error fetching coach feedback from proxy:', error);
  }

  // Fallback if API call fails
  const tips: string[] = []
  if (input.accuracy < 92) {
    tips.push('Prioritize rhythm over speed until accuracy stays above 95%.')
  }
  if (input.topWeakKeys.length) {
    tips.push(
      `Spend two minutes on drills that repeat “${input.topWeakKeys.slice(0, 3).join(', ')}”.`,
    )
  }
  if (input.wpm < 45) {
    tips.push('Keep eyes on the line ahead, not the fingers — micro-pauses beat corrections.')
  }
  if (!tips.length) {
    tips.push('Stable session. Try Adaptive mode to stress uncommon letters.')
  }

  const summary =
    input.accuracy >= 97
      ? 'Clean accuracy with room to push tempo.'
      : input.accuracy >= 90
        ? 'Solid control — tighten weak letters to unlock speed.'
        : 'Accuracy first: slow down until mistakes are rare, then add pace.'

  const weakKeyMsg = input.topWeakKeys.length > 0 
    ? `You are having some trouble with the ${input.topWeakKeys.slice(0, 3).join(', ')} keys.`
    : "You're building solid fundamentals."

  return {
    summary,
    tips: tips.slice(0, 4),
    pattern:
      input.topWeakKeys.length > 0
        ? `Most friction on: ${input.topWeakKeys.slice(0, 5).join(', ')}`
        : undefined,
    detailedMessage: `Dear user, your performance in this ${input.mode} session shows you're currently at ${input.wpm} WPM. ${weakKeyMsg} To improve, try focusing on accuracy first—speed will naturally follow once your finger movements become automatic. Keep practicing!`,
    syncScore: input.neuralSyncScore
  }
}

export async function generateChatbotResponse(history: {role: string, content: string}[]): Promise<string> {
  try {
    const systemPrompt = {
      role: 'system',
      content: `You are NeuroCoach, an AI typing assistant for the 'NeuroKeys' blind typing app.
You help users with typing techniques, posture, reducing mistakes, breaking plateaus, and navigating the app.
Be concise, friendly, and practical. Keep responses under 3 paragraphs.`
    };

    const response = await fetch(PROXY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: MODEL,
        messages: [systemPrompt, ...history],
        temperature: 0.7,
      })
    });

    const data = await response.json();
    if (data.choices && data.choices.length > 0) {
       return data.choices[0].message.content.trim();
    }
    return "Could not generate a response. Please try again.";
  } catch (error) {
    console.error('Error fetching chatbot response from proxy:', error);
    return "Sorry, I ran into a connection error!";
  }
}
