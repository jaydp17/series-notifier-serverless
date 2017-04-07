/**
 * The main file that starts the function
 */

import * as Promise from 'bluebird';

import { verifyToken } from '../common/environment';

import { LambdaEvent, LambdaHttpCallback } from '../common/aws-lambda-types';
import { Callback } from '../common/common-types';
import { invokeProcessQuery } from '../common/lambda-utils';
import { AnyFacebookMessage, ITextMessageEntry, ITextMessageMessaging } from '../common/messenger-types';
import { messengerAuth } from '../common/messenger.api';

export function handler(event: LambdaEvent, context: {}, callback: LambdaHttpCallback): void {

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

    // get the messaging objects out
    Promise.resolve(body.entry)
      .map((entry: ITextMessageEntry) => entry.messaging)
      .reduce((acc: ITextMessageMessaging[], messaging: ITextMessageMessaging[]) => [...acc, ...messaging])
      .map((messaging: ITextMessageMessaging) => invokeProcessQuery(messaging))

      // send 200 OK, after delegating the tasks
      .then(() => callback(null, { statusCode: 200 }))

      // incase there's some error, return it back
      .catch(err => callback(err));

    return;
  }

  callback(null, { statusCode: 403, body: `Invalid httpMethod: ${event.httpMethod}` });
}
