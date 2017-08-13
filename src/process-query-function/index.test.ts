/**
 * Tests process query function index file
 */

jest.mock('./controllers/search.controller');
jest.mock('../common/lambda-utils');
jest.mock('./controllers/trending.controller');
jest.mock('../models/subscription');

import { getTraktFullShow, getTraktSearchResult } from '../../test/test-data/trakt.data';
import { platformNames } from '../common/constants';
import { invokeMessengerReply, invokeProcessQuery } from '../common/lambda-utils';
import * as Subscription from '../models/subscription';
import * as SearchController from './controllers/search.controller';
import * as TrendingController from './controllers/trending.controller';
import * as ProcessQuery from './index';

// types
import * as InternalTypes from '../common/internal-message-types';

const { ActionTypes, ReplyKind } = InternalTypes;

describe('Process Query Function', () => {
  const senderId = '2342388586';
  const socialId = `FBMessenger::${senderId}`; // tslint:disable-line:mocha-no-side-effect-code

  beforeEach(() => {
    // clear mocks
    (<jest.Mock<{}>>invokeMessengerReply).mockClear();
  });

  it('handles search query', async () => {
    const action = <InternalTypes.ISearchAction>{
      text: 'The Flash',
      type: ActionTypes.Search,
      platform: platformNames.FBMessenger,
      metaData: { fbMessenger: { sender: { id: senderId } } },
    };
    const callback = jest.fn();
    const shows = ['random', 'shows'];
    (<jest.Mock<{}>>SearchController.search).mockReturnValueOnce(Promise.resolve(shows));

    // test
    await ProcessQuery.handler(action, {}, callback);
    expect(SearchController.search).toHaveBeenCalledTimes(1);
    expect(SearchController.search).toHaveBeenCalledWith(action.text, socialId);
    expect(invokeMessengerReply).toHaveBeenCalledTimes(1);
    expect(invokeMessengerReply).toHaveBeenCalledWith({
      kind: ReplyKind.SearchResults,
      shows,
      metaData: action.metaData,
    });
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(null, { success: true });
  });

  it('handles search query [error]', async () => {
    const action = <InternalTypes.ISearchAction>{
      text: 'The Flash',
      type: ActionTypes.Search,
      platform: platformNames.FBMessenger,
      metaData: { fbMessenger: { sender: { id: senderId } } },
    };
    const callback = jest.fn();
    const expectedError = new Error('expected error');
    (<jest.Mock<{}>>SearchController.search).mockImplementationOnce(() => {
      throw expectedError;
    });

    // test
    await ProcessQuery.handler(action, {}, callback);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(expectedError);
  });

  it('handles get trending query', async () => {
    const action = <InternalTypes.IShowTrendingAction>{
      type: ActionTypes.ShowTrending,
      platform: platformNames.FBMessenger,
      metaData: { fbMessenger: { sender: { id: senderId } } },
    };
    const callback = jest.fn();
    const shows = ['random', 'shows'];
    (<jest.Mock<{}>>TrendingController.getTrending).mockReturnValueOnce(Promise.resolve(shows));

    // test
    await ProcessQuery.handler(action, {}, callback);
    expect(TrendingController.getTrending).toHaveBeenCalledTimes(1);
    expect(invokeMessengerReply).toHaveBeenCalledTimes(1);
    expect(invokeMessengerReply).toHaveBeenCalledWith({
      kind: ReplyKind.TrendingShows,
      shows,
      metaData: action.metaData,
    });
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(null, { success: true });
  });

  it('handles subscribe action', async () => {
    const action = <InternalTypes.ISubscribeAction>{
      type: ActionTypes.Subscribe,
      platform: platformNames.FBMessenger,
      metaData: { fbMessenger: { sender: { id: senderId } } },
      imdbId: 'tt5673782',
      tvdbId: 322399,
      title: 'Genius',
    };
    const callback = jest.fn();

    // test
    await ProcessQuery.handler(action, {}, callback);
    expect(Subscription.createSubscription).toHaveBeenCalledTimes(1);
    expect(Subscription.createSubscription).toHaveBeenCalledWith(action.imdbId, socialId);
    expect(invokeMessengerReply).toHaveBeenCalledTimes(1);
    expect(invokeMessengerReply).toHaveBeenCalledWith({
      kind: ReplyKind.SubscribeResult,
      success: true,
      imdbId: action.imdbId,
      title: action.title,
      metaData: action.metaData,
    });
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(null, { success: true });
  });

  it('handles myShows', async () => {
    const action = <InternalTypes.IMyShowsAction>{
      type: ActionTypes.MyShows,
      platform: platformNames.FBMessenger,
      metaData: { fbMessenger: { sender: { id: senderId } } },
    };
    const subscriptionRows: Subscription.SubscriptionRecord[] = [
      { socialId, imdbId: 'tt123' },
      { socialId, imdbId: 'tt456' },
    ];
    (<jest.Mock<{}>>Subscription.getSubscribedShows).mockReturnValueOnce(Promise.resolve(subscriptionRows));
    (<jest.Mock<{}>>SearchController.searchByImdb).mockReturnValueOnce(
      Promise.resolve(getTraktFullShow({ running: true })),
    );
    (<jest.Mock<{}>>SearchController.searchByImdb).mockReturnValueOnce(
      Promise.resolve(getTraktFullShow({ running: true })),
    );
    const callback = jest.fn();

    // test
    await ProcessQuery.handler(action, {}, callback);
    expect(invokeMessengerReply).toHaveBeenCalledTimes(1);
    expect(invokeMessengerReply).toHaveBeenCalledWith(
      expect.objectContaining({
        kind: ReplyKind.MyShows,
        metaData: action.metaData,
      }),
    );
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(null, { success: true });
  });
});
