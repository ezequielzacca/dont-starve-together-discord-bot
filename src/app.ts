import {
  getChatMessageParts,
  getBossSpawnedParts,
  getBossKilledParts
} from "./app/messages";
import { initializeBot } from "./app/bot";
import { settings, readContent } from "./app/settings";
import * as path from "path";
import { watchFileChanges } from "./app/file-watcher";
import { map, filter } from "rxjs/operators";
import { ChatEventsEnum } from "./enums/chat-events.enum";
import { initializeServer } from "./app/server";
import { ServerEventsEnum } from "./enums/server-events.enum";
import { BOSS_SPAWNED_LINE, BOSS_KILLED_LINE } from "./constants/lines.constants";

export const METHEUS_CHANNEL = "metheus";

const startBot = async () => {
  const SERVER_SETTINGS = await settings();
  const bot = await initializeBot();

  bot.messages.subscribe(message => {
    if (message.channelName === METHEUS_CHANNEL) {
      console.log(
        "someone said: ",
        message.message,
        " on channel ",
        message.channelName
      );
    }
  });

  const MASTER_CHAT_LOG_PATH = path.join(
    SERVER_SETTINGS.serverFilesLocation,
    "Master/server_chat_log.txt"
  );

  const masterChatLogInitialContent = await readContent(MASTER_CHAT_LOG_PATH);
  console.log("master chat initial content: ", masterChatLogInitialContent);

  const masterChatLogChanges = watchFileChanges(
    masterChatLogInitialContent,
    MASTER_CHAT_LOG_PATH
  );

  const sendToServerConsole = await initializeServer(SERVER_SETTINGS);

  const chatMessages = masterChatLogChanges.pipe(
    map(changes =>
      changes.lines.filter(line => line.indexOf(ChatEventsEnum.Message) > -1)
    ),
    map(lines => lines.map(line => getChatMessageParts(line)))
  );

  const MASTER_SERVER_LOG_PATH = path.join(
    SERVER_SETTINGS.serverFilesLocation,
    "Master/server_log.txt"
  );

  const masterServerLogInitialContent = await readContent(
    MASTER_SERVER_LOG_PATH
  );

  const masterServerLogChanges = watchFileChanges(
    masterServerLogInitialContent,
    MASTER_SERVER_LOG_PATH
  );

  const bossSpawned = masterServerLogChanges.pipe(
    map(changes =>
      changes.lines.filter(
        line =>
          //Object.keys(ServerEventsEnum).some(key => line.indexOf(key) > -1)
          line.indexOf(ServerEventsEnum.BossSpawned) > -1
      )
    ),
    map(lines => lines.map(line => getBossSpawnedParts(line)))
  );

  const bossKilled = masterServerLogChanges.pipe(
    map(changes =>
      changes.lines.filter(
        line =>
          //Object.keys(ServerEventsEnum).some(key => line.indexOf(key) > -1)
          line.indexOf(ServerEventsEnum.BossKilled) > -1
      )
    ),
    map(lines => lines.map(line => getBossKilledParts(line)))
  );

  //Listen for Ingame chat messages and send to discord
  chatMessages.subscribe(lines => {
    lines.map(message => {
      console.log("gonna send message: ", message.text);
      bot.send(`__***${message.sender}***__: ${message.text}`);
    });
  });

  bossSpawned.subscribe(lines => {
    lines.map(message => {
      bot.send(BOSS_SPAWNED_LINE(bot, message.name, message.id));
    });
  });

  bossKilled.subscribe(lines => {
    lines.map(message => {
      bot.send(
        BOSS_KILLED_LINE(bot, message.name, message.id, ...message.players)
      );
    });
  });

  //Listen for discord messages and send them to the game
  bot.messages
    .pipe(
      //filter metheus messages
      filter(message => message.user.toLowerCase() !== "metheus"),
      map(message => `c_announce("${message.user}: ${message.message}")`)
    )
    .subscribe(message => {
      sendToServerConsole(message);
    });
};

startBot()
  .then(() => console.log("STARTED..."))
  .catch(console.log);
