import redis from 'redis';

declare module 'util' {
  function promisify<T, U, R>(
    fn: redis.OverloadedCommand<T, U, R>
  ): {
    (arg1: T, arg2: T | T[]): Promise<U>;
    (arg1: T | T[]): Promise<U>;
    (...args: Array<T>): Promise<U>;
  };
}
