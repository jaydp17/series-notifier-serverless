/**
 * Everything related to searching series
 */

import * as SubscriptionModel from '../../models/subscription';
import { convertToITvShow } from '../action-helper';
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
  const runningShows = traktResults.map(result => result.show)
    .filter(show => isShowRunning(show));
  const validRunningShows = runningShows
    .map(show => convertToITvShow(show))
    .filter(show => show.imdbId); // keep only those series who have a valid imdb id

  // imdbIds of valid running shows
  const validImdbIds = validRunningShows.map(show => show.imdbId);

  const [backDropUrlMap, subscriptionRecords] = await Promise.all([
    _getBackDropUrls(validImdbIds),
    SubscriptionModel.getSubscribedShows(socialId),
  ]);
  const subscribedImdbIds = subscriptionRecords.map(record => record.imdbId);

  return validRunningShows
    .map(show => ({ ...show, backDropUrl: backDropUrlMap[show.imdbId] }))
    .filter(show => !!show.backDropUrl) // keep shows with backdrop only
    .map(show => ({ ...show, isSubscribed: subscribedImdbIds.includes(show.imdbId) }));
}
/**
 * @private
 */
export async function _getBackDropUrls(imdbIds: string[]): Promise<{ [key: string]: string | null | undefined }> {
  const promises = imdbIds.map(imdbId => TheMovieDbAPI.getBackDropImageUrl(imdbId));
  const urls = await Promise.all(promises);
  return imdbIds.reduce((finalObj, eachImdbId, index) => ({ ...finalObj, [eachImdbId]: urls[index] }), {});
}
