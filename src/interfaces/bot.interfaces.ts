import { Observable } from "rxjs";

export interface IChannelMessage {
  user: string;
  userID: string;
  channelID: string;
  channelName: string;
  message: string;
  _: any;
}

export interface IBot {
  messages: Observable<IChannelMessage>;
  send(message: string): Promise<void>;
}
