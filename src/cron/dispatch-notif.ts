/**
 * Finds the episodes that launched in last 5 mins
 * or are going to be launched in next 10 minutes
 * and sends out a notification for all those
 */

import { DynamoDB } from 'aws-sdk';
import * as Bluebird from 'bluebird';
import { addMinutes } from 'date-fns';
import { keyBy } from 'lodash';
import dynamodb from '../common/dynamodb';
import { env } from '../common/environment';
import * as LambdaUtils from '../common/lambda-utils';
import tables from '../common/tables';
import * as SubscriptionModel from '../models/subscription';
import * as NextEpisodeController from '../process-query-function/controllers/next-episode.controller';
import * as SearchController from '../process-query-function/controllers/search.controller';

// types
import * as InternalTypes from '../common/internal-message-types';

// tslint:disable no-console

const now = Date.now();
const MINUTE = 60 * 1000;

export async function main() {
  const imdbIds = await SubscriptionModel.getAllUniqShows();
  const nextEpisodesPerImdbId = await Bluebird.map(imdbIds, getNextEpisode, {
    concurrency: 50,
  });
  const nearbyEpisodes = <InternalTypes.ITvEpisode[]>nextEpisodesPerImdbId.filter(keepOnlyNearByEpisodes);

  await Bluebird.map(nearbyEpisodes, processEachEpisode, { concurrency: 5 });
  if (env !== 'test') {
    console.log('done!');
  }
}

export async function processEachEpisode(episode: InternalTypes.ITvEpisode) {
  const [usersSubscribed, show] = await Promise.all([
    SubscriptionModel.getUsersWhoSubscribed(episode.imdbId),
    SearchController.searchByImdb(episode.imdbId, true),
  ]);
  if (!show || !show.title) {
    console.error(new Error(`${episode.imdbId} doesn't have a show or title`));
    return undefined;
  }
  const socialIds = usersSubscribed.map(subscription => subscription.socialId);
  await Bluebird.map(socialIds, socialId => sendNotification(socialId, episode, show), { concurrency: 10 });
}

async function sendNotification(socialId: string, episode: InternalTypes.ITvEpisode, show: InternalTypes.ITvShow) {
  if (env !== 'test') {
    console.log('sending notif', episode);
  }
  const senderId = socialId.split('::')[1];
  const event: InternalTypes.IEpisodeNotificationReply = {
    kind: InternalTypes.ReplyKind.EpisodeNotification,
    episode,
    show: {
      imdbId: episode.imdbId,
      title: show.title,
    },
    metaData: <InternalTypes.IMetaData>{ fbMessenger: { sender: { id: senderId } } },
  };
  return LambdaUtils.invokeMessengerReply(event);
}

/**
 * Filters shows which are going to be live in next 10 mins
 * or went live in past 5 mins
 */
function keepOnlyNearByEpisodes(episode: InternalTypes.ITvEpisode | undefined) {
  if (!episode || !episode.firstAired) return false;
  const past5Mins = addMinutes(now, -5).getTime();
  const next10Mins = addMinutes(now, 10).getTime();
  return episode.firstAired >= past5Mins && episode.firstAired <= next10Mins;
}

export async function getNextEpisode(imdbId: string): Promise<InternalTypes.ITvEpisode | undefined> {
  try {
    // there's await over here because I wanna catch the error here
    // and not at one level up
    return await NextEpisodeController.getNextEpisode(imdbId);
  } catch (err) {
    console.error(err);
  }
  return Promise.resolve(undefined);
}
