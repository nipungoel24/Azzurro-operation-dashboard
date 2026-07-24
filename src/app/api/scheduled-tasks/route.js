export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { getScheduledTasks, createScheduledTask } from '@/services/scheduling';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const tasks = await getScheduledTasks({
      propertyName: searchParams.get('propertyName') || null,
      status: searchParams.get('status') || null,
      assigneeName: searchParams.get('assigneeName') || null,
      category: searchParams.get('category') || null,
      startDate: searchParams.get('startDate') || null,
      endDate: searchParams.get('endDate') || null,
      limit: parseInt(searchParams.get('limit') || '200'),
    });
    return NextResponse.json(tasks);
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
    const task = await createScheduledTask(body, { email: session.user.email, name: session.user.name });
    return NextResponse.json(task, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
