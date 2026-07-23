import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "../../../../lib/prisma";

export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    // Find the task first
    const existingTask = await prisma.task.findUnique({
      where: { id }
    });

    if (!existingTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Build update payload dynamically
    const updateData = {};
    const fields = [
      'title', 
      'description', 
      'status', 
      'property', 
      'responsible', 
      'dueDate', 
      'lastUpdated', 
      'recurrence', 
      'reminderActive', 
      'reminderTime', 
      'snoozeDuration', 
      'reminderTriggered'
    ];

    fields.forEach(field => {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    });

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

    // Compare fields to build a description log
    const changes = [];
    if (body.title !== undefined && body.title !== existingTask.title) changes.push("Title");
    if (body.description !== undefined && body.description !== existingTask.description) changes.push("Description");
    if (body.property !== undefined && body.property !== existingTask.property) changes.push("Property");
    if (body.responsible !== undefined && body.responsible !== existingTask.responsible) changes.push("Assignee");
    if (body.dueDate !== undefined && body.dueDate !== existingTask.dueDate) changes.push("Due Date");
    if (body.recurrence !== undefined && body.recurrence !== existingTask.recurrence) changes.push("Recurrence");
    
    let logText = "";
    if (body.status !== undefined && body.status !== existingTask.status) {
      logText = `Status changed from "${existingTask.status}" to "${body.status}"`;
    } else if (changes.length > 0) {
      logText = `Task details updated: ${changes.join(", ")}`;
    }

    // Reminder changes
    if (body.reminderActive !== undefined && body.reminderActive !== existingTask.reminderActive) {
      if (body.reminderActive) {
        logText = `Reminder scheduled for ${body.reminderTime}`;
      } else {
        logText = `Reminder cleared`;
      }
    } else if (body.reminderTime !== undefined && body.reminderTime !== existingTask.reminderTime && body.reminderTime) {
      logText = `Reminder snoozed to ${body.reminderTime}`;
    }

    let updatedUpdates = Array.isArray(existingTask.updates) ? existingTask.updates : [];
    
    if (body.updates !== undefined) {
      // Manual updates (e.g. comment additions or updates edits)
      updatedUpdates = body.updates;
    } else if (logText) {
      // Automated system update log
      const systemLog = {
        id: "log_" + Date.now().toString() + "_" + Math.random().toString(36).substr(2, 4),
        authorName: session.user.name || "Unknown User",
        authorEmail: session.user.email,
        text: logText,
        timestamp: nowStr
      };
      updatedUpdates = [...updatedUpdates, systemLog];
    }

    updateData.updates = updatedUpdates;
    updateData.updated_by_email = session.user.email;

    const updatedTask = await prisma.task.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json(updatedTask);
  } catch (err) {
    console.error('[PUT /api/tasks/[id]] Error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const existingTask = await prisma.task.findUnique({
      where: { id }
    });

    if (!existingTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    await prisma.task.delete({
      where: { id }
    });

    return NextResponse.json({ success: true, message: "Task deleted successfully" });
  } catch (err) {
    console.error('[DELETE /api/tasks/[id]] Error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
