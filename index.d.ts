import mongoose from 'mongoose';
import redis from 'redis';
import bluebird from 'bluebird';

type CustomQuery<T extends mongoose.Document> = string | number | mongoose.FilterQuery<T>;

declare type dbSetter<T extends mongoose.Document, LeanResultType = mongoose.LeanDocumentOrArray> = (
  query: CustomQuery<T>,
  alter: mongoose.UpdateQuery<T>,
  options?: QueryOptions | null,
) => Promise<LeanResultType>;

declare type dbGetter<T extends mongoose.Document, LeanResultType = mongoose.LeanDocumentOrArray> = (
  query: CustomQuery<T>,
  project?: any | null,
) => Promise<LeanResultType>;

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
interface GiftItemSchema extends mongoose.Document<GiftItem> {}

interface PaidRoles {
  server: string;
  role: string;
  price: string;
  temp: number;
  unique: any;
}
interface PaidRolesSchema extends mongoose.Document<PaidRoles> {}

interface miscDB {
  gift: mongoose.Model<GiftItemSchema> & { set: dbSetter<GiftItemSchema>; get: dbGetter<GiftItemSchema> };
  paidroles: mongoose.Model<PaidRolesSchema> & { set: dbSetter<PaidRolesSchema>; get: dbGetter<PaidRolesSchema> }; // TODO paidroles.new
}

interface Schemas {
  // TODO missing
  miscDB: miscDB;
  paidroles: miscDB['paidroles'];
  gifts: miscDB['gift'];
}

declare module 'mongoose' {
  interface Query {
    noCache: boolean;
  }
}

declare global {
  export const redis: redis.RedisClient;
  export const DB: Schemas;
}

declare function init(m: { hook: unknown; url: string; options: mongoose.ConnectOptions}, extras?: { redis: { host: string; port: number; options?: unknown } }): Promise<Schemas> // TODO unknown = WebhookDigester, unknown = redis options
export = init;
