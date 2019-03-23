/**
 * Tests the reply function entry file
 */

jest.mock('../common/messenger.api');
jest.mock('./messenger.formatter');

import * as dummyCommonData from '../../test/test-data/common.data';
// types
import * as InternalTypes from '../common/internal-message-types';
import * as MessengerTypes from '../common/messenger-types';
import * as MessengerAPI from '../common/messenger.api';
import * as MessengerReply from './index';
import { generateGenericTemplate } from './messenger.formatter';

describe('Messenger Reply Function', () => {
  const senderId = '2342388586';
  const metaData: InternalTypes.IMetaData = {
    fbMessenger: <MessengerTypes.AnyMessagingObject>{
      sender: { id: senderId },
    },
  };

  beforeEach(() => {
    // clear mocks
    (<jest.Mock<{}>>MessengerAPI.sendMessage).mockClear();
    (<jest.Mock<{}>>generateGenericTemplate).mockClear();
  });

  it('checks for metaData [no metaData]', async () => {
    const reply = <InternalTypes.ITextReply>{
      kind: InternalTypes.ReplyKind.Text,
      text: 'hello',
    };
    const callback = jest.fn();

    // test
    await MessengerReply.handler(reply, {}, callback);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(new Error('no metaData'));
  });

  it('checks for metaData [no fbMessenger metaData]', async () => {
    const reply = <InternalTypes.ITextReply>{
      kind: InternalTypes.ReplyKind.Text,
      metaData: { fbMessenger: {} },
      text: 'hello',
    };
    const callback = jest.fn();

    // test
    await MessengerReply.handler(reply, {}, callback);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(new Error('No fbMessenger metaData'));
  });

  it('checks for senderId', async () => {
    const reply = <InternalTypes.ITextReply>{
      kind: InternalTypes.ReplyKind.Text,
      metaData: {
        fbMessenger: {
          sender: {},
        },
      },
      text: 'hello',
    };
    const callback = jest.fn();

    // test
    await MessengerReply.handler(reply, {}, callback);
    expect(callback).toHaveBeenCalledTimes(1);
    const error = (<jest.Mock<{}>>callback).mock.calls[0][0];
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toMatch(/No senderId in metaData:/);
  });

  it('sends subscription result', async () => {
    const title = 'The Flash';
    const reply = <InternalTypes.ISubscribeReply>{
      kind: InternalTypes.ReplyKind.SubscribeResult,
      metaData,
      title,
    };
    const callback = jest.fn();

    // test
    await MessengerReply.handler(reply, {}, callback);
    expect(MessengerAPI.sendMessage).toHaveBeenCalledTimes(1);
    expect((<jest.Mock<{}>>MessengerAPI.sendMessage).mock.calls[0]).toMatchSnapshot();
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(null, { status: true });
  });

  it('sends un-subscription result', async () => {
    const title = 'The Flash';
    const reply = <InternalTypes.IUnSubscribeReply>{
      kind: InternalTypes.ReplyKind.UnSubscribeResult,
      metaData,
      title,
    };
    const callback = jest.fn();

    // test
    await MessengerReply.handler(reply, {}, callback);
    expect(MessengerAPI.sendMessage).toHaveBeenCalledTimes(1);
    expect((<jest.Mock<{}>>MessengerAPI.sendMessage).mock.calls[0]).toMatchSnapshot();
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(null, { status: true });
  });

  it('sends search results', async () => {
    const shows = [dummyCommonData.getTVShow()];
    const message = { payload: 'some-random-payload' };
    const reply = <InternalTypes.ISearchResultsReply>{
      kind: InternalTypes.ReplyKind.SearchResults,
      metaData,
      shows,
    };
    const callback = jest.fn();
    (<jest.Mock<{}>>generateGenericTemplate).mockReturnValueOnce(message);

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
    const reply = <InternalTypes.ITrendingShowsReply>{
      kind: InternalTypes.ReplyKind.TrendingShows,
      metaData,
      shows,
    };
    const callback = jest.fn();
    (<jest.Mock<{}>>generateGenericTemplate).mockReturnValueOnce(message);

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
    const reply = <InternalTypes.IMyShowsReply>{
      kind: InternalTypes.ReplyKind.MyShows,
      metaData,
      shows,
    };
    const callback = jest.fn();
    (<jest.Mock<{}>>generateGenericTemplate).mockReturnValueOnce(message);

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
    const reply = <InternalTypes.ISubscribeReply>{
      kind: InternalTypes.ReplyKind.SubscribeResult,
      metaData,
      title,
    };
    const callback = jest.fn();
    const error = new Error('random error');
    (<jest.Mock<{}>>MessengerAPI.sendMessage).mockImplementationOnce(() => {
      throw error;
    });

    // test
    await MessengerReply.handler(reply, {}, callback);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(error);
  });
});
