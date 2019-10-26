import { Subject } from "rxjs";
import Discord from "discord.io";
import { IBot, IChannelMessage } from "../interfaces/bot.interfaces";
import { ISettings } from "../interfaces/settings.interface";
import { resolveEmojis } from "./emojis-resolver";

export const initializeBot = (settings: ISettings): Promise<IBot> => {
  return new Promise((resolve, reject) => {
    let channels: Array<Discord.Channel & { server: Discord.Server }> = [];
    let servers: Array<Discord.Server> = [];

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

    bot.on("message", async (user, userID, messageChannelID, message, evt) => {
      if (user !== bot.username) {
        if (channels.some(channel => channel.id === messageChannelID)) {
          const messagechannel = channels.find(
            channel => channel.id === messageChannelID
          );
          if (messagechannel) {
            messagesSubject.next({
              channelName: messagechannel.name,
              channelID: messageChannelID,
              _: evt,
              message: message,
              user: user,
              userID: userID
            });
            await broadcast(message, user, messageChannelID);
          }
        }
      }
    });
    const send = (message: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        channels
          .filter(
            channel => settings.bot.ignoreChannels.indexOf(channel.name) === -1
          )
          .map(channel => {
            bot.sendMessage(
              {
                to: channel.id,
                message: resolveEmojis(message, channel.server)
              },
              (err, res) => {
                if (err) {
                  return reject(err);
                }
                return resolve();
              }
            );
          });
      });
    };

    const broadcast = (
      message: string,
      sender: string,
      originalchannelId: string
    ): Promise<void> => {
      return new Promise((resolve, reject) => {
        channels
          .filter(
            channel =>
              channel.id !== originalchannelId &&
              settings.bot.ignoreChannels.indexOf(channel.name) === -1
          )
          .map(channel => {
            bot.sendMessage(
              {
                to: channel.id,
                message: `__***${sender}***__: ${resolveEmojis(
                  message,
                  channel.server
                )}`
              },
              (err, res) => {
                if (err) {
                  return reject(err);
                }
                return resolve();
              }
            );
          });
      });
    };
    bot.on("ready", function(evt) {
      logger.info("Connected");
      logger.info("Logged in as: ");
      logger.info(bot.username + " - (" + bot.id + ")");
      servers = Object.keys(bot.servers).map(key => bot.servers[key]);
      servers.map(server => {
        const channelsList: Array<
          Discord.Channel & { server: Discord.Server }
        > = Object.keys(server.channels)
          .map(key => server.channels[key])
          .map(channel => Object.assign(channel, { server: server }));
        const channel = channelsList.find(channel =>
          settings.bot.channels.includes(channel.name)
        );
        if (channel) {
          channels = [...channels, channel];
        }
      });

      return resolve({
        messages: messagesSubject,
        send: send,
        broadcast: broadcast
      });
    });
  });
};
