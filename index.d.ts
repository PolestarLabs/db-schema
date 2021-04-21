// @ts-check

import { User, Member } from 'eris';
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

declare type dbGetter<T extends mongoose.Document, R> = (
  query: CustomQuery<T>,
  project?: any | null,
) => Promise<mongoose.LeanDocumentOrArray<R | null>>;

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
interface GiftItemSchema extends mongoose.Document, GiftItem {
  id: string;
}
interface GiftItemModel extends mongoose.Model<GiftItemSchema> {
  set: dbSetter<GiftItemSchema>;
  get: dbGetter<GiftItemSchema, GiftItem>;
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
  get: dbGetter<PaidRolesSchema, PaidRoles>;
  // TODO paidroles.new
}

interface Globals {
  id: number;
  data: any;
}
interface GlobalsSchema extends mongoose.Document, Globals {
  id: number;
}
interface GlobalsModel extends mongoose.Model<GlobalsSchema> {
  set(alter: Globals): Promise<mongodb.UpdateWriteOpResult['result']>;
  get(): Promise<GlobalsSchema | any>;
}

interface UserCollection {
  id: string;
  collections: any;
}
interface UserCollectionSchema extends mongoose.Document, UserCollection {
  id: string;
}
interface UserCollectionModel extends mongoose.Model<UserCollectionSchema> {
  set: dbSetter<UserCollectionSchema>;
  get: dbGetter<UserCollectionSchema, UserCollection>;
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
interface FanartSchema extends mongoose.Document, Fanart {
  id: string;
}
interface FanartModel extends mongoose.Model<FanartSchema> {
  set: dbSetter<FanartSchema>;
  get: dbGetter<FanartSchema, Fanart>;
}

interface Buyable {
  id: string;
  price_USD: number;
  price_BRL: number;
  sendTo: string;
  name: string;
  description: string;
  img: string;
  filter: string;
  other: any;
}
interface BuyableSchema extends mongoose.Document, Buyable {
  id: string;
}
interface BuyableModel extends mongoose.Model<BuyableSchema> {
  set: dbSetter<BuyableSchema>;
  get: dbGetter<BuyableSchema, Buyable>;
}

interface CommendsParsed {
  id: string;
  whoIn: { id: string; count: number };
  whoOut: { id: string; count: number };
  readonly totalIn: number;
  readonly totalOut: number;
}
interface Commends {
  from: string;
  to: string;
  count: number;
}
interface CommendsSchema extends mongoose.Document, Commends {}
interface CommendsModel extends mongoose.Model<CommendsSchema> {
  set: dbSetter<CommendsSchema>;
  get: dbGetter<CommendsSchema, Commends>;
  add: (idFrom: string, idTo: string) => Promise<number>;
  parseFull: (userId: string | Member | User) => Promise<CommendsParsed>;
}

interface ReactionRole {
  role: string;
  emoji: string;
}
interface ReactionRoles {
  channel: string;
  message: string;
  server: string;
  rolemoji: ReactionRole[];
}
interface ReactionRolesSchema extends mongoose.Document, ReactionRoles {}
interface ReactionRolesModel extends mongoose.Model<ReactionRolesSchema> {
  set: dbSetter<ReactionRolesSchema>;
  get: dbGetter<ReactionRolesSchema, ReactionRoles>;
}

interface Marketplace {
  id: string;
  item_id: string;
  item_type: string;
  price: number;
  currency: string;
  author: string;
  timestamp: number;
}
interface MarketplaceSchema extends mongoose.Document, Marketplace {
  id: string;
}
interface MarketplaceModel extends mongoose.Model<MarketplaceSchema> {
  set: dbSetter<MarketplaceSchema>;
  get: dbGetter<MarketplaceSchema, Marketplace>;
  new: (payload: Marketplace) => void;
}

interface Relationship {
  id: string;
  users: [string, string]; // NOTE this could increase to 3 in the future
  ring: 'jade' | 'sapphire' | 'stardust' | 'rubine';
  ringCollection: string[];
  initiative: string;
  since: number;
  lovepoints: number;
  type: 'marriage' | 'parents' | 'children';
}
interface RelationshipSchema extends mongoose.Document, Relationship {
  id: string;
} // @ts-ignore
interface RelationshipModel extends mongoose.Model<RelationshipSchema> {
  set: dbSetter<RelationshipSchema>;
  get: dbGetter<RelationshipSchema, Relationship>;
  create: (type: 'marriage' | 'parents' | 'children', users: [string, string], initiative: string, ring: 'jade' | 'sapphire' | 'stardust' | 'rubine', date?: number) => Promise<RelationshipSchema>;
}

interface AlertInfo {
  time: number;
  interval: number;
  text: string;
}
interface Alerts {
  type: 'recurring' | 'onetime';
  scope: 'server' | 'dm';
  channel: string;
  alerts: AlertInfo[];
}
interface AlertsSchema extends mongoose.Document, Alerts {}
interface AlertsModel extends mongoose.Model<AlertsSchema> {
  set: dbSetter<AlertsSchema>;
  get: dbGetter<AlertsSchema, Alerts>;
}

interface Feed<T extends 'rss' | 'twitch' | 'youtube' | 'reminder' = 'rss' | 'twitch' | 'youtube' | 'reminder'> {
  server: T extends 'reminder' ? undefined : string;
  type: T;
  url: string;
  last: any;
  channel: string;
  thumb: T extends 'reminder' ? undefined : T extends 'youtube' ? string | null : string;
  name: string;
  expires: T extends 'reminder' ? number : undefined;
  repeat: T extends 'reminder' ? number : undefined;
}
interface FeedSchema extends mongoose.Document, Feed {}
interface FeedModel extends mongoose.Model<FeedSchema> {
  set: dbSetter<FeedSchema>;
  get: dbGetter<FeedSchema, Feed>;
}

interface Control {
  id: string;
  data: any;
}
interface ControlSchema extends mongoose.Document, Control {
  id: string;
}
interface ControlModel extends mongoose.Model<ControlSchema> {
  set: dbSetter<ControlSchema>;
  get: dbGetter<ControlSchema, Control>;
}

interface miscDB {
  gift: GiftItemModel;
  paidroles: PaidRolesModel;
  usercols: UserCollectionModel;
  global: GlobalsModel;
  fanart: FanartModel;
  buyables: BuyableModel;
  commends: CommendsModel;
  reactRoles: ReactionRolesModel;
  marketplace: MarketplaceModel;
  relationships: RelationshipModel;
  alert: AlertsModel;
  feed: FeedModel;
  control: ControlModel;
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