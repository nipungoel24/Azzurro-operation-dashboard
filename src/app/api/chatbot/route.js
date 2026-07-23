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
    const { message, confirmAction, confirmParams, history } = body;

    if (!message && !confirmAction) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
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
      session.user.name || session.user.email,
      history || []
    );

    return NextResponse.json(result);
  } catch (err) {
    if (err.message && err.message.includes('image')) {
      return NextResponse.json({ action: 'respond', message: 'This model only supports text input.' });
    }
    console.error('[chatbot route]', err.message?.slice(0, 100));
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
