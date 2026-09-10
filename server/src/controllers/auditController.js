import * as auditService from '../services/auditService.js';
import { sendSuccess } from '../utils/apiResponse.js';

export async function getAuditLogs(req, res, next) {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const { entity, search } = req.query;

    const result = await auditService.getAuditLogs({ page, limit, entity, search });
    return sendSuccess(res, result.logs, 'Audit logs retrieved', 200, result.pagination);
  } catch (error) {
    next(error);
  }
}
