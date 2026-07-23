import { prisma } from '../lib/prisma';
import { createAuditLog, SOURCES } from './audit';

// ── Statuses, categories, shifts (re-exported) ────────────────────────

const TASK_STATUSES = ['scheduled', 'in_progress', 'completed', 'incomplete', 'cancelled', 'overdue'];
const TASK_CATEGORIES = [
  'bathroom_deep_clean', 'vent_cleaning', 'general_cleaning', 'night_shift',
  'cockroach_spraying', 'ac_check', 'hardware_check', 'supplies',
  'laundry_pod', 'go_key_charge', 'bed_frame_check', 'curtain_rod_check',
  'overnight_maintenance', 'other',
];
const SHIFTS = ['morning', 'afternoon', 'night', 'overnight'];

export function getTaskStatuses() { return TASK_STATUSES; }
export function getTaskCategories() { return TASK_CATEGORIES; }
export function getShifts() { return SHIFTS; }

// ── Deterministic recurrence key ──────────────────────────────────────

export function recurrenceKey(category, propertyName, facilityId, dateStr, shift) {
  return `${category}:${propertyName || 'any'}:${facilityId || 'none'}:${dateStr}:${shift || 'any'}`.toLowerCase().replace(/\s+/g, '_');
}

// ── CRUD ──────────────────────────────────────────────────────────────

export async function createScheduledTask(data, user) {
  const taskData = {
    ...data,
    status: data.status || 'scheduled',
    priority: data.priority || 'medium',
    version: 1,
    createdBy: user.email,
    createdByName: user.name || user.email,
    updatedBy: user.email,
    updatedByName: user.name || user.email,
  };

  if (data.propertyName && !data.propertyId) {
    const property = await prisma.property.findFirst({ where: { name: data.propertyName } });
    if (property) taskData.propertyId = property.id;
  }

  const task = await prisma.scheduledTask.create({ data: taskData });

  await createAuditLog({
    entityType: 'scheduled_task', entityId: task.id, action: 'CREATE',
    changedByEmail: user.email, changedByName: user.name || user.email,
    source: data.generatedSource || SOURCES.UI,
    summary: `Created task: ${task.title}`, newData: JSON.stringify(task),
  });

  return task;
}

export async function updateScheduledTask(id, data, user) {
  const existing = await prisma.scheduledTask.findUnique({ where: { id } });
  if (!existing) throw new Error('Task not found');

  const oldStatus = existing.status;
  const newStatus = data.status || oldStatus;
  const updateData = {
    ...data,
    version: (existing.version || 1) + 1,
    updatedBy: user.email,
    updatedByName: user.name || user.email,
  };
  if (newStatus === 'completed' && !updateData.completedAt) {
    updateData.completedAt = new Date().toISOString();
  }

  const task = await prisma.scheduledTask.update({ where: { id }, data: updateData });

  let summary = `Updated task: ${task.title}`;
  if (oldStatus !== newStatus) summary = `Status changed "${oldStatus}" → "${newStatus}" for: ${task.title}`;

  await createAuditLog({
    entityType: 'scheduled_task', entityId: task.id, action: 'UPDATE',
    changedByEmail: user.email, changedByName: user.name || user.email,
    source: SOURCES.UI, summary,
    oldData: JSON.stringify({ status: oldStatus, ...existing }),
    newData: JSON.stringify(task),
  });
  return task;
}

export async function deleteScheduledTask(id, user) {
  const existing = await prisma.scheduledTask.findUnique({ where: { id } });
  if (!existing) throw new Error('Task not found');
  await prisma.scheduledTask.delete({ where: { id } });
  await createAuditLog({
    entityType: 'scheduled_task', entityId: id, action: 'DELETE',
    changedByEmail: user.email, changedByName: user.name || user.email,
    source: SOURCES.UI, summary: `Deleted task: ${existing.title}`,
    oldData: JSON.stringify(existing),
  });
  return { success: true };
}

export async function getScheduledTasks({
  propertyId = null, propertyName = null, category = null,
  assigneeName = null, shift = null, status = null,
  startDate = null, endDate = null, limit = 200, offset = 0,
} = {}) {
  const where = {};
  if (propertyId) where.propertyId = propertyId;
  if (propertyName) where.propertyName = propertyName;
  if (category) where.category = category;
  if (assigneeName) where.assigneeName = assigneeName;
  if (shift) where.shift = shift;
  if (status) where.status = status;
  if (startDate || endDate) {
    where.scheduledStart = {};
    if (startDate) where.scheduledStart.gte = startDate;
    if (endDate) where.scheduledStart.lte = endDate;
  }
  return await prisma.scheduledTask.findMany({ where, orderBy: [{ scheduledStart: 'asc' }, { priority: 'desc' }], take: limit, skip: offset });
}

export async function getScheduledTask(id) {
  return await prisma.scheduledTask.findUnique({ where: { id } });
}

export async function markTaskIncomplete(id, reason, user) {
  return await updateScheduledTask(id, { status: 'incomplete', incompleteReason: reason }, user);
}

export async function markTaskComplete(id, notes, user) {
  return await updateScheduledTask(id, { status: 'completed', completionNotes: notes || null, completedAt: new Date().toISOString() }, user);
}

export async function reassignTask(id, newAssigneeName, user) {
  return await updateScheduledTask(id, { assigneeName: newAssigneeName }, user);
}

// ══════════════════════════════════════════════════════════════════════
//  SCHEDULING ENGINE
// ══════════════════════════════════════════════════════════════════════

// ── Recurrence: generate next occurrence ──────────────────────────────

export async function generateNextRecurrence(task, user) {
  if (!task.recurrenceReference) return null;

  const [type, intervalStr, unit] = task.recurrenceReference.split(':');
  const interval = parseInt(intervalStr || '1', 10);

  const nextDate = new Date(task.scheduledStart + 'T00:00:00');
  switch (unit || 'days') {
    case 'days': nextDate.setDate(nextDate.getDate() + interval); break;
    case 'weeks': nextDate.setDate(nextDate.getDate() + interval * 7); break;
    case 'months': nextDate.setMonth(nextDate.getMonth() + interval); break;
    default: nextDate.setDate(nextDate.getDate() + 1);
  }
  const nextDateStr = nextDate.toISOString().split('T')[0];
  const key = recurrenceKey(task.category, task.propertyName, task.facilityId, nextDateStr, task.shift);

  const existing = await prisma.scheduledTask.findFirst({
    where: { recurrenceReference: task.recurrenceReference, scheduledStart: nextDateStr, category: task.category, propertyName: task.propertyName },
  });
  if (existing) return null;

  const nextTask = await createScheduledTask({
    title: task.title.replace(/\(\d{4}-\d{2}-\d{2}\)/, `(${nextDateStr})`),
    description: task.description,
    instructions: task.instructions,
    category: task.category,
    propertyName: task.propertyName,
    facilityId: task.facilityId,
    roomId: task.roomId,
    scheduledStart: nextDateStr,
    shift: task.shift,
    assigneeName: task.assigneeName,
    assignedRole: task.assignedRole,
    priority: task.priority,
    recurrenceReference: task.recurrenceReference,
    generatedSource: 'recurrence',
    parentTaskId: task.id,
  }, { email: 'scheduler', name: 'Scheduler' });

  await updateScheduledTask(task.id, { recurrenceReference: task.recurrenceReference }, { email: 'scheduler', name: 'Scheduler' });
  return nextTask;
}

// ── Bathroom deep-clean rotation ──────────────────────────────────────

export async function generateBathroomDeepCleanTasks(user, {
  propertyCode = null, dateStr = null, bathroomsPerCleaner = 1,
} = {}) {
  if (!dateStr) {
    const sydneyNow = new Date(new Date().toLocaleString('en-US', { timeZone: 'Australia/Sydney' }));
    dateStr = sydneyNow.toISOString().split('T')[0];
  }

  const where = { type: 'bathroom', active: true, ownerOccupied: false, cleaningRequired: true };
  if (propertyCode) where.propertyCode = propertyCode;

  const allBathrooms = await prisma.facility.findMany({
    where,
    orderBy: { lastDeepCleanedAt: { sort: 'asc', nulls: 'first' } },
  });

  // Split into shared/common vs ensuite (enclosed in a room)
  const sharedBathrooms = allBathrooms.filter(b => !b.isEnsuite);
  const ensuiteBathrooms = allBathrooms.filter(b => b.isEnsuite && b.assignedRoomId);

  // For ensuite bathrooms, check which rooms are empty today
  let emptyRoomNumbers = new Set();
  if (ensuiteBathrooms.length > 0) {
    try {
      const emptyRooms = await prisma.emptyRoomSnapshot.findMany({
        where: {
          propertyId: { in: [...new Set(ensuiteBathrooms.map(b => b.propertyId))] },
        },
        select: { roomNumber: true, propertyId: true },
      });
      emptyRooms.forEach(r => emptyRoomNumbers.add(`${r.propertyId}:${r.roomNumber}`.toLowerCase()));
    } catch {
      // Cloudbeds data unavailable — fall back to including all bathrooms
    }
  }

  // Determine which ensuite bathrooms are in empty rooms
  let cleanableEnsuite = ensuiteBathrooms;
  if (emptyRoomNumbers.size > 0) {
    cleanableEnsuite = [];
    for (const b of ensuiteBathrooms) {
      try {
        const room = await prisma.room.findUnique({ where: { id: b.assignedRoomId }, select: { roomNumber: true } });
        if (room && emptyRoomNumbers.has(`${b.propertyId}:${room.roomNumber}`.toLowerCase())) {
          cleanableEnsuite.push(b);
        }
      } catch {
        // If room lookup fails, include the bathroom anyway
        cleanableEnsuite.push(b);
      }
    }
  }

  // Combine: shared bathrooms always included, ensuite only if room is empty
  const bathrooms = [...sharedBathrooms, ...cleanableEnsuite].sort((a, b) => {
    const aDate = a.lastDeepCleanedAt ? new Date(a.lastDeepCleanedAt).getTime() : 0;
    const bDate = b.lastDeepCleanedAt ? new Date(b.lastDeepCleanedAt).getTime() : 0;
    return aDate - bDate;
  });

  if (bathrooms.length === 0) return [];

  const createdTasks = [];

  for (let i = 0; i < bathrooms.length; i += bathroomsPerCleaner) {
    const batch = bathrooms.slice(i, i + bathroomsPerCleaner);
    const bathroomNames = batch.map(b => b.name).join(', ');
    const propName = batch[0]?.propertyCode || 'Unknown';
    const key = recurrenceKey('bathroom_deep_clean', propName, bathroomNames, dateStr, 'morning');

    const dup = await prisma.scheduledTask.findFirst({
      where: { category: 'bathroom_deep_clean', scheduledStart: dateStr, facilityId: bathroomNames },
    });
    if (dup) continue;

    const sharedCount = batch.filter(b => !b.isEnsuite).length;
    const ensuiteCount = batch.filter(b => b.isEnsuite).length;
    let typeLabel = '';
    if (sharedCount > 0 && ensuiteCount > 0) typeLabel = `${sharedCount} shared + ${ensuiteCount} ensuite`;
    else if (sharedCount > 0) typeLabel = `${sharedCount} shared`;
    else typeLabel = `${ensuiteCount} ensuite`;

    // Gather room numbers for ensuite bathrooms
    let roomInfo = '';
    if (ensuiteCount > 0) {
      const roomNumbers = [];
      for (const b of batch.filter(b => b.isEnsuite && b.assignedRoomId)) {
        try {
          const rm = await prisma.room.findUnique({ where: { id: b.assignedRoomId }, select: { roomNumber: true } });
          if (rm) roomNumbers.push(rm.roomNumber);
        } catch {}
      }
      if (roomNumbers.length > 0) roomInfo = ` | Rooms: ${roomNumbers.join(', ')}`;
    }

    const task = await createScheduledTask({
      title: `Bathroom Deep Clean: ${bathroomNames} @ ${propName}`,
      description: `Deep clean ${batch.length} bathroom(s) [${typeLabel}]${roomInfo}. Age-based priority.`,
      category: 'bathroom_deep_clean',
      propertyName: propName,
      facilityId: bathroomNames,
      scheduledStart: dateStr,
      shift: 'morning',
      priority: 'high',
      recurrenceReference: 'daily:1:days',
      generatedSource: 'scheduler',
    }, { email: user.email, name: user.name || user.email });

    createdTasks.push({ task, bathrooms: batch.map(b => b.id) });

    // Skip short sleep to prevent overwhelming the DB
    if (i > 0 && i % 100 === 0) await new Promise(r => setTimeout(r, 10));
  }

  // Update last-deep-clean timestamps to "scheduled" (prevent re-assignment)
  for (const ct of createdTasks) {
    for (const bid of ct.bathrooms) {
      await prisma.facility.update({
        where: { id: bid },
        data: { lastDeepCleanedAt: new Date() },
      }).catch(() => {});
    }
  }

  const skippedEnsuite = allBathrooms.filter(b => b.isEnsuite && b.assignedRoomId).length - cleanableEnsuite.length;

  return { tasks: createdTasks, skippedEnsuite, totalBathrooms: allBathrooms.length, cleanable: bathrooms.length };
}

// ── Vent cleaning scheduling ──────────────────────────────────────────

export async function generateVentCleaningTasks(user, {
  propertyCode = null, daysOfWeek = ['Monday', 'Wednesday'],
  bathroomsPerSession = 4, weeksAhead = 2, assigneeRole = 'cleaner',
} = {}) {
  const createdTasks = [];
  const today = new Date(new Date().toLocaleString('en-US', { timeZone: 'Australia/Sydney' }));
  today.setHours(0, 0, 0, 0);

  // Find next occurrences of target days
  const targetDays = daysOfWeek.map(d => ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'].indexOf(d));
  const dates = [];

  for (let w = 0; w < weeksAhead; w++) {
    for (const td of targetDays) {
      const d = new Date(today);
      d.setDate(d.getDate() + ((td - today.getDay() + 7) % 7) + w * 7);
      if (d > today) dates.push(d.toISOString().split('T')[0]);
    }
  }

  const where = { type: 'bathroom', active: true, isEnsuite: true, cleaningRequired: true };
  if (propertyCode) where.propertyCode = propertyCode;

  const bathrooms = await prisma.facility.findMany({
    where,
    orderBy: { lastVentCleanedAt: { sort: 'asc', nulls: 'first' } },
  });

  for (const dateStr of dates) {
    const todayBaths = bathrooms.filter(b => {
      const last = b.lastVentCleanedAt;
      if (!last) return true;
      const daysSince = (new Date(dateStr + 'T00:00:00') - new Date(last)) / 86400000;
      return daysSince >= 3;
    });

    const candidates = todayBaths.length >= bathroomsPerSession ? todayBaths.slice(0, bathroomsPerSession) : bathrooms.slice(0, bathroomsPerSession);

    if (candidates.length < 2) continue;

    const names = candidates.map(b => b.name).join(', ');
    const key = recurrenceKey('vent_cleaning', propertyCode || 'all', names, dateStr, 'morning');

    const dup = await prisma.scheduledTask.findFirst({
      where: { category: 'vent_cleaning', scheduledStart: dateStr, facilityId: names },
    });
    if (dup) continue;

    const task = await createScheduledTask({
      title: `Vent Cleaning: ${candidates.length} bathrooms`,
      description: `Vent cleaning for: ${names}. Covering ~${bathroomsPerSession} bathrooms per session.`,
      category: 'vent_cleaning',
      propertyName: propertyCode || 'All',
      facilityId: names,
      scheduledStart: dateStr,
      shift: 'morning',
      priority: 'medium',
      assignedRole: assigneeRole,
      recurrenceReference: 'weekly:2:weeks',
      generatedSource: 'scheduler',
    }, { email: user.email, name: user.name || user.email });

    createdTasks.push({ task, bathrooms: candidates.map(b => b.id) });

    for (const bid of candidates.map(b => b.id).filter(Boolean)) {
      await prisma.facility.update({
        where: { id: bid },
        data: { lastVentCleanedAt: new Date() },
      }).catch(() => {});
    }
  }

  return createdTasks;
}

// ── Empty-room task generation ────────────────────────────────────────

export async function generateEmptyRoomTasks(user, {
  emptyRooms = [], taskCategory = 'overnight_maintenance', shift = 'overnight',
} = {}) {
  const createdTasks = [];
  const dateStr = new Date(new Date().toLocaleString('en-US', { timeZone: 'Australia/Sydney' })).toISOString().split('T')[0];

  const seenRooms = new Set();

  for (const prop of emptyRooms) {
    const propertyName = prop.propertyName;

    for (const room of (prop.emptyRooms || [])) {
      const baseRoomName = room.roomName.replace(/\.\d+$/, '');
      const dedupeKey = `${propertyName}:${baseRoomName}:${dateStr}`;

      if (seenRooms.has(dedupeKey)) continue;
      seenRooms.add(dedupeKey);

      const dup = await prisma.scheduledTask.findFirst({
        where: { category: taskCategory, scheduledStart: dateStr, roomId: { in: [room.roomName, baseRoomName] }, propertyName },
      });
      if (dup) continue;

      const titlePrefix = taskCategory === 'cockroach_spraying' ? 'Overnight Pest Control' :
        taskCategory === 'overnight_maintenance' ? 'Overnight Maintenance' :
        taskCategory === 'ac_check' ? 'Overnight AC Check' : 'Room Task';

      const task = await createScheduledTask({
        title: `${titlePrefix}: Room ${baseRoomName} @ ${propertyName}`,
        description: `Auto-generated overnight maintenance task for room ${baseRoomName} at ${propertyName}.`,
        category: 'overnight_maintenance',
        propertyName,
        roomId: baseRoomName,
        scheduledStart: dateStr,
        shift: 'overnight',
        priority: 'medium',
        generatedSource: 'cloudbeds_sync',
      }, { email: user.email, name: user.name || user.email });

      createdTasks.push(task);
    }
  }

  return createdTasks;
}

// ── Missing-update detection ──────────────────────────────────────────

export async function detectMissingUpdates(dateStr, shiftCutoff = '17:00') {
  const tasks = await prisma.scheduledTask.findMany({
    where: {
      status: { in: ['scheduled', 'in_progress'] },
      scheduledStart: { lte: dateStr + 'T23:59:59' },
    },
  });

  const flagged = [];

  for (const task of tasks) {
    const hoursSinceScheduled = (new Date() - new Date(task.scheduledStart + 'T00:00:00')) / 3600000;
    if (hoursSinceScheduled > 8) {
      await updateScheduledTask(task.id,
        { status: task.status, handoffNotes: (task.handoffNotes || '') + ' [FLAGGED: missing update]' },
        { email: 'system', name: 'System' }
      );
      flagged.push(task);
    }
  }

  return flagged;
}

// ── Incomplete-task follow-up (Brema workflow) ────────────────────────

export async function createFollowUpShift(incompleteTaskId, user, {
  assignedTo = 'Brema', shiftHours = 5, followUpDate = null,
} = {}) {
  const original = await prisma.scheduledTask.findUnique({ where: { id: incompleteTaskId } });
  if (!original) throw new Error('Original task not found');
  if (original.status !== 'incomplete') throw new Error('Only incomplete tasks can create a follow-up shift');

  if (!followUpDate) {
    const tomorrow = new Date(new Date().toLocaleString('en-US', { timeZone: 'Australia/Sydney' }));
    tomorrow.setDate(tomorrow.getDate() + 1);
    followUpDate = tomorrow.toISOString().split('T')[0];
  }

  const followUp = await createScheduledTask({
    title: `[FOLLOW-UP] ${original.title}`,
    description: `Follow-up ${shiftHours}-hour shift for incomplete task: "${original.title}". Original reason: ${original.incompleteReason || 'not provided'}`,
    category: original.category,
    propertyName: original.propertyName,
    facilityId: original.facilityId,
    roomId: original.roomId,
    scheduledStart: followUpDate,
    shift: 'morning',
    priority: 'high',
    assigneeName: assignedTo,
    assignedRole: assignedTo,
    generatedSource: 'follow_up',
    parentTaskId: original.id,
  }, { email: user.email, name: user.name || user.email });

  await createAuditLog({
    entityType: 'scheduled_task', entityId: followUp.id, action: 'CREATE_FOLLOWUP',
    changedByEmail: user.email, changedByName: user.name || user.email,
    source: SOURCES.UI,
    summary: `Created ${shiftHours}h follow-up shift for incomplete task "${original.title}". Assigned to ${assignedTo}.`,
    oldData: JSON.stringify({ parentTaskId: original.id, incompleteReason: original.incompleteReason }),
    newData: JSON.stringify(followUp),
    correlationId: `followup_${original.id}`,
  });

  return { original, followUp };
}

// ── Overdue check ─────────────────────────────────────────────────────

export async function checkOverdueTasks() {
  const today = new Date(new Date().toLocaleString('en-US', { timeZone: 'Australia/Sydney' })).toISOString().split('T')[0];

  const overdue = await prisma.scheduledTask.findMany({
    where: { status: { in: ['scheduled', 'in_progress'] }, scheduledStart: { lt: today } },
  });

  if (overdue.length === 0) return overdue;

  await prisma.scheduledTask.updateMany({
    where: { id: { in: overdue.map(t => t.id) }, status: { in: ['scheduled', 'in_progress'] } },
    data: { status: 'overdue' },
  });

  for (const task of overdue) {
    await createAuditLog({
      entityType: 'scheduled_task', entityId: task.id, action: 'UPDATE',
      changedByEmail: 'system', changedByName: 'System',
      source: SOURCES.CRON, summary: `Marked overdue: ${task.title}`,
      oldData: JSON.stringify({ status: task.status }),
      newData: JSON.stringify({ status: 'overdue' }),
    });
  }
  return overdue;
}

// ── Duplicate prevention ──────────────────────────────────────────────

export async function isDuplicateTask(category, propertyName, facilityId, dateStr, shift) {
  const existing = await prisma.scheduledTask.findFirst({
    where: { category, propertyName, facilityId, scheduledStart: dateStr, shift },
  });
  return !!existing;
}

// ── Schedule summary for a given date/property ────────────────────────

export async function getScheduleSummary(dateStr, propertyName = null) {
  const where = { scheduledStart: dateStr };
  if (propertyName) where.propertyName = propertyName;

  const tasks = await prisma.scheduledTask.findMany({ where });

  const summary = {
    date: dateStr,
    property: propertyName || 'All',
    total: tasks.length,
    byStatus: {},
    byCategory: {},
    byShift: {},
    incomplete: tasks.filter(t => t.status === 'incomplete'),
    overdue: tasks.filter(t => t.status === 'overdue'),
    missingUpdates: tasks.filter(t => t.status === 'scheduled' && t.createdAt && (new Date() - new Date(t.createdAt)) > 36000000),
  };

  for (const t of tasks) {
    summary.byStatus[t.status] = (summary.byStatus[t.status] || 0) + 1;
    summary.byCategory[t.category || 'other'] = (summary.byCategory[t.category || 'other'] || 0) + 1;
    summary.byShift[t.shift || 'none'] = (summary.byShift[t.shift || 'none'] || 0) + 1;
  }

  return summary;
}

// ── Generate automated daily tasks for a property ─────────────────────

export async function generateDailyAutomatedTasks(user, propertyCode) {
  const dateStr = new Date(new Date().toLocaleString('en-US', { timeZone: 'Australia/Sydney' })).toISOString().split('T')[0];
  const results = [];

  const facilityTypes = [
    { type: 'kitchen', category: 'general_cleaning', title: 'Kitchen Clean' },
    { type: 'laundry_area', category: 'general_cleaning', title: 'Laundry Area Clean' },
    { type: 'laundry_lint_filter', category: 'general_cleaning', title: 'Laundry Lint Filter Clean' },
    { type: 'reception', category: 'general_cleaning', title: 'Reception Clean' },
    { type: 'common_area', category: 'general_cleaning', title: 'Common Area Clean' },
  ];

  for (const ft of facilityTypes) {
    const facilities = await prisma.facility.findMany({
      where: { type: ft.type, propertyCode, active: true },
    });

    for (const fac of facilities) {
      const key = recurrenceKey(ft.category, propertyCode, fac.id, dateStr, 'morning');
      const dup = await prisma.scheduledTask.findFirst({
        where: { category: ft.category, facilityId: fac.id, scheduledStart: dateStr },
      });
      if (dup) continue;

      const task = await createScheduledTask({
        title: `${ft.title}: ${fac.name}`,
        category: ft.category,
        propertyName: fac.propertyName || propertyCode,
        facilityId: fac.id,
        scheduledStart: dateStr,
        shift: 'morning',
        priority: 'low',
        recurrenceReference: fac.defaultTaskFrequency || 'daily:1:days',
        generatedSource: 'scheduler',
      }, { email: user.email, name: user.name || user.email });

      results.push(task);
    }
  }

  return results;
}
