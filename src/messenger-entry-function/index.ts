/**
 * The main file that starts the function
 */
import { ILambdaEvent } from '../common/aws-lambda-types';
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

export async function handler(event: ILambdaEvent): Promise<{ statusCode: number; body?: string }> {
  if (env !== 'test') {
    console.log('input', JSON.stringify(event)); // tslint:disable-line no-console
  }

  // TOKEN verification
  if (event.httpMethod === 'GET') {
    if (!event.queryStringParameters) {
      return { statusCode: 200, body: 'ping' };
    }
    return messengerAuth(event.queryStringParameters as any, verifyToken);
  }

  // Actual Message
  if (event.httpMethod === 'POST') {
    const body: MessengerTypes.IFBWebHookMessage = JSON.parse(event.body);

    const { object: objectType } = body;
    if (objectType !== 'page') {
      return { statusCode: 403, body: 'Invalid Object Type' };
    }

    await processPostBody(body);
    return { statusCode: 200 };
  }

  return { statusCode: 403, body: `Invalid httpMethod: ${event.httpMethod}` };
}

export function filterTextMessages(messaging: MessengerTypes.AnyMessagingObject): boolean {
  return MessengerTypes.isTextMessagingObj(messaging) && !messaging.message.is_echo;
}
