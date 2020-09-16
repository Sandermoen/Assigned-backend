import { ErrorRequestHandler } from 'express';
import logger from '../utils/logger';
import { ValidationError } from 'yup';

const errorHandler: ErrorRequestHandler = (err, _req, res, next) => {
  if (err instanceof Error) {
    logger.error(err.message);
    err.stack && logger.error(err.stack);
    switch (err.name) {
      case 'CastError':
        return res.status(400).send({ error: 'Malformatted id.' });
      case 'ValidationError':
        // Check to see if the error is caused by yup schema validation.
        if (err instanceof ValidationError) {
          return res.status(400).send({ error: err.errors });
        }
        return res.status(400).send({ error: err.message });
      case 'JsonWebTokenError':
        return res.status(401).send({ error: 'Invalid token.' });
      case 'TokenExpiredError':
        return res
          .status(401)
          .send({ error: 'Session expired, please log in again.' });
    }
  }
  return next();
};

export default errorHandler;
