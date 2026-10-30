/**
 * NoSQL Injection Sanitization Middleware
 * Recursively scans req.body, req.query, and req.params for prohibited keys.
 * Rejects any payload containing keys starting with '$' or containing dots '.'
 * to prevent MongoDB query selector injection and field path traversal attacks.
 */

export function hasForbiddenMongoKey(value) {
  if (!value || typeof value !== 'object') {
    return false;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      if (hasForbiddenMongoKey(item)) {
        return true;
      }
    }
    return false;
  }

  for (const key of Object.keys(value)) {
    if (key.startsWith('$') || key.includes('.')) {
      return true;
    }
    if (hasForbiddenMongoKey(value[key])) {
      return true;
    }
  }

  return false;
}

const mongoSanitize = (req, res, next) => {
  if (
    hasForbiddenMongoKey(req.body) ||
    hasForbiddenMongoKey(req.query) ||
    hasForbiddenMongoKey(req.params)
  ) {
    return res.status(400).json({
      success: false,
      message: "Malformed request: parameter keys cannot contain '$' or '.'"
    });
  }

  next();
};

export default mongoSanitize;
