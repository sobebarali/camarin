import { Request, Response, NextFunction } from "express";
import { Schema, ZodError } from "zod";
import { CustomError } from "../utils/custom-error.ts";

interface ValidationError {
  path: string;
  message: string;
}

export const validate = (schema: Schema) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const validationErrors: ValidationError[] = error.errors.map((err) => ({
          path: err.path.join("."),
          message: err.message,
        }));
        
        next(new CustomError("Validation failed", 400, validationErrors));
      } else {
        next(new CustomError("Validation failed", 400));
      }
    }
  };
}; 