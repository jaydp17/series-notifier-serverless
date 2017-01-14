import Promise from 'bluebird';
import request from 'request-promise';

import { GRAPH_API_URL } from '../constants';
import { verifyToken, pageToken } from '../utils/environment';
import * as MessageCtrl from '../controllers/message.controller';
import * as DeliveryCtrl from '../controllers/delivery.controller';
import * as PostBackCtrl from '../controllers/postback.controller';
import * as QuickReplyCtrl from '../controllers/quick-reply.controller';
import * as ReadCtrl from '../controllers/read.controller';

/**
 * Used to authenticate the webhook
 */
export function messengerAuth(query, callback) {
  // Facebook app verification
  if (query['hub.verify_token'] === verifyToken && query['hub.challenge']) {
    const response = { statusCode: 200, body: query['hub.challenge'] };
    return callback(null, response);
  }
  return callback('Invalid token');
}

/**
 * Processes incoming messenger message
 */
export const processIncomingBody = body => {
  const { entry } = body;
  return Promise.map(entry, eachEntry => _processEachEntry(eachEntry));
};

/**
 * Sends a message to Fb Messenger
 * @param senderId Id of the user to send this message to
 * @param Messenger message object
 * @returns Promise
 */
export const sendMessage = (senderId, msgObj) => {
  const options = {
    method: 'POST',
    url: `${GRAPH_API_URL}/me/messages`,
    qs: { access_token: pageToken },
    json: { recipient: { id: senderId }, message: msgObj },
  };
  return request(options).promise();
};

/// Private functions
function _processEachEntry(entry) {
  const { messaging } = entry;
  return Promise.map(messaging, messagingObj => {
    const { message, postback, sender, quick_reply: quickReply, delivery, read } = messagingObj;
    if (postback) {
      const payload = JSON.parse(postback.payload);
      return PostBackCtrl.handle({ payload, senderId: sender.id });
    } else if (message) {
      const text = message.text;
      if (!message.is_echo) {
        return MessageCtrl.handle({ text: (text || '').trim(), senderId: sender.id });
      }
    } else if (quickReply) {
      const payload = JSON.parse(quickReply.payload);
      return QuickReplyCtrl.handle({ payload, senderId: sender.id });
    } else if (delivery) {
      const mids = delivery.mids || [];
      const { watermark, seq } = delivery;
      return Promise.map(mids, mid => DeliveryCtrl.handle({ mid, watermark, seq }));
    } else if (read) {
      const { watermark, seq } = read;
      return ReadCtrl.handle({ watermark, seq });
    } else {
      Logger.info('ignoring', messagingObj);
    }
  });
}
