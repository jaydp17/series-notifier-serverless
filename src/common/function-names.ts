/**
 * Contains all the function names
 */

import { serviceName, stage } from './environment';

/**
 * A prefix that has to be added in every function
 */
const prefix: string = `${serviceName}-${stage}`;

/**
 * The messenger sends the user sent messages to this function
 */
export const messengerEntryPoint: string = `${prefix}-messengerEntryPoint`;

/**
 * THe function that actually computes the output
 */
export const processQuery: string = `${prefix}-processQuery`;

/**
 * Function that replies to FB Messenger
 */
export const messengerReply: string = `${prefix}-messengerReply`;
