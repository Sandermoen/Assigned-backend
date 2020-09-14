declare namespace Express {
  export interface Request {
    token?: string;
    user?: import('../../src/types').NonSensitiveUser;
  }
}
