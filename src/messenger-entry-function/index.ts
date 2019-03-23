/**
 * The main file that starts the function
 */
import { ILambdaEvent, LambdaHttpCallback } from '../common/aws-lambda-types';
import { env, verifyToken } from '../common/environment';
import * as MessengerTypes from '../common/messenger-types';
import { messengerAuth } from '../common/messenger.api';
import { process as processMessage } from './process/message';
import { process as processPostBack } from './process/postback';

export function processPostBody(body: MessengerTypes.IFBWebHookMessage) {
  // get the messaging objects out
  const messagingObjs = body.entry
    .map(entry => entry.messaging)
    .reduce((acc, messaging) => [...acc, ...messaging]);

  const postBackMessaging = (messagingObjs as MessengerTypes.IPostBackMessaging[]).filter(
    messaging => MessengerTypes.isPostBackMessagingObj(messaging),
  );

  const textMessaging = (messagingObjs as MessengerTypes.ITextMessageMessaging[]).filter(
    filterTextMessages,
  );

  return Promise.all([processMessage(textMessaging), processPostBack(postBackMessaging)]);
}

export async function handler(
  event: ILambdaEvent,
  context: {},
  callback: LambdaHttpCallback,
): Promise<void> {
  if (env !== 'test') {
    console.log('input', JSON.stringify(event)); // tslint:disable-line no-console
  }

  // TOKEN verification
  if (event.httpMethod === 'GET') {
    if (!event.queryStringParameters) {
      return callback(null, { statusCode: 200, body: 'ping' });
    }
    return messengerAuth(event.queryStringParameters as any, verifyToken, callback);
  }

  // Actual Message
  if (event.httpMethod === 'POST') {
    const body: MessengerTypes.IFBWebHookMessage = JSON.parse(event.body);

    const { object: objectType } = body;
    if (objectType !== 'page') {
      return callback(null, { statusCode: 403, body: 'Invalid Object Type' });
    }

    return (
      processPostBody(body)
        // send 200 OK, after delegating the tasks
        .then(() => callback(null, { statusCode: 200 }))
        // incase there's some error, return it back
        .catch(callback)
    );
  }

  return callback(null, { statusCode: 403, body: `Invalid httpMethod: ${event.httpMethod}` });
}

export function filterTextMessages(messaging: MessengerTypes.AnyMessagingObject): boolean {
  return MessengerTypes.isTextMessagingObj(messaging) && !messaging.message.is_echo;
}
