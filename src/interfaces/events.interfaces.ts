import { MoonPhasesEnum } from "./../enums/moon-phases.enum";
import { SeasonsEnum } from "./../enums/seasons.enum";
import { IPlayer } from "./events.interfaces";
export interface IChatMessageEvent {
    sender: string;
    text: string;
}

export interface ILogEvent {
    type: string;
    text: string;
}

export interface IBossKilledEvent {
    id: string;
    name: string;
    players: Array<IPlayer>;
}

export interface IBossSpawnedEvent {
    id: string;
    name: string;
}

export interface IPlayerConnectionEvent extends IPlayer {}

export interface IPlayer {
    id: string;
    name: string;
    character: string;
}

export interface ISeasonEndCloseEvent {
    next: SeasonsEnum;
}

export interface IMoonPhaseChangeCloseEvent {
    next: MoonPhasesEnum;
}
