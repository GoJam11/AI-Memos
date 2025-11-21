import { GoogleGenAI } from "@google/genai";
import { Memo } from '../types';

// Initialize Gemini Client
// NOTE: process.env.API_KEY is injected by the environment.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateSmartTags = async (content: string): Promise<string[]> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Analyze the following text and suggest up to 3 relevant tags (single words). 
      Return ONLY the tags separated by commas, no hash signs, no extra text.
      
      Text: "${content}"`,
    });

    const text = response.text || '';
    return text.split(',').map(t => t.trim()).filter(t => t.length > 0);
  } catch (error) {
    console.error("Gemini Tag Gen Error:", error);
    return [];
  }
};

export const chatWithMemos = async (
  query: string, 
  memos: Memo[], 
  history: { role: string, parts: { text: string }[] }[]
) => {
  try {
    // Prepare context from recent memos (limit to last 50 to fit context context efficiently)
    const memoContext = memos
      .slice(0, 50)
      .map(m => `[${new Date(m.createdAt).toLocaleDateString()}] ${m.content}`)
      .join('\n---\n');

    const systemInstruction = `You are a personal knowledge assistant embedded in a "Memos" app.
    You have access to the user's recent notes/memos provided below.
    Answer the user's questions based on their notes.
    If the answer isn't in the notes, use your general knowledge but mention that it wasn't found in the memos.
    Keep answers concise and helpful.
    
    User's Memos Context:
    ${memoContext}`;

    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: systemInstruction,
      },
      history: history.map(h => ({
        role: h.role,
        parts: h.parts
      }))
    });

    const result = await chat.sendMessageStream({ message: query });
    return result;

  } catch (error) {
    console.error("Gemini Chat Error:", error);
    throw error;
  }
};