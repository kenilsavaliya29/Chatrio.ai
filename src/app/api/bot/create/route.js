import { NextResponse } from 'next/server';
import connectDB from '@/server/config/db';
import { cookies } from 'next/headers';
import { verifyToken } from '@/server/utils/jwt.utils';
import User from '@/server/models/user.model';

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

        const user = await User.findById(decoded.id);
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const bot = user.bots.find(b => b.botId === botId);
        if (!bot) {
            return NextResponse.json({ error: 'Bot not found' }, { status: 404 });
        }

        // Update bot with final configuration
        bot.config = requestData;
        bot.status = 'active';

        await user.save();

        const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000').replace(/\/$/, '');
        
        // Simplified embed code: directly sets config and loads the main widget script
        const embedCode = `
            <script>
            window.chatrioConfig = {
                botId: '${botId}',
                apiUrl: '${baseUrl}/api/bot/chat'
            };
            (function(){
                var s = document.createElement('script');
                s.src = '${baseUrl}/widget/index.js';
                s.async = true;
                document.body.appendChild(s);
            })();
            </script>
        `;

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