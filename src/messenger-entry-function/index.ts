/**
 * The main file that starts the function
 */
import 'babel-polyfill';
import { platformNames } from '../common/constants';
import { verifyToken } from '../common/environment';
import { invokeProcessQuery } from '../common/lambda-utils';
import { messengerAuth } from '../common/messenger.api';

// types
import { LambdaEvent, LambdaHttpCallback } from '../common/aws-lambda-types';
import { Callback } from '../common/common-types';
import { ActionTypes, AnyAction, IMessage, ISearchAction, Platform } from '../common/internal-message-types';
import * as MessengerTypes from '../common/messenger-types';

export function processPostBody(body: MessengerTypes.AnyFacebookMessage) {
  // get the messaging objects out
  return body.entry
    .map(entry => entry.messaging)
    .reduce((acc, messaging) => [...acc, ...messaging])
    .filter((messaging: MessengerTypes.AnyMessagingObject) => filterTextMessages(messaging))
    .map((messaging: MessengerTypes.ITextMessageMessaging) => {
      const message: ISearchAction = {
        type: ActionTypes.Search,
        text: messaging.message.text,
        platform: platformNames.FBMessenger,
        metaData: { fbMessenger: messaging },
      };
      return invokeProcessQuery(message);
    });
}

export async function handler(event: LambdaEvent, context: {}, callback: LambdaHttpCallback): Promise<void> {

  // TOKEN verification
  if (event.httpMethod === 'GET') {
    if (!event.queryStringParameters) {
      return callback(null, { statusCode: 200, body: 'ping' });
    }
    return messengerAuth(event.queryStringParameters, verifyToken, callback);
  }

  // Actual Message
  if (event.httpMethod === 'POST') {
    const body: MessengerTypes.AnyFacebookMessage = JSON.parse(event.body);

    const { object: objectType } = body;
    if (objectType !== 'page') {
      return callback(null, { statusCode: 403, body: 'Invalid Object Type' });
    }
    const promises = processPostBody(body);

    return Promise.all(promises)
      // send 200 OK, after delegating the tasks
      .then(() => callback(null, { statusCode: 200 }))
      // incase there's some error, return it back
      .catch(err => callback(err));
  }

  return callback(null, { statusCode: 403, body: `Invalid httpMethod: ${event.httpMethod}` });
}

export function filterTextMessages(messaging: MessengerTypes.AnyMessagingObject): boolean {
  return MessengerTypes.isTextMessagingObj(messaging) && !messaging.message.is_echo;
}
