/**
 * Tests process query function index file
 */

jest.mock('./controllers/search.controller');
jest.mock('../common/lambda-utils');
jest.mock('./controllers/trending.controller');
jest.mock('../models/subscription');

import { mocked } from 'ts-jest/utils';
import { getTraktFullShow } from '../../test/test-data/trakt.data';
import { platformNames } from '../common/constants';
import * as InternalTypes from '../common/internal-message-types';
import { invokeMessengerReply } from '../common/lambda-utils';
import * as Subscription from '../models/subscription';
import * as SearchController from './controllers/search.controller';
import * as TrendingController from './controllers/trending.controller';
import * as ProcessQuery from './index';

const { ActionTypes, ReplyKind } = InternalTypes;

describe('Process Query Function', () => {
  const senderId = '2342388586';
  const socialId = `FBMessenger::${senderId}`; // tslint:disable-line:mocha-no-side-effect-code

  beforeEach(() => {
    // clear mocks
    mocked(invokeMessengerReply).mockClear();
  });

  it('handles search query', async () => {
    const action = {
      text: 'The Flash',
      type: ActionTypes.Search,
      platform: platformNames.FBMessenger,
      metaData: { fbMessenger: { sender: { id: senderId } } },
    } as InternalTypes.ISearchAction;
    const callback = jest.fn();
    const shows = ['random', 'shows'];
    mocked(SearchController.search).mockReturnValueOnce(Promise.resolve(shows));

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
    const action = {
      text: 'The Flash',
      type: ActionTypes.Search,
      platform: platformNames.FBMessenger,
      metaData: { fbMessenger: { sender: { id: senderId } } },
    } as InternalTypes.ISearchAction;
    const callback = jest.fn();
    const expectedError = new Error('expected error');
    mocked(SearchController.search).mockImplementationOnce(() => {
      throw expectedError;
    });

    // test
    await ProcessQuery.handler(action, {}, callback);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(expectedError);
  });

  it('handles get trending query', async () => {
    const action = {
      type: ActionTypes.ShowTrending,
      platform: platformNames.FBMessenger,
      metaData: { fbMessenger: { sender: { id: senderId } } },
    } as InternalTypes.IShowTrendingAction;
    const callback = jest.fn();
    const shows = ['random', 'shows'];
    mocked(TrendingController.getTrending).mockReturnValueOnce(Promise.resolve(shows));

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
    const action = {
      type: ActionTypes.Subscribe,
      platform: platformNames.FBMessenger,
      metaData: { fbMessenger: { sender: { id: senderId } } },
      imdbId: 'tt5673782',
      tvdbId: 322399,
      title: 'Genius',
    } as InternalTypes.ISubscribeAction;
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

  it('handles un-subscribe action', async () => {
    const action = {
      type: ActionTypes.UnSubscribe,
      platform: platformNames.FBMessenger,
      metaData: { fbMessenger: { sender: { id: senderId } } },
      imdbId: 'tt5673782',
      tvdbId: 322399,
      title: 'Genius',
    } as InternalTypes.IUnSubscribeAction;
    const callback = jest.fn();

    // test
    await ProcessQuery.handler(action, {}, callback);
    expect(Subscription.deleteSubscription).toHaveBeenCalledTimes(1);
    expect(Subscription.deleteSubscription).toHaveBeenCalledWith(action.imdbId, socialId);
    expect(invokeMessengerReply).toHaveBeenCalledTimes(1);
    expect(invokeMessengerReply).toHaveBeenCalledWith({
      kind: ReplyKind.UnSubscribeResult,
      success: true,
      imdbId: action.imdbId,
      title: action.title,
      metaData: action.metaData,
    });
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(null, { success: true });
  });

  it('handles myShows', async () => {
    const action = {
      type: ActionTypes.MyShows,
      platform: platformNames.FBMessenger,
      metaData: { fbMessenger: { sender: { id: senderId } } },
    } as InternalTypes.IMyShowsAction;
    const subscriptionRows: Subscription.ISubscriptionRecord[] = [
      { socialId, imdbId: 'tt123' },
      { socialId, imdbId: 'tt456' },
    ];
    mocked(Subscription.getSubscribedShows).mockReturnValueOnce(Promise.resolve(subscriptionRows));
    mocked(SearchController.searchByImdb).mockReturnValueOnce(
      Promise.resolve(getTraktFullShow({ running: true })),
    );
    mocked(SearchController.searchByImdb).mockReturnValueOnce(
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
