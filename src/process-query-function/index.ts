/**
 * The main file that starts the Process Query function
 */

import 'babel-polyfill'; // tslint:disable-line:no-import-side-effect
import { inspect } from 'util';
import { prettyPrint } from '../common/common-utils';
import { platformNames } from '../common/constants';
import { env } from '../common/environment';
import { invokeMessengerReply, invokeProcessQuery } from '../common/lambda-utils';
import * as MessengerAPI from '../common/messenger.api';
import * as Subscription from '../models/subscription';
import * as ActionHelper from './action-helper';
import * as TraktAPI from './apis/trakt.api';
import * as SearchController from './controllers/search.controller';
import * as TrendingController from './controllers/trending.controller';

// types
import { LambdaCallback, LambdaEvent } from '../common/aws-lambda-types';
import * as InternalTypes from '../common/internal-message-types';
import { AnyMessagingObject, ITextMessageMessaging } from '../common/messenger-types';

const { ActionTypes, ReplyKind } = InternalTypes;

export async function handler(action: InternalTypes.AnyAction, context: {}, callback: LambdaCallback): Promise<void> {
  if (env !== 'test') {
    console.log('entry'); // tslint:disable-line:no-console
    prettyPrint(action);
  }

  const socialId = ActionHelper.getSocialId(action);
  let reply: InternalTypes.AnyReplyKind;

  // compute the reply
  try {
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
      case ActionTypes.ShowTrending: {
        const shows = await TrendingController.getTrending(socialId);
        reply = {
          kind: ReplyKind.TrendingShows,
          shows,
          metaData: action.metaData,
        };
        break;
      }
      case ActionTypes.Subscribe: {
        await Subscription.createSubscription(action.imdbId, socialId);
        reply = {
          kind: ReplyKind.SubscribeResult,
          success: true,
          imdbId: action.imdbId,
          title: action.title,
          metaData: action.metaData,
        };
        break;
      }
      case ActionTypes.UnSubscribe: {
        await Subscription.deleteSubscription(action.imdbId, socialId);
        reply = {
          kind: ReplyKind.UnSubscribeResult,
          success: true,
          imdbId: action.imdbId,
          title: action.title,
          metaData: action.metaData,
        };
        break;
      }
      case ActionTypes.MyShows: {
        const subscribtionRows = await Subscription.getSubscribedShows(socialId);
        const imdbIds = subscribtionRows.map(row => row.imdbId);
        const shows = await Promise.all(imdbIds.map(imdbId => SearchController.searchByImdb(imdbId, true)));
        const filteredShows = <InternalTypes.ITvShow[]>shows.filter(row => !!row);
        reply = {
          kind: ReplyKind.MyShows,
          shows: filteredShows,
          metaData: action.metaData,
        };
        break;
      }
      default:
        const message = `Unknows Action: ${action}`;
        console.error(message);
        return callback(new Error(message));
    }
  } catch (err) {
    return callback(err);
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
