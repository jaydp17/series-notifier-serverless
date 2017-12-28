/**
 * Contains types related to messages transfered between lambas
 */

// tslint:disable:no-reserved-keywords

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
  MyShows,
  NextEpisodeDate,
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
  type: ActionTypes;
  platform: Platform;
  metaData: IMetaData;
}

/**
 * An action that represents a search query
 */
export interface ISearchAction extends IAction {
  type: ActionTypes.Search;
  text: string;
}

/**
 * An action that represents that the user is asking for the trending shows
 */
export interface IShowTrendingAction extends IAction {
  type: ActionTypes.ShowTrending;
}

/**
 * An action that represents that the user is asking to subscribe a show
 */
export interface ISubscribeAction extends IAction {
  type: ActionTypes.Subscribe;
  imdbId: string;
  tvdbId: number;
  title: string;
}

/**
 * An Action that represents that the user is trying to unSubscribe a show
 */
export interface IUnSubscribeAction extends IAction {
  type: ActionTypes.UnSubscribe;
  imdbId: string;
  tvdbId: number;
  title: string;
}

/**
 * An action that represents user asking for his subscribed shows
 */
export interface IMyShowsAction extends IAction {
  type: ActionTypes.MyShows;
}

export interface INextEpisodeDateAction extends IAction {
  type: ActionTypes.NextEpisodeDate;
  imdbId: string;
  tvdbId: number;
  title: string;
}

/**
 * Generic Action Type
 */
export type AnyAction =
  | ISearchAction
  | IShowTrendingAction
  | ISubscribeAction
  | IUnSubscribeAction
  | IMyShowsAction
  | INextEpisodeDateAction;

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
  SubscribeResult,
  UnSubscribeResult,
  MyShows,
  NextEpisodeDate,
  EpisodeNotification,
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
 * Reply to a subscribe show request
 */
export interface ISubscribeReply extends IReply {
  kind: ReplyKind.SubscribeResult;
  success: boolean;
  imdbId: string;
  title: string;
}

/**
 * Reply to an un-subscribe request
 */
export interface IUnSubscribeReply extends IReply {
  kind: ReplyKind.UnSubscribeResult;
  success: boolean;
  imdbId: string;
  title: string;
}

/**
 * A reply for Show Trending
 */
export interface ITrendingShowsReply extends IReply {
  kind: ReplyKind.TrendingShows;
  shows: ITvShow[];
}

/**
 * A reply for user's subscribed shows
 */
export interface IMyShowsReply extends IReply {
  kind: ReplyKind.MyShows;
  shows: ITvShow[];
}

/**
 * A reply for Next episode's date
 */
export interface INextEpisodeDateReply extends IReply {
  kind: ReplyKind.NextEpisodeDate;
  episode: ITvEpisode | null;
  error: { message: string } | null;
  show: {
    imdbId: string;
    title: string;
  };
}

/**
 * A reply for when the notification is sent to the user
 * when one of the episodes from the series he has subscribed goes live
 */
export interface IEpisodeNotificationReply extends IReply {
  kind: ReplyKind.EpisodeNotification;
  episode: ITvEpisode;
  show: {
    imdbId: string;
  };
}

/**
 * Generic reply type
 */
export type AnyReplyKind =
  | ITextReply
  | ISearchResultsReply
  | ITrendingShowsReply
  | ISubscribeReply
  | IUnSubscribeReply
  | IMyShowsReply
  | INextEpisodeDateReply
  | IEpisodeNotificationReply;

export interface ITvShowMetaData {
  title: string;
  year: number;
  tvdbId: number;
  imdbId: string;
  overview: string;
  genres: string[];
  backDropUrl?: string | null;
}

/**
 * Internal representation of a TV Show
 */
export interface ITvShow extends ITvShowMetaData {
  isSubscribed: boolean;
}

/**
 * Internal representation of an Episode
 */
export interface ITvEpisode {
  seasonNumber: number;
  epNumber: number;
  title?: string;
  tvdbId: number;
  imdbId: string;
  overview: string;
  rating?: number;
  firstAired?: number | null; // epoc time
  runtime?: number;
}
