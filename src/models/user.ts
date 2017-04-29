/**
 * User Model
 */

import { DynamoDB } from 'aws-sdk';
import { prettyPrint } from '../common/common-utils';
import { dynamoDocClient } from '../common/dynamodb';
import { isPlatform } from '../common/internal-message-types';
import tables from '../common/tables';

const TableName = tables.names.users; // tslint:disable-line:variable-name

/**
 * Validates whether a given social Id is valid or not
 */
export function validateSocialId(socialId: string) {
  const [platform, externalId] = socialId.split('::');
  return isPlatform(platform) && externalId;
}

export function createUser(socialId: string) {
  if (!validateSocialId(socialId)) {
    throw new Error(`Invalid socialId: ${socialId}`);
  }
  const params: DynamoDB.DocumentClient.PutItemInput = {
    TableName,
    Item: { socialId },
  };
  return dynamoDocClient.put(params).promise();
}

export function getUser(socialId: string) {
  const params: DynamoDB.DocumentClient.GetItemInput = {
    TableName,
    Key: { socialId },
  };
  return dynamoDocClient.get(params).promise();
}
