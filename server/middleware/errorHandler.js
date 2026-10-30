const env = require('../config/env');

const notFoundHandler = (req, res, next) => {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

// Central error handler
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || (res.statusCode >= 400 ? res.statusCode : 500);

  // Handle Mongoose cast errors (malformed ObjectIDs) as 400
  if (err.name === 'CastError') {
    statusCode = 400;
  }

  // Handle JSON parse errors from body parser as 400
  if (err.type === 'entity.parse.failed') {
    statusCode = 400;
  }

  let message = err.message || 'Internal Server Error';

  // In production, mask unhandled 500 server errors to prevent information leakage
  if (env.NODE_ENV === 'production' && statusCode === 500) {
    message = 'Internal Server Error';
  }

  const response = {
    message,
  };

  // Stack traces are NEVER exposed in production
  if (env.NODE_ENV !== 'production' && err.stack) {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

module.exports = {
  notFoundHandler,
  errorHandler,
};
