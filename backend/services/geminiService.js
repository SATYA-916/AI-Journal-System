import { GoogleGenAI } from '@google/genai';
import { env } from '../config/env.js';
import { sanitizeJournalText } from '../utils/sanitize.js';

const ai = env.geminiApiKey ? new GoogleGenAI({ apiKey: env.geminiApiKey }) : null;

export async function analyzeJournalText(text) {
  if (!ai) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const safeText = sanitizeJournalText(text);

  const prompt = `You analyze journal sentiment.
Return ONLY valid JSON with this exact schema:
{"emotion":"string","keywords":["string"],"summary":"string"}
Journal text: ${safeText}`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    config: { maxOutputTokens: 512, temperature: 0.2 },
  });

  const rawText = response.text ?? '{}';
  const jsonMatch = rawText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('No JSON found in Gemini response');

  const parsed = JSON.parse(jsonMatch[0]);
  return {
    emotion: String(parsed.emotion || 'neutral').slice(0, 40),
    keywords: Array.isArray(parsed.keywords) ? parsed.keywords.slice(0, 8).map((k) => String(k).slice(0, 40)) : [],
    summary: String(parsed.summary || '').slice(0, 240),
  };
}
