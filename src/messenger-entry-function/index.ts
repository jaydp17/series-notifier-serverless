/**
 * The main file that starts the function
 */

import { verifyToken } from '../common/environment';

import { LambdaCallback, LambdaEvent } from '../common/aws-lambda-types';
import { Callback } from '../common/common-types';
import { invokeProcessQuery } from '../common/lambda-utils';
import { AnyFacebookMessage } from '../common/messenger-types';
import { messengerAuth } from './utils/messenger.api';

export function handler(event: LambdaEvent, context: {}, callback: LambdaCallback): void {

  // TOKEN verification
  if (event.httpMethod === 'GET') {
    if (!event.queryStringParameters) {
      invokeProcessQuery({ hello: 'bro' })
        .then(console.log)
        .then(() => callback(null, { statusCode: 200, body: 'Bro 😎' }));
      return;
    }
    messengerAuth(event.queryStringParameters, verifyToken, callback);
    return;
  }

  // Actual Message
  if (event.httpMethod === 'POST') {
    const body: AnyFacebookMessage = JSON.parse(event.body);

    const { object: objectType } = body;
    if (objectType !== 'page') {
      callback(null, { statusCode: 403, body: 'Invalid Object Type' });
      return;
    }
    // right now this only sends 200 OK
    callback(null, { statusCode: 200 });
    return;
  }

  callback(null, { statusCode: 403, body: `Invalid httpMethod: ${event.httpMethod}` });
}
