/**
 * Updates the cache of Next Episode
 */

import * as Bluebird from 'bluebird';
import * as SubscriptionModel from '../models/subscription';
import * as NextEpisodeController from '../process-query-function/controllers/next-episode.controller';

// types
import * as InternalTypes from '../common/internal-message-types';

export async function main() {
  const imdbIds = await SubscriptionModel.getAllUniqShows();
  await Bluebird.map(imdbIds, getNextEpisode, {
    concurrency: 50,
  });
}

export async function getNextEpisode(imdbId: string): Promise<InternalTypes.ITvEpisode | undefined> {
  try {
    // there's await over here because I wanna catch the error here
    // and not at one level up
    return await NextEpisodeController.getNextEpisode(imdbId, true);
  } catch (err) {
    console.error(err);
  }
  return Promise.resolve(undefined);
}
