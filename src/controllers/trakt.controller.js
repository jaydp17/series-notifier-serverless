import _object from 'lodash/object';

import * as TraktApi from '../apis/trakt.api';
import * as TvDbCtrl from './tvdb.controller';
import CustomError from '../utils/custom-error';

/**
 * Searches Tv Shows based on the query provided
 * @param query A piece of text that is matched against the title of the Tv Show
 */
export async function search(query) {
  const searchResult = await TraktApi.searchShow(query);
  const tvdbIds = searchResult
    .map(result => result.show)
    .filter(show => show.title && show.year && show.status)
    .map(show => show.ids.tvdb)
    .filter(id => id);
  const uniqTvDbIds = [ ...new Set(tvdbIds) ];
  const tvdbSeriesList = await TvDbCtrl.getSeriesByIds(uniqTvDbIds);

  // Arranges the currently running shows on the top
  tvdbSeriesList.sort((a, b) => b.running - a.running);

  // TODO: add the series name back in WIT.AI Feedback loop
  return tvdbSeriesList;
}

/**
 * Returns the next episode of a Tv Show
 * @param imdbId IMDB ID of the Tv Show
 */
export async function getNextEpisode(imdbId) {
  const nextEpisode = await TraktApi.nextEpisode(imdbId);
  if (!nextEpisode) {
    return Promise.reject(new CustomError('next episode unknown', { imdbId }));
  }
  const nextSummary = await TraktApi.episodeSummary(imdbId, nextEpisode.season, nextEpisode.number);
  if (!nextSummary) {
    return Promise.reject(new CustomError('next episode summary not found', {
      imdbId,
      season: nextEpisode.season,
      number: nextEpisode.number,
    }));
  }

  // Keep only required fields
  const trimmedDownEpisode = _object.pick(episode, [
    'season',
    'number',
    'title',
    'overview',
    'first_aired',
  ]);

  // Fills in default values in empty fields
  trimmedDownEpisode.title = trimmedDownEpisode.title
    ? trimmedDownEpisode.title
    : `Episode ${trimmedDownEpisode.number}`;

  // Convert airDate to a date object
  trimmedDownEpisode.first_aired = trimmedDownEpisode.first_aired
    ? new Date(trimmedDownEpisode.first_aired)
    : null;

  return trimmedDownEpisode;
}
