import { NextResponse } from 'next/server';
import connectDB from '@/server/config/db';
import { cookies } from 'next/headers';
import { verifyToken } from '@/server/utils/jwt.utils';
import User from '@/server/models/user.model';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req) {
    try {
        await connectDB();

        // Check authentication
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;
        if (!token) {
            return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
        }

        const decoded = verifyToken(token);
        if (!decoded) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        // Get request data
        const { url, name } = await req.json();
        if (!url || !name) {
            return NextResponse.json({ error: 'URL and name are required' }, { status: 400 });
        }

        // Find user and their bots
        const user = await User.findById(decoded.id);
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Normalize URL for consistent comparison
        function normalizeUrl(url) {
            return url.replace(/^(https?:\/\/)?(www\.)?/i, '').replace(/\/+$/, '');
        }

        const normalizedInputUrl = normalizeUrl(url);

        // Look for an existing bot with the same URL and completed reports
        const existingBotWithReports = user.bots.find(bot => 
            normalizeUrl(bot.url) === normalizedInputUrl && 
            bot.process?.reports === true
        );

        // Also check for any existing bot with same URL (including drafts)
        const existingBotAny = user.bots.find(bot => normalizeUrl(bot.url) === normalizedInputUrl);

        if (existingBotWithReports) {
            // Return existing bot data in the same format as process-data
            return NextResponse.json({
                success: true,
                reportsExist: true,
                botId: existingBotWithReports.botId,
                ragContext: existingBotWithReports.ragContext,
                message: 'Reports already exist for this URL!',
                // Include any other data that customize page expects
                scrapingReport: existingBotWithReports.scrapingReport
            });
        }

        // If we have an existing bot (draft) but no reports, use that bot
        if (existingBotAny) {
            return NextResponse.json({
                success: true,
                reportsExist: false,
                botId: existingBotAny.botId,
                message: 'Using existing bot draft'
            });
        }

        // If no existing bot found at all, create a new draft bot
        const newBotId = uuidv4();
        const newBot = {
            botId: newBotId,
            name: name,
            url: url,
            status: 'draft',
            process: {
                reports: false,
                customization: false,
                deployed: false
            },
            createdAt: new Date(),
            updatedAt: new Date()
        };

        // Add the new bot to user's bots array
        user.bots.push(newBot);
        await user.save();

        // Return response indicating no existing reports but including the new botId
        return NextResponse.json({
            success: true,
            reportsExist: false,
            botId: newBotId,
            message: 'New bot draft created'
        });

    } catch (error) {
        console.error('Error checking reports:', error);
        return NextResponse.json({ 
            error: 'Failed to check reports',
            details: error.message 
        }, { status: 500 });
    }
}