/**
 * The main file that starts the Process Query function
 */

import 'babel-polyfill';
import { inspect } from 'util';
import { prettyPrint } from '../common/common-utils';
import { platformNames } from '../common/constants';
import { invokeMessengerReply, invokeProcessQuery } from '../common/lambda-utils';
import * as MessengerAPI from '../common/messenger.api';
import * as ActionHelper from './action-helper';
import * as TraktAPI from './apis/trakt.api';
import * as SearchController from './controllers/search.controller';

// types
import { LambdaCallback, LambdaEvent } from '../common/aws-lambda-types';
import * as InternalTypes from '../common/internal-message-types';
import { AnyMessagingObject, ITextMessageMessaging } from '../common/messenger-types';

const { ActionTypes, ReplyKind } = InternalTypes;

export async function handler(action: InternalTypes.AnyAction, context: {}, callback: LambdaCallback): Promise<void> {
  console.log('entry'); // tslint:disable-line:no-console
  prettyPrint(action);

  const socialId = ActionHelper.getSocialId(action);
  let reply: InternalTypes.ISearchResultsReply;

  // compute the reply
  switch (action.type) {
    case ActionTypes.Search: {
      const shows = await SearchController.search(action.text, socialId);
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
    case platformNames.FBMessenger: {
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
