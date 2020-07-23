const info = (...params: string[]): void => {
  console.log(params.join(' '));
};

const error = (...params: string[]): void => {
  console.error(params.join(' '));
};

export default {
  info,
  error,
};
