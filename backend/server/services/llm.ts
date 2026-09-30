import { GoogleGenAI, Type } from '@google/genai';

let aiInstance: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI | null {
  if (process.env.MOCK_LLM === '1') {
    return null;
  }
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiInstance;
}

export async function generateWithGemini<T = any>(prompt: string, schemaDescription?: string): Promise<T | null> {
  const client = getGeminiClient();
  if (!client) return null;

  try {
    const response = await client.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    });

    let text = response.text?.trim();
    if (!text) return null;

    // Strip markdown code fences if present
    if (text.startsWith('```json')) {
      text = text.slice(7);
    } else if (text.startsWith('```')) {
      text = text.slice(3);
    }
    if (text.endsWith('```')) {
      text = text.slice(0, -3);
    }
    text = text.trim();

    return JSON.parse(text) as T;
  } catch (err) {
    console.warn('[Gemini LLM Warning] Falling back to grounded dataset logic:', err instanceof Error ? err.message : err);
    return null;
  }
}
