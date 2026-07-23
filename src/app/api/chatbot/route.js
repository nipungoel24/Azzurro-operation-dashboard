import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { processChatMessage } from '@/services/chatbot';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { message, confirmAction, confirmParams } = body;

    if (!message && !confirmAction) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    if (message && /\.(png|jpg|jpeg|gif|webp|bmp|svg|ico)\b|!\[|\bimage\b|\bupload\b|\bfile\b/i.test(message)) {
      return NextResponse.json({ error: true, message: 'This model supports text only. Please describe what you need rather than referencing files or images.' });
    }

    if (confirmAction) {
      const { executeAction } = await import('@/services/chatbot');
      const result = await executeAction(
        confirmAction,
        confirmParams || {},
        { email: session.user.email, name: session.user.name },
        null
      );
      return NextResponse.json(result);
    }

    const result = await processChatMessage(
      message,
      session.user.email,
      session.user.name || session.user.email
    );

    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
