// import Class from '../models/Class';
import { RequestHandler } from 'express';

import { isString, isObject } from '../utils/typeGuards';

export const createClass: RequestHandler = (req, res) => {
  if (!isObject(req.body) || !isString(req.body.className)) {
    return res.status(400).send({ error: 'Invalid class name.' });
  }
  console.log(req.user);
  const className = req.body.className;
  return res.send(className);
};
