/**
 * Tests the trakt api
 */

import * as TraktAPI from './trakt.api';

describe('TraktAPI', () => {
  it('search flash', async () => {
    const result = await TraktAPI.searchShow('flash');
    const cleanedResult = result.map(item => {
      delete item.score; // deleting item property as it could change over time
      return item;
    });
    expect(result).toMatchSnapshot();
  });
});
