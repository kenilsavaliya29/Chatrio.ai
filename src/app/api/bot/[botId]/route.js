import { NextResponse } from 'next/server';
import connectDB from '@/server/config/db';
import { cookies } from 'next/headers';
import { verifyToken } from '@/server/utils/jwt.utils';
import User from '@/server/models/user.model';

// GET a specific bot's configuration
export async function GET(request, { params }) {
  try {
    const { botId } = params;
    if (!botId) {
      return NextResponse.json({ error: 'Bot ID is required' }, { status: 400 });
    }

    await connectDB();
    const cookieStore = await cookies();
    const token = await cookieStore.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    
    const user = await User.findById(decoded.id);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const bot = user.bots.find(b => b.botId === botId);
    if (!bot) return NextResponse.json({ error: 'Bot not found' }, { status: 404 });

    // Return all necessary bot data for editing
    return NextResponse.json({
        id: bot.botId,
        name: bot.name,
        url: bot.url,
        config: bot.config,
    });

  } catch (error) {
    console.error(`Error fetching bot ${params.botId}:`, error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT (update) a specific bot's configuration
export async function PUT(request, { params }) {
    try {
      const { botId } = params;
      if (!botId) {
        return NextResponse.json({ error: 'Bot ID is required' }, { status: 400 });
      }
  
      const updatedConfig = await request.json();
  
      await connectDB();
      const cookieStore = await cookies();
      const token = await cookieStore.get('token')?.value;
      if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      
      const decoded = verifyToken(token);
      if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
      
      const user = await User.findById(decoded.id);
      if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
  
      const botIndex = user.bots.findIndex(b => b.botId === botId);
      if (botIndex === -1) return NextResponse.json({ error: 'Bot not found' }, { status: 404 });
  
      // Update the bot's config
      user.bots[botIndex].config = { ...user.bots[botIndex].config, ...updatedConfig };
      user.bots[botIndex].name = updatedConfig.botName || user.bots[botIndex].name;
      
      await user.save();
  
      return NextResponse.json({ success: true, message: 'Bot updated successfully' });
  
    } catch (error) {
      console.error(`Error updating bot ${params.botId}:`, error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
} 