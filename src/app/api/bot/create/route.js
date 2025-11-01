import { NextResponse } from 'next/server';
import connectDB from '@/server/config/db';
import { cookies } from 'next/headers';
import { verifyToken } from '@/server/utils/jwt.utils';
import Bot from '@/server/models/bot.model';

export async function POST(req) {
    try {
        await connectDB();

        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;
        if (!token) {
            return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
        }

        const decoded = verifyToken(token);
        if (!decoded) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        const { botId, ...requestData } = await req.json();
        if (!botId) {
            return NextResponse.json({ error: 'Bot ID is required' }, { status: 400 });
        }

        const bot = await Bot.findOne({ userId: decoded.id, botId });
        if (!bot) {
            return NextResponse.json({ error: 'Bot not found' }, { status: 404 });
        }

        // Update bot with final configuration
        bot.config = requestData;
        bot.status = 'active';
        await bot.save();

        const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000').replace(/\/$/, '');
        
        // Generate simple one-line script tag that loads the bot-specific script
        const embedCode = `<script src="${baseUrl}/api/bot/${botId}/script" async></script>`;

        return NextResponse.json({
            success: true,
            message: 'Bot created successfully!',
            botId: botId,
            embedCode: embedCode,
        });

    } catch (error) {
        console.error('Error creating bot:', error);
        return NextResponse.json({ error: error.message || 'Failed to create bot.' }, { status: 500 });
    }
} 