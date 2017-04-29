/**
 * Contains utility functions
 */

import { inspect } from 'util';

/**
 * Pretty prints an object
 */
export function prettyPrint(obj: {}): void {
  console.log(inspect(obj, false, 20, true)); // tslint:disable-line:no-console
}
