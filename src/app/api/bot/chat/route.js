import { NextResponse } from 'next/server';
import connectDB from '@/server/config/db';
import User from '@/server/models/user.model';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENAI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// This is a simplified chat handler for the MVP.
// A production system would use WebSockets and a more complex context management strategy.
export async function POST(req) {
  try {
    await connectDB();

    const { botId, message, conversationHistory = [] } = await req.json();

    if (!botId || !message) {
      return NextResponse.json({ error: 'Bot ID and message are required' }, { status: 400 });
    }

    // In this MVP, we find the user and then the bot. This is not efficient.
    // A production system would query the bot directly by its botId.
    const user = await User.findOne({ 'bots.botId': botId });
    if (!user) {
      return NextResponse.json({ error: 'Bot not found' }, { status: 404 });
    }

    const bot = user.bots.find(b => b.botId === botId);
    if (!bot || !bot.ragContext) {
      return NextResponse.json({ error: 'Bot configuration or RAG context not found' }, { status: 404 });
    }

    const { ragContext } = bot;

    // Check if this is the first message in the conversation
    const isFirstMessage = conversationHistory.length === 0;
    
    // Build a simplified prompt for the MVP
    const prompt = `
      You are an AI assistant for "${ragContext.BUSINESS_PROFILE?.company_name}".
      Your personality should be: ${JSON.stringify(ragContext.CHATBOT_PERSONALITY, null, 2)}.
      
      Strictly use the following information to answer the user's question. Do not use any other knowledge.
      If the answer is not in the provided information, use one of the fallback responses.
      
      IMPORTANT RULES:
      - ${isFirstMessage ? 'This is the first message. Greet the user warmly and introduce yourself briefly.' : 'Do NOT greet the user. This is not the first message.'}
      - You must provide every detail regarding the context you have been given.
      - If user asks the same question again and again which you don't know, you can deny rather than speaking lies.
      - Never speak lies to user in any case ever.
      - Keep responses concise and helpful.

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