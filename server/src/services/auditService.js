import { AuditLog } from '../models/AuditLog.js';

function normalizeIp(rawIp) {
  if (!rawIp) return '127.0.0.1';
  let ip = String(rawIp).trim();
  if (ip.startsWith('::ffff:')) {
    ip = ip.replace('::ffff:', '');
  }
  if (ip === '::1') {
    ip = '127.0.0.1';
  }
  return ip;
}

export async function recordAudit({ actor, role, action, entity, entityId = null, details = {}, ip = '127.0.0.1' }) {
  try {
    return await AuditLog.create({
      actor,
      role,
      action,
      entity,
      entityId,
      details,
      ip: normalizeIp(ip),
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

  const sanitizedLogs = logs.map((log) => ({
    ...log,
    ip: normalizeIp(log.ip),
  }));

  return {
    logs: sanitizedLogs,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
}
