import { NextResponse } from 'next/server';
import { scrapeWebsite } from '@/server/utils/scraper';
import { processScrapingReport } from '@/server/utils/rag-processor';
import connectDB from '@/server/config/db';
import { cookies } from 'next/headers';
import { verifyToken } from '@/server/utils/jwt.utils';
import User from '@/server/models/user.model';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req) {
  console.log('[API /process-data] Request received.');
  try {
    // Check for required environment variables first
    if (!process.env.GOOGLE_GENAI_API_KEY) {
      throw new Error('GOOGLE_GENAI_API_KEY is not set in environment variables');
    }

    await connectDB();
    console.log('[API /process-data] Database connection successful.');

    // Get and await the cookie store
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    console.log(`[API /process-data] Token verified for user: ${decoded.id}`);

    const body = await req.json();
    console.log('[API /process-data] Request body:', body);

    const { url, name, botId } = body;
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch (e) {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
    }

    console.log(`[API /process-data] Starting processing for URL: ${url}`);

    // --- MVP Step 1: Scrape website ---
    console.log('[API /process-data] Step 1: Starting web scraper...');
    const scrapingReport = await scrapeWebsite(url);
    
    if (scrapingReport.error) {
      console.error('[API /process-data] Scraping failed:', scrapingReport.error);
      return NextResponse.json({ 
        error: `Failed to scrape website: ${scrapingReport.error}`,
        details: scrapingReport.errors 
      }, { status: 500 });
    }
    console.log('[API /process-data] Scraping completed successfully.');

    // --- MVP Step 2: Generate RAG context ---
    console.log('[API /process-data] Step 2: Starting RAG processing...');
    const ragContext = await processScrapingReport(scrapingReport);
    if (!ragContext) {
      throw new Error('RAG context generation failed');
    }
    console.log('[API /process-data] RAG context generated successfully.');

    // --- MVP Step 3: Store in MongoDB ---
    console.log(`[API /process-data] Step 3: Finding user ${decoded.id} in DB...`);
    const user = await User.findById(decoded.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let finalBotId;
    
    if (botId) {
      // Bot already exists as draft, update it
      console.log(`[API /process-data] Updating existing bot: ${botId}`);
      const existingBot = user.bots.find(bot => bot.botId === botId);
      if (existingBot) {
        existingBot.ragContext = ragContext;
        existingBot.scrapingReport = scrapingReport;
        // Initialize process object if it doesn't exist
        if (!existingBot.process) {
          existingBot.process = {
            reports: false,
            customization: false,
            deployed: false
          };
        }
        existingBot.process.reports = true;
        existingBot.updatedAt = new Date();
        finalBotId = botId;
      } else {
        return NextResponse.json({ error: 'Bot draft not found' }, { status: 404 });
      }
    } else {
      // Create new bot
      finalBotId = uuidv4();
      console.log(`[API /process-data] Generated new bot ID: ${finalBotId}`);

    const newBotData = {
        botId: finalBotId,
      name: name || 'My New Bot',
      url: url,
      status: 'processing',
      ragContext: ragContext,
      scrapingReport: scrapingReport,
        process: {
          reports: true,
          customization: false,
          deployed: false
        },
      createdAt: new Date(),
    };
    
    if (!user.bots) {
      user.bots = [];
    }
    user.bots.push(newBotData);
    }

    console.log('[API /process-data] Saving bot data to database...');
    await user.save();
    console.log('[API /process-data] Bot data saved successfully.');

    return NextResponse.json({ 
      success: true, 
      message: 'Website processed successfully!',
      botId: finalBotId,
      ragContext: ragContext
    });

  } catch (error) {
    console.error('[API /process-data] Critical error:', error);
    console.error('Error stack trace:', error.stack);
    
    // Send a more detailed error response
    return NextResponse.json({ 
      error: error.message || 'Failed to process website',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
} 