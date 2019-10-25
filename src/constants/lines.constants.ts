import { IPlayer } from "./../interfaces/player.interface";
import { IBot } from "../interfaces/bot.interfaces";
import { getEmoji } from "../app/bot";
import { IPlayerConnectionEvent } from "../interfaces/events.interfaces";
import { SeasonsEnum } from "../enums/seasons.enum";
import { MoonPhasesEnum } from "../enums/moon-phases.enum";

export const POINTS_NAME = "puntos";

export const BOSS_SPAWNED_LINE = (
  bot: IBot,
  bossName: string,
  emoji: string
) => {
  const emojiId = getEmoji(bot, emoji);
  const lines = [
    `${emojiId} Oh no! El terrible ${bossName} ha aparecido!`,
    `${emojiId} Salvese quien pueda! Ha aparecido ${bossName}!`,
    `${emojiId} El implacable ${bossName} esta tras nosotros`,
    `${emojiId} Grrrr, un peligroso ${bossName} fue invocado.`,
    `${emojiId} Oh no! El implacable ${bossName} ha aparecido!`
  ];
  return randomFrom(lines);
};

export const randomFrom = (lines: Array<string>) => {
  return lines[Math.floor(Math.random() * lines.length)];
};

export const BOSS_KILLED_LINE = (
  bot: IBot,
  score: number,
  emoji: string,
  bossName: string,
  players: Array<IPlayerConnectionEvent>
) =>
  `${getEmoji(bot, emoji)} ${bossName} ha muerto a manos de ${players
    .map(player => `${getEmoji(bot, player.character)} ${player.name}`)
    .join(" ")} ganando ${
    players.length > 1 ? "cada uno" : ""
  } ${score} ${POINTS_NAME}. ¡Hurra!`;

export const PLAYER_CONNECTED_LINE = (
  bot: IBot,
  player: IPlayerConnectionEvent
) => `${getEmoji(bot, player.character)} ${player.name} se ha conectado`;

export const PLAYER_DISCONNECTED_LINE = (
  bot: IBot,
  player: IPlayerConnectionEvent
) => `${getEmoji(bot, player.character)} ${player.name} se ha desconectado`;

export const PLAYER_PICKED_LINE = (bot: IBot, player: IPlayerConnectionEvent) =>
  `Damos la bienvenida a ${getEmoji(bot, player.character)} ${
    player.name
  }! Esperamos disfrutes de esta aventura.`;

export const SEASON_CHANGING_LINE = (bot: IBot, season: SeasonsEnum) => {
  switch (season) {
    case SeasonsEnum.Autumn:
      return `${getEmoji(
        bot,
        season
      )} Empiezan a caer las hojas de los arboles... El Otoño se acerca!`;
    case SeasonsEnum.Winter:
      return `${getEmoji(
        bot,
        season
      )} Brrrrr que frio! Parece que se acerca el invierno...`;
    case SeasonsEnum.Spring:
      return `${getEmoji(
        bot,
        season
      )} Nubes grises llenando el cielo... ¿Se acercara la primavera?`;
    case SeasonsEnum.Summer:
      return `${getEmoji(
        bot,
        season
      )} Que calor!! Parece que se nos viene el Verano...`;
  }
};

export const MOON_CHANGING_LINE = (bot: IBot, phase: MoonPhasesEnum) => {
  switch (phase) {
    case MoonPhasesEnum.New:
      return `${getEmoji(
        bot,
        phase
      )} Las estrellas iluminan con intenso brillo... Se acerca la luna nueva`;
    case MoonPhasesEnum.Full:
      return `${getEmoji(
        bot,
        phase
      )} Hounds aullando con sordido lamento... La luna llena se acerca`;
    default:
      return "";
  }
};

export const LIST_PLAYERS_LINE = (
  bot: IBot,
  players: Array<IPlayerConnectionEvent>
) => {
  return players.length > 0
    ? `${
        players.length > 1
          ? "Los jugadores conectados son"
          : "El unico jugador conectado es"
      } ${players
        .map(player => ({
          emoji: getEmoji(bot, player.character),
          name: player.name
        }))
        .map(player => `${player.emoji} ${player.name}`)
        .join(" | ")}`
    : "No hay jugadores conectados";
};

export const SCOREBOARD = (bot: IBot, players: Array<IPlayer>) => {
  const sortedPlayers = players.sort((a, b) => (a.score < b.score ? 1 : -1));

  return players.length > 0
    ? `${sortedPlayers
        .map(
          player =>
            `${getEmoji(bot, player.character)} ${player.name}: ${player.score}`
        )
        .join("\r\n")}`
    : "Ningun jugador registra puntaje.";
};

export const SECONOMY = (bot: IBot, players: Array<IPlayer>) => {
  const sortedPlayers = players.sort((a, b) => (a.score < b.score ? 1 : -1));

  return players.length > 0
    ? `${sortedPlayers
        .map(
          player =>
            `${getEmoji(bot, player.character)} ${player.name}: ${getEmoji(bot,'secoins')}${player.secoins}`
        )
        .join("\r\n")}`
    : "Ningun jugador registra secoins.";
};
