/**
 * Utility functions to help with actions
 */

import { platformNames } from '../common/constants';

// types
import * as InternalTypes from '../common/internal-message-types';
import * as TraktTypes from './apis/trakt.types';

export function getSocialId(action: InternalTypes.AnyAction): string {
  switch (action.platform) {
    case platformNames.FBMessenger: {
      const metaData = action.metaData.fbMessenger;
      if (!metaData) {
        throw new Error('No facebook metaData');
      }
      return `${platformNames.FBMessenger}::${metaData.sender.id}`;
    }
    default:
      throw new Error('unknown platform');
  }
}

/**
 * Converts ITraktShowFull to the internal show type ITvShow
 */
export function convertToITvShow(show: TraktTypes.ITraktShowFull, isSubscribed: boolean = false): InternalTypes.ITvShow {
  return {
    title: show.title,
    year: show.year,
    tvdbId: show.ids.tvdb,
    imdbId: show.ids.imdb,
    overview: show.overview,
    genres: show.genres,
    isSubscribed,
  };
}
