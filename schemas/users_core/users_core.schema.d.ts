import mongoose from 'mongoose';
import mongodb from 'mongodb';
import { CustomQuery, dbSetter, dbGetter, dbGetterFull, IDOrIDObject } from '../../index';

export interface UserCurrencies {
  RBN: number;
  SPH: number;
  JDE: number;
  PSM: number;
  EVT: number;
}

export interface UserProfile {
  background: string | null;
  flair: string;
  flairDown: string;
  sticker: string | null;
  color: string;
  about: string;
  tagline: string;
  medals: (string | 0)[];
  skins: Record<string, any>;
  featuredMarriage: string | null;
}

export interface UserProgression {
  level: number;
  exp: number;
  craftingExp: number;
}

export interface UserMeta {
  createdAt: Date;
  lastLogin: Date | null;
  lastUpdated: Date;
  migrated: boolean;
  apiKey: string | null;
  apiPerms: string;
}

export interface PrimeData {
  tier: string | null;
  lastClaimed: number;
  active: boolean;
  maxServers: number;
  canReallocate: boolean;
  custom_background: boolean;
  custom_handle: boolean;
  custom_shop: boolean;
  servers: string[];
  misc: any;
}

export interface UserCore {
  id: string;
  name: string;
  tag: string;
  avatar: string | null;
  personalhandle?: string;
  currency: UserCurrencies;
  profile: UserProfile;
  progression: UserProgression;
  meta: UserMeta;
  prime: PrimeData | null;
  blacklisted: string | null;
  switches: Record<string, any>;
  counters: Record<string, any>;
  eventData: Record<string, any>;
  /** @deprecated read from prime.tier instead */
  donator?: string | null;
}

export interface UserCoreSchema extends mongoose.Document, UserCore {
  id: string;
  addCurrency: (curr: keyof UserCurrencies, amt?: number) => Promise<mongodb.UpdateWriteOpResult['result']>;
  addXP: (amt?: number) => Promise<mongodb.UpdateWriteOpResult['result']>;
  incrementAttr: (attr: string, amt?: number) => Promise<mongodb.UpdateWriteOpResult['result']>;
}

/**
 * Parameter for UsersCore.updateMeta(). Accepts Discord/Eris-like user objects.
 * Implementation sets: name, tag, avatar, meta.lastUpdated.
 */
export interface UserMetaUpdate {
  id: string;
  username?: string;
  global_name?: string | null;
  discriminator?: string;
  tag?: string;
  avatar?: string | null;
  displayAvatarURL?: string | null;
}

export interface UserCoreModel extends mongoose.Model<UserCoreSchema> {
  updateMeta: (U: UserMetaUpdate) => Promise<void>;
  new: (userData: Partial<UserCore>) => Promise<UserCoreSchema>;
  cat: 'users';
  set: dbSetter<UserCoreSchema>;
  get: (query: CustomQuery<UserCoreSchema>, project?: any) => Promise<UserCore | null>;
  getFull: dbGetterFull<UserCoreSchema>;
}
