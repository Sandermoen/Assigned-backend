import { IRefreshToken } from '../types';

export const isObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null;
};

export const isString = (value: unknown): value is string => {
  return typeof value === 'string';
};

export const isRefreshToken = (value: unknown): value is IRefreshToken => {
  if (!isObject(value)) {
    return false;
  }
  if (
    !value.token ||
    !isString(value.token) ||
    !value.issued ||
    !Number.isInteger(value.issued) ||
    !value.expiry ||
    !Number.isInteger(value.expiry)
  ) {
    return false;
  }
  return true;
};
