/**
 * Stores the table names & specs
 */

import { DynamoDB } from 'aws-sdk';

export const names = {
  users: 'Users',
  subscriptions: 'Subscriptions',
};

const usersTable = {
  TableName: 'Users',
  KeySchema: [
    { AttributeName: 'socialId', KeyType: 'HASH' },  //Partition key
  ],
  AttributeDefinitions: [
    { AttributeName: 'socialId', AttributeType: 'S' },
  ],
  ProvisionedThroughput: {
    ReadCapacityUnits: 1,
    WriteCapacityUnits: 1,
  },
};

export const indexes = {
  subscriptions: {
    socialId: 'socialId-index',
  },
};

const subscriptionsTable: DynamoDB.CreateTableInput = {
  TableName: 'Subscriptions',
  KeySchema: [
    { AttributeName: 'imdbId', KeyType: 'HASH' },  //Partition key
    { AttributeName: 'socialId', KeyType: 'RANGE' },  //Sort key
  ],
  AttributeDefinitions: [
    { AttributeName: 'imdbId', AttributeType: 'S' },
    { AttributeName: 'socialId', AttributeType: 'S' },
  ],
  GlobalSecondaryIndexes: [{
    IndexName: indexes.subscriptions.socialId,
    KeySchema: [
      { AttributeName: 'socialId', KeyType: 'HASH' },  //Partition key
      { AttributeName: 'imdbId', KeyType: 'RANGE' },  //Sort key
    ],
    Projection: {
      ProjectionType: 'KEYS_ONLY',
    },
    ProvisionedThroughput: {
      ReadCapacityUnits: 1,
      WriteCapacityUnits: 1,
    },
  }],
  ProvisionedThroughput: {
    ReadCapacityUnits: 1,
    WriteCapacityUnits: 1,
  },
};

export const specs = {
  users: usersTable,
  subscriptions: subscriptionsTable,
};

export default { names, specs, indexes };
