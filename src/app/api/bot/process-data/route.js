import { NextResponse } from 'next/server';
import { scrapeWebsite } from '@/server/utils/scraper';
import { processScrapingReport } from '@/server/utils/rag-processor';
import connectDB from '@/server/config/db';
import { cookies } from 'next/headers';
import { verifyToken } from '@/server/utils/jwt.utils';
import Bot from '@/server/models/bot.model';
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

    const userId = decoded.id;

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

    let finalBotId;
    let botExists = false;

    const updateProgress = async (botId, { percent, step, message, status }) => {
      try {
        const bot = await Bot.findOne({ userId, botId });
        if (!bot) return;
        bot.process = bot.process || {};
        bot.process.processing = bot.process.processing || {};
        if (typeof percent === 'number') bot.process.processing.progressPercent = percent;
        if (step) bot.process.processing.step = step;
        if (message !== undefined) bot.process.processing.message = message;
        if (status) bot.process.processing.status = status;
        bot.process.processing.lastUpdated = new Date();
        await bot.save();
      } catch (e) {
        console.error('[API /process-data] Failed to update progress:', e);
      }
    };

    if (botId) {
      // Attempt to find and update an existing bot for this user
      const existingBot = await Bot.findOne({ userId, botId });
      if (existingBot) {
        existingBot.status = 'processing';
        existingBot.url = url;
        existingBot.name = name || existingBot.name;
        existingBot.updatedAt = new Date();
        await existingBot.save();
        finalBotId = botId;
        botExists = true;
        console.log(`[API /process-data] Updating existing bot ${botId} to processing status.`);
      } else {
        return NextResponse.json({ error: 'Bot not found for this user' }, { status: 404 });
      }
    } else {
      // Create a new bot document
      finalBotId = uuidv4();
      await Bot.create({
        userId,
        botId: finalBotId,
        name: name || 'My New Bot',
        url,
        status: 'processing',
        process: {
          reports: false,
          customization: false,
          deployed: false,
          processing: {
            progressPercent: 0,
            step: 'queued',
            status: 'processing',
            message: 'Job queued',
            lastUpdated: new Date()
          }
        },
        createdAt: new Date()
      });
      console.log(`[API /process-data] Created new bot ${finalBotId} with processing status.`);
    }

    // --- TEMPORARY: Synchronous Processing for Local Testing ---
    // In production, this entire block (scraping and RAG) MUST be moved to a background worker.
    console.log(`[API /process-data] Starting background processing for bot ${finalBotId} (TEMPORARY SYNC).`);

    let processingSuccess = true;
    let processingMessage = 'Bot processing initiated.';

    try {
      // Step 1: Scrape website
      console.log('[API /process-data] Step 1: Starting web scraper...');
      await updateProgress(finalBotId, { percent: 15, step: 'scraping', message: 'Scraping website…' });
      const scrapingReport = await scrapeWebsite(url);

      if (scrapingReport.error) {
        throw new Error(`Failed to scrape website: ${scrapingReport.error}`);
      }
      console.log('[API /process-data] Scraping completed successfully.');
      await updateProgress(finalBotId, { percent: 45, step: 'scraping', message: 'Scraping completed.' });

      // Step 2: Generate RAG context
      console.log('[API /process-data] Step 2: Starting RAG processing...');
      await updateProgress(finalBotId, { percent: 55, step: 'rag', message: 'Generating knowledge base…' });
      const ragContext = await processScrapingReport(scrapingReport);
      if (!ragContext) {
        throw new Error('RAG context generation failed');
      }
      console.log('[API /process-data] RAG context generated successfully.');
      await updateProgress(finalBotId, { percent: 85, step: 'rag', message: 'Knowledge base generated.' });

      // Update bot with processed data and set status to active
      const botToUpdate = await Bot.findOne({ userId, botId: finalBotId });
      if (!botToUpdate) throw new Error('Bot not found after processing.');
      botToUpdate.ragContext = ragContext;
      botToUpdate.scrapingReport = scrapingReport;
      botToUpdate.process = botToUpdate.process || {};
      botToUpdate.process.reports = true;
      botToUpdate.status = 'active';
      botToUpdate.updatedAt = new Date();
      await botToUpdate.save();
      console.log(`[API /process-data] Bot ${finalBotId} successfully processed and set to active.`);
      processingMessage = 'Bot processed successfully!';
      await updateProgress(finalBotId, { percent: 100, step: 'complete', message: 'Completed.', status: 'active' });

    } catch (processingError) {
      processingSuccess = false;
      processingMessage = `Bot processing failed: ${processingError.message}`;
      console.error('[API /process-data] Processing failed:', processingError);
      // Set bot status to inactive or error if processing fails
      const botToUpdate = await Bot.findOne({ userId, botId: finalBotId });
      if (botToUpdate) {
        botToUpdate.status = 'inactive';
        botToUpdate.updatedAt = new Date();
        await botToUpdate.save();
      }
      await updateProgress(finalBotId, { percent: 0, step: 'error', message: processingMessage, status: 'error' });
    }
    // --- END TEMPORARY SYNC PROCESSING ---

    return NextResponse.json({
      success: processingSuccess,
      message: processingMessage,
      botId: finalBotId,
      status: processingSuccess ? 'active' : 'inactive' // Return final status
    }, { status: processingSuccess ? 200 : 500 }); // Return 200 on success, 500 on failure

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