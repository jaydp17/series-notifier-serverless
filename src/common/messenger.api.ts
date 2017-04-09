import axios from 'axios';

import { Callback } from './common-types';
import { GRAPH_API_URL } from './constants';
import { pageToken, verifyToken } from './environment';
import { AnySendMessage } from './messenger-types';

/**
 * Used to authenticate the webhook
 */
export function messengerAuth(query: {}, verifyToken: string, callback: Callback): void {
  // Facebook app verification
  if (query['hub.verify_token'] === verifyToken && query['hub.challenge']) {
    const response = { statusCode: 200, body: query['hub.challenge'] };
    return callback(null, response);
  }
  return callback(new Error('Invalid token'));
}

/**
 * Sends a message to Fb Messenger
 * @param senderId Id of the user to send this message to
 * @param Messenger message object
 */
export const sendMessage = (senderId: string, msgObj: AnySendMessage) => {
  const options = {
    method: 'POST',
    url: `${GRAPH_API_URL}/me/messages`,
    params: { access_token: pageToken },
    data: { recipient: { id: senderId }, message: msgObj },
  };
  return axios(options);
};
