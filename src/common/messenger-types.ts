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
  [key: string]: any; //tslint:disable-line:no-any
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

export interface IDeliveryMessageMessaging extends IMesssaging {
  delivery: {
    mids: string[];
  };
}

export interface ISendTextMsgPayload {
  text: string;
}

export type AnyMessagingObject = ITextMessageMessaging | IDeliveryMessageMessaging;

export type AnyFacebookMessage = TextMessage;

export type AnySendMessagePayload = ISendTextMsgPayload;

// Type Guards
export function isTextMessagingObj(obj: AnyMessagingObject): obj is ITextMessageMessaging {
  return (<ITextMessageMessaging>obj).message != null;
}
