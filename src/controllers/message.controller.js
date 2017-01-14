import { sendMessage } from '../apis/messenger.api';

export const handle = ({ text, senderId }) => {
  return sendMessage(senderId, { text });
};
