import { NextResponse } from 'next/server';
import connectDB from '@/server/config/db';

export async function GET(req, { params }) {
    try {
        const { botId } = await params;

        // Connect to database
        await connectDB();
        
        // Find any user that has this bot (we don't need to authenticate the requester)
        // This is a public endpoint but we still validate the bot exists
        const User = (await import('@/server/models/user.model')).default;
        const user = await User.findOne({ 'bots.botId': botId });
        
        if (!user) {
            return NextResponse.json({ error: 'Bot not found' }, { status: 404 });
        }
        
        const bot = user.bots.find(b => b.botId === botId);
        
        // Check if bot is active
        if (bot.status !== 'active') {
            return NextResponse.json({ error: 'Bot is not active' }, { status: 403 });
        }
        
        // Generate the bot-specific JavaScript
        const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000').replace(/\/$/, '');
        
        const botScript = `
            (function() {
                // Bot configuration
                window.chatrioConfig = {
                    botId: '${botId}',
                    apiUrl: '${baseUrl}/api/bot/chat',
                    config: ${JSON.stringify(bot.config || {})}
                };
                
                // Load the main widget
                var s = document.createElement('script');
                s.src = '${baseUrl}/widget/index.js';
                s.async = true;
                document.body.appendChild(s);
            })();
        `;
        
        // Return the JavaScript with proper headers
        return new NextResponse(botScript, {
            headers: {
                'Content-Type': 'application/javascript',
                'Cache-Control': 'public, max-age=60',
            },
        });
        
    } catch (error) {
        console.error('Error serving bot script:', error);
        return NextResponse.json({ error: 'Failed to serve bot script' }, { status: 500 });
    }
}
