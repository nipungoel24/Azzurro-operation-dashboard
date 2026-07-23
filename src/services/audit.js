import { prisma } from '../lib/prisma';

export const SOURCES = {
  UI: 'ui',
  CHATBOT: 'chatbot',
  CLOUDBEDS_SYNC: 'cloudbeds_sync',
  SCHEDULER: 'scheduler',
  CRON: 'cron',
  SYSTEM: 'system',
  REVERT: 'revert',
};

export async function createAuditLog({
  entityType = 'task',
  entityId,
  action,
  changedByEmail,
  changedByName = null,
  actorRole = null,
  source = SOURCES.UI,
  summary = null,
  reason = null,
  oldData = null,
  newData = null,
  correlationId = null,
  batchId = null,
  revertedAuditId = null,
}) {
  try {
    await prisma.auditLog.create({
      data: {
        entityType,
        entityId,
        action,
        changedByEmail: changedByEmail || 'system',
        changedByName,
        actorRole,
        source,
        summary,
        reason,
        oldData: oldData ? (typeof oldData === 'string' ? oldData : JSON.stringify(oldData)) : null,
        newData: newData ? (typeof newData === 'string' ? newData : JSON.stringify(newData)) : null,
        correlationId,
        batchId,
        revertedAuditId,
      },
    });
  } catch (err) {
    console.error('[Audit] Failed to create audit log:', err.message);
  }
}

export async function getAuditLogs({
  entityType = null,
  entityId = null,
  changedByEmail = null,
  source = null,
  limit = 100,
  offset = 0,
  startDate = null,
  endDate = null,
}) {
  try {
    const where = {};
    if (entityType) where.entityType = entityType;
    if (entityId) where.entityId = entityId;
    if (changedByEmail) where.changedByEmail = changedByEmail;
    if (source) where.source = source;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const logs = await prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });
    return logs;
  } catch (err) {
    console.error('[Audit] Failed to fetch audit logs:', err.message);
    return [];
  }
}

export async function getAuditLogById(id) {
  try {
    return await prisma.auditLog.findUnique({ where: { id } });
  } catch (err) {
    console.error('[Audit] Failed to fetch audit log:', err.message);
    return null;
  }
}
