/**
 * Higher-order utility wrapping async Express route handlers
 * Catches unhandled rejections and forwards them to next(error).
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;
