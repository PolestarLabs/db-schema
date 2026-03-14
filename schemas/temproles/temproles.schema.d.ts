import mongoose from 'mongoose';
import mongodb from 'mongodb';
import { dbSetter, dbGetter, US, USER } from '../../index';

export interface Temprole { server: string; user: string; role: string; expires: number; }
export interface TemproleSchema extends mongoose.Document, Temprole {}
export interface TemproleModel extends mongoose.Model<TemproleSchema> {
  set: dbSetter<TemproleSchema>; get: dbGetter<TemproleSchema, Temprole>;
  new: (US: USER) => void; add: (US: USER) => void;
  expire(US: US): mongoose.QueryWithHelpers<mongodb.DeleteWriteOpResultObject['result'] & { deletedCount?: number }, TemproleSchema, {}>;
  expire(US: number): mongoose.QueryWithHelpers<mongodb.DeleteWriteOpResultObject['result'] & { deletedCount?: number }, TemproleSchema, {}>;
}
