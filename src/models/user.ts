/**
 * User Model
 */

import { DynamoDB } from 'aws-sdk';
import { prettyPrint } from '../common/common-utils';
import dynamodb from '../common/dynamodb';
import { isPlatform } from '../common/internal-message-types';
import tables from '../common/tables';

const TableName = tables.names.users; // tslint:disable-line:variable-name

/**
 * Validates whether a given social Id is valid or not
 */
export function isValidSocialId(socialId?: string | null): boolean {
  if (!socialId) {
    return false;
  }
  const [platform, externalId] = socialId.split('::');
  return isPlatform(platform) && !!externalId;
}

export function createUser(socialId: string) {
  if (!isValidSocialId(socialId)) {
    throw new Error(`Invalid socialId: ${socialId}`);
  }
  const params: DynamoDB.DocumentClient.PutItemInput = {
    TableName,
    Item: { socialId },
  };
  return dynamodb.put(params);
}

export function getUser(socialId: string) {
  const params: DynamoDB.DocumentClient.GetItemInput = {
    TableName,
    Key: { socialId },
  };
  return dynamodb.get(params);
}
