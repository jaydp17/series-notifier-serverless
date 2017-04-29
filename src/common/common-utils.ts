/**
 * Contains utility functions
 */

import { inspect } from 'util';

/**
 * Pretty prints an object
 */
export function prettyPrint(obj: any): void { // tslint:disable-line:no-any
  console.log(inspect(obj, false, 20, true)); // tslint:disable-line:no-console
}
