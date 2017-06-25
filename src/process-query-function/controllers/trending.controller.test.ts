/**
 * Tests Trending Controller
 */

// mocks
jest.mock('../apis/trakt.api');
jest.mock('./search.controller');

// types
import * as TraktType from '../apis/trakt.types';

import deepFreeze from 'deep-freeze';
import * as faker from 'faker';
import { getTraktSearchResult, getTraktShow } from '../../../test/test-data/trakt.data';
import * as TraktApi from '../apis/trakt.api';
import { _getBackDropUrls } from './search.controller';
import * as TrendingController from './trending.controller';

describe('Trending Controller', () => {
  const dummyResults: TraktType.ITraktTrendingResult[] = deepFreeze([getDummyResult(), getDummyResult()]);
  beforeEach(() => {
    jest.resetAllMocks();
    (<jest.Mock<{}>>TraktApi.showTrending).mockReturnValueOnce(Promise.resolve(dummyResults));
    (<jest.Mock<{}>>TraktApi.searchByImdbId).mockImplementation(imdb =>
      Promise.resolve(getTraktSearchResult({ imdb })),
    );
    (<jest.Mock<{}>>_getBackDropUrls).mockImplementationOnce(imdbIds => Promise.resolve(getDummyBackDropUrls(imdbIds)));
  });
  afterAll(() => jest.resetAllMocks());

  it('gets trending shows', async () => {
    const results = await TrendingController.getTrending();
    expect(results).toHaveLength(2);
    expect(results[0].imdbId).toEqual(dummyResults[0].show.ids.imdb);
    expect(results[1].imdbId).toEqual(dummyResults[1].show.ids.imdb);
  });

  it('filters out shows without backDropUrl', async () => {
    // prepare
    (<jest.Mock<{}>>_getBackDropUrls).mockReset();
    (<jest.Mock<{}>>_getBackDropUrls).mockImplementationOnce(imdbIds =>
      Promise.resolve({ ...getDummyBackDropUrls(imdbIds), [imdbIds[1]]: undefined }),
    );

    // test
    const results = await TrendingController.getTrending();
    expect(results).toHaveLength(1);
    expect(results[0].imdbId).toEqual(dummyResults[0].show.ids.imdb);
  });
});

function getDummyResult(): TraktType.ITraktTrendingResult {
  return {
    watchers: 100,
    show: getTraktShow(),
  };
}

function getDummyBackDropUrls(imdbIds: string[]) {
  return imdbIds.reduce(
    (acc, imdb) => ({
      ...acc,
      [imdb]: faker.image.imageUrl(),
    }),
    {},
  );
}