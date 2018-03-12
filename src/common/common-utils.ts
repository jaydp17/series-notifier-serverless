/**
 * Contains utility functions
 */

import { AxiosError } from 'axios';
import { inspect } from 'util';

/**
 * Pretty prints an object
 */
export function prettyPrint(obj: {}): void {
  // tslint:disable-line:no-any
  const color = !!process.env.IS_LOCAL;
  console.log(inspect(obj, false, 20, color)); // tslint:disable-line:no-console
}

/**
 * An error could be a regular Error object or AxiosError
 * This method gets the actual error out if it's an AxisoError
 */
export function getError(error: Error | AxiosError): Error {
  const response = (<AxiosError>error).response;
  if (response) {
    return response.data;
  }
  return error;
}
