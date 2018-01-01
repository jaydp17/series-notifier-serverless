/**
 * The main file that starts the Process Query function
 */

import 'babel-polyfill'; // tslint:disable-line:no-import-side-effect
import { inspect } from 'util';
import { prettyPrint } from '../common/common-utils';
import { errorMessages, platformNames } from '../common/constants';
import { env } from '../common/environment';
import { invokeMessengerReply, invokeProcessQuery } from '../common/lambda-utils';
import * as MessengerAPI from '../common/messenger.api';
import * as Subscription from '../models/subscription';
import * as ActionHelper from './action-helper';
import * as TraktAPI from './apis/trakt.api';
import * as NextEpisodeController from './controllers/next-episode.controller';
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

  // compute the reply
  let reply;
  try {
    reply = await getReply(action);
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

async function getReply(action: InternalTypes.AnyAction): Promise<InternalTypes.AnyReplyKind> {
  const socialId = ActionHelper.getSocialId(action);
  switch (action.type) {
    case ActionTypes.Search: {
      const shows = await SearchController.search(action.text, socialId);
      return {
        kind: ReplyKind.SearchResults,
        shows,
        metaData: action.metaData,
      };
    }
    case ActionTypes.ShowTrending: {
      const shows = await TrendingController.getTrending(socialId);
      return {
        kind: ReplyKind.TrendingShows,
        shows,
        metaData: action.metaData,
      };
    }
    case ActionTypes.Subscribe: {
      await Subscription.createSubscription(action.imdbId, socialId);
      return {
        kind: ReplyKind.SubscribeResult,
        success: true,
        imdbId: action.imdbId,
        title: action.title,
        metaData: action.metaData,
      };
    }
    case ActionTypes.UnSubscribe: {
      await Subscription.deleteSubscription(action.imdbId, socialId);
      return {
        kind: ReplyKind.UnSubscribeResult,
        success: true,
        imdbId: action.imdbId,
        title: action.title,
        metaData: action.metaData,
      };
    }
    case ActionTypes.MyShows: {
      const subscribtionRows = await Subscription.getSubscribedShows(socialId);
      const imdbIds = subscribtionRows.map(row => row.imdbId);
      const shows = await Promise.all(imdbIds.map(imdbId => SearchController.searchByImdb(imdbId, true)));
      const filteredShows = <InternalTypes.ITvShow[]>shows.filter(row => !!row);
      return {
        kind: ReplyKind.MyShows,
        shows: filteredShows,
        metaData: action.metaData,
      };
    }
    case ActionTypes.NextEpisodeDate: {
      let nextEpisode: InternalTypes.ITvEpisode | null = null;
      let error;
      try {
        nextEpisode = await NextEpisodeController.getNextEpisodeAskedByUser(action.imdbId);
      } catch (err) {
        error = err;
      }
      return {
        kind: ReplyKind.NextEpisodeDate,
        episode: nextEpisode,
        error: error && { message: error.message },
        show: {
          imdbId: action.imdbId,
          title: action.title,
        },
        metaData: action.metaData,
      };
    }
    default:
      const message = `Unknows Action: ${action}`;
      console.error(message);
      throw new Error(message);
  }
}
