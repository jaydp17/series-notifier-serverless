/**
 * Everything related to searching series
 */

// types
import * as InternalTypes from '../../common/internal-message-types';
import { ITraktShowFull } from '../apis/trakt.types';

// imports
import * as TraktAPI from '../apis/trakt.api';

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

export async function search(query: string): Promise<InternalTypes.ITvShow[]> {
  const traktResults = await TraktAPI.searchShow(query);
  const runningShows = traktResults.map(result => result.show)
    .filter(show => isShowRunning(show));
  return runningShows.map(show => TraktAPI.convertToITvShow(show));
}
