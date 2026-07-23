import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { getScheduledTask, updateScheduledTask, deleteScheduledTask, markTaskComplete, markTaskIncomplete } from '@/services/scheduling';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const task = await getScheduledTask(id);
    if (!task) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(task);
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

    if (body.action === 'complete') {
      const task = await markTaskComplete(id, body.completionNotes, { email: session.user.email, name: session.user.name });
      return NextResponse.json(task);
    }
    if (body.action === 'incomplete') {
      const task = await markTaskIncomplete(id, body.reason, { email: session.user.email, name: session.user.name });
      return NextResponse.json(task);
    }

    const task = await updateScheduledTask(id, { ...body, id: undefined }, { email: session.user.email, name: session.user.name });
    return NextResponse.json(task);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { id } = await params;
    await deleteScheduledTask(id, { email: session.user.email, name: session.user.name });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
