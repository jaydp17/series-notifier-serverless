interface Entry {
  id: string;
  time: number;
}

interface Messsaging {
  sender: { id: string; };
  recipient: { id: string; };
  timestamp: number;
}

export type TextMessage = {
  object: string;
  entry: TextMessageEntry[];
};

interface TextMessageEntry extends Entry {
  messaging: TextMessageMessaging[];
};

interface TextMessageMessaging extends Messsaging {
  message: {
    text: string;
    is_echo: boolean;
  }
};

export type AnyFacebookMessage = TextMessage;