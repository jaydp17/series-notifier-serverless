/**
 * Test file for the entry function
 */

jest.mock('../common/lambda-utils');
jest.mock('../common/messenger.api');

// mocks
import { invokeProcessQuery } from '../common/lambda-utils';
import { messengerAuth } from '../common/messenger.api';

// types
import { LambdaEvent, LambdaHttpCallback } from '../common/aws-lambda-types';

// other imports
import deepFreeze from 'deep-freeze';
import { handler } from './index';

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
    (<jest.Mock<{}>>invokeProcessQuery).mockClear();
    (<jest.Mock<{}>>messengerAuth).mockClear();
  });

  it('should call messengerAuth on GET request with queryStringParameters', () => {
    const event: LambdaEvent = {
      httpMethod: 'GET',
      queryStringParameters: {},
      body: '',
    };

    handler(event, {}, jest.fn());
    expect(messengerAuth).toBeCalled();
  });

  it('should return ping on GET req w/o queryStringParameters', () => {
    // prepare
    const event: LambdaEvent = {
      httpMethod: 'GET',
      queryStringParameters: null,
      body: '',
    };

    // execute
    const callback = jest.fn();
    handler(event, {}, callback);

    // test
    expect(callback).toBeCalled();
    expect(callback.mock.calls[0]).toMatchSnapshot();
    expect((<jest.Mock<{}>>messengerAuth).mock.calls.length).toEqual(0);
    expect((<jest.Mock<{}>>invokeProcessQuery).mock.calls.length).toEqual(0);
  });

  it('rejects non page Type events from FB Messenger', () => {
    // prepare
    const event: LambdaEvent = {
      ...baseEvent,
      body: JSON.stringify({ ...baseEventBody, object: 'nonPage' }),
      queryStringParameters: null,
    };

    // execute
    const callback = jest.fn();
    handler(event, {}, callback);

    // test
    expect(callback).toBeCalled();
    expect(callback.mock.calls[0]).toMatchSnapshot();
    expect((<jest.Mock<{}>>messengerAuth).mock.calls.length).toEqual(0);
    expect((<jest.Mock<{}>>invokeProcessQuery).mock.calls.length).toEqual(0);
  });

  it('returns 403 on non GET/POST requests', () => {
    // prepare
    const event: LambdaEvent = {
      httpMethod: 'PUT',
      queryStringParameters: null,
      body: '',
    };

    // execute
    const callback = jest.fn();
    handler(event, {}, callback);

    // test
    expect(callback).toBeCalled();
    expect(callback.mock.calls[0]).toMatchSnapshot();
    expect((<jest.Mock<{}>>messengerAuth).mock.calls.length).toEqual(0);
    expect((<jest.Mock<{}>>invokeProcessQuery).mock.calls.length).toEqual(0);
  });
});
