import { METHEUS_CHANNEL } from "./app";
import { Subject } from "rxjs";
import Discord from "discord.io";
import { IBot, IChannelMessage } from "../interfaces/bot.interfaces";

export const initializeBot = (): IBot => {
  let channelId: string;
  let channelName: string;
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
  bot.on("ready", function(evt) {
    logger.info("Connected");
    logger.info("Logged in as: ");
    logger.info(bot.username + " - (" + bot.id + ")");
    const server = bot.servers[Object.keys(bot.servers)[0]];
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
  });
  bot.on("message", function(user, userID, channelID, message, evt) {
    messagesSubject.next({
      channelName: channelName,
      channelID: channelID,
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
  return {
    messages: messagesSubject,
    send: send
  };
};
