import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { revertChange, revertBatch } from '@/services/revert';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { auditLogId, batchId } = body;

    const user = { email: session.user.email, name: session.user.name };

    if (batchId) {
      const result = await revertBatch(batchId, user);
      return NextResponse.json(result);
    }

    if (auditLogId) {
      const result = await revertChange(auditLogId, user);
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: 'auditLogId or batchId required' }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
