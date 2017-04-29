/**
 * Stores the table names & specs
 */

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

const subscriptionsTable = {
  TableName: 'Subscriptions',
  KeySchema: [
    { AttributeName: 'imdbId', KeyType: 'HASH' },  //Partition key
    { AttributeName: 'socialId', KeyType: 'RANGE' },  //Sort key
  ],
  AttributeDefinitions: [
    { AttributeName: 'imdbId', AttributeType: 'S' },
    { AttributeName: 'socialId', AttributeType: 'S' },
  ],
  ProvisionedThroughput: {
    ReadCapacityUnits: 1,
    WriteCapacityUnits: 1,
  },
};

export const specs = {
  users: usersTable,
  subscriptions: subscriptionsTable,
};

export default { names, specs };
