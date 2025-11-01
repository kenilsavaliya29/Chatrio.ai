import { NextResponse } from 'next/server';
import connectDB from '@/server/config/db';
import { cookies } from 'next/headers';
import { verifyToken } from '@/server/utils/jwt.utils';
import Bot from '@/server/models/bot.model';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const botId = searchParams.get('botId');
    if (!botId) {
      return NextResponse.json({ error: 'Bot ID is required' }, { status: 400 });
    }

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

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        let closed = false;
        let interval;

        const safeWrite = (eventName, data) => {
          if (closed) return;
          try {
            controller.enqueue(encoder.encode(`event: ${eventName}\n`));
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
          } catch {
            closed = true;
            clearInterval(interval);
            try { controller.close(); } catch {}
          }
        };

        const endStream = () => {
          if (closed) return;
          closed = true;
          clearInterval(interval);
          try { controller.close(); } catch {}
        };

        safeWrite('open', { ok: true });

        const emitOnce = async () => {
          try {
            const bot = await Bot.findOne({ userId: decoded.id, botId });
            if (!bot) { safeWrite('error', { error: 'Bot not found' }); return endStream(); }
            const processing = bot.process?.processing || {};
            const payload = {
              percent: processing.progressPercent ?? 0,
              step: processing.step || 'queued',
              message: processing.message || '',
              status: processing.status || bot.status || 'processing',
              lastUpdated: processing.lastUpdated || bot.updatedAt || bot.createdAt
            };
            safeWrite('progress', payload);
            if (payload.status === 'active' || payload.status === 'error' || bot.status === 'active') {
              return endStream();
            }
          } catch {
            safeWrite('error', { error: 'Stream failed' });
            return endStream();
          }
        };

        await emitOnce();
        interval = setInterval(emitOnce, 1000);
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no'
      }
    });
  } catch (error) {
    console.error('SSE progress stream error:', error);
    return NextResponse.json({ error: 'Failed to start progress stream' }, { status: 500 });
  }
}


