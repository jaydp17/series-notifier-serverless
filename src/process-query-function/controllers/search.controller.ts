/**
 * Everything related to searching series
 */

import * as SeriesCacheModel from '../../models/series-cache';
import * as SubscriptionModel from '../../models/subscription';
import { capitalizeGeneres, convertToITvShow } from '../action-helper';
import * as TheMovieDbAPI from '../apis/themoviedb.api';
import * as TraktAPI from '../apis/trakt.api';

// types
import * as InternalTypes from '../../common/internal-message-types';
import { ITraktShowFull } from '../apis/trakt.types';

export const notRunningStatuses = ['canceled', 'ended', ''];

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
export async function search(query: string, socialId: string): Promise<InternalTypes.ITvShow[]> {
  const traktResults = await TraktAPI.searchShow(query);
  const runningShows = traktResults.map(result => result.show).filter(isShowRunning);
  const validRunningShows = runningShows.map(show => convertToITvShow(show, false)).filter(show => show.imdbId); // keep only those series who have a valid imdb id

  // imdbIds of valid running shows
  const validImdbIds = validRunningShows.map(show => show.imdbId);

  const [backDropUrlMap, subscriptionRecords] = await Promise.all([
    _getBackDropUrls(validImdbIds),
    SubscriptionModel.getSubscribedShows(socialId),
  ]);
  const subscribedImdbIds = subscriptionRecords.map(record => record.imdbId);

  const processedShows = validRunningShows
    .map(show => ({ ...show, backDropUrl: backDropUrlMap[show.imdbId] }))
    .filter(show => !!show.backDropUrl) // keep shows with backdrop only
    .map(show => ({ ...show, isSubscribed: subscribedImdbIds.includes(show.imdbId) }))
    .map(capitalizeGeneres);

  // save cache
  // fire & forget
  Promise.all(processedShows.map(show => SeriesCacheModel.updateCache(show.imdbId, show)));

  return processedShows;
}

export async function searchByImdb(
  imdbId: string,
  isSubscribed: boolean = false,
): Promise<InternalTypes.ITvShow | undefined> {
  const showCache: InternalTypes.ITvShowMetaData | null = await SeriesCacheModel.getCache(imdbId);
  if (showCache) {
    return { ...showCache, isSubscribed };
  }
  const [result, backDropUrlMap] = await Promise.all([TraktAPI.searchByImdbId(imdbId), _getBackDropUrls([imdbId])]);
  if (!result) {
    return undefined;
  }
  const tvShow = convertToITvShow(result.show, isSubscribed);
  if (!tvShow.imdbId) {
    return undefined;
  }
  const show = capitalizeGeneres({ ...tvShow, backDropUrl: backDropUrlMap[imdbId] });

  // save cache
  // fire & forget
  SeriesCacheModel.updateCache(show.imdbId, show);

  return show;
}

/**
 * @private
 */
export async function _getBackDropUrls(imdbIds: string[]): Promise<{ [key: string]: string | null | undefined }> {
  const promises = imdbIds.map(imdbId => TheMovieDbAPI.getBackDropImageUrl(imdbId));
  const urls = await Promise.all(promises);
  return imdbIds.reduce((finalObj, eachImdbId, index) => ({ ...finalObj, [eachImdbId]: urls[index] }), {});
}
