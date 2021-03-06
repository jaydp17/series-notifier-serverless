/**
 * Generates common test data
 */

import * as faker from 'faker';
import { platformNames } from '../../src/common/constants';
import * as InternalTypes from '../../src/common/internal-message-types';

export function getSocialId(): string {
  return `${platformNames.FBMessenger}::${faker.random.number()}`;
}

// tslint:disable-next-line:no-any
export function getTVShow(overrides: { [key: string]: any } = {}): InternalTypes.ITvShow {
  const title = `${faker.hacker.adjective()} ${faker.hacker.noun()}`;
  return {
    title: overrides.title || title,
    year: overrides.year || faker.date.past().getFullYear(),
    tvdbId: overrides.tvdb || faker.random.number(),
    imdbId: overrides.imdb || `tt${faker.random.number()}`,
    overview: overrides.overview || faker.hacker.phrase(),
    genres: overrides.genres || ['drama', 'fantasy', 'science-fiction'],
    backDropUrl: overrides.backDropUrl || null,
    isSubscribed: overrides.isSubscribed || false,
  };
}

// tslint:disable-next-line:no-any
export function getTvEpisode(overrides: { [key: string]: any } = {}): InternalTypes.ITvEpisode {
  const title = `${faker.hacker.adjective()} ${faker.hacker.noun()}`;
  return {
    seasonNumber: overrides.seasonNumber || faker.random.number(),
    epNumber: overrides.epNumber || faker.random.number(),
    title: overrides.title || title,
    tvdbId: overrides.tvdb || faker.random.number(),
    imdbId: overrides.imdb || `tt${faker.random.number()}`,
    overview: overrides.overview || faker.hacker.phrase(),
    rating: overrides.rating || null,
    firstAired: overrides.firstAired || null,
    runtime: overrides.runtime || null,
  };
}
