/**
 * Tests the trakt api
 */

import * as TraktAPI from './trakt.api';

test('asdf', async () => {
  const result = await TraktAPI.searchShow('flash');
  console.log('result', result);
});
