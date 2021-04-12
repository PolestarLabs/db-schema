import mongoose from 'mongoose';
import mongodb from 'mongodb';
import redis from 'redis';
import bluebird from 'bluebird';

// Utils

type CustomQuery<T extends mongoose.Document> = string | number | mongoose.FilterQuery<T>;

declare type dbSetter<T extends mongoose.Document> = (
  query: CustomQuery<T>,
  alter: mongoose.UpdateQuery<T>,
  options?: mongoose.QueryOptions | null,
) => Promise<mongodb.UpdateWriteOpResult['result']>;

declare type dbGetter<T extends mongoose.Document> = (
  query: CustomQuery<T>,
  project?: any | null,
) => Promise<mongoose.LeanDocumentOrArray<T | null>>;

declare type dbGetterFull<T extends mongoose.Document> = (
  query: CustomQuery<T>,
  project?: any | null,
  avoidNew?: boolean,
) => Promise<T>;


interface GiftItem {
  id: string;
  creator: string;
  holder: string;
  previous: string[];
  type: string;
  querystring: any;
  icon: string;
  message: string;
}
interface GiftItemSchema extends mongoose.Document, GiftItem {}
interface GiftItemModel extends mongoose.Model<GiftItemSchema> {
  set: dbSetter<GiftItemSchema>;
  get: dbGetter<GiftItemSchema>;
}

interface PaidRoles {
  server: string;
  role: string;
  price: string;
  temp: number;
  unique: any;
}
interface PaidRolesSchema extends mongoose.Document, PaidRoles {}
interface PaidRolesModel extends mongoose.Model<PaidRolesSchema> {
  set: dbSetter<PaidRolesSchema>;
  get: dbGetter<PaidRolesSchema>;
  // TODO paidroles.new
}

interface Globals {
  id: number;
  data: any;
}
interface GlobalsSchema extends mongoose.Document, Globals {}
interface GlobalsModel extends mongoose.Model<GlobalsSchema> {
  set(alter: Globals): Promise<mongodb.UpdateWriteOpResult['result']>;
  get(): Promise<GlobalsSchema | any>;
}

interface UserCollection {
  id: string;
  collections: any;
}
interface UserCollectionSchema extends mongoose.Document, UserCollection {}
interface UserCollectionModel extends mongoose.Model<UserCollectionSchema> {
  set: dbSetter<UserCollectionSchema>;
  get: dbGetter<UserCollectionSchema>;
  new: (payload: UserCollection) => void;
}

interface Fanart {
  id: string;
  src: string;
  thumb: string;
  title: string;
  description: string;
  date: Date;
  author: string;
  author_ID: string;
  publish: boolean;
  extras: any;
}
interface FanartSchema extends mongoose.Document, Fanart {}
interface FanartModel extends mongoose.Model<FanartSchema> {
  set: dbSetter<FanartSchema>;
  get: dbGetter<FanartSchema>;
}

interface miscDB {
  gift: GiftItemModel;
  paidroles: PaidRolesModel;
  usercols: UserCollectionModel;
  global: GlobalsModel;
  fanart: FanartModel;
}

interface Schemas {
  // TODO missing
  miscDB: miscDB;
  paidroles: miscDB['paidroles'];
  gifts: miscDB['gift'];
  globalDB: miscDB['global'];
  globals: miscDB['global'];
  native: miscDB['global']['db'];
  usercols: miscDB['usercols'];
}

declare module 'mongoose' {
  interface Query<ResultType, DocType extends mongoose.Document<any, {}>, THelpers = {}> {
    noCache: boolean;
  }
}

declare global {
  export const redis: redis.RedisClient;
  export const DB: Schemas;
}

declare function init(m: { hook: unknown; url: string; options: mongoose.ConnectOptions}, extras?: { redis: { host: string; port: number; options?: unknown } }): Promise<Schemas> // TODO unknown = WebhookDigester, unknown = redis options
export = init;
