/**
 * This function takes the internal generic crossplatform way of representation
 * and sends it back to the source (in this case FB Messenger)
 */

import * as MessengerAPI from '../common/messenger.api';

// types
import { LambdaCallback } from '../common/aws-lambda-types';
import { IMessage, Platform } from '../common/internal-message-types';
import { ITextMessageMessaging } from '../common/messenger-types';

export function handler(event: IMessage, context: {}, callback: LambdaCallback): void {
  const { text, platform } = event;

  // make sure this message is for FB Messenger only
  if (platform !== Platform.Messenger) {
    callback(new Error(`Incorrect platform: ${platform}`));
    return;
  }

  const metaData: ITextMessageMessaging = (<ITextMessageMessaging>event.metaData);
  const senderId = metaData.sender.id;
  MessengerAPI.sendMessage(senderId, { text })
    .then(() => callback(null, { statusCode: 200, body: 'done!' }))
    .catch(err => {
      console.error('err', err);
      callback(err);
    });
}
