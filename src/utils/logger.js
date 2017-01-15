import CustomError from './custom-error';

// eslint-disable no-console
export const info = (msg, data) => {
  console.info(msg, data);
};

export const error = (err, data) => {
  // if (err instanceof CustomError) {
  //   Sentry.captureException(err, { extra: err.extra, tags: { env: process.env.NODE_ENV } });
  // } else {
  //   Sentry.captureException(err, data);
  // }
  console.error(err);
};

export const warn = (msg, data) => {
  console.warn(msg, data);
};

export const log = msg => {
  console.log(msg);
};
