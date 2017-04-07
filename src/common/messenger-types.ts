/**
 * Contains types related to Messenger API
 */

interface IEntry {
  id: string;
  time: number;
}

interface IMesssaging {
  sender: { id: string; };
  recipient: { id: string; };
  timestamp: number;
}

export type TextMessage = {
  object: string;
  entry: ITextMessageEntry[];
};

export interface ITextMessageEntry extends IEntry {
  messaging: ITextMessageMessaging[];
}

export interface ITextMessageMessaging extends IMesssaging {
  message: {
    text: string;
    is_echo: boolean;
  };
}

export interface ISendTextMsgPayload {
  text: string;
}

export type AnyMessagingObject = ITextMessageMessaging;

export type AnyFacebookMessage = TextMessage;

export type AnySendMessagePayload = ISendTextMsgPayload;
