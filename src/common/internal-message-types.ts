/**
 * Contains types related to messages transfered between lambas
 */

import * as MessengerTypes from '../common/messenger-types';
import { platformNames } from './constants';

/**
 * Represents the platforms from which a message can come & go
 */
export type Platform = 'FBMessenger' | 'AmazonAlexa' | 'GoogleHome';

export function isPlatform(platform: string): platform is Platform {
  return Object.values(<{ [key: string]: string }>platformNames).includes(platform);
}

/**
 * The processing function requires an action with an action type
 * This is the action type for it
 */
export enum ActionTypes {
  Search,
  Subscribe,
  UnSubscribe,
  ShowTrending,
}

/**
 * The metaData object that's passed around across functions
 */
export interface IMetaData {
  fbMessenger?: MessengerTypes.AnyMessagingObject;
}

/**
 * The processing function requires an action to work on
 * It's similar to what Action/ActionTypes do in redux
 */
interface IAction {
  type: ActionTypes; // tslint:disable-line:no-reserved-keywords
  platform: Platform;
  metaData: IMetaData;
}

/**
 * An action that represents a search query
 */
export interface ISearchAction extends IAction {
  type: ActionTypes.Search; // tslint:disable-line:no-reserved-keywords
  text: string;
}

/**
 * An action that represents that the user is asking for the trending shows
 */
export interface IShowTrendingAction extends IAction {
  type: ActionTypes.ShowTrending; // tslint:disable-line:no-reserved-keywords
}

/**
 * Generic Action Type
 */
export type AnyAction = ISearchAction | IShowTrendingAction;

/**
 * Message that is sent to the ProcessQuery function
 * This is a cross platform way of telling that function to process something
 */
export interface IMessage {
  text: string;
  platform: Platform;
  metaData: {};
}

/**
 * Enum to classify the kind of reply
 */
export enum ReplyKind {
  Text,
  SearchResults,
  TrendingShows,
}

/**
 * The Formatter functions (i.e. the functions that reply back the the repective platforms)
 * get a reply object
 */
export interface IReply {
  kind: ReplyKind;
  metaData: IMetaData;
}

/**
 * A text message reply
 */
export interface ITextReply extends IReply {
  kind: ReplyKind.Text;
  text: string;
}

/**
 * A search results reply
 */
export interface ISearchResultsReply extends IReply {
  kind: ReplyKind.SearchResults;
  shows: ITvShow[];
}

/**
 * A reply for Show Trending
 */
export interface ITrendingShowsReply extends IReply {
  kind: ReplyKind.TrendingShows;
  shows: ITvShow[];
}

/**
 * Generic reply type
 */
export type AnyReplyKind = ITextReply | ISearchResultsReply | ITrendingShowsReply;

/**
 * Internal representation of a TV Show
 */
export interface ITvShow {
  title: string;
  year: number;
  tvdbId: number;
  imdbId: string;
  overview: string;
  genres: string[];
  backDropUrl?: string | null;
  isSubscribed: boolean;
}
