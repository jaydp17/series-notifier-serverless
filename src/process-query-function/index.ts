/**
 * The main file that starts the Process Query function
 */

import { inspect } from 'util';

import { LambdaCallback, LambdaEvent } from '../common/aws-lambda-types';
import { AnyMessagingObject } from '../common/messenger-types';
import { sendMessage } from '../common/messenger.api';

export function handler(event: AnyMessagingObject, context: {}, callback: LambdaCallback): void {
  console.log('entry', event); // tslint:disable-line:no-console

  const { message, sender } = event;
  if (!message.is_echo) {
    sendMessage(sender.id, { text: message.text })
      .then(() => callback(null, { statusCode: 200, body: 'done!' }))
      .catch(err => {
        console.error('error log', inspect(err, false, 100, false));
        callback(err);
      });
    return;
  }
  callback(null, { ignore: true });
}
