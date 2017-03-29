/**
 * The main file that starts the Process Query function
 */

import { LambdaCallback, LambdaEvent } from '../common/aws-lambda-types';

export function handler(event: LambdaEvent, context: {}, callback: LambdaCallback): void {
  console.log('entry', event); // tslint:disable-line:no-console
  callback(null, { statusCode: 200, body: 'done!' });
}
