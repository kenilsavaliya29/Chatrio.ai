import { NextResponse } from 'next/server';
import connectDB from '@/server/config/db';
import { cookies } from 'next/headers';
import { verifyToken } from '@/server/utils/jwt.utils';
import User from '@/server/models/user.model';

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
        
        const user = await User.findById(decoded.id);
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }
        
        const bot = user.bots.find(b => b.botId === botId);
        if (!bot) {
            return NextResponse.json({ error: 'Bot not found' }, { status: 404 });
        }
        
        user.bots = user.bots.filter(b => b.botId !== botId);
        
        await user.save();
        
        return NextResponse.json({ message: "Bot deleted successfully" }, { status: 200 });
    } catch (error) {
        console.error('Error creating bot:', error);
        return NextResponse.json({ error: error.message || 'Failed to create bot.' }, { status: 500 });
    }
} 