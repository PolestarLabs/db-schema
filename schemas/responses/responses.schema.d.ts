import mongoose from 'mongoose';
import { dbSetter, dbGetter } from '../../index';

export interface Responses { trigger: string; response: string; server: string; id: string; embed: any; type: 'EMBED' | 'STRING' | 'FILE'; }
export interface ResponsesSchema extends mongoose.Document, Responses { id: string; }
export interface ResponsesModel extends mongoose.Model<ResponsesSchema> {
  set: dbSetter<ResponsesSchema>;
  get: dbGetter<ResponsesSchema, Responses>;
}
