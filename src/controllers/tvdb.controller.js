import Promise from 'bluebird';
import TVDB from 'node-tvdb';

import { tvdbApiKey } from '../utils/environment';
import * as Logger from '../utils/logger';

const tvdb = new TVDB(tvdbApiKey);

/**
 * Returns Tv Shows based on TVDB Ids
 * @param tvDbIds An Array of TvDb Ids
 */
export async function getSeriesByIds(tvdbIds) {
  const tvdbResults = await Promise.map(tvdbIds, id => _getSeriesById(id));
  const filturedResults = tvdbResults.filter(_filterData);
  return filturedResults.map(_parseData);
}

/**
 * Queries TvDb server for the result
 * @param tvDbId A Single TvDb Id string
 * @private
 */
async function _getSeriesById(tvDbId) {
  try {
    return await tvdb.getSeriesById(tvDbId);
  } catch (error) {
    Logger.error(error, { message: `error loading tvDbId: ${tvDbId}` });
  }
}

/**
 * Filters shows that don't have basic data filled in
 * @param data Data Received from TvDb
 * @private
 */
function _filterData(data) {
  if (!data) {
    return false;
  }
  return data.id && data.IMDB_ID && data.SeriesName && data.Genre && data.Status && data.Runtime &&
    data.Rating &&
    data.poster &&
    true;
}

/**
 * Parses Data from TvDb to data that the Client app can understand
 * @param data Data Received from TvDb
 * @private
 */
function _parseData(data) {
  return {
    imdbId: data.IMDB_ID,
    tvDbId: data.id,
    name: data.SeriesName,
    genre: TVDB.utils.parsePipeList(data.Genre),
    running: data.Status === 'Continuing',
    rating: data.Rating,
    length: data.Runtime,
    poster: `http://thetvdb.com/banners/_cache/${data.poster}`,
    fanArt: `http://thetvdb.com/banners/${data.fanart}`,
  };
}
