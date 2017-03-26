import { verifyToken } from './utils/environment';
import { LambdaEvent, LambdaCallback } from '../common/aws-lambda-types';
import { Callback } from '../common/common-types';
import { AnyFacebookMessage } from '../common/messenger-types';

import { messengerAuth } from './utils/messenger.api';

export const handler = (event: LambdaEvent, context, callback: LambdaCallback) => {

  // TOKEN verification
  if (event.httpMethod === 'GET') {
    if (!event.queryStringParameters) {
      return callback(null, { statusCode: 200, body: 'Bro 😎' });
    }
    return messengerAuth(event.queryStringParameters, verifyToken, callback);
  }

  // Actual Message
  if (event.httpMethod === 'POST') {
    const body: AnyFacebookMessage = JSON.parse(event.body);

    const { object: objectType } = body;
    if (objectType !== 'page') {
      return callback(null, { statusCode: 403, body: 'Invalid Object Type' });
    }
    // right now this only sends 200 OK
    return callback(null, { statusCode: 200 });
  }

  return callback(null, { statusCode: 403, body: `Invalid httpMethod: ${event.httpMethod}` });
}
