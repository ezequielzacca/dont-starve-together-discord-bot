import { METHEUS_CHANNEL } from "../app";
import { Subject } from "rxjs";
import Discord from "discord.io";
import { IBot, IChannelMessage } from "../interfaces/bot.interfaces";

export const initializeBot = (): Promise<IBot> => {
  return new Promise((resolve, reject) => {
    let channelId: string;
    let channelName: string;
    let server: Discord.Server;
    const messagesSubject = new Subject<IChannelMessage>();
    var logger = require("winston");
    var auth = require("../auth.json");
    // Configure logger settings
    logger.remove(logger.transports.Console);
    logger.add(new logger.transports.Console(), {
      colorize: true
    });
    logger.level = "debug";
    // Initialize Discord Bot
    var bot = new Discord.Client({
      token: auth.token,
      autorun: true
    });

    bot.on("message", function(user, userID, messageChannelID, message, evt) {
      if (messageChannelID === channelId)
        messagesSubject.next({
          channelName: channelName,
          channelID: messageChannelID,
          _: evt,
          message: message,
          user: user,
          userID: userID
        });
    });
    const send = (message: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        bot.sendMessage(
          {
            to: channelId,
            message: message
          },
          (err, res) => {
            if (err) {
              return reject(err);
            }
            return resolve();
          }
        );
      });
    };
    bot.on("ready", function(evt) {
      logger.info("Connected");
      logger.info("Logged in as: ");
      logger.info(bot.username + " - (" + bot.id + ")");
      server = bot.servers[Object.keys(bot.servers)[0]];
      const channelsList: Array<Discord.Channel> = Object.keys(
        server.channels
      ).map(key => server.channels[key]);
      const channel = channelsList.find(
        channel => channel.name === METHEUS_CHANNEL
      );
      if (channel) {
        channelId = channel.id;
        channelName = channel.name;
        console.log("channel: ", channelId, channelName);
      } else {
        console.log("no channel matching");
      }
      return resolve({
        emojis: server.emojis,
        messages: messagesSubject,
        send: send
      });
    });
  });
};

export const getEmoji = (bot: IBot, name: string): string => {
  console.log("bot: ", bot);
  console.log("bot.emojis: ", bot.emojis);
  return `<:${name}:${
    Object.keys(bot.emojis)
      .map(key => bot.emojis[key])
      .find((emoji: any) => emoji.name === name).id
  }>`;
};
