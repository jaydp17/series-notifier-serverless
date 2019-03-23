/**
 * Tests the postback processer
 */

jest.mock('../../common/lambda-utils');

import deepFreeze from 'deep-freeze';
import { platformNames } from '../../common/constants';
import * as InternalTypes from '../../common/internal-message-types';
import { invokeProcessQuery } from '../../common/lambda-utils';
import * as MessengerActionTypes from '../../common/messenger-actions-types';
import * as MessengerTypes from '../../common/messenger-types';
import * as PostbackProcessor from './postback';

describe('Postback processer', () => {
  const baseMessaging: MessengerTypes.IMessaging = deepFreeze({
    sender: { id: 'random:sender-id' },
    recipient: { id: 'random:recipient-id' },
    timestamp: 1337,
  });
  beforeEach(() => {
    // clear mocks
    (invokeProcessQuery as jest.Mock<{}>).mockClear();
  });

  it('gets internal action [showTrending]', () => {
    // prepare
    const payload = { action: MessengerActionTypes.showTrending.type };

    // test
    const result = PostbackProcessor._getInternalAction(JSON.stringify(payload));
    expect(result).toEqual({
      type: InternalTypes.ActionTypes.ShowTrending,
      platform: platformNames.FBMessenger,
      metaData: { fbMessenger: undefined },
    });
  });

  it('gets internal action [subscribe]', () => {
    // prepare
    const payload = {
      action: MessengerActionTypes.subscribe.type,
      imdbId: 'tt5673782',
      tvdbId: 322399,
      title: 'Genius',
    };

    // test
    const result = PostbackProcessor._getInternalAction(JSON.stringify(payload));
    expect(result).toEqual({
      type: InternalTypes.ActionTypes.Subscribe,
      platform: platformNames.FBMessenger,
      metaData: { fbMessenger: undefined },
      imdbId: payload.imdbId,
      tvdbId: payload.tvdbId,
      title: payload.title,
    });
  });

  it('gets internal action [un-subscribe]', () => {
    // prepare
    const payload = {
      action: MessengerActionTypes.unSubscribe.type,
      imdbId: 'tt5673782',
      tvdbId: 322399,
      title: 'Genius',
    };

    // test
    const result = PostbackProcessor._getInternalAction(JSON.stringify(payload));
    expect(result).toEqual({
      type: InternalTypes.ActionTypes.UnSubscribe,
      platform: platformNames.FBMessenger,
      metaData: { fbMessenger: undefined },
      imdbId: payload.imdbId,
      tvdbId: payload.tvdbId,
      title: payload.title,
    });
  });

  it('gets internal action [myShows]', () => {
    // prepare
    const payload = {
      action: MessengerActionTypes.myShows.type,
    };

    // test
    const result = PostbackProcessor._getInternalAction(JSON.stringify(payload));
    expect(result).toEqual({
      type: InternalTypes.ActionTypes.MyShows,
      platform: platformNames.FBMessenger,
      metaData: { fbMessenger: undefined },
    });
  });

  it('gets internal action [unknown]', () => {
    // prepare
    const payload = { action: 'random-action' };

    // test
    expect(() => {
      PostbackProcessor._getInternalAction(JSON.stringify(payload));
    }).toThrowError(`Unknown PostBack ActionType: ${payload.action}`);
  });

  it('process postback message', async () => {
    // prepare
    const payload = { action: MessengerActionTypes.showTrending.type };
    const payloadStr = JSON.stringify(payload);
    (invokeProcessQuery as jest.Mock<{}>).mockReturnValueOnce(Promise.resolve(payloadStr));
    const postbackMessagings = [
      {
        ...baseMessaging,
        postback: { payload: payloadStr },
      },
    ];
    const internalMessage = PostbackProcessor._getInternalAction(payloadStr);
    // to test that this is being attached in the process method
    internalMessage.metaData.fbMessenger = postbackMessagings[0];

    // test
    const result = await PostbackProcessor.process(postbackMessagings);
    expect(result).toEqual([payloadStr]);
    expect((invokeProcessQuery as jest.Mock<{}>).mock.calls.length).toBe(1);
    const callArguments = (invokeProcessQuery as jest.Mock<{}>).mock.calls[0];
    expect(callArguments).toEqual([internalMessage]);
  });

  it('ignores postback message if no payload', async () => {
    const postbackMessagings = [{ ...baseMessaging, postback: { payload: undefined } }];
    const result = await PostbackProcessor.process(postbackMessagings);
    expect(result).toEqual([undefined]);
  });
});
