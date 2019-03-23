/**
 * Creates a dynamodb instance
 */

import { DynamoDB } from 'aws-sdk';
import { DocumentClient } from 'aws-sdk/lib/dynamodb/document_client';
import { env } from './environment';

let dynamoDbOptions: DynamoDB.ClientConfiguration = { region: 'us-east-1' };
if (env === 'development' && process.env.IS_LOCAL) {
  dynamoDbOptions = { ...dynamoDbOptions, endpoint: 'http://localhost:8000' }; //tslint:disable-line
}
export const dynamodb = new DynamoDB(dynamoDbOptions);
export const dynamoDocClient = new DynamoDB.DocumentClient(dynamoDbOptions);

export default {
  get: (params: DocumentClient.GetItemInput) => dynamoDocClient.get(params).promise(),
  put: (params: DocumentClient.PutItemInput) => dynamoDocClient.put(params).promise(),
  query: (params: DocumentClient.QueryInput) => dynamoDocClient.query(params).promise(),
  delete: (params: DocumentClient.DeleteItemInput) => dynamoDocClient.delete(params).promise(),
  scan: (params: DocumentClient.ScanInput) => dynamoDocClient.scan(params).promise(),
};
