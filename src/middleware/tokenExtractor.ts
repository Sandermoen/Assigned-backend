import { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';

const tokenExtractor: RequestHandler = (req, _, next) => {
  const authorization = req.get('authorization');
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    const token = authorization.substring(7);
    if (!process.env.JWT_SECRET) {
      throw new Error('No JWT secret found.');
    }
    jwt.verify(token, process.env.JWT_SECRET);
    req.token = authorization.substring(7);
  }
  next();
};

export default tokenExtractor;
