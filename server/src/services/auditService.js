import { AuditLog } from '../models/AuditLog.js';

export async function recordAudit({ actor, role, action, entity, entityId = null, details = {}, ip = '127.0.0.1' }) {
  try {
    return await AuditLog.create({
      actor,
      role,
      action,
      entity,
      entityId,
      details,
      ip,
    });
  } catch (error) {
    console.error('⚠️ [AuditService] Failed to record audit log:', error.message);
    return null;
  }
}

export async function getAuditLogs({ page = 1, limit = 20, entity, search }) {
  const query = {};
  if (entity) {
    query.entity = entity;
  }
  if (search && search.trim()) {
    const searchRegex = new RegExp(search.trim(), 'i');
    query.$or = [{ action: searchRegex }, { ip: searchRegex }];
  }

  const skip = (page - 1) * limit;
  const [logs, total] = await Promise.all([
    AuditLog.find(query)
      .populate('actor', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    AuditLog.countDocuments(query),
  ]);

  return {
    logs,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
}
