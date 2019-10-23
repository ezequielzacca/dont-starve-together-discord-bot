import { MOB_SCORES } from "./constants/mobs-scores.constant";
import { MoonPhasesEnum } from "./enums/moon-phases.enum";
import { BotCommandsEnum } from "./enums/commands.enum";
import mongoose from "mongoose";
import {
  getChatMessageParts,
  getBossSpawnedParts,
  getBossKilledParts,
  getPlayersConnectionPart,
  getSeasonEndingParts,
  getMoonPhaseChaningParts
} from "./app/messages";
import { initializeBot } from "./app/bot";
import { settings, readContent } from "./app/settings";
import * as path from "path";
import { watchFileChanges } from "./app/file-watcher";
import { map, filter } from "rxjs/operators";
import { ChatEventsEnum } from "./enums/chat-events.enum";
import { initializeServer } from "./app/server";
import { ServerEventsEnum } from "./enums/server-events.enum";
import {
  BOSS_SPAWNED_LINE,
  BOSS_KILLED_LINE,
  PLAYER_CONNECTED_LINE,
  PLAYER_DISCONNECTED_LINE,
  PLAYER_PICKED_LINE,
  SEASON_CHANGING_LINE,
  MOON_CHANGING_LINE,
  LIST_PLAYERS_LINE,
  SCOREBOARD
} from "./constants/lines.constants";
import { PlayerFunctions } from "./mongodb/models/player.model";
import {
  addConnectedPlayer,
  removeConnectedPlayer,
  getConnectedPlayers
} from "./app/connections";

export const METHEUS_CHANNEL = "metheus";

const startBot = async () => {
  const SERVER_SETTINGS = await settings();
  await mongoose.connect("mongodb://localhost:27017/dst");
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

  //Chat log entries

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

  //Listen for Ingame chat messages and send to discord
  chatMessages.subscribe(lines => {
    lines.map(message => {
      console.log("gonna send message: ", message.text);
      bot.send(`__***${message.sender}***__: ${message.text}`);
    });
  });

  //Server Log Entries

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

  //Bosses Spawning and Dying

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

  bossSpawned.subscribe(lines => {
    lines.map(message => {
      bot.send(BOSS_SPAWNED_LINE(bot, message.name, message.id));
    });
  });

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

  bossKilled.subscribe(lines => {
    lines.map(async message => {
      for (let i = 0; i < message.players.length; i++) {
        await PlayerFunctions.updateScore(
          message.players[i],
          MOB_SCORES[message.id]
        );
      }
      bot.send(
        BOSS_KILLED_LINE(
          bot,
          MOB_SCORES[message.id],
          message.id,
          message.name,
          message.players
        )
      );
    });
  });

  //Player Connects, Pick, Disconnects

  const userConnections = masterServerLogChanges.pipe(
    map(changes =>
      changes.lines.filter(
        line =>
          //Object.keys(ServerEventsEnum).some(key => line.indexOf(key) > -1)
          line.indexOf(ServerEventsEnum.PlayerConnected) > -1
      )
    ),
    map(lines => lines.map(line => getPlayersConnectionPart(line)))
  );

  userConnections.subscribe(lines => {
    lines.map(player => {
      addConnectedPlayer(player);
      bot.send(PLAYER_CONNECTED_LINE(bot, player));
    });
  });

  const userDisconnections = masterServerLogChanges.pipe(
    map(changes =>
      changes.lines.filter(
        line =>
          //Object.keys(ServerEventsEnum).some(key => line.indexOf(key) > -1)
          line.indexOf(ServerEventsEnum.PlayerDisconnected) > -1
      )
    ),
    map(lines => lines.map(line => getPlayersConnectionPart(line)))
  );

  userDisconnections.subscribe(lines => {
    lines.map(player => {
      removeConnectedPlayer(player);
      bot.send(PLAYER_DISCONNECTED_LINE(bot, player));
    });
  });

  const userPicks = masterServerLogChanges.pipe(
    map(changes =>
      changes.lines.filter(
        line =>
          //Object.keys(ServerEventsEnum).some(key => line.indexOf(key) > -1)
          line.indexOf(ServerEventsEnum.PlayerPicked) > -1
      )
    ),
    map(lines => lines.map(line => getPlayersConnectionPart(line)))
  );

  userPicks.subscribe(lines => {
    //register player on db
    lines.map(async player => {
      await PlayerFunctions.create(player);
      bot.send(PLAYER_PICKED_LINE(bot, player));
    });
  });

  //Season And Moon Cycles

  const seasonEnding = masterServerLogChanges.pipe(
    map(changes =>
      changes.lines.filter(
        line =>
          //Object.keys(ServerEventsEnum).some(key => line.indexOf(key) > -1)
          line.indexOf(ServerEventsEnum.SeasonEndClose) > -1
      )
    ),
    map(lines => lines.map(line => getSeasonEndingParts(line)))
  );

  seasonEnding.subscribe(lines => {
    lines.map(change => {
      console.log("season change: ", change);
      bot.send(SEASON_CHANGING_LINE(bot, change.next));
    });
  });

  const cyclesChange = masterServerLogChanges.pipe(
    map(changes =>
      changes.lines.filter(
        line =>
          //Object.keys(ServerEventsEnum).some(key => line.indexOf(key) > -1)
          line.indexOf(ServerEventsEnum.CycleChanged) > -1
      )
    ),
    map(lines => lines.map(line => getMoonPhaseChaningParts(line)))
  );

  const moonChange = cyclesChange.pipe(
    map(changes =>
      changes.filter(
        line =>
          //Object.keys(ServerEventsEnum).some(key => line.indexOf(key) > -1)
          line.next !== MoonPhasesEnum.Other
      )
    )
  );

  moonChange.subscribe(lines => {
    lines.map(change => {
      bot.send(MOON_CHANGING_LINE(bot, change.next));
    });
  });

  //filter metheus messages
  const discordMessages = bot.messages.pipe(
    filter(message => message.user.toLowerCase() !== "metheus")
  );

  //Listen for discord messages and send them to the game
  const discordChatMessages = discordMessages.pipe(
    //filter metheus messages
    filter(message => message.message[0] !== "!"),
    map(message => `c_announce("${message.user}: ${message.message}")`)
  );

  discordChatMessages.subscribe(message => {
    sendToServerConsole(message);
  });

  //listen for console commands
  const discordCommands = discordMessages.pipe(
    //filter metheus messages
    filter(message => message.message[0] === "!"),
    map(message => message.message.substr(1))
  );

  //list players command
  const listPlayers = discordCommands.pipe(
    //filter metheus messages
    filter(message => message === BotCommandsEnum.ListPlayers)
  );

  listPlayers.subscribe(() =>
    bot.send(LIST_PLAYERS_LINE(bot, getConnectedPlayers()))
  );

  //list players command
  const score = discordCommands.pipe(
    //filter metheus messages
    filter(message => message === BotCommandsEnum.Scores)
  );

  score.subscribe(async () => {
    //register connected players that are not on the db
    let dbPlayers = await PlayerFunctions.list();
    let connectedPlayers = getConnectedPlayers();
    let unregisteredPlayers = connectedPlayers.filter(
      player => !dbPlayers.some(db => db.uid === player.uid)
    );
    for (let i = 0; i < unregisteredPlayers.length; i++) {
      await PlayerFunctions.create(unregisteredPlayers[i]);
    }
    //now get all players
    const allPlayers = await PlayerFunctions.list();
    bot.send(SCOREBOARD(bot, allPlayers));
  });
};

startBot()
  .then(() => console.log("STARTED..."))
  .catch(console.log);
