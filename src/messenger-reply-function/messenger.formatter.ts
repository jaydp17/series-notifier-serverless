/**
 * A formatter that formats TV Shows in Facebook Messenger format
 */

// types
import * as InternalTypes from '../common/internal-message-types';
import * as MessengerTypes from '../common/messenger-types';

export namespace GenericTemplate {
  export function getSubscribeButton(show: InternalTypes.ITvShow): MessengerTypes.GenericTemplate.PostBackButton {
    return {
      type: 'postback',
      title: show.isSubscribed ? 'Un-Subscribe' : 'Subscribe',
      payload: JSON.stringify(show),
    };
  }

  /**
   * Generates a single element in the generic template
   */
  export function getElement(show: InternalTypes.ITvShow): MessengerTypes.GenericTemplateElement {
    const buttons: MessengerTypes.GenericTemplate.Button[] = [
      {
        type: 'postback',
        title: show.isSubscribed ? 'Un-Subscribe' : 'Subscribe',
        payload: JSON.stringify(show),
      },
    ];
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
