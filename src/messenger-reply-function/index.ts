/**
 * This function takes the internal generic crossplatform way of representation
 * and sends it back to the source (in this case FB Messenger)
 */

import { get, isEmpty } from 'lodash';
import { inspect } from 'util';
import * as MessengerAPI from '../common/messenger.api';
import { genericTemplate } from './messenger.formatter';

// types
import { LambdaCallback } from '../common/aws-lambda-types';
import * as InternalTypes from '../common/internal-message-types';
import { ITextMessageMessaging } from '../common/messenger-types';

const { ReplyKind } = InternalTypes;

export async function handler(reply: InternalTypes.AnyReplyKind, context: {}, callback: LambdaCallback): Promise<void> {

  const metaData: ITextMessageMessaging = (<ITextMessageMessaging>reply.metaData);
  const senderId: string = get(metaData, 'sender.id', '');

  // if there's no senderId don't do anything
  if (isEmpty(senderId)) {
    const errorMessage = `No senderId in metaData: ${inspect(reply, { depth: 100 })}`;
    // console.error(errorMessage);
    return callback(new Error(errorMessage));
  }

  switch (reply.kind) {
    case ReplyKind.SearchResults: {
      const message = genericTemplate(reply.shows);
      await MessengerAPI.sendMessage(senderId, message);
      break;
    }
    default:
      const errorMessage = `Not supported Kind: ${reply.kind}`;
      console.error(errorMessage);
      return callback(new Error(errorMessage));
  }

  callback(null, { status: true });
}
