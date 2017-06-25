/**
 * A formatter that formats TV Shows in Facebook Messenger format
 */

// types
import * as InternalTypes from '../common/internal-message-types';
import * as MessengerActionTypes from '../common/messenger-actions-types';
import * as MessengerTypes from '../common/messenger-types';

export namespace GenericTemplate {
  export function getSubscribeButton(show: InternalTypes.ITvShow): MessengerTypes.GenericTemplate.PostBackButton {
    const action = show.isSubscribed ? MessengerActionTypes.unSubscribe : MessengerActionTypes.subscribe;
    return {
      type: 'postback',
      title: action.label,
      payload: JSON.stringify(convertToTvShowPayload(show, action.type)),
    };
  }

  /**
   * Generates a single element in the generic template
   */
  export function getElement(show: InternalTypes.ITvShow): MessengerTypes.GenericTemplateElement {
    const buttons: MessengerTypes.GenericTemplate.Button[] = [getSubscribeButton(show)];
    return {
      title: show.title,
      subtitle: show.genres.join(', '),
      image_url: show.backDropUrl,
      buttons,
    };
  }

  /**
   * Generates the entire content to be sent as generic template
   */
  export function generate(shows: InternalTypes.ITvShow[]): MessengerTypes.ISendGenericTemplateMessage {
    return {
      attachment: {
        type: 'template',
        payload: {
          template_type: 'generic',
          elements: shows.map(getElement),
        },
      },
    };
  }
}

export function convertToTvShowPayload(show: InternalTypes.ITvShow, actionType: string): MessengerTypes.TvShowPayLoad {
  return {
    action: actionType,
    tvdbId: show.tvdbId,
    imdbId: show.imdbId,
    title: show.title,
  };
}
