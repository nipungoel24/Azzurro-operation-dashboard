import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { getAuditLogById } from '@/services/audit';
import { isRevertEligible, revertChange } from '@/services/revert';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const log = await getAuditLogById(id);
    if (!log) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const eligible = await isRevertEligible(id);
    return NextResponse.json({ ...log, revertEligible: eligible.eligible, revertReason: eligible.reason });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
