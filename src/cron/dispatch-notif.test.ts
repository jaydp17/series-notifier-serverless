/**
 * Test dispatch-notif cron
 */

jest.mock('../models/subscription');
jest.mock('../process-query-function/controllers/next-episode.controller');
jest.mock('../process-query-function/controllers/search.controller');
jest.mock('../common/lambda-utils');

// mocks
import * as LambdaUtils from '../common/lambda-utils';
import * as SubscriptionModel from '../models/subscription';
import * as NextEpisodeController from '../process-query-function/controllers/next-episode.controller';
import * as SearchController from '../process-query-function/controllers/search.controller';

// imports
import { getTvEpisode, getTVShow } from '../../test/test-data/common.data';
import * as cron from './dispatch-notif';

describe('Dispatch Notification Cron', () => {
  it('verifies main flow', async () => {
    // prepare
    const imdbIds = ['tt123', 'tt234', 'tt345'];
    (SubscriptionModel.getAllUniqShows as jest.Mock<{}>).mockReturnValueOnce(Promise.resolve(imdbIds));
    (NextEpisodeController.getNextEpisode as jest.Mock<{}>)
      .mockImplementationOnce(async imdbId => getTvEpisode({ imdbId, firstAired: Date.now() }))
      .mockImplementation(async imdbId => getTvEpisode({ imdbId }));
    (SubscriptionModel.getUsersWhoSubscribed as jest.Mock<{}>)
      .mockReturnValueOnce(Promise.resolve([{ socialId: '123' }]))
      .mockReturnValue(Promise.resolve([]));
    (SearchController.searchByImdb as jest.Mock<{}>).mockImplementation(async imdbId => getTVShow({ imdbId }));

    // execute
    await cron.main();

    // test
    expect(NextEpisodeController.getNextEpisode as jest.Mock<{}>).toHaveBeenCalledTimes(imdbIds.length);
    expect(LambdaUtils.invokeMessengerReply as jest.Mock<{}>).toHaveBeenCalledTimes(1);
  });
});
