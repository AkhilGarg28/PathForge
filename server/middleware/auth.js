import { verifyToken, COOKIE_NAME } from '../utils/jwt.js';
import User from '../models/User.js';

/**
 * Authentication verification middleware
 * Inspects httpOnly cookie (or Bearer header), verifies JWT signature,
 * validates user existence, and attaches req.user.
 */
const authMiddleware = async (req, res, next) => {
  let token = req.cookies ? req.cookies[COOKIE_NAME] : null;

  // Fallback to Bearer authorization header if cookie is absent
  if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. No token provided.'
    });
  }

  try {
    const decoded = verifyToken(token);

    if (!decoded || !decoded.id) {
      return res.status(401).json({
        success: false,
        message: 'Invalid authentication token.'
      });
    }

    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User account no longer exists.'
      });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Authentication token has expired. Please log in again.'
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Invalid authentication token.'
    });
  }
};

export default authMiddleware;
