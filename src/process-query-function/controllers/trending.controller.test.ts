/**
 * Tests Trending Controller
 */

// mocks
jest.mock('../apis/trakt.api');
jest.mock('./search.controller');
jest.mock('../../models/subscription');

// types
import * as TraktType from '../apis/trakt.types';

import * as deepFreeze from 'deep-freeze';
import * as faker from 'faker';
import { getTVShow } from '../../../test/test-data/common.data';
import { getTraktSearchResult, getTraktShow } from '../../../test/test-data/trakt.data';
import * as Subscription from '../../models/subscription';
import * as TraktApi from '../apis/trakt.api';
import { _getBackDropUrls } from './search.controller';
import * as SearchController from './search.controller';
import * as TrendingController from './trending.controller';

describe('Trending Controller', () => {
  const dummyResults: TraktType.ITraktTrendingResult[] = deepFreeze([getDummyResult(), getDummyResult()]);
  beforeEach(() => {
    jest.resetAllMocks();
    (<jest.Mock<{}>>TraktApi.showTrending).mockReturnValueOnce(Promise.resolve(dummyResults));
    (<jest.Mock<{}>>TraktApi.searchByImdbId).mockImplementation(imdb =>
      Promise.resolve(getTraktSearchResult({ imdb })),
    );
    (<jest.Mock<{}>>SearchController.searchByImdb).mockImplementation(imdb =>
      Promise.resolve(getTVShow({ imdb, backDropUrl: faker.image.imageUrl() })),
    );
    (<jest.Mock<{}>>_getBackDropUrls).mockImplementationOnce(imdbIds => Promise.resolve(getDummyBackDropUrls(imdbIds)));
  });
  afterAll(() => jest.resetAllMocks());

  it('gets trending shows', async () => {
    const subscribedRecords = [{ imdbId: 'tt123' }, { imdbId: dummyResults[0].show.ids.imdb }];
    const socialId = 'random-social-id';
    (<jest.Mock<{}>>Subscription.getSubscribedShows).mockReturnValueOnce(Promise.resolve(subscribedRecords));
    (<jest.Mock<{}>>SearchController.searchByImdb).mockImplementationOnce(imdb =>
      Promise.resolve(getTVShow({ imdb, backDropUrl: faker.image.imageUrl(), isSubscribed: true })),
    );

    const results = await TrendingController.getTrending(socialId);
    expect(results).toHaveLength(2);
    expect(results[0].imdbId).toEqual(dummyResults[0].show.ids.imdb);
    expect(results[0].isSubscribed).toEqual(true);
    expect(results[1].imdbId).toEqual(dummyResults[1].show.ids.imdb);
    expect(results[1].isSubscribed).toEqual(false);
  });

  it('filters out shows without backDropUrl', async () => {
    // prepare
    const subscribedRecords = [{ imdbId: 'tt123' }, { imdbId: dummyResults[0].show.ids.imdb }];
    const socialId = 'random-social-id';
    (<jest.Mock<{}>>Subscription.getSubscribedShows).mockReturnValueOnce(Promise.resolve(subscribedRecords));
    (<jest.Mock<{}>>SearchController.searchByImdb).mockReset();
    (<jest.Mock<{}>>SearchController.searchByImdb).mockImplementationOnce(imdb =>
      Promise.resolve(getTVShow({ imdb, backDropUrl: faker.image.imageUrl(), isSubscribed: true })),
    );
    (<jest.Mock<{}>>SearchController.searchByImdb).mockImplementationOnce(imdb =>
      Promise.resolve(getTVShow({ imdb, isSubscribed: true })),
    );

    // test
    const results = await TrendingController.getTrending(socialId);
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
