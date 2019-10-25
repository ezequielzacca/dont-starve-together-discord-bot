import { Document } from "mongoose";
export interface IPlayer extends Document {
  name: string;
  uid: string;
  character: string;
  score: number;
  secoins: number;
}
