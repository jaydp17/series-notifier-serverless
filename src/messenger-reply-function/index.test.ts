/**
 * Tests the reply function entry file
 */

jest.mock('../common/messenger.api');
jest.mock('./messenger.formatter');

import { mocked } from 'ts-jest/utils';
import * as dummyCommonData from '../../test/test-data/common.data';
import * as InternalTypes from '../common/internal-message-types';
import * as MessengerTypes from '../common/messenger-types';
import * as MessengerAPI from '../common/messenger.api';
import * as MessengerReply from './index';
import { generateGenericTemplate } from './messenger.formatter';

describe('Messenger Reply Function', () => {
  const senderId = '2342388586';
  const metaData: InternalTypes.IMetaData = {
    fbMessenger: {
      sender: { id: senderId },
    } as MessengerTypes.AnyMessagingObject,
  };

  beforeEach(() => {
    // clear mocks
    mocked(MessengerAPI.sendMessage).mockClear();
    mocked(generateGenericTemplate).mockClear();
  });

  it('checks for metaData [no metaData]', async () => {
    const reply = {
      kind: InternalTypes.ReplyKind.Text,
      text: 'hello',
    } as InternalTypes.ITextReply;
    const callback = jest.fn();

    // test
    await MessengerReply.handler(reply, {}, callback);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(new Error('no metaData'));
  });

  it('checks for metaData [no fbMessenger metaData]', async () => {
    const reply = {
      kind: InternalTypes.ReplyKind.Text,
      metaData: { fbMessenger: {} },
      text: 'hello',
    } as InternalTypes.ITextReply;
    const callback = jest.fn();

    // test
    await MessengerReply.handler(reply, {}, callback);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(new Error('No fbMessenger metaData'));
  });

  it('checks for senderId', async () => {
    const reply = {
      kind: InternalTypes.ReplyKind.Text,
      metaData: {
        fbMessenger: {
          sender: {},
        },
      },
      text: 'hello',
    } as InternalTypes.ITextReply;
    const callback = jest.fn();

    // test
    await MessengerReply.handler(reply, {}, callback);
    expect(callback).toHaveBeenCalledTimes(1);
    const error = mocked(callback).mock.calls[0][0];
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toMatch(/No senderId in metaData:/);
  });

  it('sends subscription result', async () => {
    const title = 'The Flash';
    const reply = {
      kind: InternalTypes.ReplyKind.SubscribeResult,
      metaData,
      title,
    } as InternalTypes.ISubscribeReply;
    const callback = jest.fn();

    // test
    await MessengerReply.handler(reply, {}, callback);
    expect(MessengerAPI.sendMessage).toHaveBeenCalledTimes(1);
    expect(mocked(MessengerAPI.sendMessage).mock.calls[0]).toMatchSnapshot();
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(null, { status: true });
  });

  it('sends un-subscription result', async () => {
    const title = 'The Flash';
    const reply = {
      kind: InternalTypes.ReplyKind.UnSubscribeResult,
      metaData,
      title,
    } as InternalTypes.IUnSubscribeReply;
    const callback = jest.fn();

    // test
    await MessengerReply.handler(reply, {}, callback);
    expect(MessengerAPI.sendMessage).toHaveBeenCalledTimes(1);
    expect(mocked(MessengerAPI.sendMessage).mock.calls[0]).toMatchSnapshot();
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(null, { status: true });
  });

  it('sends search results', async () => {
    const shows = [dummyCommonData.getTVShow()];
    const message = { payload: 'some-random-payload' };
    const reply = {
      kind: InternalTypes.ReplyKind.SearchResults,
      metaData,
      shows,
    } as InternalTypes.ISearchResultsReply;
    const callback = jest.fn();
    mocked(generateGenericTemplate).mockReturnValueOnce(message);

    // test
    await MessengerReply.handler(reply, {}, callback);
    expect(generateGenericTemplate).toHaveBeenCalledTimes(1);
    expect(generateGenericTemplate).toHaveBeenCalledWith(shows);
    expect(MessengerAPI.sendMessage).toHaveBeenCalledTimes(1);
    expect(MessengerAPI.sendMessage).toHaveBeenCalledWith(senderId, message);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(null, { status: true });
  });

  it('sends trending shows', async () => {
    const shows = [dummyCommonData.getTVShow()];
    const message = { payload: 'some-random-payload' };
    const reply = {
      kind: InternalTypes.ReplyKind.TrendingShows,
      metaData,
      shows,
    } as InternalTypes.ITrendingShowsReply;
    const callback = jest.fn();
    mocked(generateGenericTemplate).mockReturnValueOnce(message);

    // test
    await MessengerReply.handler(reply, {}, callback);
    expect(generateGenericTemplate).toHaveBeenCalledTimes(1);
    expect(generateGenericTemplate).toHaveBeenCalledWith(shows);
    expect(MessengerAPI.sendMessage).toHaveBeenCalledTimes(1);
    expect(MessengerAPI.sendMessage).toHaveBeenCalledWith(senderId, message);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(null, { status: true });
  });

  it('sends myShows results', async () => {
    const shows = [dummyCommonData.getTVShow()];
    for (let i = 0; i < 10; i += 1) {
      shows.push(dummyCommonData.getTVShow());
    }
    const message = { payload: 'some-random-payload' };
    const reply = {
      kind: InternalTypes.ReplyKind.MyShows,
      metaData,
      shows,
    } as InternalTypes.IMyShowsReply;
    const callback = jest.fn();
    mocked(generateGenericTemplate).mockReturnValueOnce(message);

    // test
    await MessengerReply.handler(reply, {}, callback);
    expect(generateGenericTemplate).toHaveBeenCalledTimes(Math.ceil(shows.length / 10));
    expect(MessengerAPI.sendMessage).toHaveBeenCalledTimes(Math.ceil(shows.length / 10));
    expect(MessengerAPI.sendMessage).toHaveBeenCalledWith(senderId, message);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(null, { status: true });
  });

  it('catches MessengerAPI.sendMessage error', async () => {
    const title = 'The Flash';
    const reply = {
      kind: InternalTypes.ReplyKind.SubscribeResult,
      metaData,
      title,
    } as InternalTypes.ISubscribeReply;
    const callback = jest.fn();
    const error = new Error('random error');
    mocked(MessengerAPI.sendMessage).mockImplementationOnce(() => {
      throw error;
    });

    // test
    await MessengerReply.handler(reply, {}, callback);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(error);
  });
});
