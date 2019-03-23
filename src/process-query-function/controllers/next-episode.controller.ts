/**
 * Figures out the next episode and it's air time
 */

import { addMinutes, isPast } from 'date-fns';
import { cronIntervalMins } from '../../common/environment';
import * as InternalTypes from '../../common/internal-message-types';
import * as NextEpisodeCacheModel from '../../models/next-episode-cache';
import * as TraktAPI from '../apis/trakt.api';

interface IGetNextEpisodeOptions {
  skipCacheRead?: boolean;
  skipCacheWrite?: boolean;
}

export async function getNextEpisode(
  imdbId: string,
  { skipCacheRead = false, skipCacheWrite = false }: IGetNextEpisodeOptions = {},
): Promise<InternalTypes.ITvEpisode> {
  if (!skipCacheRead) {
    const episodeCache = await NextEpisodeCacheModel.getCache(imdbId);
    if (episodeCache) {
      return episodeCache;
    }
  }
  const nextEp = await TraktAPI.nextEpisode(imdbId);
  const episodeDetails = await TraktAPI.episodeSummary(imdbId, nextEp.season, nextEp.number);

  const nextEpisode: InternalTypes.ITvEpisode = {
    seasonNumber: episodeDetails.season,
    epNumber: episodeDetails.number,
    title: episodeDetails.title,
    tvdbId: episodeDetails.ids.tvdb,
    imdbId: episodeDetails.ids.imdb,
    overview: episodeDetails.overview,
    rating: episodeDetails.rating,
    firstAired: new Date(episodeDetails.first_aired).getTime() || null,
    runtime: episodeDetails.runtime,
  };
  // fire & forget
  NextEpisodeCacheModel.updateCache(imdbId, nextEpisode);
  return nextEpisode;
}

/**
 * Because of updating the NextEpisode cache every 12 hours, there's a possibility that
 * when the user asks for the next episode of a TV show it might be obsolete data
 *
 * 1) We need that obsolete data in the cron
 * 2) But not when the user requests it, that should be the latest/live data
 *
 * This function takes care of that
 * @param imdbId ImdbId of the Tv Series
 */
export async function getNextEpisodeAskedByUser(imdbId: string): Promise<InternalTypes.ITvEpisode> {
  let nextEpisode = await getNextEpisode(imdbId);
  if (nextEpisode && nextEpisode.firstAired && isPast(nextEpisode.firstAired)) {
    const skipCacheWrite = !isPast(addMinutes(nextEpisode.firstAired, cronIntervalMins));
    nextEpisode = await getNextEpisode(imdbId, { skipCacheRead: true, skipCacheWrite });
  }
  return nextEpisode;
}

// getNextEpisode('tt6226232')
//   .then(console.log)
//   .catch(console.error);
