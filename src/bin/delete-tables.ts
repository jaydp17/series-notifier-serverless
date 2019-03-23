/**
 * Detetes tables in Dynamodb
 */

import { dynamodb } from '../common/dynamodb';
import { env } from '../common/environment';
import tables from '../common/tables';

if (env === 'production') {
  // tslint:disable-next-line: no-console
  console.error("can't drop tables in production");
  process.exit(0);
}

const getParams = (tableName: string) => ({
  TableName: tableName,
});

const promises = Object.values(tables.names)
  .map(getParams)
  .map(param => dynamodb.deleteTable(param).promise());

Promise.all(promises).then(() => console.log('done!')); // tslint:disable-line:no-console
