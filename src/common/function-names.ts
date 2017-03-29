/**
 * Contains all the function names
 */

import { serviceName, stage } from './environment';

/**
 * A prefix that has to be added in every function
 */
const prefix: string = `${serviceName}-${stage}`;

export const messengerEntryPoint: string = `${prefix}-messengerEntryPoint`;

export const processQuery: string = `${prefix}-processQuery`;
