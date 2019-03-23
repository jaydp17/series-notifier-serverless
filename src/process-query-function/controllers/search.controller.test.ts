/**
 * Tests the search controller
 */

jest.mock('../apis/themoviedb.api');
jest.mock('../apis/trakt.api');
jest.mock('../../models/subscription');
jest.mock('../../models/series-cache');

import deepFreeze from 'deep-freeze';
import { mocked } from 'ts-jest/utils';
import { getSocialId } from '../../../test/test-data/common.data';
import { getTraktFullShow, getTraktSearchResult } from '../../../test/test-data/trakt.data';
import * as SubscriptionModel from '../../models/subscription';
import * as TheMovieDbAPI from '../apis/themoviedb.api';
import * as TraktAPI from '../apis/trakt.api';
import * as TraktTypes from '../apis/trakt.types';
import * as SearchController from './search.controller';

describe('Search Controller', () => {
  const dummyShowFull: TraktTypes.ITraktShowFull = deepFreeze(getTraktFullShow({ running: true }));

  // const dummyShow: InternalTypes.ITvShow = deepFreeze({
  //   title: 'dummyShow',
  //   year: '2017',
  //   tvdbId: 279121,
  //   imdbId: 'tt3107288',
  //   overview: 'dummy overview',
  //   genres: [],
  // });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('checks if show is running', () => {
    const statusValues = ['running', 'canceled', 'ended', 'returning series', ''];
    for (const status of statusValues) {
      const localShow = { ...dummyShowFull, status };
      const isRunning = SearchController.isShowRunning(localShow);
      // should only be true when status = running or returning series
      expect(isRunning).toEqual(status === 'running' || status === 'returning series');
    }
  });

  it('gets backdropUrls', async () => {
    // prepare
    const imdbIds = ['t123', 't456'];
    const images = ['https://image.tmdb.org/abc.jpg', 'https://image.tmdb.org/def.jpg'];
    const expectedResults = imdbIds.reduce((finalObj, imdbId, index) => ({ ...finalObj, [imdbId]: images[index] }), {});
    mocked(TheMovieDbAPI.getBackDropImageUrl)
      .mockReturnValueOnce(Promise.resolve(images[0]))
      .mockReturnValueOnce(Promise.resolve(images[1]));

    // test
    const result = await SearchController._getBackDropUrls(imdbIds);
    expect(result).toEqual(expectedResults);
  });

  describe('Search', () => {
    const mockSearchResults: ReadonlyArray<TraktTypes.ITraktSearchResult> = deepFreeze([
      getTraktSearchResult({ running: true }),
      getTraktSearchResult({ running: true }),
      getTraktSearchResult({ running: false }),
    ]);
    const mockSearchImdbIds = deepFreeze(mockSearchResults.map(result => result.show.ids.imdb));
    const imageUrl = 'https://image.tmdb.org/abc.jpg';
    const query = 'some-random-query';
    const socialId = getSocialId(); // tslint:disable-line:mocha-no-side-effect-code

    beforeEach(() => {
      jest.resetAllMocks();
      mocked(TraktAPI.searchShow).mockReturnValueOnce(Promise.resolve(mockSearchResults));
      // becuase of the below mock, the 1st imdbid is subscribed
      mocked(SubscriptionModel.getSubscribedShows).mockReturnValueOnce(
        Promise.resolve([{ imdbId: mockSearchImdbIds[0] }]),
      );
    });

    it('filters out non running shows', async () => {
      // prepare
      mocked(TheMovieDbAPI.getBackDropImageUrl).mockReturnValue(Promise.resolve(imageUrl));

      // test
      // console.log('SearchController.search', SearchController.search);
      const results = await SearchController.search(query, socialId);
      expect(results.length).toEqual(2);
      expect(results[0].imdbId).toEqual(mockSearchImdbIds[0]);
      expect(results[1].imdbId).toEqual(mockSearchImdbIds[1]);
    });

    it('filters out shows without backDropUrl', async () => {
      // prepare
      const expectedResultIndex = 1;
      mocked(TheMovieDbAPI.getBackDropImageUrl).mockImplementation(
        imdbId => (imdbId === mockSearchImdbIds[expectedResultIndex] ? imageUrl : undefined),
      );

      // test
      const results = await SearchController.search(query, socialId);
      expect(results.length).toEqual(1);
      expect(results[0].imdbId).toEqual(mockSearchImdbIds[expectedResultIndex]);
    });

    it('checks isSubscribed field', async () => {
      // prepare
      mocked(TheMovieDbAPI.getBackDropImageUrl).mockReturnValue(Promise.resolve(imageUrl));

      // test
      const results = await SearchController.search(query, socialId);
      expect(results.length).toEqual(2);
      expect(results[0].isSubscribed).toEqual(true);
      expect(results[1].isSubscribed).toEqual(false);
    });
  });

  describe('Search by Imdb', () => {
    const mockSearchResult: TraktTypes.ITraktSearchResult = deepFreeze(getTraktSearchResult({ running: true }));
    const imdbId = 'tt123423';
    const imageUrl = 'https://image.tmdb.org/abc.jpg';

    beforeEach(() => {
      jest.resetAllMocks();
    });

    it('returns undefined if show not found', async () => {
      mocked(TraktAPI.searchByImdbId).mockReturnValueOnce(Promise.resolve(undefined));

      const result = await SearchController.searchByImdb(imdbId);
      expect(result).toEqual(undefined);
    });

    it('contains backdropUrl', async () => {
      mocked(TraktAPI.searchByImdbId).mockReturnValueOnce(Promise.resolve(mockSearchResult));
      mocked(TheMovieDbAPI.getBackDropImageUrl).mockReturnValueOnce(Promise.resolve(imageUrl));

      const result = await SearchController.searchByImdb(imdbId);
      expect(result).not.toBeUndefined();
      expect(result && result.backDropUrl).toEqual(imageUrl);
    });

    it('passes on the isSubscribed flag [true]', async () => {
      mocked(TraktAPI.searchByImdbId).mockReturnValueOnce(Promise.resolve(mockSearchResult));
      mocked(TheMovieDbAPI.getBackDropImageUrl).mockReturnValueOnce(Promise.resolve(imageUrl));

      const result = await SearchController.searchByImdb(imdbId, true);
      expect(result).not.toBeUndefined();
      expect(result && result.isSubscribed).toEqual(true);
    });

    it('passes on the isSubscribed flag [false]', async () => {
      mocked(TraktAPI.searchByImdbId).mockReturnValueOnce(Promise.resolve(mockSearchResult));
      mocked(TheMovieDbAPI.getBackDropImageUrl).mockReturnValueOnce(Promise.resolve(imageUrl));

      const result = await SearchController.searchByImdb(imdbId, false);
      expect(result).not.toBeUndefined();
      expect(result && result.isSubscribed).toEqual(false);
    });
  });
});
