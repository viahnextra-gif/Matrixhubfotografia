import { NextFunction, Request, Response } from 'express';
import { HttpError } from '../types/http-error';

export const errorHandler = (err: Error, _req: Request, res: Response, _next: NextFunction): void => {
  const status = err instanceof HttpError ? err.statusCode : 500;
  const message = err.message || 'Internal Server Error';

  res.status(status).json({
    status,
    message,
  });
};
