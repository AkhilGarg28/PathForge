/**
 * Central Express Error Handler Middleware
 * Formats errors into the unified API error shape { success: false, message, errors? }.
 * Redacts internal stacks in production and normalizes Mongoose / JWT error structures.
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || (res.statusCode !== 200 ? res.statusCode : 500);
  let message = err.message || 'Internal Server Error';
  let errors = err.errors;

  // 1. Mongoose Validation Error (Bad Request)
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
    errors = Object.values(err.errors || {}).map((e) => ({
      field: e.path,
      message: e.message
    }));
  }

  // 2. Mongoose Duplicate Key Error (Conflict)
  else if (err.code === 11000) {
    statusCode = 409;
    const duplicatedFields = Object.keys(err.keyValue || {});
    const fieldName = duplicatedFields.length > 0 ? duplicatedFields.join(', ') : 'field';
    message = `Duplicate value entered for ${fieldName}. Please provide a unique value.`;
    errors = duplicatedFields.map((field) => ({
      field,
      message: `${field} must be unique`
    }));
  }

  // 3. Mongoose Cast Error (e.g. invalid ObjectId)
  else if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid format for resource parameter '${err.path}': ${err.value}`;
  }

  // 3b. Mongoose Version / Concurrency Conflict Error
  else if (err.name === 'VersionError') {
    statusCode = 409;
    message = 'Concurrent modification detected. Please refresh and try again.';
  }

  // 4. JWT Verification & Expiration Errors
  else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid authentication token. Please log in again.';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Authentication token has expired. Please log in again.';
  }

  // In production, redact raw 500 internal details
  const isProduction = process.env.NODE_ENV === 'production';
  if (isProduction && statusCode === 500) {
    message = 'An unexpected server error occurred';
    errors = undefined;
  }

  const responsePayload = {
    success: false,
    message
  };

  if (errors && Array.isArray(errors) && errors.length > 0) {
    responsePayload.errors = errors;
  }

  res.status(statusCode).json(responsePayload);
};

export default errorHandler;
