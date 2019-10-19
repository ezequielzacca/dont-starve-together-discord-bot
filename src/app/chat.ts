import { IChatMessageEvent } from "./../interfaces/events.interfaces";
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
