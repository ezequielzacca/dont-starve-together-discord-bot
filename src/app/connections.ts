import { IPlayerConnectionEvent } from "../interfaces/events.interfaces";

let connectedPlayers: Array<IPlayerConnectionEvent> = [];

export const getConnectedPlayers = (): Array<IPlayerConnectionEvent> =>
  connectedPlayers;

export const removeConnectedPlayer = (player: IPlayerConnectionEvent): void => {
  connectedPlayers = connectedPlayers.filter(
    connected => connected.uid !== player.uid
  );
};

export const addConnectedPlayer = (player: IPlayerConnectionEvent): void => {
  connectedPlayers = [
    ...connectedPlayers.filter(connected => connected.uid !== player.uid),
    player
  ];
};
