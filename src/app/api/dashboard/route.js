import { NextResponse } from 'next/server';
import connectDB from '@/server/config/db';
import { cookies } from 'next/headers';
import { verifyToken } from '@/server/utils/jwt.utils';
import User from '@/server/models/user.model';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const tab = searchParams.get('tab') || 'overview';

  try {
    let data;

    switch (tab) {
      case 'overview': {
        await connectDB();
        const cookieStore = await cookies();
        const token = await cookieStore.get('token')?.value;
        if (!token) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const decoded = verifyToken(token);
        if (!decoded) {
          return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        const user = await User.findById(decoded.id);
        if (!user) {
          return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Calculate stats
        const totalBots = user.bots.length;
        const activeBots = user.bots.filter(bot => bot.status === 'active').length;

        data = {
          stats: {
            totalBots,
            activeBots,
            // Keeping total chats as dummy data for now
            // Would need to implement chat logging system first
            totalChats: 0
          }
        };
        break;
      }

      case 'bots': {
        await connectDB();
        const cookieStore = await cookies();
        const token = await cookieStore.get('token')?.value;
        if (!token) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const decoded = verifyToken(token);
        if (!decoded) {
          return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        const user = await User.findById(decoded.id);

        if (!user) {
          return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const botsList = user.bots.map(b => ({
          id: b.botId || b._id,
          name: b.name,
          active: b.status === 'active'
        }));

        data = { bots: botsList };
        break; }

      case 'analytics':
        data = {
          metrics: {
            // Analytics data will go here
          },
        };
        break;

      case 'settings':
        data = {
          settings: {
            // User settings will go here
          },
        };
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid tab parameter' },
          { status: 400 }
        );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Dashboard API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 