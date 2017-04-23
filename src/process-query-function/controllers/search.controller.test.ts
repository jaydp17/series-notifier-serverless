/**
 * Tests the search controller
 */

jest.mock('../apis/themoviedb.api');

import deepFreeze from 'deep-freeze';
import * as TheMovieDbAPI from '../apis/themoviedb.api';
import * as SearchController from './search.controller';

// types
import * as InternalTypes from '../../common/internal-message-types';
import { ITraktShowFull } from '../apis/trakt.types';

describe('Search Controller', () => {
  const dummyShowFull: ITraktShowFull = deepFreeze({
    title: 'dummpShow',
    year: 2017,
    ids: {
      imdb: 'tt3107288',
      slug: 'the-flash-2014',
      tmdb: 60735,
      trakt: 60300,
      tvdb: 279121,
      tvrage: 36939,
    },
    overview: 'dummy overview',
    first_aired: '01-01-2017',
    status: 'running',
    rating: 5,
    genres: [],
  });

  const dummyShow: InternalTypes.ITvShow = deepFreeze({
    title: 'dummyShow',
    year: '2017',
    tvdbId: 279121,
    imdbId: 'tt3107288',
    overview: 'dummy overview',
    genres: [],
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('checks if show is running', () => {
    const statusValues = ['running', 'canceled', 'ended', ''];
    for (const status of statusValues) {
      const localShow = { ...dummyShowFull, status };
      const isRunning = SearchController.isShowRunning(localShow);
      expect(isRunning).toEqual(status === 'running'); // should only be true when status = running
    }
  });

  it('attaches backdrop url', async () => {
    // prepare
    const imageUrl = 'https://image.tmdb.org/t/p/w780//mmxxEpTqVdwBlu5Pii7tbedBkPC.jpg';
    (<jest.Mock<{}>>TheMovieDbAPI.getBackDropImageUrl).mockReturnValue(Promise.resolve(imageUrl));

    // execute
    const result = await SearchController._attachBackDrop(dummyShow);
    expect(result.backDropUrl).toEqual(imageUrl);
  });
});
