import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { createAuditLog, SOURCES } from '@/services/audit';

export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { text } = body;

    if (!text || !text.trim()) {
      return NextResponse.json({ error: 'Update text is required' }, { status: 400 });
    }

    const task = await prisma.scheduledTask.findUnique({ where: { id } });
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    const existingUpdates = (task.updates && typeof task.updates === 'object' ? task.updates : []);
    const newUpdate = {
      text: text.trim(),
      by: session.user.name || session.user.email,
      byEmail: session.user.email,
      at: new Date().toISOString(),
    };

    const updatedTask = await prisma.scheduledTask.update({
      where: { id },
      data: { updates: [...existingUpdates, newUpdate] },
    });

    await createAuditLog({
      entityType: 'scheduled_task',
      entityId: id,
      action: 'UPDATE',
      changedByEmail: session.user.email,
      changedByName: session.user.name || session.user.email,
      source: SOURCES.UI,
      summary: `Added update: ${text.trim().slice(0, 100)}`,
    });

    return NextResponse.json(updatedTask);
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
