/**
 * Subscription model
 */

import { DynamoDB } from 'aws-sdk';
import dynamodb from '../common/dynamodb';
import tables from '../common/tables';
import { isValidSocialId } from './user';

import { prettyPrint } from '../common/common-utils';

const TableName = tables.names.subscriptions; // tslint:disable-line:variable-name

export type SubscriptionRecord = {
  imdbId: string;
  socialId: string;
};

/**
 * Adds a mapping of imdbId and socialId of a user,
 * to mark the subscription of a given TvShow to a user
 */
export function createSubscription(imdbId: string, socialId: string) {
  if (!isValidSocialId(socialId)) {
    throw new Error(`Invalid socialId: ${socialId}`);
  }
  const params: DynamoDB.DocumentClient.PutItemInput = {
    TableName,
    Item: {
      imdbId,
      socialId,
    },
  };
  return dynamodb.put(params);
}

/**
 * Get all the shows subscribed by a user
 */
export async function getSubscribedShows(socialId: string): Promise<SubscriptionRecord[]> {
  if (!isValidSocialId(socialId)) {
    throw new Error(`Invalid socialId: ${socialId}`);
  }
  const params: DynamoDB.DocumentClient.QueryInput = {
    TableName,
    IndexName: tables.indexes.subscriptions.socialId,
    KeyConditionExpression: 'socialId = :socialId',
    ExpressionAttributeValues: { ':socialId': socialId },
  };
  const result = await dynamodb.query(params);
  return <SubscriptionRecord[]>result.Items;
}

/**
 * Get all the users who have subscribed to a given show
 */
export async function getUsersWhoSubscribed(imdbId: string): Promise<SubscriptionRecord[]> {
  const params: DynamoDB.DocumentClient.QueryInput = {
    TableName,
    KeyConditionExpression: 'imdbId = :imdbId',
    ExpressionAttributeValues: { ':imdbId': imdbId },
  };
  const result = await dynamodb.query(params);
  return <SubscriptionRecord[]>result.Items;
}

/**
 * Removes the subscription of a user from a tvShow
 */
export function deleteSubscription(imdbId: string, socialId: string) {
  const params: DynamoDB.DocumentClient.DeleteItemInput = {
    TableName,
    Key: { imdbId, socialId },
  };
  return dynamodb.delete(params);
}
