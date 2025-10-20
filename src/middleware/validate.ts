import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';
import type { ApiResponse } from '../types';

/**
 * Middleware factory to validate request body against a Zod schema
 * @param schema - Zod schema to validate against
 * @returns Express middleware function
 */
export const validate = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Validate and parse the request body
      const parsed = schema.parse(req.body);
      
      // Replace req.body with the parsed (and potentially transformed) data
      req.body = parsed;
      
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Format Zod validation errors
        const errors = error.issues.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors,
        } satisfies ApiResponse);
        return;
      }

      // Handle unexpected errors
      res.status(500).json({
        success: false,
        error: 'Internal server error during validation',
      } satisfies ApiResponse);
    }
  };
};

/**
 * Middleware factory to validate request query parameters against a Zod schema
 * @param schema - Zod schema to validate against
 * @returns Express middleware function
 */
export const validateQuery = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const parsed = schema.parse(req.query);
      req.query = parsed as any;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.issues.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        res.status(400).json({
          success: false,
          error: 'Query validation failed',
          details: errors,
        } satisfies ApiResponse);
        return;
      }

      res.status(500).json({
        success: false,
        error: 'Internal server error during validation',
      } satisfies ApiResponse);
    }
  };
};

/**
 * Middleware factory to validate request params against a Zod schema
 * @param schema - Zod schema to validate against
 * @returns Express middleware function
 */
export const validateParams = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const parsed = schema.parse(req.params);
      req.params = parsed as any;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.issues.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        res.status(400).json({
          success: false,
          error: 'Parameter validation failed',
          details: errors,
        } satisfies ApiResponse);
        return;
      }

      res.status(500).json({
        success: false,
        error: 'Internal server error during validation',
      } satisfies ApiResponse);
    }
  };
};
