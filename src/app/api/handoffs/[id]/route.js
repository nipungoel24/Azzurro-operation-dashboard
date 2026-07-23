import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { getHandoff, acknowledgeHandoff } from '@/services/handoffs';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const handoff = await getHandoff(id);
    if (!handoff) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(handoff);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { id } = await params;
    const body = await request.json();

    if (body.action === 'acknowledge') {
      const handoff = await acknowledgeHandoff(id, { email: session.user.email, name: session.user.name });
      return NextResponse.json(handoff);
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
