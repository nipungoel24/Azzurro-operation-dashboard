import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { createFollowUpShift } from '@/services/scheduling';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { taskId, assignedTo, shiftHours = 5, followUpDate } = body;

    if (!taskId) {
      return NextResponse.json({ error: 'taskId is required' }, { status: 400 });
    }

    const user = { email: session.user.email, name: session.user.name };

    try {
      const result = await createFollowUpShift(taskId, user, {
        assignedTo: assignedTo || 'Brema',
        shiftHours,
        followUpDate: followUpDate || null,
      });
      return NextResponse.json({
        success: true,
        original: result.original,
        followUp: result.followUp,
        message: `Follow-up shift created for ${assignedTo || 'Brema'} — ${shiftHours} hours.`,
      }, { status: 201 });
    } catch (err) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
