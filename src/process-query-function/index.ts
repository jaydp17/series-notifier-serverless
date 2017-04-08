/**
 * The main file that starts the Process Query function
 */

import { inspect } from 'util';
import { invokeMessengerReply, invokeProcessQuery } from '../common/lambda-utils';
import * as MessengerAPI from '../common/messenger.api';

// types
import { LambdaCallback, LambdaEvent } from '../common/aws-lambda-types';
import { IMessage, Platform } from '../common/internal-message-types';
import { AnyMessagingObject, ITextMessageMessaging } from '../common/messenger-types';

export function handler(event: IMessage, context: {}, callback: LambdaCallback): void {
  console.log('entry', event); // tslint:disable-line:no-console

  const { text, platform } = event;

  let promise: Promise<any>; // tslint:disable-line:no-any
  switch (platform) {
    case Platform.Messenger: {
      promise = invokeMessengerReply(event);
      break;
    }
    default:
      console.error(`Platform: ${platform} isn't supported yet`);
      callback(new Error(`un supported platform : ${platform}`));
      return;
  }

  if (promise) {
    promise.catch(err => {
      console.error('error log', inspect(err, false, 100, false));
      callback(err);
    });
    return;
  }

  callback(null, { unreachable: true });
}
