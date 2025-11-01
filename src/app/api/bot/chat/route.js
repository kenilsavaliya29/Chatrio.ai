import { NextResponse } from 'next/server';
import connectDB from '@/server/config/db';
import Bot from '@/server/models/bot.model';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENAI_API_KEY);
const model = genAI.getGenerativeModel(
  {
    model: "gemini-2.0-flash",
    generationConfig: {
      maxOutputTokens: 50
    }
  },);

export async function POST(req) {
  try {
    await connectDB();

    const { botId, message, conversationHistory = [] } = await req.json();

    if (!botId || !message) {
      return NextResponse.json({ error: 'Bot ID and message are required' }, { status: 400 });
    }

    const bot = await Bot.findOne({ botId });
    if (!bot || !bot.ragContext) {
      return NextResponse.json({ error: 'Bot configuration or RAG context not found' }, { status: 404 });
    }

    // Check if bot is active
    if (bot.status !== 'active') {
      return NextResponse.json({ error: 'Bot is not active' }, { status: 403 });
    }

    const { ragContext } = bot;

    // Check if this is the first message in the conversation
    const isFirstMessage = conversationHistory.length === 0;

    // Build a simplified prompt for the MVP
    const prompt = `
      You are an AI assistant for "${ragContext.BUSINESS_PROFILE?.name}".
      Your personality should be: ${JSON.stringify(ragContext.CHATBOT_PERSONALITY, null, 2)}.
      
      Strictly use the following information to answer the user's question. Do not use any other knowledge.
      If the answer is not in the provided information, use one of the fallback responses.
      
      IMPORTANT RULES:
      - ${isFirstMessage ? 'This is the first message. Greet the user warmly and introduce yourself briefly.' : 'Do NOT greet the user. This is not the first message.'}
      - You must provide every detail regarding the context you have been given.
      - If user asks the same question again and again which you don't know, you can deny rather than speaking lies.
      - Never speak lies to user in any case ever.
      - Keep responses concise and helpful.
      - Keep responses concise (maximum 30 words).
      - Do not exceed the limit under any circumstance.

      ---
      CONTEXT:
      Business Overview: ${ragContext.BUSINESS_PROFILE?.overview}
      FAQs: ${JSON.stringify(ragContext.COMPREHENSIVE_FAQ_DATABASE, null, 2)}
      ---
      
      CONVERSATION HISTORY:
      ${conversationHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n')}

      CURRENT USER MESSAGE:
      user: ${message}

      RESPONSE:
      assistant:
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({
      success: true,
      response: text,
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json({ error: 'Failed to get chat response.' }, { status: 500 });
  }
} 