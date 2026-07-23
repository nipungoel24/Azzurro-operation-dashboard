import { prisma } from '../lib/prisma';
import { createAuditLog, SOURCES, getAuditLogById } from './audit';

export async function revertChange(auditLogId, user) {
  const auditEntry = await getAuditLogById(auditLogId);
  if (!auditEntry) throw new Error('Audit entry not found');

  if (auditEntry.revertedAuditId) {
    throw new Error('This change has already been reverted');
  }

  const { entityType, entityId, oldData } = auditEntry;
  if (!oldData) throw new Error('No previous state available to revert to');

  let previousState;
  try {
    previousState = typeof oldData === 'string' ? JSON.parse(oldData) : oldData;
  } catch {
    throw new Error('Cannot parse previous state');
  }

  let currentEntity;
  const modelMap = {
    facility: { model: prisma.facility, name: 'facility' },
    scheduled_task: { model: prisma.scheduledTask, name: 'scheduled task' },
    property: { model: prisma.property, name: 'property' },
  };

  const mapped = modelMap[entityType];
  if (!mapped) throw new Error(`Cannot revert entity type: ${entityType}`);

  try {
    currentEntity = await mapped.model.findUnique({ where: { id: entityId } });
  } catch {
    currentEntity = null;
  }

  if (!currentEntity) {
    throw new Error(`${mapped.name} no longer exists — cannot revert`);
  }

  let revertedEntity;
  const revertedAt = new Date().toISOString();

  switch (entityType) {
    case 'scheduled_task': {
      const { status, assigneeName, assigneeId, scheduledStart, priority, incompleteReason, completionNotes } = previousState;
      revertedEntity = await prisma.scheduledTask.update({
        where: { id: entityId },
        data: {
          status: status || currentEntity.status,
          assigneeName: assigneeName !== undefined ? assigneeName : currentEntity.assigneeName,
          assigneeId: assigneeId !== undefined ? assigneeId : currentEntity.assigneeId,
          scheduledStart: scheduledStart !== undefined ? scheduledStart : currentEntity.scheduledStart,
          priority: priority !== undefined ? priority : currentEntity.priority,
          incompleteReason: incompleteReason !== undefined ? incompleteReason : null,
          completionNotes: completionNotes !== undefined ? completionNotes : null,
          version: (currentEntity.version || 1) + 1,
          updatedBy: user.email,
          updatedByName: user.name || user.email,
        },
      });
      break;
    }
    case 'facility': {
      const { name, type, active, verificationStatus, notes, floorOrArea } = previousState;
      revertedEntity = await prisma.facility.update({
        where: { id: entityId },
        data: {
          name: name || currentEntity.name,
          type: type || currentEntity.type,
          active: active !== undefined ? active : currentEntity.active,
          verificationStatus: verificationStatus || currentEntity.verificationStatus,
          notes: notes !== undefined ? notes : currentEntity.notes,
          floorOrArea: floorOrArea !== undefined ? floorOrArea : currentEntity.floorOrArea,
        },
      });
      break;
    }
    default:
      throw new Error(`Revert not implemented for: ${entityType}`);
  }

  await createAuditLog({
    entityType,
    entityId,
    action: 'REVERT',
    changedByEmail: user.email,
    changedByName: user.name || user.email,
    source: SOURCES.REVERT,
    summary: `Reverted change from ${auditEntry.createdAt?.toISOString() || 'unknown'}`,
    reason: `User reverted audit log #${auditLogId}`,
    oldData: JSON.stringify(currentEntity),
    newData: JSON.stringify(revertedEntity),
    batchId: auditEntry.batchId || null,
    revertedAuditId: auditLogId,
  });

  return { success: true, revertedEntity, auditEntry };
}

export async function revertBatch(batchId, user) {
  if (!batchId) throw new Error('batchId is required');

  const entries = await prisma.auditLog.findMany({
    where: { batchId },
    orderBy: { createdAt: 'desc' },
  });

  if (!entries.length) throw new Error('No batch entries found');

  const results = [];
  for (const entry of entries) {
    if (entry.revertedAuditId) continue;
    try {
      const result = await revertChange(entry.id, user);
      results.push({ id: entry.id, status: 'reverted' });
    } catch (err) {
      results.push({ id: entry.id, status: 'failed', error: err.message });
    }
  }

  await createAuditLog({
    entityType: 'batch',
    entityId: batchId,
    action: 'BATCH_REVERT',
    changedByEmail: user.email,
    changedByName: user.name || user.email,
    source: SOURCES.REVERT,
    summary: `Batch revert of ${results.filter(r => r.status === 'reverted').length}/${results.length} changes`,
    batchId,
    newData: JSON.stringify(results),
  });

  return { success: true, results };
}

export async function isRevertEligible(auditLogId) {
  const entry = await getAuditLogById(auditLogId);
  if (!entry) return { eligible: false, reason: 'Audit entry not found' };
  if (entry.revertedAuditId) return { eligible: false, reason: 'Already reverted' };
  if (entry.action === 'DELETE') return { eligible: false, reason: 'Cannot revert deletions' };
  if (entry.action === 'REVERT' || entry.action === 'BATCH_REVERT') {
    return { eligible: false, reason: 'Cannot revert a revert' };
  }
  if (!entry.oldData) return { eligible: false, reason: 'No previous state recorded' };

  const validTypes = ['facility', 'scheduled_task'];
  if (!validTypes.includes(entry.entityType)) {
    return { eligible: false, reason: `Entity type "${entry.entityType}" not revertible` };
  }

  return { eligible: true };
}
