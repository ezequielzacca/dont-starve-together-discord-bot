import Discord from "discord.io";

export interface IResolvedEmoji {
  demoji: string;
  emoji: string;
}

export interface Emoji {
  id: string;
  name: string;
}

export const resolveEmojis = (message: string, server: Discord.Server) => {
  let messageToReturn = message;
  console.log("original message is: ", message);
  const anotherDiscordEmojiMatches = message.match(/\<:\S+:\d+\>/g);
  if (anotherDiscordEmojiMatches) {
    messageToReturn = message.replace(/\<|\d+\>/g, "");
  }
  console.log("anotherDiscordEmojiMatches ", anotherDiscordEmojiMatches);
  const matches = messageToReturn.match(/:(?:[^:\s]|::)*:/g);
  console.log("matches ", matches);
  if (!matches) return messageToReturn;
  const toResolve = matches.map(
    demojiTag =>
      <Partial<IResolvedEmoji>>{
        demoji: demojiTag.replace(/:/g, "")
      }
  );

  const emojis = dictionaryToArray<Emoji>(<any>server.emojis);

  for (let i = 0; i < toResolve.length; i++) {
    const coincidentalEmoji = emojis.find(
      emoji => emoji.name === toResolve[i].demoji
    );
    if (coincidentalEmoji) {
      toResolve[i].emoji = `<:${toResolve[i].demoji}:${coincidentalEmoji.id}>`;
    } else {
      toResolve[i].emoji = "";
    }
  }
  toResolve.map(resolved => {
    console.log([
      "replacing: ",
      messageToReturn,
      `:${resolved.demoji}:`,
      resolved.emoji ? resolved.emoji : ""
    ]);
    messageToReturn = messageToReturn.replace(
      new RegExp(`(?<!<):${resolved.demoji}:`),
      resolved.emoji ? resolved.emoji : ""
    );
  });
  console.log("final message is: ", messageToReturn);
  return messageToReturn;
};

export const dictionaryToArray = <T>(dict: { [key: string]: T }): Array<T> => {
  return Object.keys(dict).map(key => dict[key]);
};
