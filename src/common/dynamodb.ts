/**
 * Creates a dynamodb instance
 */

import { DynamoDB } from 'aws-sdk';
import { env } from './environment';

let dynamoDbOptions = {};
if (env === 'development') {
  dynamoDbOptions = { endpoint: 'http://localhost:8000' }; //tslint:disable-line
}
export const dynamodb = new DynamoDB(dynamoDbOptions);
export const dynamoDocClient = new DynamoDB.DocumentClient(dynamoDbOptions);
