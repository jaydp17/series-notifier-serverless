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

export const cronIntervalMins = 15;

export const cronIntervalMillis = cronIntervalMins * 60 * 1000;

/**
 * Name of the service, it's not gonna change
 */
export const serviceName: string = 'snbot';

export const pageToken = process.env.FB_PAGE_TOKEN as string;
if (!pageToken && env !== 'test') {
  throw new Error('FB_PAGE_TOKEN not found in env vars');
}

export const verifyToken = process.env.FB_VERIFY_TOKEN as string;
if (!verifyToken && env !== 'test') {
  throw new Error('FB_VERIFY_TOKEN not found in env vars');
}

export const botUsername = process.env.FB_USERNAME as string;
if (!botUsername && env !== 'test') {
  throw new Error('FB_USERNAME not found in env vars');
}

export const tvdbApiKey = process.env.TVDB_API_KEY as string;
if (!tvdbApiKey && env !== 'test') {
  throw new Error('TVDB_API_KEY not found in env vars');
}

export const traktApiKey = process.env.TRAKT_API_KEY as string;
if (!traktApiKey && env !== 'test') {
  throw new Error('TRAKT_API_KEY not found in env vars');
}

export const witAIToken = process.env.WITAI_TOKEN as string;
if (!witAIToken && env !== 'test') {
  throw new Error('WITAI_TOKEN not found in env vars');
}

export const fanArtApiKey = process.env.FAN_ART_API_KEY as string;
if (!fanArtApiKey && env !== 'test') {
  throw new Error('FAN_ART_API_KEY not found in env vars');
}

export const theMovieDbApiKey = process.env.THE_MOVIE_DB_API_KEY as string;
if (!theMovieDbApiKey && env !== 'test') {
  throw new Error('THE_MOVIE_DB_API_KEY not found in env vars');
}
