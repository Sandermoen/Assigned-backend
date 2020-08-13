import bcrypt from 'bcrypt';
import User from '../models/User';
import { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';

import { IUser, Credentials, IRefreshToken } from '../types';
import { isRefreshToken } from '../utils/typeGuards';
import { userSchema, credentialSchema } from '../utils/schemas';
import { isObject } from '../utils/typeGuards';
import { redisGet } from '../app';
import {
  generateAccessToken,
  generateRefreshToken,
  refreshExpire,
} from '../utils/token';

export const signUp: RequestHandler = async (req, res, next) => {
  const {
    firstName,
    lastName,
    email,
    password,
    role,
  } = (await userSchema.validate(req.body, {
    abortEarly: false,
  })) as IUser;

  let newUser = new User({
    firstName,
    lastName,
    email,
    role,
    password,
  });

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    res.status(400).send({ error: 'A user with that email already exists.' });
  }

  const refreshToken = await generateRefreshToken(email);

  newUser = await newUser.save();

  if (!process.env.JWT_SECRET) {
    return next('Unable to sign JWT, no secret present.');
  }
  const accessToken = generateAccessToken(newUser.toJSON());

  res.cookie('refreshToken', refreshToken, {
    maxAge: refreshExpire,
    httpOnly: true,
  });
  return res.status(201).json({ user: newUser, accessToken });
};

export const login: RequestHandler = async (req, res) => {
  const { email, password } = (await credentialSchema.validate(req.body, {
    abortEarly: false,
  })) as Credentials;

  const invalidCredentials = () => {
    return res
      .status(401)
      .send({ error: 'Invalid credentials, please try again.' });
  };

  const user = await User.findOne({ email });
  if (!user) {
    return invalidCredentials();
  }
  const authorized = await bcrypt.compare(password, user.password);
  if (!authorized) {
    return invalidCredentials();
  }

  const accessToken = generateAccessToken(user.toJSON());
  const refreshToken = await generateRefreshToken(user.email);

  res.cookie('refreshToken', refreshToken, {
    maxAge: refreshExpire,
    httpOnly: true,
  });
  return res.json({ user: user, accessToken });
};

export const auth: RequestHandler = (req, res) => {
  // Using a string type assertion here because we already have middleware
  // in place to handle a case where the token does not exist on protected routes
  const token = req.token as string;
  const decodedToken = jwt.decode(token);
  if (decodedToken && isObject(decodedToken) && decodedToken.user) {
    return res.send(decodedToken.user);
  }
  return res.status(500).send({ error: 'Empty token.' });
};

export const refresh: RequestHandler = async (req, res) => {
  if (!isObject(req.cookies)) {
    return res.status(400).send({ error: 'Invalid cookie.' });
  }
  if (!isObject(req.body) || typeof req.body.email !== 'string') {
    return res.status(400).send({ error: 'Invalid email.' });
  }

  const invalidToken = () => {
    return res.status(401).send({ error: 'Invalid token.' });
  };

  const jsonRefreshObject = await redisGet(req.body.email);
  if (!jsonRefreshObject) {
    return invalidToken();
  }

  const refreshObject = JSON.parse(jsonRefreshObject) as IRefreshToken;
  if (!isRefreshToken(refreshObject)) {
    return res
      .status(500)
      .send({ error: 'Invalid refresh token object received.' });
  }

  const refreshToken = req.cookies.refreshToken;
  if (
    refreshToken !== refreshObject.token ||
    refreshObject.expiry < Date.now()
  ) {
    return invalidToken();
  }

  const newToken = await generateRefreshToken(req.body.email);

  res.cookie('refreshToken', newToken, {
    maxAge: refreshExpire,
    httpOnly: true,
  });
  return res.status(204).end();
};
