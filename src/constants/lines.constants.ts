import { IBot } from "../interfaces/bot.interfaces";
import { getEmoji } from "../app/bot";
import { IPlayer } from "../interfaces/events.interfaces";

export const BOSS_SPAWNED_LINE = (bot: IBot, ...args: Array<string>) => {
  const emoji = getEmoji(bot, args[1]);
  const lines = [
    `${emoji} Oh no! El terrible ${args[0]} ha aparecido!`,
    `${emoji} Salvese quien pueda! Ha aparecido ${args[0]}!`,
    `${emoji} El implacable ${args[0]} esta tras nosotros`,
    `${emoji} Grrrr, un peligroso ${args[0]} fue invocado.`,
    `${emoji} Oh no! El implacable ${args[0]} ha aparecido!`
  ];
  return randomFrom(lines);
};

export const randomFrom = (lines: Array<string>) => {
  return lines[Math.floor(Math.random() * lines.length)];
};

export const BOSS_KILLED_LINE = (bot: IBot, ...args: Array<string | IPlayer>) =>
  `${getEmoji(bot, <string>args[1])} ${<string>(
    args[0]
  )} ha muerto a manos de ${args
    .slice(2)
    .map(player => <IPlayer>player)
    .map(player => `${getEmoji(bot, player.character)} ${player.name}`)
    .join(" ")}. Hurra!!`;

export const PLAYER_CONNECTED_LINE = (bot: IBot, player: IPlayer) =>
  `${getEmoji(bot, player.character)} ${player.name} se ha conectado`;

export const PLAYER_DISCONNECTED_LINE = (bot: IBot, player: IPlayer) =>
  `${getEmoji(bot, player.character)} ${player.name} se ha desconectado`;

  export const PLAYER_PICKED_LINE = (bot: IBot, player: IPlayer) =>
  `Damos la bienvenida a ${getEmoji(bot, player.character)} ${player.name}! Esperamos disfrutes de esta aventura.`;
