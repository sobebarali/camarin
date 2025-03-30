export class CustomError extends Error {
  statusCode: number;
  errors: Record<string, string>[];
  isOperational: boolean;

  constructor(
    message: string, 
    statusCode = 400, 
    errors: Record<string, string>[] = [],
    isOperational = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = isOperational; // Used to identify operational vs programmer errors
    
    // Maintains proper stack trace (only available on V8)
    Error.captureStackTrace(this, this.constructor);
    
    Object.setPrototypeOf(this, CustomError.prototype);
  }
}

// Create factory methods for common error types
export const createBadRequestError = (message: string, errors: Record<string, string>[] = []) => {
  return new CustomError(message, 400, errors);
};

export const createUnauthorizedError = (message = "Unauthorized") => {
  return new CustomError(message, 401);
};

export const createForbiddenError = (message = "Forbidden") => {
  return new CustomError(message, 403);
};

export const createNotFoundError = (message = "Resource not found") => {
  return new CustomError(message, 404);
};

export const createServerError = (message = "Internal server error") => {
  return new CustomError(message, 500, [], false);
}; 