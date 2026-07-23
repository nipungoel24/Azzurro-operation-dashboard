import { prisma } from '../lib/prisma';
import { createAuditLog, SOURCES } from './audit';

export async function createHandoff(data, user) {
  const handoffData = {
    ...data,
    preparedBy: user.email,
    preparedByName: user.name || user.email,
    acknowledged: false,
    taskIds: Array.isArray(data.taskIds) ? JSON.stringify(data.taskIds) : (data.taskIds || null),
  };

  const handoff = await prisma.shiftHandoff.create({ data: handoffData });

  await createAuditLog({
    entityType: 'shift_handoff', entityId: handoff.id, action: 'CREATE',
    changedByEmail: user.email, changedByName: user.name || user.email,
    source: SOURCES.UI, summary: `Created shift handoff from ${data.shiftFrom || '?'} to ${data.shiftTo || '?'}`,
    newData: JSON.stringify(handoff),
  });

  return handoff;
}

export async function acknowledgeHandoff(id, user) {
  const existing = await prisma.shiftHandoff.findUnique({ where: { id } });
  if (!existing) throw new Error('Handoff not found');

  const handoff = await prisma.shiftHandoff.update({
    where: { id },
    data: {
      acknowledged: true,
      acknowledgedBy: user.email,
      acknowledgedAt: new Date().toISOString(),
    },
  });

  await createAuditLog({
    entityType: 'shift_handoff', entityId: handoff.id, action: 'UPDATE',
    changedByEmail: user.email, changedByName: user.name || user.email,
    source: SOURCES.UI, summary: `Acknowledged shift handoff`,
    oldData: JSON.stringify({ acknowledged: false }),
    newData: JSON.stringify({ acknowledged: true, acknowledgedBy: user.email }),
  });

  return handoff;
}

export async function getHandoffs({ propertyName = null, shiftTo = null, acknowledged = null } = {}) {
  const where = {};
  if (propertyName) where.propertyName = propertyName;
  if (shiftTo) where.shiftTo = shiftTo;
  if (acknowledged !== null) where.acknowledged = acknowledged;

  const handoffs = await prisma.shiftHandoff.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  return handoffs.map(h => ({
    ...h,
    taskIds: h.taskIds ? JSON.parse(h.taskIds) : [],
  }));
}

export async function getHandoff(id) {
  const h = await prisma.shiftHandoff.findUnique({ where: { id } });
  if (!h) return null;
  return { ...h, taskIds: h.taskIds ? JSON.parse(h.taskIds) : [] };
}
