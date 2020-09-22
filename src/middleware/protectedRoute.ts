import { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';

import { isNonSensitiveUser } from '../utils/typeGuards';

const protectedRoute: RequestHandler = (req, res, next) => {
  if (!req.token) {
    return res.status(401).send({ error: 'Not authorized.' });
  }
  if (!process.env.JWT_SECRET) {
    throw new Error('No JWT secret found.');
  }
  const decodedToken = jwt.verify(req.token, process.env.JWT_SECRET) as Record<
    string,
    unknown
  >;

  if (!isNonSensitiveUser(decodedToken.user)) {
    return res.status(500).send({ error: 'Unable to verify user.' });
  }

  req.user = decodedToken.user;
  return next();
};

export default protectedRoute;
