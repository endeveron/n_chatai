import { ShortTermMemoryNode } from '@/core/features/chat/types';
import { HarmBlockThreshold, HarmCategory } from '@google/generative-ai';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';

export const llm = new ChatGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY,
  model: 'gemini-2.0-flash-lite',
  maxOutputTokens: 100,
  temperature: 1,
  safetySettings: [
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
  ],
});

export const shortTermMemory: ShortTermMemoryNode[] = [];
