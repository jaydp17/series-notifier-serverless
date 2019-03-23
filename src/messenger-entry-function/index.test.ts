/**
 * Test file for the entry function
 */

jest.mock('../common/lambda-utils');
jest.mock('../common/messenger.api');

import deepFreeze from 'deep-freeze';
import { ILambdaEvent } from '../common/aws-lambda-types';
import { platformNames } from '../common/constants';
import * as InternalTypes from '../common/internal-message-types';
import { ActionTypes } from '../common/internal-message-types';
import { invokeProcessQuery } from '../common/lambda-utils';
import * as MessengerTypes from '../common/messenger-types';
import { messengerAuth } from '../common/messenger.api';
import * as indexFile from './index';
import { getFacebookMessage, getMessageTexts } from './index.data';

describe('Entry Function', () => {
  // tslint:disable-next-line:mocha-no-side-effect-code
  const baseEventBody = deepFreeze({
    object: 'page',
  });

  // tslint:disable-next-line:mocha-no-side-effect-code
  const baseEvent = deepFreeze({
    httpMethod: 'POST',
    body: JSON.stringify(baseEventBody),
  });

  beforeEach(() => {
    // clear mocks
    (invokeProcessQuery as jest.Mock<{}>).mockClear();
    (messengerAuth as jest.Mock<{}>).mockClear();
  });

  it('should call messengerAuth on GET request with queryStringParameters', () => {
    const event: ILambdaEvent = {
      httpMethod: 'GET',
      queryStringParameters: {},
      body: '',
    };

    indexFile.handler(event, {}, jest.fn());
    expect(messengerAuth).toBeCalled();
  });

  it('should return ping on GET req w/o queryStringParameters', () => {
    // prepare
    const event: ILambdaEvent = {
      httpMethod: 'GET',
      queryStringParameters: null,
      body: '',
    };

    // execute
    const callback = jest.fn();
    indexFile.handler(event, {}, callback);

    // test
    expect(callback).toBeCalled();
    expect(callback.mock.calls[0]).toMatchSnapshot();
    expect((messengerAuth as jest.Mock<{}>).mock.calls.length).toEqual(0);
    expect((invokeProcessQuery as jest.Mock<{}>).mock.calls.length).toEqual(0);
  });

  it('rejects non page Type events from FB Messenger', () => {
    // prepare
    const event: ILambdaEvent = {
      ...baseEvent,
      body: JSON.stringify({ ...baseEventBody, object: 'nonPage' }),
      queryStringParameters: null,
    };

    // execute
    const callback = jest.fn();
    indexFile.handler(event, {}, callback);

    // test
    expect(callback).toBeCalled();
    expect(callback.mock.calls[0]).toMatchSnapshot();
    expect((messengerAuth as jest.Mock<{}>).mock.calls.length).toEqual(0);
    expect((invokeProcessQuery as jest.Mock<{}>).mock.calls.length).toEqual(0);
  });

  it('returns 403 on non GET/POST requests', () => {
    // prepare
    const event: ILambdaEvent = {
      httpMethod: 'PUT',
      queryStringParameters: null,
      body: '',
    };

    // execute
    const callback = jest.fn();
    indexFile.handler(event, {}, callback);

    // test
    expect(callback).toBeCalled();
    expect(callback.mock.calls[0]).toMatchSnapshot();
    expect((messengerAuth as jest.Mock<{}>).mock.calls.length).toEqual(0);
    expect((invokeProcessQuery as jest.Mock<{}>).mock.calls.length).toEqual(0);
  });

  it('filters text messages', () => {
    const cases = [
      {
        input: {},
        result: false,
      },
      {
        input: { message: {} },
        result: true,
      },
      {
        input: { message: { is_echo: true } },
        result: false,
      },
      {
        input: { message: { is_echo: false } },
        result: true,
      },
    ];

    for (const { input, result: expectedResult } of cases) {
      const result = indexFile.filterTextMessages(input as MessengerTypes.AnyMessagingObject);
      expect(result).toEqual(expectedResult);
    }
  });

  it('tests processPostBody with 1 message', () => {
    const postBody = getFacebookMessage();
    const texts = getMessageTexts(postBody);
    indexFile.processPostBody(postBody);

    // test
    const invokeProcessQueryCalls = (invokeProcessQuery as jest.Mock<{}>).mock.calls;
    expect(invokeProcessQueryCalls.length).toEqual(texts.length);
    invokeProcessQueryCalls.forEach(([param], index) => validateParam(param, texts[index]));
  });

  it('tests processPostBody with 2 entries 1 messaging', () => {
    const postBody = getFacebookMessage({ entries: 2 });
    const texts = getMessageTexts(postBody);
    indexFile.processPostBody(postBody);

    // test
    const invokeProcessQueryCalls = (invokeProcessQuery as jest.Mock<{}>).mock.calls;
    expect(invokeProcessQueryCalls.length).toEqual(texts.length);
    invokeProcessQueryCalls.forEach(([param], index) => validateParam(param, texts[index]));
  });

  it('tests processPostBody with 2 entries 2 messaging', () => {
    const postBody = getFacebookMessage({ entries: 2, messagings: 2 });
    const texts = getMessageTexts(postBody);
    indexFile.processPostBody(postBody);

    // test
    const invokeProcessQueryCalls = (invokeProcessQuery as jest.Mock<{}>).mock.calls;
    expect(invokeProcessQueryCalls.length).toEqual(texts.length);
    invokeProcessQueryCalls.forEach(([param], index) => validateParam(param, texts[index]));
  });

  it('returns statusCode: 200 if eveything goes well', async () => {
    const postBody = getFacebookMessage();
    // const texts = getMessageTexts(postBody);
    // indexFile.processPostBody(postBody);
    const event: ILambdaEvent = {
      httpMethod: 'POST',
      body: JSON.stringify(postBody),
      queryStringParameters: null,
    };

    const callback = jest.fn();
    await indexFile.handler(event, {}, callback);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(null, { statusCode: 200 });
  });
});

function validateParam(param: InternalTypes.ISearchAction, text: string) {
  expect(param.type).toEqual(ActionTypes.Search);
  expect(param.text).toEqual(text);
  expect(param.platform).toEqual(platformNames.FBMessenger);
  expect(param.metaData).toHaveProperty('fbMessenger');
}
