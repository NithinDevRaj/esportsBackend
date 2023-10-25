// Middleware to handle 404 Not Found errors
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);

  // Set the HTTP status code to 404
  res.status(404);
  // Pass the error to the next middleware
  next(error);
};

// Main Error Handling middleware
const errorHandler = (error, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = error.message;

  // Handling CastError in mongoose
  if (error.name === "CastError" && error.kind === "ObjectId") {
    statusCode = 404;
    message = "Resource not found";
  }

  // Send a JSON response with the error message and stack trace (in development)
  res.status(statusCode).json({
    message,
    // For stack trace (only in development environment)
    stack: process.env.NODE_ENV === "production" ? null : error.stack,
  });
};

export { notFound, errorHandler };
