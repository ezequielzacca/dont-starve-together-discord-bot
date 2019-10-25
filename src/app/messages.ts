import {
  IBossKilledEvent,
  IBossSpawnedEvent,
  IPlayerConnectionEvent,
  ISeasonEndCloseEvent,
  IMoonPhaseChangeCloseEvent,
  ISecoinsUpdatedEvent
} from "./../interfaces/events.interfaces";
import { IChatMessageEvent } from "../interfaces/events.interfaces";
import { BossesList } from "../enums/bosses.enum";
import { nextSeason } from "../utils/season.utils";
import { MoonPhasesEnum } from "../enums/moon-phases.enum";
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
  const players: Array<IPlayerConnectionEvent> = playersConcat
    .split("|")
    .slice(0, -1)
    .map(player => player.trim())
    .map(player => player.split("@"))
    .map(player => {
      console.log(player);
      return player;
    })
    .map(player => ({
      uid: player[0],
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
): IPlayerConnectionEvent => {
  //eg: [00:01:22]: [Player Connected] :	KI_12313@RHeadShot@webber
  //eg2: [00:01:22]: [Player Disconnected] :	KI_12313@RHeadShot@webber

  const splited = logMessage.split(":");

  const playerData = splited[4].trim();
  const player = playerData.split("@");

  return {
    uid: player[0],
    name: player[1],
    character: player[2]
  };
};

export const getSeasonEndingParts = (
  logMessage: string
): ISeasonEndCloseEvent => {
  //eg: [00:01:22]: [Season End Close] :	summer

  const splited = logMessage.split(":");

  const currentSeason = splited[4].trim();
  const next = nextSeason(currentSeason);

  return {
    next: next
  };
};

export const getMoonPhaseChaningParts = (
  logMessage: string
): IMoonPhaseChangeCloseEvent => {
  //eg: [00:01:22]: [Moon Phase Close] :	new

  const splited = logMessage.split(":");

  const cycle = Number.parseInt(<MoonPhasesEnum>splited[4].trim()) + 1;

  const isFullMoon = cycle % 20 === 11;
  const isNewMoon = cycle % 20 === 1;

  return {
    next: isFullMoon
      ? MoonPhasesEnum.Full
      : isNewMoon
      ? MoonPhasesEnum.New
      : MoonPhasesEnum.Other
  };
};

export const getSecoinsUpdatedParts = (
  logMessage: string
): ISecoinsUpdatedEvent => {
  //eg: [00:01:22]: [Boss Spawned] :	121750 - deerclops

  const splited = logMessage.split(":");

  const playerData = splited[4].trim();
  const player = playerData.split("@");
  const playerSecoins = Number.parseInt(player[3]);
  const secoins = !isNaN(playerSecoins) ? playerSecoins : 0;

  return {
    uid: player[0],
    name: player[1],
    character: player[2],
    secoins: secoins
  };
};
