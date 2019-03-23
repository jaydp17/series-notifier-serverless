/**
 * Test dispatch-notif cron
 */

jest.mock('../models/subscription');
jest.mock('../process-query-function/controllers/next-episode.controller');
jest.mock('../process-query-function/controllers/search.controller');
jest.mock('../common/lambda-utils');

import { mocked } from 'ts-jest/utils';
import { getTvEpisode, getTVShow } from '../../test/test-data/common.data';
import * as LambdaUtils from '../common/lambda-utils';
import * as SubscriptionModel from '../models/subscription';
import * as NextEpisodeController from '../process-query-function/controllers/next-episode.controller';
import * as SearchController from '../process-query-function/controllers/search.controller';
import * as cron from './dispatch-notif';

describe('Dispatch Notification Cron', () => {
  it('verifies main flow', async () => {
    // prepare
    const imdbIds = ['tt123', 'tt234', 'tt345'];
    mocked(SubscriptionModel.getAllUniqShows).mockReturnValueOnce(Promise.resolve(imdbIds));
    mocked(NextEpisodeController.getNextEpisode)
      .mockImplementationOnce(async imdbId => getTvEpisode({ imdbId, firstAired: Date.now() }))
      .mockImplementation(async imdbId => getTvEpisode({ imdbId }));
    mocked(SubscriptionModel.getUsersWhoSubscribed)
      .mockReturnValueOnce(Promise.resolve([{ socialId: '123' }]))
      .mockReturnValue(Promise.resolve([]));
    mocked(SearchController.searchByImdb).mockImplementation(async imdbId => getTVShow({ imdbId }));

    // execute
    await cron.main();

    // test
    expect(NextEpisodeController.getNextEpisode).toHaveBeenCalledTimes(imdbIds.length);
    expect(LambdaUtils.invokeMessengerReply).toHaveBeenCalledTimes(1);
  });
});
