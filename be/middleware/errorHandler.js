function notFoundHandler(req, res) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

function errorHandler(error, req, res, next) {
  const statusCode = error.statusCode || 500;
  const message = error.message || "Internal server error";

  res.status(statusCode).json({
    message,
    ...(process.env.NODE_ENV !== "production" && { stack: error.stack }),
  });
}

module.exports = {
  notFoundHandler,
  errorHandler,
};
