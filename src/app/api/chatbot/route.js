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

    if (message && /\.(png|jpg|jpeg|gif|webp|bmp|svg|ico|heic|tiff|raw)\b|!\[|\[image\]|image\.png|upload.*image/i.test(message)) {
      return NextResponse.json({ error: true, message: 'This assistant works with text only. Describe what you need in words.' });
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
    if (err.message && /image|png|jpg|jpeg|does not support/i.test(err.message)) {
      return NextResponse.json({ error: true, message: 'Text only please. Describe your request in words.' });
    }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
