import { rateLimit } from 'express-rate-limit';

const isTest = process.env.NODE_ENV === 'test' || process.env.DISABLE_RATE_LIMIT === 'true';

const windowMs = Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000;
const authMax = Number(process.env.RATE_LIMIT_AUTH_MAX) || 10;
const submitMax = Number(process.env.RATE_LIMIT_SUBMIT_MAX) || 15;
const generalMax = Number(process.env.RATE_LIMIT_GENERAL_MAX) || 100;

/**
 * Creates a rate limiter instance with the standard PathForge API error response shape.
 */
export function createRateLimiter({ window = windowMs, max, message, forceEnable = false }) {
  return rateLimit({
    windowMs: window,
    limit: max,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    skip: () => !forceEnable && isTest,
    handler: (req, res, _next, options) => {
      res.status(options.statusCode || 429).json({
        success: false,
        message: message || 'Too many requests, please try again later.'
      });
    }
  });
}

/**
 * Strict rate limiter for authentication routes (signup / login)
 * Default: 10 requests per 15 minutes per IP
 */
export const authLimiter = createRateLimiter({
  max: authMax,
  message: 'Too many authentication attempts from this IP. Please try again after 15 minutes.'
});

/**
 * Moderate rate limiter for resource-intensive diagnostic assessment submissions
 * Default: 15 requests per 15 minutes per IP
 */
export const submitLimiter = createRateLimiter({
  max: submitMax,
  message: 'Too many diagnostic submissions from this IP. Please try again after 15 minutes.'
});

/**
 * General rate limiter for general API routes
 * Default: 100 requests per 15 minutes per IP
 */
export const generalLimiter = createRateLimiter({
  max: generalMax,
  message: 'Too many requests from this IP. Please try again after 15 minutes.'
});
