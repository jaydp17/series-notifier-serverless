import { Wit } from 'node-wit';
import util from 'util';

import { witAIToken } from '../utils/environment';
import { sendMessage } from '../apis/messenger.api';
import * as StaticResponses from './static-responses';
import { Intents } from '../constants';

const witClient = new Wit({ accessToken: witAIToken });

export const handle = async ({ text, senderId }) => {
  const witResult = await witClient.message(text, {});
  const { entities } = witResult;
  const intent = getFirstValue(entities.intent);

  if (!intent) {
    return StaticResponses.didNotUnderstand(senderId);
  }

  switch (intent) {
    case Intents.Trending:
      return sendMessage(senderId, { text: 'Trending feature coming soon!' });
    case Intents.NextEpisode:
      return sendMessage(senderId, { text: 'Next Air date feature coming soon!' });
    case Intents.Search:
      return sendMessage(senderId, { text: 'Search is coming soon!' });
    default:
      return StaticResponses.didNotUnderstand(senderId);
  }
};

/**
 * Wit.AI sends everything in array form, this gets the first element from it
 */
function getFirstValue(arr) {
  if (arr && arr.length > 0 && arr[0].value) {
    return arr[0].value;
  }
}
