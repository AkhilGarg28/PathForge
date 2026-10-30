/**
 * 404 Not Found Middleware
 * Intercepts requests that match no defined routes.
 */
const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`
  });
};

export default notFound;
