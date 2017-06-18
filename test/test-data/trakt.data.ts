/**
 * Contains data from Trakt
 */

import * as faker from 'faker';
import * as TraktTypes from '../../src/process-query-function/apis/trakt.types';

import { prettyPrint } from '../../src/common/common-utils';

const runningSeriesStatus = ['running', 'returning series'];
const endedSeriesStatus = ['canceled', 'ended', ''];
const seriesStatus = [...runningSeriesStatus, ...endedSeriesStatus];

type Override = {
  title?: string;
  year?: number;
  trakt?: number;
  slug?: string;
  tvdb?: number;
  imdb?: string;
  tmdb?: number;
  tvrage?: number;
  running?: boolean;
  overview?: string;
  first_aired?: string;
  trailer?: string;
  status?: string;
  rating?: number;
  genres?: string[];
};

/**
 * Retuns a value equalant to what a Trakt api search result would look
 */
export function getTraktSearchResult(overrides: {} = { running: true }): TraktTypes.ITraktSearchResult {
  return {
    type: 'show',
    score: null,
    show: getTraktFullShow(overrides),
  };
}

export function getTraktShow(overrides: Override = {}): TraktTypes.ITraktShow {
  const title = `${faker.hacker.adjective()} ${faker.hacker.noun()}`;
  const slug = faker.helpers.slugify(title.toLowerCase());
  return {
    title: overrides.title || title,
    year: overrides.year || faker.date.past().getFullYear(),
    ids: {
      trakt: overrides.trakt || faker.random.number(),
      slug: overrides.slug || slug,
      tvdb: overrides.tvdb || faker.random.number(),
      imdb: overrides.imdb || `tt${faker.random.number()}`,
      tmdb: overrides.tmdb || faker.random.number(),
      tvrage: overrides.tvrage || faker.random.number(),
    },
  };
}

export function getTraktFullShow(overrides: Override = { running: true }): TraktTypes.ITraktShowFull {
  const miniShow = getTraktShow(overrides);
  return {
    ...miniShow,
    overview: overrides.overview || faker.hacker.phrase(),
    first_aired: overrides.first_aired || faker.date.past().toISOString(),
    status: overrides.status || faker.random.arrayElement(overrides.running ? runningSeriesStatus : endedSeriesStatus),
    rating: overrides.rating || 8.28726,
    genres: overrides.genres || ['drama', 'fantasy', 'science-fiction'],
  };
}
