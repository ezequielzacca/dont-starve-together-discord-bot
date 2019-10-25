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
    const matches = message.match(/<demoji>(.*?)<\/demoji>/g);
    if (!matches) return message;
    const toResolve = matches.map(
        demojiTag =>
            <Partial<IResolvedEmoji>>{
                demoji: demojiTag.replace(/<\/?demoji>/g, "")
            }
    );

    for (let i = 0; i < toResolve.length; i++) {
        const emojis = dictionaryToArray<Emoji>(<any>server.emojis);
        const coincidentalEmoji = emojis.find(
            emoji => emoji.name === toResolve[i].demoji
        );
        if (coincidentalEmoji) {
            toResolve[
                i
            ].emoji = `<:${toResolve[i].demoji}:${coincidentalEmoji.id}`;
        } else {
            toResolve[i].emoji = "";
        }
    }
    toResolve.map(resolved => {
        messageToReturn = messageToReturn.replace(
            `<demoji>${resolved.demoji}</demoji>`,
            resolved.emoji ? resolved.emoji : ""
        );
    });
    return messageToReturn;
};

export const dictionaryToArray = <T>(dict: { [key: string]: T }): Array<T> => {
    return Object.keys(dict).map(key => dict[key]);
};
