import { sendMessage } from '../apis/messenger.api';

export const didNotUnderstand = senderId => {
  return sendMessage(senderId, { text: 'What? I didn\'t get it' });
};
