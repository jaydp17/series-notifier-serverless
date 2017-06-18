/**
 * The main file that starts the function
 */
import 'babel-polyfill';
import { platformNames } from '../common/constants';
import { env } from '../common/environment';
import { verifyToken } from '../common/environment';
import { invokeProcessQuery } from '../common/lambda-utils';
import { messengerAuth } from '../common/messenger.api';
import { process as processMessage } from './process/message';
import { process as processPostBack } from './process/postback';

// types
import { LambdaEvent, LambdaHttpCallback } from '../common/aws-lambda-types';
import { Callback } from '../common/common-types';
import { ActionTypes, AnyAction, IMessage, ISearchAction, Platform } from '../common/internal-message-types';
import * as MessengerTypes from '../common/messenger-types';

export function processPostBody(body: MessengerTypes.FBWebHookMessage) {
  // get the messaging objects out
  const messagingObjs = body.entry.map(entry => entry.messaging).reduce((acc, messaging) => [...acc, ...messaging]);

  const postBackMessaging = (<MessengerTypes.IPostBackMessaging[]>messagingObjs).filter(messaging =>
    MessengerTypes.isPostBackMessagingObj(messaging),
  );

  const textMessaging = (<MessengerTypes.ITextMessageMessaging[]>messagingObjs).filter(messaging =>
    filterTextMessages(messaging),
  );

  return Promise.all([processMessage(textMessaging), processPostBack(postBackMessaging)]);
}

export async function handler(event: LambdaEvent, context: {}, callback: LambdaHttpCallback): Promise<void> {
  if (env !== 'test') {
    console.log('input', JSON.stringify(event)); // tslint:disable-line no-console
  }

  // TOKEN verification
  if (event.httpMethod === 'GET') {
    if (!event.queryStringParameters) {
      return callback(null, { statusCode: 200, body: 'ping' });
    }
    return messengerAuth(event.queryStringParameters, verifyToken, callback);
  }

  // Actual Message
  if (event.httpMethod === 'POST') {
    const body: MessengerTypes.FBWebHookMessage = JSON.parse(event.body);

    const { object: objectType } = body;
    if (objectType !== 'page') {
      return callback(null, { statusCode: 403, body: 'Invalid Object Type' });
    }

    return (
      processPostBody(body)
        // send 200 OK, after delegating the tasks
        .then(() => callback(null, { statusCode: 200 }))
        // incase there's some error, return it back
        .catch(err => callback(err))
    );
  }

  return callback(null, { statusCode: 403, body: `Invalid httpMethod: ${event.httpMethod}` });
}

export function filterTextMessages(messaging: MessengerTypes.AnyMessagingObject): boolean {
  return MessengerTypes.isTextMessagingObj(messaging) && !messaging.message.is_echo;
}
