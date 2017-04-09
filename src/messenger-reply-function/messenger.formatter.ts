/**
 * A formatter that formats TV Shows in Facebook Messenger format
 */

// types
import * as InternalTypes from '../common/internal-message-types';
import * as MessengerTypes from '../common/messenger-types';

/**
 * Generates a single element in the generic template
 */
function genericElement(show: InternalTypes.ITvShow): MessengerTypes.GenericTemplateElement {
  return {
    title: show.title,
    subtitle: show.genres.join(', '),
  };
}

/**
 * Generates the entire content to be sent as generic template
 */
export function genericTemplate(shows: InternalTypes.ITvShow[]): MessengerTypes.ISendGenericTemplateMessage {
  return {
    attachment: {
      type: 'template',
      payload: {
        template_type: 'generic',
        elements: shows.map(genericElement),
      },
    },
  };
}
