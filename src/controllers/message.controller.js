import { Wit } from 'node-wit';
import util from 'util';

import { witAIToken } from '../utils/environment';
import { sendMessage } from '../apis/messenger.api';
const witClient = new Wit({ accessToken: witAIToken });

export const handle = async ({ text, senderId }) => {
  const witResult = await witClient.message(text, {});
  console.log('witResult', util.inspect(witResult, false, null));
  sendMessage(senderId, { text });
};
