import bcrypt from 'bcrypt';
import User from '../models/User';
import { RequestHandler } from 'express';

import { IUser, Credentials } from '../types';
import { userSchema, credentialSchema } from '../utils/schemas';
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

  const refreshToken = generateRefreshToken(email);

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
  const refreshToken = generateRefreshToken(user.email);

  res.cookie('refreshToken', refreshToken, {
    maxAge: refreshExpire,
    httpOnly: true,
  });
  return res.json({ user: user, accessToken });
};
