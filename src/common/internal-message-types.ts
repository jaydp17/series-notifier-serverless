/**
 * Contains types related to messages transfered between lambas
 */

/**
 * Represents the platforms from which a message can come & go
 */
export const enum Platform {
  Messenger,
  AmazonAlexa,
  GoogleHome,
}

/**
 * Message that is sent to the ProcessQuery function
 * This is a cross platform way of telling that function to process something
 */
export interface IMessage {
  text: string;
  platform: Platform;
  metaData: {};
}
