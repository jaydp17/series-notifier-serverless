/**
 * SeriesCache Model
 */
import { DynamoDB } from 'aws-sdk';
import { addDays } from 'date-fns';
import dynamodb from '../common/dynamodb';
import * as InternalTypes from '../common/internal-message-types';
import tables from '../common/tables';

const TableName = tables.names.seriesCache; // tslint:disable-line:variable-name

export function updateCache(imdbId: string, cache: InternalTypes.ITvShowMetaData) {
  const after10Days = addDays(new Date(), 10).getTime();
  const params: DynamoDB.DocumentClient.PutItemInput = {
    TableName,
    Item: {
      ...cache,
      isSubscribed: undefined, // as subscription info shouldn't go in cache
      imdbId,
      // dividing by 1000 coz TTL in Dynamodb is seconds from epoc time
      ttl: Math.ceil(after10Days / 1000), // this item will expire in 10 days
    },
  };
  return dynamodb.put(params);
}

export async function getCache(imdbId: string): Promise<InternalTypes.ITvShowMetaData> {
  const params: DynamoDB.DocumentClient.GetItemInput = {
    TableName,
    Key: { imdbId },
  };
  const result = await dynamodb.get(params);
  return result.Item as InternalTypes.ITvShowMetaData;
}
