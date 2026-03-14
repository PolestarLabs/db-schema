import mongoose from 'mongoose';
import { dbSetter, dbGetter } from '../../index';

export interface Ranking { id: string; type: string; points: number; timestamp: number; data: any; }
export interface RankingSchema extends mongoose.Document, Ranking { id: string; }
export interface RankingModel extends mongoose.Model<RankingSchema> {
  set: dbSetter<RankingSchema>;
  get: dbGetter<RankingSchema, Ranking>;
}
