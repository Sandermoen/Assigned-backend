import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

import { redisDel, redisSet } from '../app';
import { NonSensitiveUser } from '../types';

export const generateAccessToken = (user: string): string => {
  if (!process.env.JWT_SECRET) {
    throw new Error('Unable to sign JWT, no secret present.');
  }
  return jwt.sign({ user }, process.env.JWT_SECRET, {
    expiresIn: '15m',
  });
};

export const refreshExpire = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds

export const generateRefreshToken = async (
  user: NonSensitiveUser,
  oldToken?: string
): Promise<string> => {
  const refreshToken = uuidv4();
  if (oldToken) {
    await redisDel(oldToken);
  }
  await redisSet(
    refreshToken,
    JSON.stringify({
      token: refreshToken,
      issued: Date.now(),
      expiry: Date.now() + refreshExpire,
      user,
    })
  );
  return refreshToken;
};
