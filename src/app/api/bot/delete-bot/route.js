import { NextResponse } from 'next/server';
import connectDB from '@/server/config/db';
import { cookies } from 'next/headers';
import { verifyToken } from '@/server/utils/jwt.utils';
import Bot from '@/server/models/bot.model';

export async function DELETE(req) {
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
        
        const { botId } = await req.json();
        if (!botId) {
            return NextResponse.json({ error: 'Bot ID is required' }, { status: 400 });
        }
        
        const result = await Bot.deleteOne({ userId: decoded.id, botId });
        if (result.deletedCount === 0) {
            return NextResponse.json({ error: 'Bot not found' }, { status: 404 });
        }
        
        return NextResponse.json({ message: "Bot deleted successfully" }, { status: 200 });
    } catch (error) {
        console.error('Error deleting bot:', error);
        return NextResponse.json({ error: error.message || 'Failed to delete bot.' }, { status: 500 });
    }
} 