import { getChatMessageParts } from "./chat";
import { initializeBot } from "./bot";
import { settings, readContent } from "./settings";
import * as path from "path";
import { watchFileChanges } from "./file-watcher";
import { merge } from "rxjs";
import { filter, map } from "rxjs/operators";
import { ChatEventsEnum } from "../enums/chat-events.enum";

export const METHEUS_CHANNEL = "metheus";

const startServer = async () => {
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
  const SERVER_SETTINGS = await settings();

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

  const chatMessages = masterChatLogChanges.pipe(
    map(changes =>
      changes.lines.filter(line => line.indexOf(ChatEventsEnum.Message) > -1)
    ),
    map(lines => lines.map(line => getChatMessageParts(line)))
  );

  chatMessages.subscribe(lines => {
    lines.map(message => {
      console.log("gonna send message: ", message.text);
      bot.send(`__***${message.sender}***__: ${message.text}`);
    });
  });
};

startServer()
  .then(() => console.log("STARTED..."))
  .catch(console.log);
