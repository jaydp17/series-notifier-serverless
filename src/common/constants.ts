import { Platform } from './internal-message-types';
/**
 * Contains constants used accross the app
 */
export const GRAPH_API_URL = 'https://graph.facebook.com/v2.6';

export const platformNames: {[K in Platform]: Platform } = {
  FBMessenger: 'FBMessenger',
  AmazonAlexa: 'AmazonAlexa',
  GoogleHome: 'GoogleHome',
};
