import mongoose from 'mongoose';
import { IDOrIDObject } from '../../index';

export interface UserConnectionData {
  userId: string;
  type: string;
  externalId: string;
  name: string;
  verified: boolean;
  visibility: number;
  show_activity: boolean;
  friend_sync: boolean;
  two_way_link: boolean;
  metadata_visibility: number;
  extra: any;
}
export interface UserConnectionSchema extends mongoose.Document, UserConnectionData {}
export interface UserConnectionModel extends mongoose.Model<UserConnectionSchema> {
  get: (query: any, project?: any) => Promise<UserConnectionData | null>;
  set: (query: any, alter: mongoose.UpdateQuery<UserConnectionSchema>, options?: mongoose.QueryOptions) => Promise<any>;
  allForUser: (userId: IDOrIDObject) => Promise<UserConnectionData[]>;
  bulkUpsert: (userId: string, connections: any[]) => Promise<any>;
}
