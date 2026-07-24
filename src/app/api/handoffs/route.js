export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { getHandoffs, createHandoff, getHandoff, acknowledgeHandoff } from '@/services/handoffs';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const handoffs = await getHandoffs({
      propertyName: searchParams.get('propertyName') || null,
      shiftTo: searchParams.get('shiftTo') || null,
      acknowledged: searchParams.get('acknowledged') === 'false' ? false : null,
    });
    return NextResponse.json(handoffs);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = await request.json();
    const handoff = await createHandoff(body, { email: session.user.email, name: session.user.name });
    return NextResponse.json(handoff, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
