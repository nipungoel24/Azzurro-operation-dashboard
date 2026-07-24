export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { getAuditLogs, getAuditLogById } from '@/services/audit';
import { isRevertEligible, revertChange } from '@/services/revert';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const entityType = searchParams.get('entityType');
    const entityId = searchParams.get('entityId');
    const changedByEmail = searchParams.get('changedByEmail');
    const source = searchParams.get('source');
    const limit = parseInt(searchParams.get('limit') || '100');

    const logs = await getAuditLogs({ entityType, entityId, changedByEmail, source, limit });
    return NextResponse.json(logs);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
