export interface IChatMessageEvent {
  sender: string;
  text: string;
}

export interface ILogEvent {
  type: string;
  text: string;
}
