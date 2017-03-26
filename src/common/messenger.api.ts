import { Callback } from './common-types';

/**
 * Used to authenticate the webhook
 */
export function messengerAuth(query, verifyToken: string, callback: Callback) {
  // Facebook app verification
  if (query['hub.verify_token'] === verifyToken && query['hub.challenge']) {
    const response = { statusCode: 200, body: query['hub.challenge'] };
    return callback(null, response);
  }
  return callback(new Error('Invalid token'));
}
