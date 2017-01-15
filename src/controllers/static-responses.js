import { sendMessage } from '../apis/messenger.api';

export const didNotUnderstand = senderId => {
  return sendMessage(senderId, { text: "What? I didn't get it" });
};

export function noRunningSeriesFound(senderId) {
  return sendMessage(senderId, { text: "hmmm.. Looks like there's no running series with that name" });
}
