import './utils/environment';
import messengerAuth from './messenger-auth';

export const messenger = (event, context, callback) => {
  // TOKEN verification
  if (event.httpMethod === 'GET') {
    return messengerAuth(event.queryStringParameters, callback);
  }

  if (event.httpMethod === 'POST') {
    callback(null, { statusCode: 200 });
  }
};
