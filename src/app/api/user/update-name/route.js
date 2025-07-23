import { NextResponse } from 'next/server';
import connectDB from '@/server/config/db';
import mongoose from 'mongoose';

export async function PUT(request) {
  try {
    const { name } = await request.json();
    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }
    
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // Assuming we store userId in token payload, decode token accordingly
    const userId = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString()).id;

    await connectDB();
    const User = mongoose.models.User || mongoose.model('User');

    await User.updateOne({ _id: userId }, { $set: { name } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update name error', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 