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

interface ITextMessageEntry extends IEntry {
  messaging: ITextMessageMessaging[];
}

interface ITextMessageMessaging extends IMesssaging {
  message: {
    text: string;
    is_echo: boolean;
  };
}

export type AnyFacebookMessage = TextMessage;
