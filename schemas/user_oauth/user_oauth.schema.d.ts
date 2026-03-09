import mongoose from 'mongoose';
import { dbSetter, dbGetter, IDOrIDObject } from '../../index';

export interface UserOAuthData {
  userId: string;
  discordIdentityCache: {
    id: string;
    username: string;
    avatar: string;
    discriminator: string;
    global_name: string;
    banner: string;
    flags: number;
    premium_type: number;
  } | null;
  discord: {
    accessToken: string;
    refreshToken: string;
    expiresAt: Date;
    scope: string;
    email: string;
    locale: string;
    verified: boolean;
    mfa_enabled: boolean;
    premium_type: number;
  } | null;
  patreon: {
    accessToken: string;
    refreshToken: string;
    expiresAt: Date;
    scope: string;
    identity: any;
  } | null;
  geo: any;
  fetchedAt: Date;
}
export interface UserOAuthSchema extends mongoose.Document, UserOAuthData {}
export interface UserOAuthModel extends mongoose.Model<UserOAuthSchema> {
  get: (userId: IDOrIDObject, project?: any) => Promise<UserOAuthData | null>;
  getFull: (userId: IDOrIDObject) => Promise<UserOAuthSchema | null>;
  set: (userId: IDOrIDObject, alter: mongoose.UpdateQuery<UserOAuthSchema>, options?: mongoose.QueryOptions) => Promise<any>;
  getOrCreate: (userId: IDOrIDObject) => Promise<UserOAuthSchema>;
  new: (userId: IDOrIDObject) => Promise<UserOAuthSchema>;
}
