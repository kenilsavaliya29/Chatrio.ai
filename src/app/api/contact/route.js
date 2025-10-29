import { NextResponse } from 'next/server';
import { sendFormMessage } from '@/server/utils/email.service';

export async function POST(request) {
  try {
    const { name, email, message } = await request.json();

    if (!name || !email || !message) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return NextResponse.json({ success: false, error: 'Email service not configured: missing EMAIL_USER or EMAIL_PASS' }, { status: 500 });
    }

    const result = await sendFormMessage(name, email, message);
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error || 'Failed to send email' }, { status: 500 });
    }

    return NextResponse.json({ success: true, messageId: result.messageId });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message || 'Unexpected error' }, { status: 500 });
  }
}


