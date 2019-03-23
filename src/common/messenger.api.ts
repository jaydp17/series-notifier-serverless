import axios from './axios';
import { GRAPH_API_URL } from './constants';
import { pageToken } from './environment';
import { AnySendMessage } from './messenger-types';

interface IVerifyQueryParams {
  'hub.verify_token': string;
  'hub.challenge': string;
}

/**
 * Used to authenticate the webhook
 */
export function messengerAuth(query: IVerifyQueryParams, verifyToken: string) {
  // Facebook app verification
  if (query['hub.verify_token'] === verifyToken && query['hub.challenge']) {
    const response = { statusCode: 200, body: query['hub.challenge'] };
    return response;
  } else {
    return { statusCode: 401, body: 'invalid token' };
  }
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
