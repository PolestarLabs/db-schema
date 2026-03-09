import mongoose from 'mongoose';
import { dbSetter, dbGetter } from '../../index';

export interface Channel {
  meta: any; snipe: any; name: string; server: string; guild: string;
  slowmode: boolean; ignored: boolean; settings: any; slowmodeTimer: number;
  LANGUAGE: string; id: string; modules: any;
}
export interface ChannelSchema extends mongoose.Document, Channel { id: string; }
export interface ChannelModel extends mongoose.Model<ChannelSchema> {
  updateMeta(C: { name: string; topic: string; position: number; nsfw: boolean }): Promise<void>;
  new: (chanData: any) => void;
  set: dbSetter<ChannelSchema>; get: dbGetter<ChannelSchema, Channel>;
}
