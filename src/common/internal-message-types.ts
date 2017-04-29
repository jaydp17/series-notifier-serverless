import { PLATFORM } from './constants';
/**
 * Contains types related to messages transfered between lambas
 */

/**
 * Represents the platforms from which a message can come & go
 */
export type Platform = 'FBMessenger' | 'AmazonAlexa' | 'GoogleHome';

export function isPlatform(platform: string): platform is Platform {
  return Object.values(PLATFORM).includes(platform);
}

/**
 * The processing function requires an action with an action type
 * This is the action type for it
 */
export const enum ActionTypes {
  Search,
  Subscribe,
  UnSubscribe,
  ShowTrending,
}

/**
 * The processing function requires an action to work on
 * It's similar to what Action/ActionTypes do in redux
 */
interface IAction {
  type: ActionTypes; // tslint:disable-line:no-reserved-keywords
  platform: Platform;
  metaData: {};
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
export const enum ReplyKind {
  Text,
  SearchResults,
  TrendnigShows,
}

/**
 * The Formatter functions (i.e. the functions that reply back the the repective platforms)
 * get a reply object
 */
export interface IReply {
  kind: ReplyKind;
  metaData: {};
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
 * Generic reply type
 */
export type AnyReplyKind = ITextReply | ISearchResultsReply;

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
  backDropUrl?: string;
}
