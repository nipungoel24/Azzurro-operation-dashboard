import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { detectMissingUpdates } from '@/services/scheduling';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get('date') || new Date().toISOString().split('T')[0];
    const shiftCutoff = searchParams.get('cutoff') || '17:00';

    const missing = await detectMissingUpdates(dateStr, shiftCutoff);
    return NextResponse.json({
      date: dateStr,
      cutoff: shiftCutoff,
      count: missing.length,
      tasks: missing,
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
