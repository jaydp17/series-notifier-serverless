/**
 * Just a simple logger
 */

import debug from 'debug';

export default (tag: string) => {
  const log = debug(`${tag}:log`);
  const error = debug(`${tag}:error`);
  log.log = console.log.bind(console);
  error.log = console.error.bind(console);
  return { log, error };
};
