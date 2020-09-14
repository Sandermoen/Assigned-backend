import { IRefreshToken, NonSensitiveUser, Role } from '../types';

export const isObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null;
};

export const isString = (value: unknown): value is string => {
  return typeof value === 'string';
};

export const isRole = (value: unknown): value is Role => {
  if (!isString(value) || !Object.values<string>(Role).includes(value)) {
    return false;
  }
  return true;
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

export const isNonSensitiveUser = (
  value: unknown
): value is NonSensitiveUser => {
  if (!isObject(value)) {
    return false;
  }
  if (
    !value.email ||
    !isString(value.email) ||
    !value.firstName ||
    !isString(value.firstName) ||
    !value.lastName ||
    !isString(value.lastName) ||
    !value.role ||
    !isRole(value.role)
  ) {
    return false;
  }
  return true;
};
