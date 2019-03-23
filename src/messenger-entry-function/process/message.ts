/**
 * Knows how to process messages
 */

import { platformNames } from '../../common/constants';
import * as InternalTypes from '../../common/internal-message-types';
import { invokeProcessQuery } from '../../common/lambda-utils';
import * as MessengerTypes from '../../common/messenger-types';

export async function process(
  textMessagings: MessengerTypes.ITextMessageMessaging[],
): Promise<any> {
  const promises = textMessagings.map((messaging: MessengerTypes.ITextMessageMessaging) => {
    const message: InternalTypes.ISearchAction = {
      type: InternalTypes.ActionTypes.Search,
      text: messaging.message.text,
      platform: platformNames.FBMessenger,
      metaData: { fbMessenger: messaging },
    };
    return invokeProcessQuery(message);
  });
  return Promise.all(promises);
}
