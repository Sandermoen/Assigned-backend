import Class from '../models/Class';
import User from '../models/User';
import { RequestHandler } from 'express';

import { isString, isObject } from '../utils/typeGuards';

export const createClass: RequestHandler = async (req, res) => {
  if (!isObject(req.body) || !isString(req.body.className)) {
    return res.status(400).send({ error: 'Invalid class name.' });
  }
  const className = req.body.className;
  const user = req.user;

  const dbUser = await User.findById(user?.id);
  if (dbUser?.role !== 'teacher') {
    return res.status(401).send({ error: 'Not authorized' });
  }

  const newClass = new Class({
    name: className,
    teachers: [{ user: dbUser.id as string }],
  });
  await newClass.save();
  return res.send({ className });
};
