import mongoose from 'mongoose';
import mongodb from 'mongodb';
import { dbSetter, dbGetter, US, USE } from '../../index';

export interface Mute { server: string; user: string; expires: number; }
export interface MuteSchema extends mongoose.Document, Mute {}
export interface MuteModel extends mongoose.Model<MuteSchema> {
  set: dbSetter<MuteSchema>; get: dbGetter<MuteSchema, Mute>;
  new: (US: USE) => void; add: (US: USE) => void;
  expire(US: US): mongoose.QueryWithHelpers<mongodb.DeleteWriteOpResultObject['result'] & { deletedCount?: number }, MuteSchema, {}>;
  expire(US: number): mongoose.QueryWithHelpers<mongodb.DeleteWriteOpResultObject['result'] & { deletedCount?: number }, MuteSchema, {}>;
}
