/**
 * Creates tables in Dynamodb
 */

// tslint:disable no-console

import * as Bluebird from 'bluebird';
import { prettyPrint } from '../common/common-utils';
import { dynamodb } from '../common/dynamodb';
import tables from '../common/tables';

const createTable = async tableSchema => {
  try {
    const result = await dynamodb.createTable(tableSchema).promise();
    prettyPrint(result);
  } catch (err) {
    if (err.code !== 'ResourceInUseException') {
      throw err;
    }
  }
};

/**
 * Makes a table remove rows after the TTL is expired
 */
function addTTL2Table(tableName: string, attributeName: string) {
  const params = {
    TableName: tableName,
    TimeToLiveSpecification: {
      AttributeName: attributeName,
      Enabled: true,
    },
  };
  return dynamodb.updateTimeToLive(params).promise();
}

async function main() {
  const specs = Object.values(tables.specs);
  await Bluebird.map(specs, createTable, { concurrency: 10 });
  await addTTL2Table(tables.names.nextEpisodeCache, 'ttl');
  console.log('done!');
}

main();
