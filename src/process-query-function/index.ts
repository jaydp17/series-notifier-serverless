/**
 * The main file that starts the Process Query function
 */

import { inspect } from 'util';
import { invokeMessengerReply, invokeProcessQuery } from '../common/lambda-utils';
import * as MessengerAPI from '../common/messenger.api';
import * as TraktAPI from './apis/trakt.api';
import * as SearchController from './controllers/search.controller';

// types
import { LambdaCallback, LambdaEvent } from '../common/aws-lambda-types';
import * as InternalTypes from '../common/internal-message-types';
import { AnyMessagingObject, ITextMessageMessaging } from '../common/messenger-types';

const { ActionTypes, ReplyKind, Platform } = InternalTypes;

export async function handler(action: InternalTypes.AnyAction, context: {}, callback: LambdaCallback): Promise<void> {
  console.log('entry', action); // tslint:disable-line:no-console

  let reply: InternalTypes.ISearchResultsReply;

  // compute the reply
  switch (action.type) {
    case ActionTypes.Search: {
      const shows = await SearchController.search(action.text);
      reply = {
        kind: ReplyKind.SearchResults,
        shows,
        metaData: action.metaData,
      };
      break;
    }
    default:
      console.error(`ActionType not supported: ${action.type}`);
      callback(new Error(`ActionType not supported: ${action.type}`));
      return;
  }

  // in case for some reason reply wasn't computed
  // and it reached here
  if (!reply) {
    console.error('No reply computed, action:', inspect(action, false, 100, false));
    callback(new Error(`No reply computed, action: ${inspect(action, false, 100, false)}`));
    return;
  }

  switch (action.platform) {
    case Platform.Messenger: {
      await invokeMessengerReply(reply);
      break;
    }
    default:
      console.error(`Platform: ${action.platform} isn't supported yet`);
      callback(new Error(`un supported platform : ${action.platform}`));
      return;
  }

  callback(null, { success: true });
}
