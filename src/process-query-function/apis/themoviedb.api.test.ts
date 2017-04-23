/**
 * Tests TheMovieDb API
 */

import * as TheMovieDbAPI from './themoviedb.api';

const theFlashImdbId = 'tt3107288';

describe('TheMovieDbAPI', () => {
  it('finds a show', async () => {
    const result = await TheMovieDbAPI.findShow(theFlashImdbId);
    expect(result).toMatchSnapshot();
  });

  it('finds backdrop ImageUrl', async () => {
    const result = await TheMovieDbAPI.getBackDropImageUrl(theFlashImdbId);
    expect(result).toMatchSnapshot();
  });
});
