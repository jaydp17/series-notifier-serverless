/**
 * Creates tables in Dynamodb
 */

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

createTable(tables.specs.users)
  .then(() => createTable(tables.specs.subscriptions))
  .then(() => console.log('done!')); // tslint:disable-line:no-console
