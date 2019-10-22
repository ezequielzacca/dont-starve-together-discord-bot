import { IPlayer } from "./../../interfaces/player.interface";
import mongoose from "mongoose";

export const PlayerSchema = new mongoose.Schema({
    name: String,
    uid: String,
    character: String,
    score: {
        type: Number,
        default: 0
    }
});

export const Player = mongoose.model<IPlayer>(
    "player",
    PlayerSchema,
    "players"
);

export const PlayerFunctions = {
    create: async (player: IPlayer) => {
        const exists = await Player.findOne({
            uid: player.uid
        });
        if (!exists) {
            const created = Object.assign(new Player(), player);
            created.save();
        }
    }
};
