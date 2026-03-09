import mongoose from 'mongoose';
import { dbSetter, dbGetter } from '../../index';

export interface LocalRanks { server: string; user: string; level: number; exp: number; thx: number; lastUpdated: Date; }
export interface LocalRanksSchema extends mongoose.Document, LocalRanks {}
export interface LocalRanksModel extends mongoose.Model<LocalRanksSchema> {
  set: dbSetter<LocalRanksSchema>; get: dbGetter<LocalRanksSchema, LocalRanks>;
  new: (US: { U: any; S: any }) => void;
  incrementExp: (US: { U: any; S: any }, X?: number) => mongoose.Query<any, LocalRanksSchema, {}>;
  incrementLv: (US: { U: any; S: any }, X?: number) => mongoose.Query<any, LocalRanksSchema, {}>;
}
