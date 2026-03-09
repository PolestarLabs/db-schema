import mongoose from 'mongoose';
import { dbSetter, dbGetter } from '../../index';

export type ChannelType = number;

export interface ServerMetadataChannel { name: string; pos: number; id: string; cat: string; type: ChannelType; nsfw: boolean; }
export interface ServerMetadata {
  id: string; name: string; number: string; roles: [string, string][];
  adms: string[]; channels: ServerMetadataChannel[]; icon: string;
}
export interface ServerMetadataSchema extends mongoose.Document, ServerMetadata { id: string; }
export interface ServerMetadataModel extends mongoose.Model<ServerMetadataSchema> {
  set: dbSetter<ServerMetadataSchema>; get: dbGetter<ServerMetadataSchema, ServerMetadata>;
  cat: 'sv_meta';
  updateMeta: (S: ServerMetadata) => Promise<string | boolean>;
}
