/**
 * Subscription model
 */

import { DynamoDB } from 'aws-sdk';
import { uniq } from 'lodash';
import dynamodb from '../common/dynamodb';
import tables from '../common/tables';
import { isValidSocialId } from './user';

import { prettyPrint } from '../common/common-utils';

const TableName = tables.names.subscriptions; // tslint:disable-line:variable-name

export interface ISubscriptionRecord {
  imdbId: string;
  socialId: string;
}

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
export async function getSubscribedShows(socialId: string): Promise<ISubscriptionRecord[]> {
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
  return result.Items as ISubscriptionRecord[];
}

/**
 * Get all the users who have subscribed to a given show
 */
export async function getUsersWhoSubscribed(imdbId: string): Promise<ISubscriptionRecord[]> {
  const params: DynamoDB.DocumentClient.QueryInput = {
    TableName,
    KeyConditionExpression: 'imdbId = :imdbId',
    ExpressionAttributeValues: { ':imdbId': imdbId },
  };
  const result = await dynamodb.query(params);
  return result.Items as ISubscriptionRecord[];
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

/**
 * Gets all the unique subscribed shows
 * by all users
 */
export async function getAllUniqShows(): Promise<string[]> {
  const imdbIds: string[] = [];
  const params: DynamoDB.DocumentClient.ScanInput = {
    TableName,
    ProjectionExpression: 'imdbId',
  };

  let result: DynamoDB.DocumentClient.ScanOutput | null = null;
  do {
    if (result && result.LastEvaluatedKey) {
      params.ExclusiveStartKey = result.LastEvaluatedKey;
    }
    result = await dynamodb.scan(params);
    const imdbIdBatch = (result.Items as Array<{ imdbId: string }>).map(item => item.imdbId);
    imdbIds.push(...imdbIdBatch);
  } while (result.LastEvaluatedKey !== undefined);

  return uniq(imdbIds);
}

// getUsersWhoSubscribed('tt5673782')
//   .then(console.log)
//   .catch(console.error);
