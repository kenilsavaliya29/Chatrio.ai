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

    // Fetch the user document here so it's available for bot operations
    const user = await User.findById(decoded.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

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

    if (botId) {
      // Attempt to find and update an existing bot for this user
      const existingBotIndex = user.bots.findIndex(b => b.botId === botId);
      if (existingBotIndex !== -1) {
        user.bots[existingBotIndex].status = 'processing';
        user.bots[existingBotIndex].url = url; // Update URL if changed
        user.bots[existingBotIndex].name = name || user.bots[existingBotIndex].name; // Update name if changed
        user.bots[existingBotIndex].updatedAt = new Date();
        finalBotId = botId;
        botExists = true;
        console.log(`[API /process-data] Updating existing bot ${botId} to processing status.`);
      } else {
        // If botId was provided but not found for this user, it's an error
        return NextResponse.json({ error: 'Bot not found for this user' }, { status: 404 });
      }
    } else {
      // Create a new bot entry
      finalBotId = uuidv4();
      const newBotData = {
        botId: finalBotId,
        name: name || 'My New Bot',
        url: url,
        status: 'processing',
        process: {
          reports: false,
          customization: false,
          deployed: false
        },
        createdAt: new Date(),
      };
      if (!user.bots) {
        user.bots = [];
      }
      user.bots.push(newBotData);
      console.log(`[API /process-data] Created new bot ${finalBotId} with processing status.`);
    }

    await user.save(); // Save the user document with the updated/new bot status

    // --- TEMPORARY: Synchronous Processing for Local Testing ---
    // In production, this entire block (scraping and RAG) MUST be moved to a background worker.
    console.log(`[API /process-data] Starting background processing for bot ${finalBotId} (TEMPORARY SYNC).`);

    let processingSuccess = true;
    let processingMessage = 'Bot processing initiated.';

    try {
      // Step 1: Scrape website
      console.log('[API /process-data] Step 1: Starting web scraper...');
      const scrapingReport = await scrapeWebsite(url);

      if (scrapingReport.error) {
        throw new Error(`Failed to scrape website: ${scrapingReport.error}`);
      }
      console.log('[API /process-data] Scraping completed successfully.');

      // Step 2: Generate RAG context
      console.log('[API /process-data] Step 2: Starting RAG processing...');
      const ragContext = await processScrapingReport(scrapingReport);
      if (!ragContext) {
        throw new Error('RAG context generation failed');
      }
      console.log('[API /process-data] RAG context generated successfully.');

      // Update bot with processed data and set status to active
      const botToUpdate = user.bots.find(b => b.botId === finalBotId);
      if (botToUpdate) {
        botToUpdate.ragContext = ragContext;
        botToUpdate.scrapingReport = scrapingReport;
        botToUpdate.process.reports = true;
        botToUpdate.status = 'active';
        botToUpdate.updatedAt = new Date();
        await user.save(); // Save user with updated bot data
        console.log(`[API /process-data] Bot ${finalBotId} successfully processed and set to active.`);
        processingMessage = 'Bot processed successfully!';
      } else {
        throw new Error('Bot not found in user document after processing.');
      }

    } catch (processingError) {
      processingSuccess = false;
      processingMessage = `Bot processing failed: ${processingError.message}`;
      console.error('[API /process-data] Processing failed:', processingError);
      // Set bot status to inactive or error if processing fails
      const botToUpdate = user.bots.find(b => b.botId === finalBotId);
      if (botToUpdate) {
        botToUpdate.status = 'inactive'; // Or 'error' status
        botToUpdate.updatedAt = new Date();
        await user.save();
      }
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