export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { prisma } from "../../../lib/prisma";

export async function GET() {
  try {
    const tasks = await prisma.task.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
    return NextResponse.json(tasks);
  } catch (err) {
    console.error('[GET /api/tasks] Error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { 
      title, 
      description, 
      status, 
      property, 
      responsible, 
      dueDate, 
      lastUpdated, 
      recurrence, 
      reminderActive, 
      reminderTime, 
      snoozeDuration, 
      reminderTriggered,
      updates 
    } = body;

    if (!title || !property || !responsible) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const nowStr = new Date()
      .toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
      .replace(",", " ·");

    const creationLog = {
      id: "log_" + Date.now().toString(),
      authorName: session.user.name || "Unknown User",
      authorEmail: session.user.email,
      text: "Task created",
      timestamp: nowStr,
    };

    const newTask = await prisma.task.create({
      data: {
        title,
        description: description || '',
        status: status || 'To do',
        property,
        responsible,
        dueDate: dueDate || '',
        lastUpdated: lastUpdated || '',
        recurrence: recurrence || 'none',
        reminderActive: !!reminderActive,
        reminderTime: reminderTime || null,
        snoozeDuration: snoozeDuration !== undefined ? Number(snoozeDuration) : 10,
        reminderTriggered: !!reminderTriggered,
        updates: [creationLog],
        created_by_email: session.user.email,
        updated_by_email: session.user.email
      }
    });

    return NextResponse.json(newTask, { status: 201 });
  } catch (err) {
    console.error('[POST /api/tasks] Error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
