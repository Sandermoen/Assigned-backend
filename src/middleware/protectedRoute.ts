import { RequestHandler } from 'express';

const protectedRoute: RequestHandler = (req, res, next) => {
  if (!req.token) {
    return res.status(401).send({ error: 'Not authorized.' });
  }
  return next();
};

export default protectedRoute;
