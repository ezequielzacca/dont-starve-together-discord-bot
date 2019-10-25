import {
  IPlayerConnectionEvent,
  ISecoinsUpdatedEvent
} from "./../../interfaces/events.interfaces";
import { IPlayer } from "./../../interfaces/player.interface";
import mongoose from "mongoose";
import { async } from "rxjs/internal/scheduler/async";

export const PlayerSchema = new mongoose.Schema({
  name: String,
  uid: String,
  character: String,
  score: {
    type: Number,
    default: 0
  },
  secoins: {
    type: Number,
    default: 200
  }
});

export const Player = mongoose.model<IPlayer>(
  "player",
  PlayerSchema,
  "players"
);

export const PlayerFunctions = {
  create: async (player: IPlayerConnectionEvent) => {
    const created = Object.assign(new Player(), player);
    created.save();
    return created;
  },

  find: async (uid: string) => {
    return await Player.findOne({
      uid: uid
    });
  },
  updateScore: async (player: IPlayerConnectionEvent, score: number) => {
    let storedPlayer = await PlayerFunctions.find(player.uid);
    if (!storedPlayer) {
      storedPlayer = await PlayerFunctions.create(player);
    }
    storedPlayer.score += score;
    storedPlayer.save();
  },
  updateSecoins: async (player: ISecoinsUpdatedEvent, secoins: number) => {
    console.log("update secoins called for: ", player, " ", secoins);
    let storedPlayer = await PlayerFunctions.find(player.uid);
    if (!storedPlayer) {
      storedPlayer = await PlayerFunctions.create(player);
    }
    storedPlayer.secoins = secoins;
    storedPlayer.save();
  },
  list: async () => {
    return Player.find();
  }
};
