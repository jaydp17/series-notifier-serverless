/**
 * Contains types related to Messenger API
 */

// tslint:disable:no-reserved-keywords

interface IEntry {
  id: string;
  time: number;
}

export interface IMessaging {
  sender: { id: string };
  recipient: { id: string };
  timestamp: number;
  [key: string]: any; // tslint:disable-line:no-any
}

export interface IFBWebHookMessage {
  object: 'page';
  entry: IFBWebHookMessageEntry[];
}
export interface IFBWebHookMessageEntry {
  messaging: AnyMessagingObject[];
}

export interface IPostBackMessage {
  object: string;
  entry: IPostBackMessaging[];
}

export interface ITextMessageMessaging extends IMessaging {
  message: {
    text: string;
    is_echo: boolean;
  };
}

export interface IDeliveryMessageMessaging extends IMessaging {
  delivery: {
    mids: string[];
  };
}

export interface IPostBackMessaging extends IMessaging {
  postback: {
    payload: string | undefined | null;
  };
}

/**
 * Data tha should be passed in the message key, when sending a message
 */
export interface ISendTextMessage {
  text: string;
}

export interface IGenericTemplateWebUrlButton {
  type: 'web_url';
  url: string;
  title: string;
}

export interface IGenericTemplatePostBackButton {
  type: 'postback';
  title: string;
  payload: string;
}

export type GenericTemplateButton = IGenericTemplateWebUrlButton | IGenericTemplatePostBackButton;

/**
 * An element in the generic Template
 */
export interface IGenericTemplateElement {
  title: string;
  subtitle: string;
  image_url: string | null | undefined;
  buttons: GenericTemplateButton[];
}

/**
 * Data that should be passed in the message key, when sending a generic template message
 */
export interface ISendGenericTemplateMessage {
  attachment: {
    type: 'template';
    payload: {
      template_type: 'generic';
      elements: IGenericTemplateElement[];
    };
  };
}

export type AnyMessagingObject = ITextMessageMessaging | IDeliveryMessageMessaging | IPostBackMessaging;

/**
 * The data that will be send in the payload of a postback Button
 */
export interface ITvShowPayLoad {
  action: string;
  tvdbId: number;
  imdbId: string;
  title: string;
}

/**
 * Generic send message type
 */
export type AnySendMessage = ISendTextMessage | ISendGenericTemplateMessage;

// Type Guards
export function isTextMessagingObj(obj: AnyMessagingObject): obj is ITextMessageMessaging {
  return (obj as ITextMessageMessaging).message != null;
}

export function isPostBackMessagingObj(obj: AnyMessagingObject): obj is IPostBackMessaging {
  return (obj as IPostBackMessaging).postback != null;
}
