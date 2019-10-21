import { ILogEvent } from "./../interfaces/events.interfaces";
import { IChatMessageEvent } from "../interfaces/events.interfaces";
export const removeBrackets = (text: string) => {
  return text.replace(/\[(.*?)\]/g, "");
};

export const removeParenthesis = (text: string) => {
  return text.replace(/\((.*?)\)/g, "");
};

export const getChatMessageParts = (logMessage: string): IChatMessageEvent => {
  const splited = logMessage.split(":");
  const text = splited[4];
  const sender = removeParenthesis(removeBrackets(splited[3])).trim();
  return {
    sender: sender,
    text: text
  };
};

export const getLogParts = (logMessage: string): ILogEvent => {
  const splited = logMessage.split(":");
  const text = splited[4];
  const sender = removeParenthesis(removeBrackets(splited[3])).trim();
  return {
    type: sender,
    text: text
  };
};
