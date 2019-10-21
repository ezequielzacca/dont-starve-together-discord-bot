import { getChatMessageParts } from "./app/chat";
import { initializeBot } from "./app/bot";
import { settings, readContent } from "./app/settings";
import * as path from "path";
import { watchFileChanges } from "./app/file-watcher";
import { map, filter } from "rxjs/operators";
import { ChatEventsEnum } from "./enums/chat-events.enum";
import { initializeServer } from "./app/server";

export const METHEUS_CHANNEL = "metheus";

const startBot = async () => {
  const SERVER_SETTINGS = await settings();
  const bot = initializeBot();

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
  const CAVES_CHAT_LOG_PATH = path.join(
    SERVER_SETTINGS.serverFilesLocation,
    "Caves/server_chat_log.txt"
  );

  const masterChatLogInitialContent = await readContent(MASTER_CHAT_LOG_PATH);
  console.log("master chat initial content: ", masterChatLogInitialContent);
  const cavesChatLogInitialContent = await readContent(CAVES_CHAT_LOG_PATH);
  console.log("caves chat initial content: ", cavesChatLogInitialContent);

  const masterChatLogChanges = watchFileChanges(
    masterChatLogInitialContent,
    MASTER_CHAT_LOG_PATH
  );
  /*const cavesChatLogChanges = watchFileChanges(
    cavesChatLogInitialContent,
    CAVES_CHAT_LOG_PATH
  );*/

  const sendToServerConsole = await initializeServer(SERVER_SETTINGS);

  const chatMessages = masterChatLogChanges.pipe(
    map(changes =>
      changes.lines.filter(line => line.indexOf(ChatEventsEnum.Message) > -1)
    ),
    map(lines => lines.map(line => getChatMessageParts(line)))
  );

  //Listen for Ingame chat messages and send to discord
  chatMessages.subscribe(lines => {
    lines.map(message => {
      console.log("gonna send message: ", message.text);
      bot.send(`__***${message.sender}***__: ${message.text}`);
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
