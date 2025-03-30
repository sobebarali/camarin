import { Request, Response, NextFunction } from "express";
import { CustomError } from "../utils/custom-error.ts";
import { logger } from "../utils/logger.ts";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  // Use eslint-disable to indicate intentional non-use
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void => {
  if (err instanceof CustomError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors,
    });
    return;
  }

  logger.error({
    message: err.message,
    error: err.stack,
    method: req.method,
    url: req.originalUrl,
  });

  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
}; 