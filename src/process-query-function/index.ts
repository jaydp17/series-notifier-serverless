/**
 * The main file that starts the Process Query function
 */
// @ts-ignore
import AWSXRay from 'aws-xray-sdk-core';
import { inspect } from 'util';
import { LambdaCallback } from '../common/aws-lambda-types';
import { prettyPrint } from '../common/common-utils';
import { platformNames } from '../common/constants';
import { env } from '../common/environment';
import * as InternalTypes from '../common/internal-message-types';
import { invokeMessengerReply } from '../common/lambda-utils';
import * as Subscription from '../models/subscription';
import * as ActionHelper from './action-helper';
import * as NextEpisodeController from './controllers/next-episode.controller';
import * as SearchController from './controllers/search.controller';
import * as TrendingController from './controllers/trending.controller';

const { ActionTypes, ReplyKind } = InternalTypes;

if (!process.env.IS_LOCAL) {
  // tslint:disable-next-line: no-console
  console.log('capturing outgoing http calls in X-Ray');
  // tslint:disable-next-line no-var-requires
  AWSXRay.captureHTTPsGlobal(require('http'));
}

export async function handler(
  action: InternalTypes.AnyAction,
  context: {},
  callback: LambdaCallback,
): Promise<void> {
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
    // tslint:disable-next-line: no-console
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
      // tslint:disable-next-line: no-console
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
      if (shows.length === 0) {
        return {
          kind: ReplyKind.Text,
          text: "Sorry, I didn't find a TV Show with that name 🤕",
          metaData: action.metaData,
        };
      } else {
        return {
          kind: ReplyKind.SearchResults,
          shows,
          metaData: action.metaData,
        };
      }
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
      const shows = await Promise.all(
        imdbIds.map(imdbId => SearchController.searchByImdb(imdbId, true)),
      );
      const filteredShows = shows.filter(row => !!row) as InternalTypes.ITvShow[];
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
    case ActionTypes.GetStarted: {
      return {
        kind: ReplyKind.Text,
        text: "Send me your favorite TV Show's name!",
        metaData: action.metaData,
      };
    }
    default:
      const message = `Unknows Action: ${action}`;
      // tslint:disable-next-line: no-console
      console.error(message);
      throw new Error(message);
  }
}
