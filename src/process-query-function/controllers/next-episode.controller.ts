/**
 * Figures out the next episode and it's air time
 */

import { prettyPrint } from '../../common/common-utils';
import * as TraktAPI from '../apis/trakt.api';

// types
import * as InternalTypes from '../../common/internal-message-types';

export async function getNextEpisode(imdbId: string): Promise<InternalTypes.ITvEpisode> {
  const nextEp = await TraktAPI.nextEpisode(imdbId);
  const episodeDetails = await TraktAPI.episodeSummary(imdbId, nextEp.season, nextEp.number);
  return {
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
}

// getNextEpisode('tt0898266').then(console.log).catch(console.error);
