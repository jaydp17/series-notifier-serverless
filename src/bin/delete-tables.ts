/**
 * Detetes tables in Dynamodb
 */

import { prettyPrint } from '../common/common-utils';
import { dynamodb } from '../common/dynamodb';
import { env } from '../common/environment';
import tables from '../common/tables';

if (env === 'production') {
  console.error('can\'t drop tables in production');
  process.exit(0);
}

const getParams = tableName => ({
  TableName: tableName,
});

const promises = Object.values(tables.names)
  .map(getParams)
  .map(param => dynamodb.deleteTable(param).promise());

Promise.all(promises)
  .then(() => console.log('done!')); // tslint:disable-line:no-console
