/**
 * NextEpisodeCache Model
 */

import { DynamoDB } from 'aws-sdk';
import { addDays, isPast, min } from 'date-fns';
import dynamodb from '../common/dynamodb';
import { ITvEpisode } from '../common/internal-message-types';
import tables from '../common/tables';

const TableName = tables.names.nextEpisodeCache; // tslint:disable-line:variable-name

export function updateCache(imdbId: string, cache: ITvEpisode) {
  const tomorrow = addDays(new Date(), 1).getTime();
  const eligibleTTLDates = [tomorrow];
  if (cache.firstAired && !isPast(cache.firstAired)) {
    eligibleTTLDates.push(cache.firstAired);
  }
  // the earliest of tomorrow and the firstAired date of the episode is stored as TTL
  const earliestTTL = min(...eligibleTTLDates).getTime();
  const params: DynamoDB.DocumentClient.PutItemInput = {
    TableName,
    Item: {
      ...cache,
      imdbId,
      ttl: earliestTTL, // this item will expire in 24 hrs
    },
  };
  return dynamodb.put(params);
}

export async function getCache(imdbId: string): Promise<ITvEpisode> {
  const params: DynamoDB.DocumentClient.GetItemInput = {
    TableName,
    Key: { imdbId },
  };
  const result = await dynamodb.get(params);
  return <ITvEpisode>result.Item;
}
