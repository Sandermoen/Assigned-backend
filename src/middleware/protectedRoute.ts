import { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';

const protectedRoute: RequestHandler = (req, res, next) => {
  if (!req.token) {
    return res.status(401).send({ error: 'Not authorized.' });
  }
  if (!process.env.JWT_SECRET) {
    throw new Error('No JWT secret found.');
  }
  jwt.verify(req.token, process.env.JWT_SECRET);
  return next();
};

export default protectedRoute;
