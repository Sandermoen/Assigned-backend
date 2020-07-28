import { ErrorRequestHandler } from 'express';
import logger from '../utils/logger';

const errorHandler: ErrorRequestHandler = (err, _req, res, next) => {
  if (err instanceof Error) {
    logger.error(err.message);
    console.log(err.name);
    switch (err.name) {
      case 'CastError':
        return res.status(400).send({ error: 'Malformatted id.' });
      case 'ValidationError':
        return res.status(400).send({ error: err.message });
      case 'JsonWebTokenError':
        return res.status(401).send({ error: 'Invalid token.' });
    }
  }
  return next();
};

export default errorHandler;
