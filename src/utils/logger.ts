const info = (...params: string[]): void => {
  process.env.NODE_ENV !== 'test' && console.log(params.join(' '));
};

const error = (...params: string[]): void => {
  process.env.NODE_ENV !== 'test' && console.error(params.join(' '));
};

export default {
  info,
  error,
};
