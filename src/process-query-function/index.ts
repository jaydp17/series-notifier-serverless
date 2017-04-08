/**
 * The main file that starts the Process Query function
 */

import { inspect } from 'util';
import * as MessengerAPI from '../common/messenger.api';

// types
import { LambdaCallback, LambdaEvent } from '../common/aws-lambda-types';
import { IMessage, Platform } from '../common/internal-message-types';
import { AnyMessagingObject, ITextMessageMessaging } from '../common/messenger-types';

export function handler(event: IMessage, context: {}, callback: LambdaCallback): void {
  console.log('entry', event); // tslint:disable-line:no-console

  const { text, platform } = event;

  let promise: Promise<void>;
  switch (platform) {
    case Platform.Messenger: {
      const metaData: ITextMessageMessaging = (<ITextMessageMessaging>event.metaData);
      const senderId = metaData.sender.id;
      promise = MessengerAPI.sendMessage(senderId, { text })
        .then(() => callback(null, { statusCode: 200, body: 'done!' }));
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
