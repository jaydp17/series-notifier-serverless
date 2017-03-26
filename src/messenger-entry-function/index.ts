import { verifyToken } from './utils/environment';
import { LambdaEvent } from '../common/aws-lambda-types';

export const handler = (event: LambdaEvent, context, callback) => {

  if (event.httpMethod === 'GET') {
    const response = { statusCode: 200, body: 'hello everybody' };
    return callback(null, response);
  }
  return callback({ statusCode: 403, body: 'Invalid Object Type' });
}
