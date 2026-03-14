import mongoose from 'mongoose';
import { dbSetter, IDOrIDObject } from '../../index';

export interface UserGuildData {
  userId: string;
  guildId: string;
  name: string;
  icon: string | null;
  banner: string | null;
  owner: boolean;
  permissions: number;
  permissions_new: string | null;
  features: string[];
  cachedAt: Date;
}
export interface UserGuildSchema extends mongoose.Document, UserGuildData {}
export interface UserGuildModel extends mongoose.Model<UserGuildSchema> {
  get: (query: any, project?: any) => Promise<UserGuildData | null>;
  set: (query: any, alter: mongoose.UpdateQuery<UserGuildSchema>, options?: mongoose.QueryOptions) => Promise<any>;
  allForUser: (userId: IDOrIDObject) => Promise<UserGuildData[]>;
  bulkUpsert: (userId: string, guilds: any[]) => Promise<any>;
}
