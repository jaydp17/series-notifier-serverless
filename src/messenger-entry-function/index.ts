/**
 * The main file that starts the function
 */

import { platformNames } from '../common/constants';
import { verifyToken } from '../common/environment';
import { invokeProcessQuery } from '../common/lambda-utils';
import { messengerAuth } from '../common/messenger.api';

// types
import { LambdaEvent, LambdaHttpCallback } from '../common/aws-lambda-types';
import { Callback } from '../common/common-types';
import { ActionTypes, AnyAction, IMessage, ISearchAction, Platform } from '../common/internal-message-types';
import * as MessengerTypes from '../common/messenger-types';

export function handler(event: LambdaEvent, context: {}, callback: LambdaHttpCallback): void {

  // TOKEN verification
  if (event.httpMethod === 'GET') {
    if (!event.queryStringParameters) {
      callback(null, { statusCode: 200, body: 'ping' });
      return;
    }
    messengerAuth(event.queryStringParameters, verifyToken, callback);
    return;
  }

  // Actual Message
  if (event.httpMethod === 'POST') {
    const body: MessengerTypes.AnyFacebookMessage = JSON.parse(event.body);

    const { object: objectType } = body;
    if (objectType !== 'page') {
      callback(null, { statusCode: 403, body: 'Invalid Object Type' });
      return;
    }

    // get the messaging objects out
    const promises = body.entry
      .map(entry => entry.messaging)
      .reduce((acc, messaging) => [...acc, ...messaging])
      .filter((messaging: MessengerTypes.AnyMessagingObject) => filterTextMessages(messaging))
      .map((messaging: MessengerTypes.ITextMessageMessaging) => {
        const message: ISearchAction = {
          type: ActionTypes.Search,
          text: messaging.message.text,
          platform: platformNames.FBMessenger,
          metaData: messaging,
        };
        return invokeProcessQuery(message);
      });

    Promise.all(promises)
      // send 200 OK, after delegating the tasks
      .then(() => callback(null, { statusCode: 200 }))
      // incase there's some error, return it back
      .catch(err => callback(err));

    return;
  }

  callback(null, { statusCode: 403, body: `Invalid httpMethod: ${event.httpMethod}` });
}

export function filterTextMessages(messaging: MessengerTypes.AnyMessagingObject): boolean {
  return MessengerTypes.isTextMessagingObj(messaging) && !messaging.message.is_echo;
}
