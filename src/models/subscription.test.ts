/**
 * Tests for Subscription Model
 */

jest.mock('../common/dynamodb.ts');

import { mocked } from 'ts-jest/utils';
import { platformNames } from '../common/constants';
import dynamodb from '../common/dynamodb';
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
      expect(mocked(dynamodb.put).mock.calls[0]).toMatchSnapshot();
    });
  });

  describe('get all Subscribed shows', () => {
    it('throws error on invalid socialId', async () => {
      const socialId = 'asdf';
      expect.assertions(1);
      try {
        await SubscriptionModel.getSubscribedShows(socialId);
      } catch (err) {
        expect(err.message).toEqual(`Invalid socialId: ${socialId}`);
      }
    });

    it('gets subscribed shows', async () => {
      // prepare
      const socialId = `${platformNames.FBMessenger}::123`;
      const expectedItems = [{ hello: 'world' }];
      mocked(dynamodb.query).mockReturnValueOnce({ Items: expectedItems });

      // execute
      const items = await SubscriptionModel.getSubscribedShows(socialId);

      // test
      expect(items).toEqual(expectedItems);
      expect(dynamodb.query).toHaveBeenCalledTimes(1);
      expect(mocked(dynamodb.query).mock.calls[0]).toMatchSnapshot();
    });
  });

  it('gets users who subscribed', async () => {
    // prepare
    const imdbId = 't123123';
    const expectedItems = [{ hello: 'world' }];
    mocked(dynamodb.query).mockReturnValueOnce({ Items: expectedItems });

    // execute
    const items = await SubscriptionModel.getUsersWhoSubscribed(imdbId);

    // test
    expect(items).toEqual(expectedItems);
    expect(dynamodb.query).toHaveBeenCalledTimes(1);
    expect(mocked(dynamodb.query).mock.calls[0]).toMatchSnapshot();
  });

  it('deletes a subscription', async () => {
    // prepare
    const imdbId = 't123123';
    const socialId = `${platformNames.FBMessenger}::123`;

    // execute
    const items = await SubscriptionModel.deleteSubscription(imdbId, socialId);

    // test
    expect(dynamodb.delete).toHaveBeenCalledTimes(1);
    expect(mocked(dynamodb.delete).mock.calls[0]).toMatchSnapshot();
  });

  it('get all uniq subscribed shows', async () => {
    // prepare
    const expectedImdbIds = ['tt2234222', 'tt4159076', 'tt0898266'];
    mocked(dynamodb.scan).mockReturnValueOnce({
      // this output contains duplicate imdb ids
      Items: [...expectedImdbIds, expectedImdbIds[0], expectedImdbIds[1]].map(imdbId => ({ imdbId })),
    });

    // execute
    const imdbIdsResult = await SubscriptionModel.getAllUniqShows();

    // test
    expect(imdbIdsResult).toEqual(expectedImdbIds);
    expect(dynamodb.scan).toHaveBeenCalledTimes(1);
    expect(mocked(dynamodb.scan).mock.calls[0]).toMatchSnapshot();
  });
});
