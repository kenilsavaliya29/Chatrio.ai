import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENAI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

const generateRAGContext = async (reportData) => {
  const prompt = `
You are an expert AI assistant specializing in creating comprehensive RAG (Retrieval-Augmented Generation) systems for chatbots. 

I will provide you with a detailed website scraping report, and you need to create a complete, structured RAG context that will power an intelligent chatbot for this business.

SCRAPING REPORT DATA:
${JSON.stringify(reportData, null, 2)}

Your task is to analyze this data and create a comprehensive RAG context file with the following structure:

1. BUSINESS_PROFILE: Company name, overview, services, target customers, etc.
2. COMPREHENSIVE_FAQ_DATABASE: Create 20+ realistic FAQ pairs covering pricing, services, support, etc.
3. CHATBOT_PERSONALITY: Define tone, communication style, and key phrases.
4. RESPONSE_TEMPLATES: Create templates for welcomes, fallbacks, and calls-to-action.
5. KNOWLEDGE_CHUNKS: Break down the content into small, searchable chunks with categories and keywords.

IMPORTANT GUIDELINES:
- Base all information strictly on the provided scraping report.
- Make responses natural and conversational.
- Avoid generic information; be specific to this business.
- Output a well-structured JSON object that can be directly used to power a chatbot.

Begin processing now:
`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    // Clean the response to ensure it's valid JSON
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
    if (jsonMatch && jsonMatch[1]) {
        return JSON.parse(jsonMatch[1]);
    }
    // Fallback for cases where the response is not in a markdown block
    return JSON.parse(text);

  } catch (error) {
    console.error('❌ Error calling Gemini API:', error.message);
    throw new Error('Failed to generate RAG context from Gemini.');
  }
}

export const processScrapingReport = async (reportData) => {
    console.log('🧠 Starting RAG Processing with Gemini...');
    
    try {
      const ragContext = await generateRAGContext(reportData);
      console.log('✅ RAG Processing Complete!');
      return ragContext;
    } catch (error) {
      console.error('💥 Error processing report:', error.message);
      throw error;
    }
}; 