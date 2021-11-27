import { ErrorRequestHandler } from 'express';
import { ErrorResponse } from '../error/error';

export const errorHandler: ErrorRequestHandler = (
  err: ErrorResponse,
  req,
  res,
  next,
) => {
  res.status(err.status || 500).json({
    message: err.message || 'internal server error',
    status: err.status || 500,
  });
};
