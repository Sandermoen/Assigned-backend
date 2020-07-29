import bcrypt from 'bcrypt';
import User from '../models/User';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { RequestHandler } from 'express';

import { IUser, NonSensitiveUser } from '../types';
import { userSchema } from '../utils/schemas';
import { redisClient } from '../app';

export const signUp: RequestHandler = async (req, res, next) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      role,
    } = (await userSchema.validate(req.body, {
      abortEarly: false,
    })) as IUser;

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    let newUser = new User({
      firstName,
      lastName,
      email,
      role,
      password: hashedPassword,
    });

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).send({ error: 'A user with that email already exists.' });
    }

    const refreshToken = uuidv4();
    redisClient.set(email, refreshToken);
    if (!process.env.JWT_SECRET) {
      return next('Unable to sign JWT, no secret present.');
    }
    const token = jwt.sign(
      {
        iat: Date.now(),
        user: newUser.toJSON() as NonSensitiveUser,
      },
      process.env.JWT_SECRET
    );

    newUser = await newUser.save();

    return res
      .status(201)
      .json({ user: newUser, token })
      .cookie('refreshToken', refreshToken, {
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days in milliseconds
        httpOnly: true,
      });
  } catch (err) {
    return next(err);
  }
};
