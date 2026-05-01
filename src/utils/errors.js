class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404);
  }
}

class ValidationError extends AppError {
  constructor(message = 'Validation failed') {
    super(message, 400);
  }
}

const handlePrismaError = (err) => {
  if (err.code === 'P2002') return new AppError('A record with this value already exists.', 409);
  if (err.code === 'P2025') return new NotFoundError('Record not found.');
  if (err.code === 'P2014') return new AppError('The change you are trying to make would violate a required relation.', 400);
  if (err.code === 'P2003') return new AppError('Foreign key constraint failed.', 400);
  return new AppError('Database error. Please check your connection and try again.', 500);
};

module.exports = { AppError, NotFoundError, ValidationError, handlePrismaError };
