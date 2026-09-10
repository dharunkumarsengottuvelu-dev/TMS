import { ApiError } from '../utils/apiError.js';

/**
 * Validate request body and/or query parameters against Zod schemas
 *
 * @param {object} schemas
 * @param {import('zod').ZodSchema} [schemas.body] - Schema for req.body
 * @param {import('zod').ZodSchema} [schemas.query] - Schema for req.query
 * @param {import('zod').ZodSchema} [schemas.params] - Schema for req.params
 */
export function validateRequest({ body, query, params } = {}) {
  return (req, _res, next) => {
    try {
      if (body) {
        req.body = body.parse(req.body);
      }
      if (query) {
        req.query = query.parse(req.query);
      }
      if (params) {
        req.params = params.parse(req.params);
      }
      next();
    } catch (error) {
      if (error.name === 'ZodError') {
        const issues = error.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        }));
        return next(ApiError.unprocessable('Request validation failed', issues));
      }
      next(error);
    }
  };
}
