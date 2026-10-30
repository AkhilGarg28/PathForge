import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';

export const COOKIE_NAME = 'token';

/**
 * Returns cookie options conforming to production/development security requirements.
 */
export const getCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
    path: '/'
  };
};

/**
 * Signs a payload into a JWT.
 */
export const signToken = (payload) => {
  const secret = config.jwtSecret || process.env.JWT_SECRET;
  return jwt.sign(payload, secret, {
    expiresIn: config.jwtExpiresIn || '7d'
  });
};

/**
 * Verifies a JWT token.
 */
export const verifyToken = (token) => {
  const secret = config.jwtSecret || process.env.JWT_SECRET;
  return jwt.verify(token, secret);
};
