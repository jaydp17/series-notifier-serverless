/**
 * Tests the trakt api
 */

import * as TraktAPI from './trakt.api';

describe('TraktAPI', () => {
  it('search flash', async () => {
    const result = await TraktAPI.searchShow('flash');
    expect(result).toMatchSnapshot();
  });
});
