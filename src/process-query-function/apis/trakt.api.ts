/**
 * An interface to TraktTV
 */

import { AxiosRequestConfig } from 'axios';
import { isEmpty } from 'lodash';
import axios from '../../common/axios';
import { errorMessages } from '../../common/constants';
import { traktApiKey } from '../../common/environment';
import * as TraktType from './trakt.types';

const BASE_URL = 'https://api.trakt.tv';
const HEADERS = { 'trakt-api-version': '2', 'trakt-api-key': traktApiKey };

/**
 * Searches a TV Show
 */
export async function searchShow(query: string): Promise<TraktType.ITraktSearchResult[]> {
  const options: AxiosRequestConfig = {
    method: 'GET',
    url: `${BASE_URL}/search/show`,
    headers: HEADERS,
    params: { extended: 'full', query },
  };
  const res = await axios(options);
  return res.data;
}

/**
 * Searches a TV Show using IMDB id
 */
export async function searchByImdbId(imdbId: string): Promise<TraktType.ITraktSearchResult | undefined> {
  const options = {
    method: 'GET',
    url: `${BASE_URL}/search/imdb/${imdbId}`,
    headers: HEADERS,
    params: { extended: 'full' },
  };
  const res = await axios(options);
  if (res.data.length > 0) {
    return res.data[0];
  }
  return undefined;
}

/**
 * Gets the Top Trending TV Shows
 */
export async function showTrending(): Promise<TraktType.ITraktTrendingResult[]> {
  const options = {
    method: 'GET',
    url: `${BASE_URL}/shows/trending`,
    headers: HEADERS,
  };
  const res = await axios(options);
  return res.data;
}

/**
 * Gets the next Upcoming episode of a TV Show
 */
export async function nextEpisode(imdbId: string): Promise<TraktType.ITraktEpisode> {
  const options = {
    method: 'GET',
    url: `${BASE_URL}/shows/${imdbId}/next_episode`,
    headers: HEADERS,
  };
  const res = await axios(options);
  if (isEmpty(res.data)) {
    throw new Error(`${errorMessages.noNextEpisode} : ${imdbId}`);
  }
  return res.data;
}

/**
 * Gets the summary of an episode
 */
export async function episodeSummary(
  imdbId: string,
  seasonNum: number,
  episodeNum: number,
): Promise<TraktType.ITraktEpisodeFull> {
  const options = {
    method: 'GET',
    url: `${BASE_URL}/shows/${imdbId}/seasons/${seasonNum}/episodes/${episodeNum}`,
    headers: HEADERS,
    params: { extended: 'full' },
  };
  const res = await axios(options);
  return res.data;
}
