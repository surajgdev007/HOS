const logger = require('../utils/logger');

exports.errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'SYSTEM ERROR. UNKNOWN FAILURE.';
  
  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 422;
    message = Object.values(err.errors).map(e => e.message).join(', ');
  }
  
  // Mongoose duplicate key
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue)[0];
    message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists.`;
  }
  
  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token. Identity unverified.';
  }
  
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired. Re-authentication required.';
  }
  
  if (statusCode === 500) {
    logger.error(`SERVER ERROR: ${err.message}`, { stack: err.stack });
  }
  
  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

exports.notFound = (req, res) => {
  res.status(404).json({
    success: false,
    message: `ENDPOINT NOT FOUND: ${req.originalUrl}`,
  });
};
