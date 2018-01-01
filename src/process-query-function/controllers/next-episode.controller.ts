/**
 * Figures out the next episode and it's air time
 */

import { prettyPrint } from '../../common/common-utils';
import * as NextEpisodeCacheModel from '../../models/next-episode-cache';
import * as TraktAPI from '../apis/trakt.api';

// types
import * as InternalTypes from '../../common/internal-message-types';

export async function getNextEpisode(imdbId: string, skipCache: boolean = false): Promise<InternalTypes.ITvEpisode> {
  if (!skipCache) {
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

// getNextEpisode('tt6226232')
//   .then(console.log)
//   .catch(console.error);
