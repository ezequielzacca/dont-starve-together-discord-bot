import {
  IBossKilledEvent,
  IPlayer,
  IBossSpawnedEvent,
  IPlayerConnectioEvent
} from "./../interfaces/events.interfaces";
import { IChatMessageEvent } from "../interfaces/events.interfaces";
import { BossesList } from "../enums/bosses.enum";
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

export const getBossSpawnedParts = (logMessage: string): IBossSpawnedEvent => {
  //eg: [00:01:22]: [Boss Spawned] :	121750 - deerclops

  const splited = logMessage.split(":");
  console.log("logMessage: ", splited);
  const bossId = splited[4].split("-")[1].trim();
  const bossName = BossesList[bossId];
  return {
    id: bossId,
    name: bossName
  };
};

export const getBossKilledParts = (logMessage: string): IBossKilledEvent => {
  //eg: [00:01:22]: [Boss Spawned] :	121750 - deerclops

  const splited = logMessage.split(":");
  console.log("logMessage: ", splited);
  const bossId = splited[4].split("-")[1].trim();
  const bossName = BossesList[bossId];
  //eg: KU_123123@KZtyler@wolfgang|	 	KU_98798@RHeadShot@webber|
  const playersConcat = splited[5];
  const players: Array<IPlayer> = playersConcat
    .split("|")
    .slice(0, -1)
    .map(player => player.trim())
    .map(player => player.split("@"))
    .map(player => {
      console.log(player);
      return player;
    })
    .map(player => ({
      id: player[0],
      name: player[1],
      character: player[2]
    }));

  return {
    id: bossId,
    name: bossName,
    players: players
  };
};

export const getPlayersConnectionPart = (
  logMessage: string
): IPlayerConnectioEvent => {
  //eg: [00:01:22]: [Player Connected] :	KI_12313@RHeadShot@webber
  //eg2: [00:01:22]: [Player Disconnected] :	KI_12313@RHeadShot@webber

  const splited = logMessage.split(":");

  const playerData = splited[4];
  const player = playerData.split("@");

  return {
    id: player[0],
    name: player[1],
    character: player[2]
  };
};
