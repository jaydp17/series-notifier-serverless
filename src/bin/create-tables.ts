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
async function addTTL2Table(tableName: string, attributeName: string) {
  const params = {
    TableName: tableName,
    TimeToLiveSpecification: {
      AttributeName: attributeName,
      Enabled: true,
    },
  };
  try {
    await dynamodb.updateTimeToLive(params).promise();
  } catch (err) {
    if (err.message !== 'TimeToLive is already enabled') throw err;
  }
}

async function main() {
  const specs = Object.values(tables.specs);
  await Bluebird.map(specs, createTable, { concurrency: 10 });
  await addTTL2Table(tables.names.nextEpisodeCache, 'ttl');
  await addTTL2Table(tables.names.seriesCache, 'ttl');
  console.log('done!');
}

main();
