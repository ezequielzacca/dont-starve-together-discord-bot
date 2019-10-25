import { IPlayer } from "./../interfaces/player.interface";
import { IPlayerConnectionEvent } from "../interfaces/events.interfaces";
import { SeasonsEnum } from "../enums/seasons.enum";
import { MoonPhasesEnum } from "../enums/moon-phases.enum";

export const POINTS_NAME = "puntos";

export const BOSS_SPAWNED_LINE = (
    bossName: string,
    emoji: string
) => {
    const lines = [
        `<demoji>${emoji}</demoji> Oh no! El terrible ${bossName} ha aparecido!`,
        `<demoji>${emoji}</demoji> Salvese quien pueda! Ha aparecido ${bossName}!`,
        `<demoji>${emoji}</demoji> El implacable ${bossName} esta tras nosotros`,
        `<demoji>${emoji}</demoji> Grrrr, un peligroso ${bossName} fue invocado.`,
        `<demoji>${emoji}</demoji> Oh no! El implacable ${bossName} ha aparecido!`
    ];
    return randomFrom(lines);
};

export const randomFrom = (lines: Array<string>) => {
    return lines[Math.floor(Math.random() * lines.length)];
};

export const BOSS_KILLED_LINE = (
    score: number,
    emoji: string,
    bossName: string,
    players: Array<IPlayerConnectionEvent>
) =>
    `<demoji>${emoji}</demoji> ${bossName} ha muerto a manos de ${players
        .map(player => `<demoji>${player.character}</demoji> ${player.name}`)
        .join(" ")} ganando ${
        players.length > 1 ? "cada uno" : ""
    } ${score} ${POINTS_NAME}. ¡Hurra!`;

export const PLAYER_CONNECTED_LINE = (
    player: IPlayerConnectionEvent
) => `<demoji>${player.character}</demoji> ${player.name} se ha conectado`;

export const PLAYER_DISCONNECTED_LINE = (
    player: IPlayerConnectionEvent
) => `<demoji>${player.character}</demoji> ${player.name} se ha desconectado`;

export const PLAYER_PICKED_LINE = (player: IPlayerConnectionEvent) =>
    `Damos la bienvenida a <demoji>${player.character}</demoji> ${player.name}! Esperamos disfrutes de esta aventura.`;

export const SEASON_CHANGING_LINE = (season: SeasonsEnum) => {
    switch (season) {
        case SeasonsEnum.Autumn:
            return `<demoji>${season}</demoji> Empiezan a caer las hojas de los arboles... El Otoño se acerca!`;
        case SeasonsEnum.Winter:
            return `<demoji>${season}</demoji> Brrrrr que frio! Parece que se acerca el invierno...`;
        case SeasonsEnum.Spring:
            return `<demoji>${season}</demoji> Nubes grises llenando el cielo... ¿Se acercara la primavera?`;
        case SeasonsEnum.Summer:
            return `<demoji>${season}</demoji> Que calor!! Parece que se nos viene el Verano...`;
    }
};

export const MOON_CHANGING_LINE = (phase: MoonPhasesEnum) => {
    switch (phase) {
        case MoonPhasesEnum.New:
            return `<demoji>${phase}</demoji> Las estrellas iluminan con intenso brillo... Se acerca la luna nueva`;
        case MoonPhasesEnum.Full:
            return `<demoji>${phase}</demoji> Hounds aullando con sordido lamento... La luna llena se acerca`;
        default:
            return "";
    }
};

export const LIST_PLAYERS_LINE = (
    players: Array<IPlayerConnectionEvent>
) => {
    return players.length > 0
        ? `${
              players.length > 1
                  ? "Los jugadores conectados son"
                  : "El unico jugador conectado es"
          } ${players
              .map(player => ({
                  emoji: `<demoji>${player.character}</demoji>`,
                  name: player.name
              }))
              .map(player => `${player.emoji} ${player.name}`)
              .join(" | ")}`
        : "No hay jugadores conectados";
};

export const SCOREBOARD = (players: Array<IPlayer>) => {
    const sortedPlayers = players.sort((a, b) => (a.score < b.score ? 1 : -1));

    return players.length > 0
        ? `${sortedPlayers
              .map(
                  player =>
                      `<demoji>${player.character}</demoji> ${player.name}: ${player.score}`
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
