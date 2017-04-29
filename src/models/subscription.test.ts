/**
 * Tests for Subscription Model
 */

jest.mock('../common/dynamodb.ts');

// mocks
import dynamodb from '../common/dynamodb';

// imports
import { platformNames } from '../common/constants';
import tables from '../common/tables';
import * as SubscriptionModel from './subscription';

describe('Subscription Model', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('create subscription', () => {
    it('throws error on invalid socialId', () => {
      const socialId = 'asdf';
      const imdbId = 't23454';
      expect(() => {
        SubscriptionModel.createSubscription(imdbId, socialId);
      }).toThrowError(/Invalid socialId/);
    });

    it('creates a new subscription', async () => {
      // prepare
      const imdbId = 't23456';
      const socialId = `${platformNames.FBMessenger}::123`;

      // execute
      await SubscriptionModel.createSubscription(imdbId, socialId);

      // test
      expect(dynamodb.put).toHaveBeenCalledTimes(1);
      expect((<jest.Mock<{}>>dynamodb.put).mock.calls[0]).toMatchSnapshot();
    });
  });

  describe('get all Subscribed shows', () => {
    it('throws error on invalid socialId', async () => {
      // TODO: refactor this when jest 20.0.0+ comes out
      // use expect().rejects
      const socialId = 'asdf';
      try {
        await SubscriptionModel.getSubscribedShows(socialId);
        return Promise.reject(new Error('should have failed'));
      } catch (err) {
        expect(err.message).toContain('Invalid socialId');
      }
    });

    it('gets subscribed shows', async () => {
      // prepare
      const socialId = `${platformNames.FBMessenger}::123`;
      const expectedItems = [{ hello: 'world' }];
      (<jest.Mock<{}>>dynamodb.query).mockReturnValueOnce({ Items: expectedItems });

      // execute
      const items = await SubscriptionModel.getSubscribedShows(socialId);

      // test
      expect(items).toEqual(expectedItems);
      expect(dynamodb.query).toHaveBeenCalledTimes(1);
      expect((<jest.Mock<{}>>dynamodb.query).mock.calls[0]).toMatchSnapshot();
    });
  });

  it('gets users who subscribed', async () => {
    // prepare
    const imdbId = 't123123';
    const expectedItems = [{ hello: 'world' }];
    (<jest.Mock<{}>>dynamodb.query).mockReturnValueOnce({ Items: expectedItems });

    // execute
    const items = await SubscriptionModel.getUsersWhoSubscribed(imdbId);

    // test
    expect(items).toEqual(expectedItems);
    expect(dynamodb.query).toHaveBeenCalledTimes(1);
    expect((<jest.Mock<{}>>dynamodb.query).mock.calls[0]).toMatchSnapshot();
  });

  it('deletes a subscription', async () => {
    // prepare
    const imdbId = 't123123';
    const socialId = `${platformNames.FBMessenger}::123`;

    // execute
    const items = await SubscriptionModel.deleteSubscription(imdbId, socialId);

    // test
    expect(dynamodb.delete).toHaveBeenCalledTimes(1);
    expect((<jest.Mock<{}>>dynamodb.delete).mock.calls[0]).toMatchSnapshot();
  });
});
