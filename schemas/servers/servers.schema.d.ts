import mongoose from 'mongoose';
import { dbSetter, dbGetter } from '../../index';

// For full server/channel types see index.d.ts (Server, ServerModule, etc.)
export interface Server {
  id: string; name: string; globalhandle: string; globalPrefix: boolean;
  respondDisabled: boolean; event: any; eventReg: string; partner: boolean;
  progression: any; partnerDetails: any; utilityChannels: any; logging: boolean;
  imgwelcome: boolean; splitLogs: boolean; switches: any; modules: any; logs: any;
  channels: any; lastUpdated: Date;
}
export interface ServerSchema extends mongoose.Document, Server { id: string; }
export interface ServerModel extends mongoose.Model<ServerSchema> {
  set: dbSetter<ServerSchema>; get: dbGetter<ServerSchema, Server>;
  new: (svData: Server) => void;
}
