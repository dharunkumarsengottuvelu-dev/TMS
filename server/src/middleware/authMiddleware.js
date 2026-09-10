import { fromNodeHeaders } from 'better-auth/node';
import { auth } from '../auth/auth.js';
import { ApiError } from '../utils/apiError.js';
import { User } from '../models/User.js';

/**
 * Authentication Middleware
 * Validates the session cookie with Better Auth and attaches req.user and req.session.
 */
export async function authenticate(req, _res, next) {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session || !session.user) {
      return next(ApiError.unauthorized('Authentication required. Please log in.'));
    }

    // Always fetch latest authoritative user record from MongoDB
    const dbUser = await User.findById(session.user.id).lean();

    if (!dbUser) {
      return next(ApiError.unauthorized('User record associated with session no longer exists.'));
    }

    if (dbUser.isActive === false) {
      return next(ApiError.forbidden('Your account has been deactivated. Please contact your administrator.'));
    }

    req.user = {
      id: dbUser._id.toString(),
      _id: dbUser._id,
      name: dbUser.name,
      email: dbUser.email,
      role: dbUser.role || 'EMPLOYEE',
      isActive: dbUser.isActive,
      image: dbUser.image,
    };

    req.session = session.session;
    next();
  } catch (error) {
    console.error('Authentication middleware error:', error.message);
    next(ApiError.unauthorized('Invalid or expired session.'));
  }
}
