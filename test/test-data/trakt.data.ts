/**
 * Contains data from Trakt
 */

import * as faker from 'faker';
import * as TraktTypes from '../../src/process-query-function/apis/trakt.types';

import { prettyPrint } from '../../src/common/common-utils';

const runningSeriesStatus = ['running', 'returning series'];
const endedSeriesStatus = ['canceled', 'ended', ''];
const seriesStatus = [...runningSeriesStatus, ...endedSeriesStatus];

export function getTraktSearchResult(running: boolean = true): TraktTypes.ITraktSearchResult {
  return {
    type: 'show',
    score: null,
    show: getTraktFullShow(running),
  };
}

export function getTraktFullShow(running: boolean = true): TraktTypes.ITraktShowFull {
  const title = `${faker.hacker.adjective()} ${faker.hacker.noun()}`;
  const slug = faker.helpers.slugify(title.toLowerCase());
  return {
    title,
    year: faker.date.past().getFullYear(),
    ids: {
      trakt: faker.random.number(),
      slug,
      tvdb: faker.random.number(),
      imdb: `tt${faker.random.number()}`,
      tmdb: faker.random.number(),
      tvrage: faker.random.number(),
    },
    overview: faker.hacker.phrase(),
    first_aired: faker.date.past().toISOString(),
    status: faker.random.arrayElement(running ? runningSeriesStatus : endedSeriesStatus),
    rating: 8.28726,
    genres: ['drama', 'fantasy', 'science-fiction'],
  };
}



// prettyPrint(getTraktSearchResult());
