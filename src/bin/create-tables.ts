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

async function main() {
  const specs = Object.values(tables.specs);
  await Bluebird.map(specs, createTable, { concurrency: 10 });
  console.log('done!');
}

main();
