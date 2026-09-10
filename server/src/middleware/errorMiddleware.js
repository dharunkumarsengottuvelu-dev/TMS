import { ApiError } from '../utils/apiError.js';
import { sendError } from '../utils/apiResponse.js';
import { env } from '../config/env.js';

/**
 * Centralized Error Handling Middleware
 */
export function errorHandler(err, _req, res, _next) {
  let statusCode = 500;
  let message = 'Internal Server Error';
  let errors = [];

  // Handled ApiError
  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    errors = err.errors;
  }
  // Mongoose CastError (e.g. invalid ObjectId)
  else if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid format for resource identifier '${err.path}'`;
  }
  // Mongoose Validation Error
  else if (err.name === 'ValidationError') {
    statusCode = 422;
    message = 'Validation Error';
    errors = Object.values(err.errors || {}).map((e) => ({
      field: e.path,
      message: e.message,
    }));
  }
  // MongoDB Duplicate Key Error
  else if (err.code === 11000) {
    statusCode = 409;
    const duplicatedField = Object.keys(err.keyValue || {})[0] || 'field';
    message = `A record with this ${duplicatedField} already exists`;
  }
  // JSON parsing error in request body
  else if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    statusCode = 400;
    message = 'Malformed JSON payload in request body';
  } else {
    // Unexpected internal error
    statusCode = err.statusCode || 500;
    message =
      env.NODE_ENV === 'production'
        ? 'An unexpected error occurred. Please try again later.'
        : err.message || 'Internal Server Error';

    console.error('Unhandled Server Error:', err);
  }

  return sendError(res, message, statusCode, errors);
}

/**
 * 404 Route Not Found Middleware
 */
export function notFoundHandler(req, res, _next) {
  return sendError(res, `Cannot ${req.method} ${req.originalUrl} - Endpoint not found`, 404);
}
