/**
 * Contains types related to Messenger API
 */

interface IEntry {
  id: string;
  time: number;
}

export interface IMesssaging {
  sender: { id: string; };
  recipient: { id: string; };
  timestamp: number;
  [key: string]: any; //tslint:disable-line:no-any
}

export type FBWebHookMessage = {
  object: 'page';
  entry: [{
    messaging: AnyMessagingObject[];
  }];
};

export type PostBackMessage = {
  object: string;
  entry: IPostBackMessaging[];
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

export interface IPostBackMessaging extends IMesssaging {
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

export namespace GenericTemplate {
  export type WebUrlButton = {
    type: 'web_url'; // tslint:disable-line:no-reserved-keywords
    url: string;
    title: string;
  };

  export type PostBackButton = {
    type: 'postback'; // tslint:disable-line:no-reserved-keywords
    title: string;
    payload: string;
  };

  export type Button = WebUrlButton | PostBackButton;
}

/**
 * An element in the generic Template
 */
export type GenericTemplateElement = {
  title: string;
  subtitle: string;
  image_url: string | null | undefined;
  buttons: GenericTemplate.Button[];
};

/**
 * Data that should be passed in the message key, when sending a generic template message
 */
export interface ISendGenericTemplateMessage {
  attachment: {
    type: 'template'; // tslint:disable-line:no-reserved-keywords
    payload: {
      template_type: 'generic';
      elements: GenericTemplateElement[];
    };
  };
}

export type AnyMessagingObject = ITextMessageMessaging | IDeliveryMessageMessaging | IPostBackMessaging;

/**
 * The data that will be send in the payload of a postback Button
 */
export type TvShowPayLoad = {
  title: string;
  year: number;
  tvdbId: number;
  imdbId: string;
  backDropUrl: string | null | undefined;
};

/**
 * Generic send message type
 */
export type AnySendMessage = ISendTextMessage | ISendGenericTemplateMessage;

// Type Guards
export function isTextMessagingObj(obj: AnyMessagingObject): obj is ITextMessageMessaging {
  return (<ITextMessageMessaging>obj).message != null;
}

export function isPostBackMessagingObj(obj: AnyMessagingObject): obj is IPostBackMessaging {
  return (<IPostBackMessaging>obj).postback != null;
}
