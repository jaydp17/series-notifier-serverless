export default class CustomError extends Error {
  constructor(message, extra) {
    super();
    Error.captureStackTrace(this, this.constructor);
    this.message = message;
    if (extra)
      this.extra = extra;
  }
}
