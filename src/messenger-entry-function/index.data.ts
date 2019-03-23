/**
 * Provides dummy data for testing
 */

import * as faker from 'faker';
import * as MessengerTypes from '../common/messenger-types';

export function getFacebookMessage({
  entries = 1,
  messagings = 1,
}: { entries?: number; messagings?: number } = {}): MessengerTypes.IFBWebHookMessage {
  const entry: MessengerTypes.IFBWebHookMessageEntry[] = [];
  for (let i = 0; i < entries; i += 1) {
    entry.push(_getEntryObject({ messagings }));
  }
  return {
    object: 'page',
    entry,
  };
}

export function _getEntryObject({ messagings = 1 }: { messagings: number }) {
  const messaging: MessengerTypes.ITextMessageMessaging[] = [];
  for (let i = 0; i < messagings; i += 1) {
    messaging.push(_getMessagingObject());
  }
  return {
    id: faker.random.alphaNumeric(),
    time: Date.now(),
    messaging,
  };
}

export function _getMessagingObject(): MessengerTypes.ITextMessageMessaging {
  return {
    sender: { id: `${faker.random.number()}` },
    recipient: { id: `${faker.random.number()}` },
    timestamp: Date.now(),
    message: _getMessageObject(),
  };
}

export function _getMessageObject() {
  return {
    text: faker.random.words(),
    is_echo: false,
  };
}

export function getMessageTexts(postBody: MessengerTypes.IFBWebHookMessage): string[] {
  const texts: string[] = [];
  for (const entry of postBody.entry) {
    for (const messaging of entry.messaging) {
      texts.push(messaging.message.text);
    }
  }
  return texts;
}
