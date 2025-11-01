import { NextResponse } from 'next/server';
import connectDB from '@/server/config/db';
import { protect } from '@/server/middleware/auth.middleware';
import Bot from '@/server/models/bot.model';

export async function POST(request) {
  try {
    // Call the authentication middleware
    const authResult = await protect(request);
    // If authResult is not null, it means authentication failed, so return the error response
    if (authResult) {
      return authResult;
    }

    // If we reach here, authentication was successful, and request.user is populated
    const { botId, status } = await request.json();
    // console.log(`[toggle-status] Received botId: ${botId}, status: ${status}`);

    if (!botId) {
      return NextResponse.json(
        { error: 'Bot ID is required' },
        { status: 400 }
      );
    }

    await connectDB();

    const result = await Bot.updateOne(
      { userId: request.user.id, botId },
      { $set: { status } }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { error: 'Bot not found or status not changed' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error toggling bot status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 