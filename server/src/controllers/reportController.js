import * as reportService from '../services/reportService.js';
import { sendSuccess } from '../utils/apiResponse.js';

export async function getExecutiveReport(req, res, next) {
  try {
    const report = await reportService.getExecutiveReport();
    return sendSuccess(res, report, 'Executive summary retrieved', 200);
  } catch (error) {
    next(error);
  }
}

export async function getEmployeePerformanceReport(req, res, next) {
  try {
    const report = await reportService.getEmployeePerformanceReport();
    return sendSuccess(res, report, 'Employee performance analytics retrieved', 200);
  } catch (error) {
    next(error);
  }
}
