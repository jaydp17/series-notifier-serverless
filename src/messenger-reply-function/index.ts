/**
 * This function takes the internal generic crossplatform way of representation
 * and sends it back to the source (in this case FB Messenger)
 */

import 'babel-polyfill'; // tslint:disable-line:no-import-side-effect
import { get, isEmpty } from 'lodash';
import { inspect } from 'util';
import { getError, prettyPrint } from '../common/common-utils';
import * as MessengerAPI from '../common/messenger.api';
import { GenericTemplate } from './messenger.formatter';

// types
import { LambdaCallback } from '../common/aws-lambda-types';
import * as InternalTypes from '../common/internal-message-types';
import * as MessengerTypes from '../common/messenger-types';

const { ReplyKind } = InternalTypes;

export async function handler(reply: InternalTypes.AnyReplyKind, context: {}, callback: LambdaCallback): Promise<void> {
  console.log('input', JSON.stringify(reply)); // tslint:disable-line:no-console

  const metaData = reply.metaData.fbMessenger;
  if (!metaData) {
    return callback(new Error('No metaData'));
  }

  const senderId: string = get(metaData, 'sender.id', '');

  // if there's no senderId don't do anything
  if (isEmpty(senderId)) {
    const errorMessage = `No senderId in metaData: ${inspect(reply, { depth: 100 })}`;
    // console.error(errorMessage);
    return callback(new Error(errorMessage));
  }

  try {
    switch (reply.kind) {
      case ReplyKind.SearchResults:
      case ReplyKind.TrendingShows: {
        const message = GenericTemplate.generate(reply.shows);
        await MessengerAPI.sendMessage(senderId, message);
        break;
      }
      default:
        const errorMessage = `Not supported Kind: ${reply.kind}`;
        console.error(errorMessage);
        return callback(new Error(errorMessage));
    }
    callback(null, { status: true });
  } catch (err) {
    const error = getError(err);
    callback(error);
  }
}
