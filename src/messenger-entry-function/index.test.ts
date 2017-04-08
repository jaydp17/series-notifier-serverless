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
import { handler } from './index';

describe('Entry Function', () => {
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
    const event: LambdaEvent = {
      httpMethod: 'GET',
      queryStringParameters: null,
      body: '',
    };

    const callback = jest.fn();
    handler(event, {}, callback);

    expect(callback).toBeCalled();
    expect(callback.mock.calls[0]).toMatchSnapshot();
    expect((<jest.Mock<{}>>messengerAuth).mock.calls.length).toEqual(0);
  });
});
