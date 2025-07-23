import { NextResponse } from 'next/server';
import connectDB from '@/server/config/db';
import mongoose from 'mongoose';

export async function POST(request) {
  try {
    const { botId, status } = await request.json();

    if (!botId) {
      return NextResponse.json(
        { error: 'Bot ID is required' },
        { status: 400 }
      );
    }

    await connectDB();
    const User = mongoose.models.User || mongoose.model('User');

    
    const result = await User.updateOne(
      { 'bots.id': botId },
      { $set: { 'bots.$.active': status } }
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