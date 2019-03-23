/**
 * This function takes the internal generic crossplatform way of representation
 * and sends it back to the source (in this case FB Messenger)
 */

import { distanceInWords } from 'date-fns';
import { chunk, get, isEmpty } from 'lodash';
import { inspect } from 'util';
import { getError, prettyPrint } from '../common/common-utils';
import { errorMessages } from '../common/constants';
import { env } from '../common/environment';
import * as MessengerAPI from '../common/messenger.api';
import { generateGenericTemplate } from './messenger.formatter';

// types
import { LambdaCallback } from '../common/aws-lambda-types';
import * as InternalTypes from '../common/internal-message-types';
import * as MessengerTypes from '../common/messenger-types';

const { ReplyKind } = InternalTypes;

export async function handler(reply: InternalTypes.AnyReplyKind, context: {}, callback: LambdaCallback): Promise<void> {
  if (env !== 'test') {
    console.log('input', JSON.stringify(reply)); // tslint:disable-line:no-console
  }

  if (isEmpty(reply.metaData)) {
    return callback(new Error('no metaData'));
  }
  const metaData = reply.metaData.fbMessenger;
  if (isEmpty(metaData)) {
    return callback(new Error('No fbMessenger metaData'));
  }

  const senderId: string = get(metaData, 'sender.id', '');

  // if there's no senderId don't do anything
  if (isEmpty(senderId)) {
    const errorMessage = `No senderId in metaData: ${inspect(reply, { depth: 100 })}`;
    // console.error(errorMessage);
    return callback(new Error(errorMessage));
  }

  try {
    switch (reply.kind) {
      case ReplyKind.SearchResults:
      case ReplyKind.TrendingShows: {
        const message = generateGenericTemplate(reply.shows);
        await MessengerAPI.sendMessage(senderId, message);
        break;
      }
      case ReplyKind.SubscribeResult: {
        const msgObj: MessengerTypes.ISendTextMessage = {
          text: `Subscribed to ${reply.title} ✅`,
        };
        await MessengerAPI.sendMessage(senderId, msgObj);
        break;
      }
      case ReplyKind.UnSubscribeResult: {
        const msgObj: MessengerTypes.ISendTextMessage = {
          text: `UnSubscribed from ${reply.title}`,
        };
        await MessengerAPI.sendMessage(senderId, msgObj);
        break;
      }
      case ReplyKind.MyShows: {
        if (reply.shows.length === 0) {
          const msgObj: MessengerTypes.ISendTextMessage = {
            text: 'You have no subscribed shows!',
          };
          await MessengerAPI.sendMessage(senderId, msgObj);
        } else {
          const showChunks = chunk(reply.shows, 10);
          const messages = showChunks.map(generateGenericTemplate);
          for (const message of messages) {
            // serially send each message
            await MessengerAPI.sendMessage(senderId, message);
          }
        }
        break;
      }
      case ReplyKind.NextEpisodeDate: {
        const msgObj: MessengerTypes.ISendTextMessage = {
          text: `No next episode found for ${reply.show.title} 😕`,
        };
        if (reply.error && !reply.error.message.startsWith(errorMessages.noNextEpisode)) {
          msgObj.text = `Error: ${reply.error.message}`;
        } else if (reply.episode && reply.episode.firstAired) {
          let episodeCode = `S${reply.episode.seasonNumber.toString().padStart(2, '0')}`;
          episodeCode += `E${reply.episode.epNumber.toString().padStart(2, '0')}`;
          const timeDifference = distanceInWords(new Date(), reply.episode.firstAired);
          msgObj.text = `${episodeCode} of ${reply.show.title} goes live in ${timeDifference}`;
        }
        await MessengerAPI.sendMessage(senderId, msgObj);
        break;
      }
      case ReplyKind.EpisodeNotification: {
        const { episode, show } = reply;
        const epNumber = `00${episode.epNumber}`.slice(-2);
        const seriesNumber = `00${episode.seasonNumber}`.slice(-2);
        const msgObj: MessengerTypes.ISendTextMessage = {
          text: `${show.title} S${seriesNumber}E${epNumber} is live`,
        };
        await MessengerAPI.sendMessage(senderId, msgObj);
        break;
      }
      default:
        const errorMessage = `Not supported Kind: ${reply.kind}`;
        console.error(errorMessage);
        return callback(new Error(errorMessage));
    }
    callback(null, { status: true });
  } catch (err) {
    const error = getError(err);
    callback(error);
  }
}
