/**
 * An interface to deal with the movie db
 */

import { AxiosRequestConfig } from 'axios';
import axios from '../../common/axios';
import { theMovieDbApiKey } from '../../common/environment';

// types
import { IFindResult } from './themoviedb.types';

const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_PREFIX_URL = 'https://image.tmdb.org/t/p/w780';

/**
 * Finds a TV show using it's imdb id
 */
export async function findShow(imdbId: string): Promise<IFindResult> {
  const options: AxiosRequestConfig = {
    method: 'GET',
    url: `${BASE_URL}/find/${imdbId}`,
    params: {
      api_key: theMovieDbApiKey,
      language: 'en-US',
      external_source: 'imdb_id',
    },
  };
  const { data }: { data: IFindResult } = await axios(options);
  return data;
}

/**
 * Gets the BackDropUrl of a Tv Show, given the imdb id
 */
export async function getBackDropImageUrl(imdbId: string): Promise<string | undefined> {
  const data = await findShow(imdbId);
  const tvResult = data.tv_results[0];
  if (!tvResult || !tvResult.backdrop_path) {
    return undefined;
  }
  return `${IMAGE_PREFIX_URL}/${tvResult.backdrop_path}`;
}
