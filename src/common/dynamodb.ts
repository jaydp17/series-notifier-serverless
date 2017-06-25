/**
 * Creates a dynamodb instance
 */

import { DynamoDB } from 'aws-sdk';
import { env } from './environment';

let dynamoDbOptions = {};
if (env === 'development' && process.env.IS_LOCAL) {
  dynamoDbOptions = { endpoint: 'http://localhost:8000' }; //tslint:disable-line
}
export const dynamodb = new DynamoDB(dynamoDbOptions);
export const dynamoDocClient = new DynamoDB.DocumentClient(dynamoDbOptions);

export default {
  get: params => dynamoDocClient.get(params).promise(),
  put: params => dynamoDocClient.put(params).promise(),
  query: params => dynamoDocClient.query(params).promise(),
  delete: params => dynamoDocClient.delete(params).promise(),
};
