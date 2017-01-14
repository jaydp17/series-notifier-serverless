import { verifyToken } from './utils/environment';

/**
 * Used to authenticate the webhook
 */
export default function facebookAuth(query, callback) {
  // Facebook app verification
  if (query['hub.verify_token'] === verifyToken && query['hub.challenge']) {
    const response = { statusCode: 200, body: query['hub.challenge'] };
    return callback(null, response);
  }
  return callback('Invalid token');
}
