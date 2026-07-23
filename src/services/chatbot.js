import { prisma } from '../lib/prisma';
import { createAuditLog, SOURCES } from './audit';
import { createScheduledTask, updateScheduledTask, getScheduledTasks } from './scheduling';
import { getFacilities, createFacility } from './facilities';
import { fetchEmptyRooms } from './cloudbeds';
import { createHandoff, acknowledgeHandoff, getHandoffs } from './handoffs';
import { revertChange } from './revert';
import { z } from 'zod';

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || '';
const DEEPSEEK_BASE_URL = 'https://api.deepseek.com/v1';

const ALLOWED_ACTIONS = [
  'query_schedule', 'query_incomplete_tasks', 'query_overdue_tasks', 'query_empty_rooms',
  'query_facilities', 'query_handoffs', 'query_bathrooms', 'query_rooms',
  'create_task', 'update_task', 'complete_task', 'mark_incomplete',
  'reassign_task', 'reschedule_task', 'create_handoff', 'acknowledge_handoff',
  'add_facility', 'update_facility', 'sync_empty_rooms', 'create_empty_room_tasks',
  'generate_bathroom_tasks', 'generate_vent_tasks', 'generate_daily_tasks',
  'create_follow_up', 'query_history', 'revert_change',
];

const DANGEROUS_ACTIONS = [
  'create_empty_room_tasks', 'generate_bathroom_tasks', 'generate_vent_tasks',
  'generate_daily_tasks', 'sync_empty_rooms', 'revert_change',
];

const SYSTEM_PROMPT = `You are an operations assistant for Azzurro Hotels, a multi-property hostel/budget hotel group in Sydney, Australia.

Your job is to help staff manage cleaning, maintenance, and facility operations through a structured action system.

IMPORTANT: You are a TEXT-ONLY assistant. Never reference or attempt to read images, files, or attachments. If a user mentions a file or image, tell them you can only process text.

AVAILABLE ACTIONS:
- query_schedule: Get scheduled tasks. Params: {propertyName, status, assigneeName, date, category, limit}
- query_incomplete_tasks: Get tasks marked incomplete. Params: {propertyName, date, assigneeName}
- query_overdue_tasks: Get overdue tasks. Params: {propertyName}
- query_empty_rooms: Get current empty rooms. Params: {propertyName}
- query_facilities: Get facilities. Params: {propertyId, type}
- query_handoffs: Get shift handoffs. Params: {propertyName, shiftTo, acknowledged}
- query_bathrooms: Query bathroom inventory. Params: {propertyCode, bathroomType}
- query_rooms: Query room inventory. Params: {propertyCode, verificationStatus}
- create_task: Create a scheduled task. Params: {title, category, propertyName, assigneeName, scheduledStart, shift, description, priority, instructions}
- update_task: Update a task. Params: {id, status, assigneeName, scheduledStart, notes}
- complete_task: Mark task complete. Params: {id, completionNotes}
- mark_incomplete: Mark task incomplete. Params: {id, reason}
- reassign_task: Reassign a task. Params: {id, assigneeName}
- reschedule_task: Reschedule a task. Params: {id, scheduledStart, shift}
- create_handoff: Create shift handoff. Params: {propertyName, shiftFrom, shiftTo, notes, taskIds}
- acknowledge_handoff: Acknowledge a handoff. Params: {id}
- add_facility: Add a facility. Params: {propertyId, type, name, floorOrArea, notes}
- update_facility: Update a facility. Params: {id, name, type, active, notes}
- sync_empty_rooms: Trigger Cloudbeds empty room sync. Params: {}
- create_empty_room_tasks: Create tasks from empty rooms. Params: {propertyName, taskCategory} (REQUIRES CONFIRMATION)
- generate_bathroom_tasks: Generate bathroom deep clean rotation. Params: {propertyCode, dateStr, bathroomsPerCleaner} (REQUIRES CONFIRMATION)
- generate_vent_tasks: Generate vent cleaning schedule. Params: {propertyCode, daysOfWeek, bathroomsPerSession} (REQUIRES CONFIRMATION)
- generate_daily_tasks: Generate daily automated cleaning tasks. Params: {propertyCode} (REQUIRES CONFIRMATION)
- create_follow_up: Create Brema follow-up shift for incomplete task. Params: {taskId, assignedTo, shiftHours}
- query_history: Query audit history. Params: {entityType, entityId, limit}
- revert_change: Revert a change. Params: {auditLogId} (REQUIRES CONFIRMATION)

RULES:
1. Always respond with a valid JSON object: {"action": "...", "params": {...}, "message": "human-readable summary", "requiresConfirmation": false}
2. For dangerous actions (creating bulk tasks, reverting), set "requiresConfirmation": true
3. Parse "today", "tomorrow", "tonight" relative to Australia/Sydney timezone
4. "tonight" = night shift today, "next Monday" = the upcoming Monday
5. Property names: Potts Point, Surry Hills, Darling Harbour, Central Sydney, The Pyrmont Budget Hotel, Olympic Hotel
6. Task categories: bathroom_deep_clean, vent_cleaning, general_cleaning, night_shift, cockroach_spraying, ac_check, hardware_check, supplies, laundry_pod, go_key_charge, bed_frame_check, curtain_rod_check, other
7. Shifts: morning, afternoon, night, overnight
8. If you cannot determine intent, ask for clarification via the message field
9. Never invent room numbers, staff names, or facility counts
10. Default task priority is "medium"

Respond ONLY with the JSON object. No other text.`;

function validateActionSchema(action, params) {
  const schemas = {
    query_schedule: z.object({
      propertyName: z.string().optional(),
      status: z.string().optional(),
      assigneeName: z.string().optional(),
      date: z.string().optional(),
      category: z.string().optional(),
      limit: z.number().int().positive().max(500).optional(),
    }),
    query_incomplete_tasks: z.object({
      propertyName: z.string().optional(),
      date: z.string().optional(),
      assigneeName: z.string().optional(),
    }),
    query_overdue_tasks: z.object({ propertyName: z.string().optional() }),
    query_empty_rooms: z.object({ propertyName: z.string().optional() }),
    query_facilities: z.object({
      propertyId: z.string().optional(),
      type: z.string().optional(),
    }),
    query_handoffs: z.object({
      propertyName: z.string().optional(),
      shiftTo: z.string().optional(),
      acknowledged: z.boolean().optional(),
    }),
    create_task: z.object({
      title: z.string().min(1, 'Title is required').max(500),
      category: z.string().optional(),
      propertyName: z.string().optional(),
      assigneeName: z.string().optional(),
      scheduledStart: z.string().optional(),
      shift: z.string().optional(),
      description: z.string().optional(),
      priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
      instructions: z.string().optional(),
    }),
    update_task: z.object({
      id: z.string().min(1),
      status: z.string().optional(),
      assigneeName: z.string().optional(),
      scheduledStart: z.string().optional(),
      notes: z.string().optional(),
    }),
    complete_task: z.object({
      id: z.string().min(1),
      completionNotes: z.string().optional(),
    }),
    mark_incomplete: z.object({
      id: z.string().min(1),
      reason: z.string().optional(),
    }),
    reassign_task: z.object({
      id: z.string().min(1),
      assigneeName: z.string().min(1),
    }),
    reschedule_task: z.object({
      id: z.string().min(1),
      scheduledStart: z.string().optional(),
      shift: z.string().optional(),
    }),
    create_handoff: z.object({
      propertyName: z.string().optional(),
      shiftFrom: z.string().optional(),
      shiftTo: z.string().optional(),
      notes: z.string().optional(),
      taskIds: z.array(z.string()).optional(),
    }),
    acknowledge_handoff: z.object({ id: z.string().min(1) }),
    add_facility: z.object({
      propertyId: z.string().optional(),
      type: z.string().optional(),
      name: z.string().min(1),
      floorOrArea: z.string().optional(),
      notes: z.string().optional(),
    }),
    update_facility: z.object({
      id: z.string().min(1),
      name: z.string().optional(),
      type: z.string().optional(),
      active: z.boolean().optional(),
      notes: z.string().optional(),
    }),
    sync_empty_rooms: z.object({}),
    create_empty_room_tasks: z.object({
      propertyName: z.string().optional(),
      taskCategory: z.string().optional(),
    }),
    query_history: z.object({
      entityType: z.string().optional(),
      entityId: z.string().optional(),
      limit: z.number().int().positive().max(500).optional(),
    }),
    revert_change: z.object({ auditLogId: z.string().min(1) }),
    query_bathrooms: z.object({
      propertyCode: z.string().optional(),
      bathroomType: z.string().optional(),
    }),
    query_rooms: z.object({
      propertyCode: z.string().optional(),
      verificationStatus: z.string().optional(),
    }),
    generate_bathroom_tasks: z.object({
      propertyCode: z.string().optional(),
      dateStr: z.string().optional(),
      bathroomsPerCleaner: z.number().int().positive().optional(),
    }),
    generate_vent_tasks: z.object({
      propertyCode: z.string().optional(),
      daysOfWeek: z.array(z.string()).optional(),
      bathroomsPerSession: z.number().int().positive().optional(),
      weeksAhead: z.number().int().positive().optional(),
    }),
    generate_daily_tasks: z.object({
      propertyCode: z.string().optional(),
    }),
    create_follow_up: z.object({
      taskId: z.string().min(1),
      assignedTo: z.string().optional(),
      shiftHours: z.number().positive().optional(),
      followUpDate: z.string().optional(),
    }),
  };

  const schema = schemas[action];
  if (!schema) return { valid: false, error: `Unknown action: ${action}` };

  try {
    schema.parse(params || {});
    return { valid: true };
  } catch (err) {
    const messages = err.issues?.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ') || err.message;
    return { valid: false, error: `Validation failed: ${messages}` };
  }
}

export async function processChatMessage(message, userEmail, userName) {
  if (!DEEPSEEK_API_KEY) {
    return { action: 'error', message: 'DeepSeek API key not configured. Please set DEEPSEEK_API_KEY.' };
  }

  const user = {
    email: userEmail,
    name: userName || userEmail,
    role: 'viewer',
  };

  try {
    const dbUser = await prisma.user.findUnique({ where: { email: userEmail } });
    if (dbUser) {
      user.role = dbUser.role || 'viewer';
      user.name = dbUser.name || userName;
    }
  } catch {
    // Use defaults
  }

  const context = await buildContext(user);

  let aiResponse;
  try {
    aiResponse = await callDeepSeek(message, context);
  } catch (err) {
    console.error('[Chatbot] DeepSeek API error:', err.message);
    if (err.message === 'IMAGE_NOT_SUPPORTED') {
      return { action: 'error', message: 'This model does not support image input. Please describe what you need in text only.' };
    }
    return { action: 'error', message: 'Failed to get response from AI. Please try again.' };
  }

  let parsed;
  try {
    parsed = typeof aiResponse === 'string' ? JSON.parse(aiResponse) : aiResponse;
  } catch {
    if (typeof aiResponse === 'string' && /image|png|jpg|does not support/i.test(aiResponse)) {
      return { action: 'error', message: 'This assistant works with text only. Describe what you need in words.' };
    }
    return { action: 'error', message: 'AI returned invalid response. Please try again.', raw: aiResponse };
  }

  if (!parsed.action || !ALLOWED_ACTIONS.includes(parsed.action)) {
    return { action: 'error', message: 'AI suggested an unsupported action.', raw: parsed };
  }

  const validation = validateActionSchema(parsed.action, parsed.params || {});
  if (!validation.valid) {
    return { action: 'error', message: validation.error, raw: parsed };
  }

  if (parsed.requiresConfirmation && DANGEROUS_ACTIONS.includes(parsed.action)) {
    return {
      ...parsed,
      requiresConfirmation: true,
      confirmMessage: `Confirm: ${parsed.message || 'Execute this action?'}`,
    };
  }

  return await executeAction(parsed.action, parsed.params || {}, user, parsed.message);
}

async function callDeepSeek(message, context) {
  const userMsg = message.trim();
  if (/\.(png|jpg|jpeg|gif|webp|bmp|svg)\b/i.test(userMsg) || userMsg.toLowerCase().includes('image')) {
    throw new Error('IMAGE_NOT_SUPPORTED');
  }

  const response = await fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'system', content: `Context: ${JSON.stringify(context)}` },
        { role: 'user', content: message },
      ],
      temperature: 0.3,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    if (text.toLowerCase().includes('image') || text.toLowerCase().includes('not support')) {
      throw new Error('IMAGE_NOT_SUPPORTED');
    }
    throw new Error(`DeepSeek API error: ${response.status} ${text}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || '';

  if (/image|\.png|\.jpg|does not support image/i.test(content)) {
    throw new Error('IMAGE_NOT_SUPPORTED');
  }

  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (jsonMatch) return JSON.parse(jsonMatch[0]);

  if (content.includes('image') || content.includes('png') || content.includes('jpg')) {
    throw new Error('IMAGE_NOT_SUPPORTED');
  }

  throw new Error('No valid JSON found in AI response');
}

async function buildContext(user) {
  const ctx = {
    user: { email: user.email, name: user.name, role: user.role },
    timezone: 'Australia/Sydney',
    now: new Date().toISOString(),
  };

  try {
    const tasks = await getScheduledTasks({ limit: 5 });
    ctx.recentTasks = tasks.map(t => ({
      id: t.id, title: t.title, status: t.status,
      propertyName: t.propertyName, assigneeName: t.assigneeName,
      scheduledStart: t.scheduledStart, category: t.category,
    }));
  } catch { ctx.recentTasks = []; }

  try {
    const facilities = await getFacilities();
    ctx.facilityCount = facilities.length;
    ctx.facilityTypes = [...new Set(facilities.map(f => f.type))];
  } catch { ctx.facilityCount = 0; }

  try {
    const overdues = await prisma.scheduledTask.findMany({
      where: { status: 'overdue' },
      select: { id: true, title: true, propertyName: true },
    });
    ctx.overdueCount = overdues.length;
  } catch { ctx.overdueCount = 0; }

  try {
    const handoffs = await prisma.shiftHandoff.findMany({
      where: { acknowledged: false },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });
    ctx.unacknowledgedHandoffs = handoffs.length;
  } catch { ctx.unacknowledgedHandoffs = 0; }

  return ctx;
}

export async function executeAction(action, params, user, summaryMessage) {
  const correlationId = `chat_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  try {
    let result;
    let message = summaryMessage || '';

    switch (action) {
      case 'query_schedule': {
        const tasks = await getScheduledTasks({
          propertyName: params.propertyName,
          status: params.status,
          assigneeName: params.assigneeName,
          category: params.category,
          startDate: params.date || null,
          limit: params.limit || 50,
        });
        message = message || formatTaskListMessage(tasks);
        result = { tasks, count: tasks.length };
        break;
      }
      case 'query_incomplete_tasks': {
        const tasks = await prisma.scheduledTask.findMany({
          where: { status: 'incomplete' },
          orderBy: { updatedAt: 'desc' },
          take: params.limit || 50,
        });
        message = message || formatTaskListMessage(tasks, 'Incomplete Tasks');
        result = { tasks, count: tasks.length };
        break;
      }
      case 'query_overdue_tasks': {
        const tasks = await prisma.scheduledTask.findMany({
          where: { status: 'overdue' },
          orderBy: { scheduledStart: 'asc' },
        });
        message = message || formatTaskListMessage(tasks, 'Overdue Tasks');
        result = { tasks, count: tasks.length };
        break;
      }
      case 'query_empty_rooms': {
        const today = new Date().toISOString().split('T')[0];
        result = await fetchEmptyRooms(today);
        if (params.propertyName) result = result.filter(r => r.propertyName === params.propertyName);
        message = message || formatEmptyRoomsMessage(result);
        break;
      }
      case 'query_facilities': {
        result = await getFacilities({
          propertyId: params.propertyId || null,
          type: params.type || null,
        });
        message = message || `Found ${result.length} facilities.`;
        break;
      }
      case 'query_handoffs': {
        result = await getHandoffs({
          propertyName: params.propertyName || null,
          shiftTo: params.shiftTo || null,
          acknowledged: params.acknowledged === false ? false : null,
        });
        message = message || `Found ${result.length} handoffs.`;
        break;
      }
      case 'create_task': {
        const task = await createScheduledTask({
          title: params.title,
          category: params.category || 'other',
          propertyName: params.propertyName,
          assigneeName: params.assigneeName,
          scheduledStart: params.scheduledStart || null,
          shift: params.shift || null,
          description: params.description || null,
          priority: params.priority || 'medium',
          instructions: params.instructions || null,
          generatedSource: 'chatbot',
        }, { email: user.email, name: user.name || user.email });
        message = `Task "${task.title}" created.`;
        result = { task, message };
        break;
      }
      case 'update_task': {
        result = await updateScheduledTask(params.id, {
          status: params.status || undefined,
          assigneeName: params.assigneeName || undefined,
          scheduledStart: params.scheduledStart || undefined,
        }, { email: user.email, name: user.name || user.email });
        message = `Task updated successfully.`;
        break;
      }
      case 'complete_task': {
        result = await updateScheduledTask(params.id, {
          status: 'completed',
          completionNotes: params.completionNotes || null,
          completedAt: new Date().toISOString(),
        }, { email: user.email, name: user.name || user.email });
        message = `Task marked as completed.`;
        break;
      }
      case 'mark_incomplete': {
        result = await updateScheduledTask(params.id, {
          status: 'incomplete',
          incompleteReason: params.reason || null,
        }, { email: user.email, name: user.name || user.email });
        message = `Task marked as incomplete.`;
        break;
      }
      case 'reassign_task': {
        result = await updateScheduledTask(params.id, {
          assigneeName: params.assigneeName,
        }, { email: user.email, name: user.name || user.email });
        message = `Task reassigned to ${params.assigneeName}.`;
        break;
      }
      case 'reschedule_task': {
        result = await updateScheduledTask(params.id, {
          scheduledStart: params.scheduledStart || null,
          shift: params.shift || null,
        }, { email: user.email, name: user.name || user.email });
        message = `Task rescheduled.`;
        break;
      }
      case 'create_handoff': {
        result = await createHandoff({
          propertyName: params.propertyName,
          shiftFrom: params.shiftFrom,
          shiftTo: params.shiftTo,
          notes: params.notes,
          taskIds: params.taskIds,
        }, { email: user.email, name: user.name || user.email });
        message = `Handoff created: ${params.shiftFrom || '?'} -> ${params.shiftTo || '?'}.`;
        break;
      }
      case 'acknowledge_handoff': {
        result = await acknowledgeHandoff(params.id, { email: user.email, name: user.name || user.email });
        message = `Handoff acknowledged.`;
        break;
      }
      case 'add_facility': {
        result = await createFacility({
          propertyId: params.propertyId,
          type: params.type || 'other',
          name: params.name,
          floorOrArea: params.floorOrArea || null,
          notes: params.notes || null,
          verificationStatus: 'needs_verification',
        }, { email: user.email, name: user.name || user.email });
        message = `Facility "${params.name}" added.`;
        break;
      }
      case 'update_facility': {
        const { updateFacility } = await import('./facilities');
        result = await updateFacility(params.id, {
          name: params.name || undefined,
          type: params.type || undefined,
          active: params.active !== undefined ? params.active : undefined,
          notes: params.notes || undefined,
        }, { email: user.email, name: user.name || user.email });
        message = `Facility updated.`;
        break;
      }
      case 'sync_empty_rooms': {
        const { fetchEmptyRooms } = await import('./cloudbeds');
        const today = new Date().toISOString().split('T')[0];
        result = await fetchEmptyRooms(today);
        const total = result.reduce((s, p) => s + p.emptyRooms.length, 0);
        message = `Sync complete. ${total} empty rooms found across ${result.length} properties.`;
        result = { synced: true, count: total };
        break;
      }
      case 'create_empty_room_tasks': {
        const { fetchEmptyRooms } = await import('./cloudbeds');
        const today = new Date().toISOString().split('T')[0];
        const rooms = await fetchEmptyRooms(today);
        const propertyRooms = params.propertyName
          ? rooms.filter(r => r.propertyName === params.propertyName)
          : rooms;
        const tasks = [];
        for (const prop of propertyRooms) {
          for (const room of prop.emptyRooms || []) {
            const task = await createScheduledTask({
              title: `[Auto] ${params.taskCategory === 'cockroach_spraying' ? 'Cockroach Spray' : 'Room Check'}: ${room.roomName} at ${prop.propertyName}`,
              category: params.taskCategory || 'other',
              propertyName: prop.propertyName,
              roomId: room.roomName,
              scheduledStart: today,
              shift: 'night',
              priority: 'medium',
              generatedSource: 'chatbot',
            }, { email: user.email, name: user.name || user.email });
            tasks.push(task);
          }
        }
        message = `Created ${tasks.length} task(s) from empty rooms.`;
        result = { tasks, count: tasks.length, message };
        break;
      }
      case 'query_history': {
        const { getAuditLogs } = await import('./audit');
        result = await getAuditLogs({
          entityType: params.entityType || null,
          entityId: params.entityId || null,
          limit: params.limit || 50,
        });
        message = `Found ${result.length} audit log entries.`;
        break;
      }
      case 'revert_change': {
        result = await revertChange(params.auditLogId, { email: user.email, name: user.name || user.email });
        message = `Change reverted.`;
        break;
      }
      case 'query_bathrooms': {
        const bw = await prisma.facility.findMany({
          where: {
            type: 'bathroom',
            ...(params.propertyCode ? { propertyCode: params.propertyCode } : {}),
            ...(params.bathroomType ? { bathroomType: params.bathroomType } : {}),
          },
          orderBy: [{ propertyCode: 'asc' }, { name: 'asc' }],
        });
        message = `Found ${bw.length} bathrooms.`;
        result = { bathrooms: bw, count: bw.length };
        break;
      }
      case 'query_rooms': {
        const rw = await prisma.room.findMany({
          where: {
            ...(params.propertyCode ? { propertyCode: params.propertyCode } : {}),
            ...(params.verificationStatus ? { verificationStatus: params.verificationStatus } : {}),
          },
          orderBy: [{ propertyCode: 'asc' }, { roomNumber: 'asc' }],
        });
        message = `Found ${rw.length} rooms.`;
        result = { rooms: rw, count: rw.length };
        break;
      }
      case 'generate_bathroom_tasks': {
        const { generateBathroomDeepCleanTasks } = await import('./scheduling');
        result = await generateBathroomDeepCleanTasks(
          { email: user.email, name: user.name || user.email },
          { propertyCode: params.propertyCode || null, dateStr: params.dateStr || null, bathroomsPerCleaner: params.bathroomsPerCleaner || 1 }
        );
        message = `Generated ${result.length} bathroom deep clean task(s).`;
        break;
      }
      case 'generate_vent_tasks': {
        const { generateVentCleaningTasks } = await import('./scheduling');
        result = await generateVentCleaningTasks(
          { email: user.email, name: user.name || user.email },
          { propertyCode: params.propertyCode || null, daysOfWeek: params.daysOfWeek || ['Monday', 'Wednesday'], bathroomsPerSession: params.bathroomsPerSession || 4, weeksAhead: params.weeksAhead || 2 }
        );
        message = `Generated ${result.length} vent cleaning task(s).`;
        break;
      }
      case 'generate_daily_tasks': {
        const { generateDailyAutomatedTasks } = await import('./scheduling');
        result = await generateDailyAutomatedTasks(
          { email: user.email, name: user.name || user.email },
          params.propertyCode || 'ALL'
        );
        message = `Generated ${result.length} daily task(s).`;
        break;
      }
      case 'create_follow_up': {
        const { createFollowUpShift } = await import('./scheduling');
        result = await createFollowUpShift(params.taskId,
          { email: user.email, name: user.name || user.email },
          { assignedTo: params.assignedTo || 'Brema', shiftHours: params.shiftHours || 5, followUpDate: params.followUpDate || null }
        );
        message = `Follow-up shift created for ${params.assignedTo || 'Brema'} (${params.shiftHours || 5}h).`;
        break;
      }
      default:
        return { action: 'error', message: `Action "${action}" not implemented yet.` };
    }

    await createAuditLog({
      entityType: 'chatbot', entityId: correlationId, action: `CHATBOT_${action.toUpperCase()}`,
      changedByEmail: user.email, changedByName: user.name || user.email,
      source: SOURCES.CHATBOT, summary: message, correlationId,
      newData: JSON.stringify({ action, params: sanitizeParams(params), result: summarizeResult(result) }),
    });

    return { action, message, result, correlationId };
  } catch (err) {
    console.error(`[Chatbot] Action "${action}" failed:`, err.message);
    return { action: 'error', message: `Failed to execute "${action}": ${err.message}` };
  }
}

function formatTaskListMessage(tasks, heading) {
  if (!tasks?.length) return heading ? `${heading}: none found.` : 'No tasks found.';
  const title = heading ? `${heading} (${tasks.length}):` : `Found ${tasks.length} task(s):`;
  const items = tasks.slice(0, 8).map(t =>
    `  - ${t.title} | ${t.propertyName || '-'} | ${t.status || '-'} | ${t.assigneeName || 'unassigned'}`
  ).join('\n');
  const more = tasks.length > 8 ? `\n  ... and ${tasks.length - 8} more` : '';
  return `${title}\n${items}${more}`;
}

function formatEmptyRoomsMessage(properties) {
  if (!properties?.length) return 'No empty room data available.';
  const lines = [];
  let total = 0;
  for (const p of properties) {
    const count = p.emptyRooms?.length || 0;
    total += count;
    lines.push(`${p.propertyName}: ${count} empty (${p.occupiedBeds}/${p.capacity} occupied, ${p.occupancy?.toFixed(1) || 0}%)`);
  }
  return `Empty Rooms (${total} total):\n${lines.map(l => '  - ' + l).join('\n')}`;
}

function sanitizeParams(params) {
  const safe = { ...params };
  delete safe.apiKey;
  delete safe.password;
  delete safe.token;
  return safe;
}

function summarizeResult(result) {
  if (!result) return null;
  if (Array.isArray(result)) return `Array(${result.length})`;
  if (typeof result === 'object') {
    const keys = Object.keys(result).join(', ');
    return `Object{${keys}}`;
  }
  return String(result).slice(0, 200);
}
