/**
 * Just a simple logger
 */

import * as debug from 'debug';

export default tag => {
  const log = debug(`${tag}:log`);
  const error = debug(`${tag}:error`);
  log.log = console.log.bind(console);
  error.log = console.error.bind(console);
  return { log, error };
};
