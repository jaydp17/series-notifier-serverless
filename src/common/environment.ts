/**
 * Contains all the environment vailables
 */

/**
 * It's the NODE_ENV
 */
export const env: string = process.env.NODE_ENV || 'development';

export const isProd: boolean = env === 'production';

/**
 * The Stage which this function is running in
 */
export const stage: string = env === 'production' ? 'production' : 'dev';

/**
 * Name of the service, it's not gonna change
 */
export const serviceName: string = 'snbot';

export const pageToken = <string>process.env.FB_PAGE_TOKEN;
if (!pageToken && env !== 'test') {
  throw new Error('FB_PAGE_TOKEN not found in env vars');
}

export const verifyToken = <string>process.env.FB_VERIFY_TOKEN;
if (!verifyToken && env !== 'test') {
  throw new Error('FB_VERIFY_TOKEN not found in env vars');
}

export const botUsername = <string>process.env.FB_USERNAME;
if (!botUsername && env !== 'test') {
  throw new Error('FB_USERNAME not found in env vars');
}

export const tvdbApiKey = <string>process.env.TVDB_API_KEY;
if (!tvdbApiKey && env !== 'test') {
  throw new Error('TVDB_API_KEY not found in env vars');
}

export const traktApiKey = <string>process.env.TRAKT_API_KEY;
if (!traktApiKey && env !== 'test') {
  throw new Error('TRAKT_API_KEY not found in env vars');
}

export const witAIToken = <string>process.env.WITAI_TOKEN;
if (!witAIToken && env !== 'test') {
  throw new Error('WITAI_TOKEN not found in env vars');
}

export const fanArtApiKey = <string>process.env.FAN_ART_API_KEY;
if (!fanArtApiKey && env !== 'test') {
  throw new Error('FAN_ART_API_KEY not found in env vars');
}

export const theMovieDbApiKey = <string>process.env.THE_MOVIE_DB_API_KEY;
if (!theMovieDbApiKey && env !== 'test') {
  throw new Error('THE_MOVIE_DB_API_KEY not found in env vars');
}
