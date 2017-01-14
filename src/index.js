// required for souce map support in CloudWatch logs
import 'source-map-support/register';

// required for async/await with babel
import 'babel-polyfill';

import Promise from 'bluebird';

import './utils/environment';
import { messengerAuth, processIncomingBody } from './apis/messenger.api';

export const messenger = (event, context, callback) => {
  // TOKEN verification
  if (event.httpMethod === 'GET') {
    return messengerAuth(event.queryStringParameters, callback);
  }

  if (event.httpMethod === 'POST') {
    const body = JSON.parse(event.body);

    const { object: objectType } = body;
    if (objectType !== 'page') {
      return callback({ statusCode: 403, body: 'Invalid Object Type' });
    }

    // parses the incoming msg body and dispatches the events in the respective Observable streams in RxBot
    return processIncomingBody(body)
      .then(() => callback(null, { statusCode: 200 }))
      .catch(err => callback(err));
  }
};
