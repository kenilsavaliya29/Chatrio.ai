import { NextResponse } from 'next/server';
import connectDB from '@/server/config/db';
import { cookies } from 'next/headers';
import { verifyToken } from '@/server/utils/jwt.utils';
import User from '@/server/models/user.model';

export async function DELETE(request) {
  try {
    await connectDB();

    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const userId = decoded.id;

    const result = await User.findByIdAndDelete(userId);

    if (!result) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    cookies().delete('token');

    return NextResponse.json({ success: true, message: 'Account deleted successfully.' });
  } catch (error) {
    console.error('Error deleting account:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}