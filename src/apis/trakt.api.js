import request from 'request-promise';
import { traktApiKey } from '../utils/environment';

const BASE_URL = 'https://api.trakt.tv';
const HEADERS = { 'trakt-api-version': '2', 'trakt-api-key': traktApiKey };

export function searchShow(query) {
  const options = {
    method: 'GET',
    url: `${BASE_URL}/search/show`,
    headers: HEADERS,
    json: true,
    qs: { extended: 'full', query },
  };
  return request(options).promise();
}

export async function searchByImdbId(imdbId) {
  const options = {
    method: 'GET',
    url: `${BASE_URL}/search/imdb/${imdbId}`,
    headers: HEADERS,
    json: true,
    qs: { extended: 'full' },
  };
  const res = await request(options);
  if (res.length > 0) {
    return res[0];
  }
  return undefined;
}

export function showTrending() {
  const options = { method: 'GET', url: `${BASE_URL}/shows/trending`, headers: HEADERS, json: true };
  return request(options).promise();
}

export function nextEpisode(imdbId) {
  const options = {
    method: 'GET',
    url: `${BASE_URL}/shows/${imdbId}/next_episode`,
    headers: HEADERS,
    json: true,
  };
  return request(options).promise();
}

export function episodeSummary(imdbId, seasonNum, episodeNum) {
  const options = {
    method: 'GET',
    url: `${BASE_URL}/shows/${imdbId}/seasons/${seasonNum}/episodes/${episodeNum}`,
    headers: HEADERS,
    json: true,
    qs: { extended: 'full' },
  };
  return request(options).promise();
}
