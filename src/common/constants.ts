import { Platform } from './internal-message-types';
/**
 * Contains constants used across the app
 */
export const GRAPH_API_URL = 'https://graph.facebook.com/v3.2';

export const platformNames: { [K in Platform]: Platform } = {
  FBMessenger: 'FBMessenger',
  AmazonAlexa: 'AmazonAlexa',
  GoogleHome: 'GoogleHome',
};

export const errorMessages = {
  noNextEpisode: 'No next episode found',
};
