/**
 * Everything related to searching series
 */

import * as TheMovieDbAPI from '../apis/themoviedb.api';
import * as TraktAPI from '../apis/trakt.api';

// types
import * as InternalTypes from '../../common/internal-message-types';
import { ITraktShowFull } from '../apis/trakt.types';

export const notRunningStatuses = ['canceled', 'ended'];

export function isShowRunning(show: ITraktShowFull): boolean {
  if (!show.status) {
    return false;
  }
  if (notRunningStatuses.includes(show.status)) {
    return false;
  }
  return true;
}

/**
 * Searches a TV Show
 */
export async function search(query: string): Promise<InternalTypes.ITvShow[]> {
  const traktResults = await TraktAPI.searchShow(query);
  const runningShows = traktResults.map(result => result.show)
    .filter(show => isShowRunning(show));
  const promises = runningShows
    .map(show => TraktAPI.convertToITvShow(show))
    .filter(show => show.imdbId) // keep only those series who have a valid imdb id
    .map(show => _attachBackDrop(show));
  const shows = await Promise.all(promises);

  // remove series who don't have a backdrop
  return shows.filter(show => !!show.backDropUrl);
}

/**
 * @private
 */
export async function _attachBackDrop(show: InternalTypes.ITvShow): Promise<InternalTypes.ITvShow> {
  const backDropUrl = await TheMovieDbAPI.getBackDropImageUrl(show.imdbId);
  return { ...show, backDropUrl };
}
