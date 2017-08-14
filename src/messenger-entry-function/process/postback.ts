/**
 * Knows how to process PostBack Messages
 */

import { platformNames } from '../../common/constants';
import * as InternalTypes from '../../common/internal-message-types';
import { invokeProcessQuery } from '../../common/lambda-utils';
import * as MessengerActionTypes from '../../common/messenger-actions-types';
import * as MessengerTypes from '../../common/messenger-types';

export async function process(postBackMessagings: MessengerTypes.IPostBackMessaging[]): Promise<(undefined | {})[]> {
  const promises = postBackMessagings.map(messaging => {
    const { payload } = messaging.postback;
    if (!payload) {
      return Promise.resolve(undefined);
    }
    const internalMessage = _getInternalAction(payload);
    internalMessage.metaData.fbMessenger = messaging;
    return invokeProcessQuery(internalMessage);
  });
  return Promise.all(promises);
}

/**
 * NOTE: keep metaData.fbMessenger empty for now, it will be attached by the process method
 */
export function _getInternalAction(postbackPayload: string): InternalTypes.AnyAction {
  const payloadJSON: MessengerTypes.TvShowPayLoad = JSON.parse(postbackPayload);
  switch (payloadJSON.action) {
    case MessengerActionTypes.showTrending.type: {
      return {
        type: InternalTypes.ActionTypes.ShowTrending,
        platform: platformNames.FBMessenger,
        metaData: { fbMessenger: undefined },
      };
    }
    case MessengerActionTypes.subscribe.type: {
      return {
        type: InternalTypes.ActionTypes.Subscribe,
        platform: platformNames.FBMessenger,
        metaData: { fbMessenger: undefined },
        imdbId: payloadJSON.imdbId,
        tvdbId: payloadJSON.tvdbId,
        title: payloadJSON.title,
      };
    }
    case MessengerActionTypes.unSubscribe.type: {
      return {
        type: InternalTypes.ActionTypes.UnSubscribe,
        platform: platformNames.FBMessenger,
        metaData: { fbMessenger: undefined },
        imdbId: payloadJSON.imdbId,
        tvdbId: payloadJSON.tvdbId,
        title: payloadJSON.title,
      };
    }
    case MessengerActionTypes.myShows.type: {
      return {
        type: InternalTypes.ActionTypes.MyShows,
        platform: platformNames.FBMessenger,
        metaData: { fbMessenger: undefined },
      };
    }
    default:
      throw new Error(`Unknown PostBack ActionType: ${payloadJSON.action}`);
  }
}
