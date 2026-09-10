/**
 * Standard API response formatter
 */
export function sendSuccess(res, data = null, message = 'Operation successful', statusCode = 200, pagination = null) {
  const payload = {
    success: true,
    message,
    data,
  };

  if (pagination) {
    payload.pagination = pagination;
  }

  return res.status(statusCode).json(payload);
}

export function sendError(res, message = 'Internal Server Error', statusCode = 500, errors = []) {
  return res.status(statusCode).json({
    success: false,
    message,
    errors: Array.isArray(errors) ? errors : [errors],
  });
}
