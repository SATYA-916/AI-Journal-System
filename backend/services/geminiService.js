import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const analysisCache = new Map();

export async function analyzeJournalText(text) {
  const cacheKey = text.trim().toLowerCase();

  if (analysisCache.has(cacheKey)) {
    console.log('Returning cached analysis');
    return analysisCache.get(cacheKey);
  }

  const prompt = `Analyze the following journal entry and return ONLY a valid JSON object with no markdown or code blocks:
{
  "emotion": "<single word emotion>",
  "keywords": ["<keyword1>", "<keyword2>", "<keyword3>"],
  "summary": "<one sentence summary>"
}

Journal entry:
${text}`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    config: { maxOutputTokens: 8192 },
  });

  const rawText = response.text ?? '{}';
  const jsonMatch = rawText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('No JSON found in Gemini response');

  const result = JSON.parse(jsonMatch[0]);
  analysisCache.set(cacheKey, result);
  return result;
}
