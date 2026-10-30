/**
 * Middleware to sanitize user input against MongoDB operator injection.
 * Strips any keys starting with '$' or containing '.' from req.body, req.params, and req.query.
 */
const sanitize = (target) => {
  if (!target || typeof target !== 'object') {
    return target;
  }

  if (Array.isArray(target)) {
    target.forEach((item) => sanitize(item));
    return target;
  }

  Object.keys(target).forEach((key) => {
    if (key.startsWith('$') || key.includes('.')) {
      delete target[key];
    } else {
      sanitize(target[key]);
    }
  });

  return target;
};

const mongoSanitize = (req, res, next) => {
  if (req.body) sanitize(req.body);
  if (req.params) sanitize(req.params);
  if (req.query) sanitize(req.query);
  next();
};

module.exports = mongoSanitize;
