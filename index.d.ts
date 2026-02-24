import { User as ErisUser, Member, ChannelTypes } from 'eris';
import mongoose from 'mongoose';
import mongodb from 'mongodb';
import redis from 'redis';

// Utils

export type CustomQuery<T extends mongoose.Document> = string | number | mongoose.FilterQuery<T>;

export declare type dbSetter<T extends mongoose.Document> = (
  query: CustomQuery<T>,
  alter: mongoose.UpdateQuery<T>,
  options?: mongoose.QueryOptions | null,
) => Promise<mongodb.UpdateWriteOpResult['result']>;

export declare type dbGetter<T extends mongoose.Document, R> = (
  query: CustomQuery<T>,
  project?: any | null,
) => Promise<mongoose.LeanDocumentOrArray<R | null>>;

export declare type dbGetterFull<T extends mongoose.Document> = (
  query: CustomQuery<T>,
  project?: any | null,
  avoidNew?: boolean,
) => Promise<T>;

export type IDOrIDObject = string | { id: string };
export interface US {
  U: IDOrIDObject;
  S: IDOrIDObject;
}
export interface USE extends US {
  E?: number;
}
export interface USER extends USE {
  R: string;
}


export interface GiftItem {
  id: string;
  creator: string;
  holder: string;
  previous: string[];
  type: string;
  querystring: any;
  icon: string;
  message: string;
}
export interface GiftItemSchema extends mongoose.Document, GiftItem {
  id: string;
}
export interface GiftItemModel extends mongoose.Model<GiftItemSchema> {
  set: dbSetter<GiftItemSchema>;
  get: dbGetter<GiftItemSchema, GiftItem>;
}

export interface PaidRoles {
  server: string;
  role: string;
  price: string;
  temp: number;
  unique: any;
}
export interface PaidRolesSchema extends mongoose.Document, PaidRoles {}
export interface PaidRolesModel extends mongoose.Model<PaidRolesSchema> {
  set: dbSetter<PaidRolesSchema>;
  get: dbGetter<PaidRolesSchema, PaidRoles>;
  // TODO paidroles.new
}

export interface Globals {
  id: number;
  data: any;
}
export interface GlobalsSchema extends mongoose.Document, Globals {
  id: number;
}
export interface GlobalsModel extends mongoose.Model<GlobalsSchema> {
  set(alter: Globals): Promise<mongodb.UpdateWriteOpResult['result']>;
  get(): Promise<GlobalsSchema | any>;
}

export interface UserCollection {
  id: string;
  collections: any;
}
export interface UserCollectionSchema extends mongoose.Document, UserCollection {
  id: string;
}
export interface UserCollectionModel extends mongoose.Model<UserCollectionSchema> {
  set: dbSetter<UserCollectionSchema>;
  get: dbGetter<UserCollectionSchema, UserCollection>;
  new: (payload: UserCollection) => void;
}

export interface Fanart {
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
export interface FanartSchema extends mongoose.Document, Fanart {
  id: string;
}
export interface FanartModel extends mongoose.Model<FanartSchema> {
  set: dbSetter<FanartSchema>;
  get: dbGetter<FanartSchema, Fanart>;
}

export interface Buyable {
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
export interface BuyableSchema extends mongoose.Document, Buyable {
  id: string;
}
export interface BuyableModel extends mongoose.Model<BuyableSchema> {
  set: dbSetter<BuyableSchema>;
  get: dbGetter<BuyableSchema, Buyable>;
}

export interface CommendsParsed {
  id: string;
  whoIn: { id: string; count: number };
  whoOut: { id: string; count: number };
  readonly totalIn: number;
  readonly totalOut: number;
}
export interface Commends {
  from: string;
  to: string;
  count: number;
}
export interface CommendsSchema extends mongoose.Document, Commends {}
export interface CommendsModel extends mongoose.Model<CommendsSchema> {
  set: dbSetter<CommendsSchema>;
  get: dbGetter<CommendsSchema, Commends>;
  add: (idFrom: string, idTo: string) => Promise<number>;
  parseFull: (userId: string | Member | ErisUser) => Promise<CommendsParsed>;
}

export interface ReactionRole {
  role: string;
  emoji: string;
}
export interface ReactionRoles {
  channel: string;
  message: string;
  server: string;
  rolemoji: ReactionRole[];
}
export interface ReactionRolesSchema extends mongoose.Document, ReactionRoles {}
export interface ReactionRolesModel extends mongoose.Model<ReactionRolesSchema> {
  set: dbSetter<ReactionRolesSchema>;
  get: dbGetter<ReactionRolesSchema, ReactionRoles>;
}

export interface Marketplace {
  id: string;
  item_id: string;
  item_type: string;
  price: number;
  currency: string;
  author: string;
  timestamp: number;
}
export interface MarketplaceSchema extends mongoose.Document, Marketplace {
  id: string;
}
export interface MarketplaceModel extends mongoose.Model<MarketplaceSchema> {
  set: dbSetter<MarketplaceSchema>;
  get: dbGetter<MarketplaceSchema, Marketplace>;
  new: (payload: Marketplace) => void;
}

export interface Relationship {
  id: string;
  users: [string, string]; // NOTE this could increase to 3 in the future
  ring: 'jade' | 'sapphire' | 'stardust' | 'rubine';
  ringCollection: string[];
  initiative: string;
  since: number;
  lovepoints: number;
  type: 'marriage' | 'parents' | 'children';
}
export interface RelationshipSchema extends mongoose.Document, Relationship {
  id: string;
} // @ts-ignore
export interface RelationshipModel extends mongoose.Model<RelationshipSchema> {
  set: dbSetter<RelationshipSchema>;
  get: dbGetter<RelationshipSchema, Relationship>;
  create: (type: 'marriage' | 'parents' | 'children', users: [string, string], initiative: string, ring: 'jade' | 'sapphire' | 'stardust' | 'rubine', date?: number) => Promise<RelationshipSchema>;
}

export interface AlertInfo {
  time: number;
  interval: number;
  text: string;
}
export interface Alerts {
  type: 'recurring' | 'onetime';
  scope: 'server' | 'dm';
  channel: string;
  alerts: AlertInfo[];
}
export interface AlertsSchema extends mongoose.Document, Alerts {}
export interface AlertsModel extends mongoose.Model<AlertsSchema> {
  set: dbSetter<AlertsSchema>;
  get: dbGetter<AlertsSchema, Alerts>;
}

export interface Feed<T extends 'rss' | 'twitch' | 'youtube' | 'reminder' = 'rss' | 'twitch' | 'youtube' | 'reminder'> {
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
export interface FeedSchema extends mongoose.Document, Feed {}
export interface FeedModel extends mongoose.Model<FeedSchema> {
  set: dbSetter<FeedSchema>;
  get: dbGetter<FeedSchema, Feed>;
}

export interface Control {
  id: string;
  data: any;
}
export interface ControlSchema extends mongoose.Document, Control {
  id: string;
}
export interface ControlModel extends mongoose.Model<ControlSchema> {
  set: dbSetter<ControlSchema>;
  get: dbGetter<ControlSchema, Control>;
}

export interface miscDB {
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

export interface GreetModule {
  enabled: boolean;
  text: string;
  channel: string;
  timer: number;
}
export type RoleNameIDPair = [string, string];
export interface ServerModule {
  BUSTER: any;
  shitpostFeed: any;
  GREET: GreetModule;
  FWELL: GreetModule;
  LVUP: boolean;
  LVUP_local: boolean;
  autoRoleStack: boolean;
  DROPS: boolean;
  ANNOUNCE: boolean;
  PREFIX: string;
  LANGUAGE: string;
  MODROLE: string;
  DISABLED: string[];
  /** @deprecated */
  MUTEDUSERS: unknown[];
  MUTEROLE: string;
  SELFROLES: RoleNameIDPair[];
  AUTOROLES: RoleNameIDPair[];
  ROLEMARKET: RoleNameIDPair[]; // TODO double check
  REACTIONS: any;
  ACTLOG: string;
  MODLOG: string;
  ADVLOG: string;
  LOGCHANNEL: string;
  customMedals: any;
  legendaryFish: string;
  pondSize: number;
  background: string;
  bgInventory: unknown[]; // TODO find out
  /** @deprecated */
  UPFACTOR: number;
  statistics: any;
  putometro_last: number;
  putometro_max: number;
}
export interface LogsActions {
  userJoin: boolean;
  userLeave: boolean;
  messDel: boolean;
  messEdit: boolean;
}
export interface LogsModeration {
  usrBan: boolean;
  usrKick: boolean;
  usrMute: boolean;
  usrUnmute: boolean;
}
export interface LogsAdvanced {
  newChan: boolean;
  newRole: boolean;
  permsEdit: boolean;
  revokeBan: boolean;
  uptRole: boolean;
  delChan: boolean;
  usrNick: boolean;
  usrPhoto: boolean;
  usrRoles: boolean;
}
export interface ServerLogs {
  act: LogsActions;
  mod: LogsModeration;
  adv: LogsAdvanced;
}
export interface Server {
  id: string;
  name: string;
  globalhandle: string;
  globalPrefix: boolean;
  respondDisabled: boolean;
  event: any;
  eventReg: string;
  partner: boolean;
  progression: any;
  partnerDetails: any;
  utilityChannels: any;
  logging: boolean;
  imgwelcome: boolean;
  splitLogs: boolean;
  switches: any;
  modules: ServerModule;
  logs: ServerLogs;
  channels: any;
  lastUpdated: Date; // NOTE Told flicky he can just enable the `timestamps` option for the schema
}
export interface ServerSchema extends mongoose.Document, Server {
  id: string;
}
export interface ServerModel extends mongoose.Model<ServerSchema> {
  updateMeta: ServerMetadataModel['updateMeta'];
  meta: ServerMetadataModel['get'];
  new: (svData: Server) => void;
  cat: 'guilds';
  set: dbSetter<ServerSchema>;
  get: dbGetter<ServerSchema, Server>;
}

export interface ServerMetadataChannel {
  name: string;
  pos: number;
  id: string;
  cat: string;
  type: Exclude<ChannelTypes, 1 | 3>;
  nsfw: boolean;
}
export interface ServerMetadata {
  id: string;
  name: string;
  number: string;
  roles: RoleNameIDPair[];
  adms: string[];
  channels: ServerMetadataChannel[];
  icon: string;
}
export interface ServerMetadataSchema extends mongoose.Document, ServerMetadata {
  id: string;
}
export interface ServerMetadataModel extends mongoose.Model<ServerMetadataSchema> {
  set: dbSetter<ServerMetadataSchema>;
  get: dbGetter<ServerMetadataSchema, ServerMetadata>;
  cat: 'sv_meta';
  updateMeta: (S: ServerMetadata) => Promise<string | boolean>;
}

export interface UserModules {
  powerups: any;
  lovepoints: number;
  PERMS: number;
  level: number;
  exp: number;
  persotext: string;
  tagline: string;
  rep: number;
  repdaily: number;
  favcolor: string;
  inventory: { id: string; count: number; crafted?: number };
  bgID: string;
  sticker: string;
  bgInventory: string[];
  skins: any;
  skinInventory: string[];
  achievements: { id: string; unlocked: number };
  SPH: number;
  RBN: number;
  JDE: number;
  coins: number;
  dyStreakHard: number;
  daily: number;
  flairTop: string;
  flairDown: string;
  flairsInventory: string[];
  medals: [string | 0];
  medalInventory: string[];
  stickerInventory: string[];
  stickerCollection: unknown; // TODO
  fishes: unknown; // TODO
  fishCollection: unknown; // TODO
  commend: number;
  commended: number;
  fun: { waifu: any; lovers: any; shiprate: any };
  statistics: any;
}
export type Donator = 'plastic' | 'aluminium' | 'iron' | 'carbon' | 'lithium' | 'iridium' | 'palladium' | 'zircon' | 'uranium' | 'xastatine' | 'antimatter' | 'neutrino';
export interface Quest {
  id: number;
  tracker: string; // TODO `${quest.action}.${quest.type}${quest.condition?"."+quest.condition:""}`
  completed: boolean;
  progress: number;
  target: number;
}
export interface User {
  id: string;
  name: string;
  personalhandle: string;
  meta: any;
  switches: any;
  progression: any;
  spdaily: any;
  rewardsMonth: number;
  rewardsClaimed: boolean;
  personal: any;
  tag: string;
  hidden: boolean;
  eventDaily: number;
  eventGoodie: number;
  cherries: number;
  cherrySet: any;
  lastUpdated: Date;
  blacklisted: string;
  married: unknown; // TODO
  eventData: any;
  featuredMarriage: string;
  counters: any;
  modules: UserModules;
  partner: boolean;
  polluxmod: boolean;
  donator: Donator;
  donatorActive: string; // TODO legacy?
  limits: any;
  quests: Quest[];
}
export interface UserItem {
  id: string;
  count: number;
}
export interface UserSchema extends mongoose.Document, User {
  id: string;
  addItem: (item: string, amt?: number, crafted?: boolean) => Promise<mongodb.UpdateWriteOpResult['result']>;
  modifyItems(items: UserItem[], debug: true): Promise<[UserItem[], { id: string }, { $inc: number }, { arrayFilters: { [key: string]: string }[] }]>;
  modifyItems(items: UserItem[], debug?: boolean): Promise<mongodb.UpdateWriteOpResult['result']>;
  removeItem: UserSchema['addItem'];
  upCommend: (USER: ErisUser | Member, amt?: number) => ReturnType<miscDB['commends']['parseFull']>;
  hasItem: (itemId: string, count?: number) => boolean;
  amtItem: (itemId: string, search?: string) => number;
  addXP: (amt?: number) => Promise<mongodb.UpdateWriteOpResult['result']>;
  incrementAttr: (attr: string, amt?: number, upper?: boolean) => Promise<mongodb.UpdateWriteOpResult['result']>;
}
export interface UserModel extends mongoose.Model<UserSchema> {
  updateMeta: (U: ErisUser) => Promise<void>;
  new: (userData: User) => Promise<UserSchema>;
  cat: 'users';
  check: never; // NOTE This will error
  set: dbSetter<UserSchema>;
  get: dbGetter<UserSchema, User>;
  getFull: dbGetterFull<UserSchema>;
}

export interface ChannelModules {
  BUSTER: any;
  DROPSLY: number;
  EXP: boolean;
  LVUP: boolean;
  DROPS: boolean;
  BYPASS: boolean;
  DISABLED: string[];
  ENABLED: string[];
  statistics: any;
}
export interface Channel {
  meta: any;
  snipe: any;
  name: string;
  server: string;
  guild: string;
  slowmode: boolean;
  ignored: boolean;
  settings: any;
  slowmodeTimer: number;
  LANGUAGE: string;
  id: string;
  modules: ChannelModules;
}
export interface ChannelSchema extends mongoose.Document, Channel {
  id: string;
}
export interface ChannelModel extends mongoose.Model<ChannelSchema> {
  updateMeta(C: {name: string; topic: string; position: number; nsfw: boolean}): Promise<void>;
  new: (chanData: any) => void;
  set: dbSetter<ChannelSchema>;
  get: dbGetter<ChannelSchema, Channel>;
}

export interface LocalRanks {
  server: string;
  user: string;
  level: number;
  exp: number;
  thx: number;
  lastUpdated: Date;
}
export interface LocalRanksSchema extends mongoose.Document, LocalRanks {}
export interface LocalRanksModel extends mongoose.Model<LocalRanksSchema> {
  set: dbSetter<LocalRanksSchema>;
  get: dbGetter<LocalRanksSchema, LocalRanks>;
  new: (US: US) => void;
  incrementExp: (US: US, X?: number) => mongoose.Query<mongodb.UpdateWriteOpResult['result'], LocalRanksSchema, {}>;
  incrementLv: (US: US, X?: number) => mongoose.Query<mongodb.UpdateWriteOpResult['result'], LocalRanksSchema, {}>;
}

export interface Ranking {
  id: string;
  type: string;
  points: number;
  timestamp: number;
  data: any;
}
export interface RankingSchema extends mongoose.Document, Ranking {
  id: string;
}
export interface RankingModel extends mongoose.Model<RankingSchema> {
  set: dbSetter<RankingSchema>;
  get: dbGetter<RankingSchema, Ranking>;
}

export interface Responses {
  trigger: string;
  response: string;
  server: string;
  id: string;
  embed: any;
  type: 'EMBED' | 'STRING' | 'FILE';
}
export interface ResponsesSchema extends mongoose.Document, Responses {
  id: string;
}
export interface ResponsesModel extends mongoose.Model<ResponsesSchema> {
  set: dbSetter<ResponsesSchema>;
  get: dbGetter<ResponsesSchema, Responses>;
}

export interface Audit {
  from: string;
  to: string;
  type: string;
  currency: string;
  transaction: string;
  amt: number;
  timestamp: number;
  transactionId: string;
  details: any;
}
export interface AuditSchema extends mongoose.Document, Audit {}
export interface AuditModel extends mongoose.Model<AuditSchema> {
  set: dbSetter<AuditSchema>;
  get: dbGetter<AuditSchema, Audit>;
  new: (payload: Partial<Audit>) => Promise<string>;
  receive: (user: string, type: string, currency?: string, amt?: number) => Promise<string>;
  forfeit: (user: string, type: string, currency?: string, amt?: number) => Promise<string>;
}

export interface Cosmetics {
  id: string;
  name: string;
  tags: string;
  series: string;
  series_id: string;
  type: string;
  icon: string;
  code: string;
  rarity: string;
  price: number;
  event: string;
  droppable: boolean;
  buyable: boolean;
  howto: string;
  category: string;
  items: string[];
  color: string;
  for: string;
  localizer: string;
  exclusive: string;
  public: boolean;
  filter: string;
  expires: number;
}
export interface CosmeticsSchema extends mongoose.Document, Cosmetics {
  id: string;
}
export interface CosmeticsModel extends mongoose.Model<CosmeticsSchema> {
  set: dbSetter<CosmeticsSchema>;
  get: dbGetter<CosmeticsSchema, Cosmetics>;
  bgs: (filter?: mongoose.FilterQuery<CosmeticsSchema>) => mongoose.QueryWithHelpers<CosmeticsSchema[], CosmeticsSchema, {}>;
  medals: (filter?: mongoose.FilterQuery<CosmeticsSchema>) => mongoose.QueryWithHelpers<CosmeticsSchema[], CosmeticsSchema, {}>;
  stickers: (filter?: mongoose.FilterQuery<CosmeticsSchema>) => mongoose.QueryWithHelpers<CosmeticsSchema[], CosmeticsSchema, {}>;
}

export interface Collectibles {
  name: string;
  id: string;
  rarity: string;
  icon: string;
  emoji: string;
  attribs: any;
}
export interface CollectiblesSchema extends mongoose.Document, Collectibles {
  id: string;
}
export interface CollectiblesModel extends mongoose.Model<CollectiblesSchema> {
  set: dbSetter<CollectiblesSchema>;
  get: dbGetter<CollectiblesSchema, Collectibles>;
}

export interface Item {
  name: string;
  id: string;
  rarity: string;
  icon: string;
  emoji: string;
  price: number;
  altEmoji: string;
  event: string;
  event_id: number;
  type: string;
  tradeable: boolean;
  buyable: boolean;
  destroyable: boolean;
  usefile: string;
  code: string;
  misc: any;
  subtype: string;
  series: string;
  filter: string;
  crafted: boolean;
  color: string;
  exclusive: string;
  public: boolean;
  materials: UserItem[];
  typeCraft: { type: string; count: number }[];
  gemcraft: { RBN: number; JDE: number; SPH: number }
}
export interface ItemSchema extends mongoose.Document, Item {
  id: string;
}
export interface ItemModel extends mongoose.Model<ItemSchema> {
  getAll: () => Promise<ItemSchema[]>;
  cat: (cat: string) => Promise<ItemSchema>;
  consume: (user: IDOrIDObject, itemID: string, amt?: number) => mongoose.QueryWithHelpers<mongodb.UpdateWriteOpResult['result'], ItemSchema, {}>;
  destroy: ItemModel['consume'];
  receive: (user: IDOrIDObject, itemID: string, amt?: number) => mongoose.QueryWithHelpers<mongodb.UpdateWriteOpResult['result'], ItemSchema, {}>;
  add: ItemModel['receive'];
  set: dbSetter<ItemSchema>;
  get: dbGetter<ItemSchema, Item>;
}

export interface Achievement {
  name: string;
  icon: string;
  exp: number;
  reveal_level: number;
  reveal_requisites: unknown[]; // TODO[epic=flicky] uhm?
  flavor_text_id: string;
  condition: string;
  advanced_conditions: string[];
  id: string;
}
export interface AchievementSchema extends mongoose.Document, Achievement {
  id: string;
}
export interface AchievementModel extends mongoose.Model<AchievementSchema> {
  award: (user: IDOrIDObject, achiev: string) => Promise<mongodb.UpdateWriteOpResult['result']>;
  set: dbSetter<AchievementSchema>;
  get: dbGetter<AchievementSchema, Achievement>;
}

export interface Quest {
  id: number;
  name: string;
  flavor_text: string;
  instruction: string;
  reveal_level: number;
  action: string;
  type: string;
  condition: string;
  target: number;
  tier: string;
  icon: string;
  reveal_requisites: string;
  advanced_conditions: string;
}
export interface QuestSchema extends mongoose.Document, Quest {
  id: number;
}
export interface QuestModel extends mongoose.Model<QuestSchema> {
  set: dbSetter<QuestSchema>;
  get: dbGetter<QuestSchema, Quest>;
}

export interface AdventureLocationTraceRoute {
  _id: string;
  name: string;
  type: string;
  distance: number;
}
export interface AdventureLocationTraceRouteOptions {
  relocating?: boolean;
  soft?: boolean;
  exploring?: boolean;
}
export interface AdventureLocation {
  id: string;
  type: string;
  name: string;
  description: string;
  landmark: string;
  connects: string[];
  drops: unknown[]; // TODO[epic=flicky] ??
  canSettle: boolean;
  coordinates: { x: number; y: number };
}
export interface AdventureLocationSchema extends mongoose.Document, AdventureLocation {
  id: string;
  isAdjacent: (locationID: string) => boolean;
}
export interface AdventureLocationModel extends mongoose.Model<AdventureLocationSchema> {
  traceRoutes: (start: string, depth: number, options?: AdventureLocationTraceRouteOptions) => Promise<AdventureLocationTraceRoute[]>;
  set: dbSetter<AdventureLocationSchema>;
  get: dbGetterFull<AdventureLocationSchema>;
  read: dbGetter<AdventureLocationSchema, AdventureLocation>;
}

export interface Mute {
  server: string;
  user: string;
  expires: number;
}
export interface MuteSchema extends mongoose.Document, Mute {}
export interface MuteModel extends mongoose.Model<MuteSchema> {
  set: dbSetter<MuteSchema>;
  get: dbGetter<MuteSchema, Mute>;
  new: (US: USE) => void;
  add: (US: USE) => void;
  expire(US: US): mongoose.QueryWithHelpers<mongodb.DeleteWriteOpResultObject['result'] & { deletedCount?: number }, MuteSchema, {}>;
  expire(US: number): mongoose.QueryWithHelpers<mongodb.DeleteWriteOpResultObject['result'] & { deletedCount?: number }, MuteSchema, {}>;
}

export interface JourneyEvent {
  time: number;
  id: number;
  trueTime: number;
  interaction: any;
}
export interface Journey {
  user: string;
  start: number;
  end: number;
  location: string;
  insurance: number;
  events: JourneyEvent[];
}
export interface JourneySchema extends mongoose.Document, Journey {}
export interface JourneyModel extends mongoose.Model<JourneySchema> {
  new: (user: string, journey: Omit<Journey, 'user' | 'events'>, events: JourneyEvent[]) => Promise<JourneySchema>;
  set: dbSetter<JourneySchema>;
  get: dbGetter<JourneySchema, Journey>;
}

export interface Temprole {
  server: string;
  user: string;
  role: string;
  expires: number;
}
export interface TemproleSchema extends mongoose.Document, Temprole {}
export interface TemproleModel extends mongoose.Model<TemproleSchema> {
  set: dbSetter<TemproleSchema>;
  get: dbGetter<TemproleSchema, Temprole>;
  new: (US: USER) => void;
  add: (US: USER) => void;
  expire(US: US): mongoose.QueryWithHelpers<mongodb.DeleteWriteOpResultObject['result'] & { deletedCount?: number }, MuteSchema, {}>;
  expire(US: number): mongoose.QueryWithHelpers<mongodb.DeleteWriteOpResultObject['result'] & { deletedCount?: number }, MuteSchema, {}>;
}

export interface PromoCode {
  code: string;
  locked: boolean;
  consumed: boolean;
  redeemedBy: any;
  maxUses: number;
  uses: number;
  prize: any;
}
export interface PromoCodeSchema extends mongoose.Document, PromoCode {}
export interface PromoCodeModel extends mongoose.Model<PromoCodeSchema> {
  set: dbSetter<PromoCodeSchema>;
  get: dbGetter<PromoCodeSchema, PromoCode>;
}

export interface Airports {
  id: string;
  name: string;
  tier: number;
  passengers: number;
  slotAmount: number;
  slotPrice: number;
  location: { type: string; coordinates: [number, number] };
}
export interface AirportsSchema extends mongoose.Document, Airports {
  id: string;
  withinRange: (kilometers: number) => mongoose.QueryWithHelpers<AirportsSchema[], AirportsSchema, {}>;
}
export interface AirportsModel extends mongoose.Model<AirportsSchema> {
  set: dbSetter<AirportsSchema>;
  get: dbGetter<AirportsSchema, Airports>;
  getFull: dbGetterFull<AirportsSchema>;
}

export interface Airline {
  id: string;
  acquiredAirplanes: { id: string; assigned: boolean }[];
  user: string;
  airlineName: string;
}
export interface AirlineSchema extends mongoose.Document, Airline {
  id: string;
}
export interface AirlineModel extends mongoose.Model<AirlineSchema> {
  set: dbSetter<AirlineSchema>;
  get: dbGetter<AirlineSchema, Airline>;
  new: (user: string, id: string, airlineName: string) => Promise<AirlineSchema>;
}

export interface AirportSlots {
  airline: string;
  airport: string;
  expiresIn: number;
}
export interface AirportSlotsSchema extends mongoose.Document, AirportSlots {}
export interface AirportSlotsModel extends mongoose.Model<AirportSlotsSchema> {
  set: dbSetter<AirportSlotsSchema>;
  get: dbGetter<AirportSlotsSchema, AirportSlots>;
  new: (id: string, airport: string, time: number) => Promise<AirportSlotsSchema>;
}

export interface AirlineRoute {
  startAirport: string;
  endAirport: string;
  airline: string;
  airplane: string;
  ticketPrice: number;
}
export interface AirlineRouteSchema extends mongoose.Document, AirlineRoute {}
export interface AirlineRouteModel extends mongoose.Model<AirlineRouteSchema> {
  set: dbSetter<AirlineRouteSchema>;
  get: dbGetter<AirlineRouteSchema, AirlineRoute>;
  new: (sa: string, ea: string, airline: string, airplane: string, prie: number) => Promise<AirlineRouteSchema>;
  check: (a: AirlineRoute) => Promise<AirlineRouteSchema | true>;
  shutdown: (options: { _id: string, airplane: string, airline: string }) => Promise<AirlineRouteSchema>;
}

export interface Airplane {
  id: string;
  humanName: string;
  price: number;
  passengerCap: number;
  maintenanceCost: number;
  make: string;
  tier: number;
  range: number;
}
export interface AirplaneSchema extends mongoose.Document, Airplane {
  id: string;
}
export interface AirplaneModel extends mongoose.Model<AirplaneSchema> {
  set: dbSetter<AirplaneSchema>;
  get: dbGetter<AirplaneSchema, Airplane>;
  buy: (airline: string, id: string) => Promise<AirplaneSchema>;
}

export interface MarketbaseProjection {
  bgBase?: boolean;
  mdBase?: boolean;
  stBase?: boolean;
  itBase?: boolean;
  fullbase?: boolean;
}
export interface Marketbase {
  bgBase: Cosmetics[];
  mdBase: Cosmetics[];
  stBase: Cosmetics[];
  itBase: Item[];
}

export interface Schemas {
  // TODO missing
  native: miscDB['global']['db'];
  serverDB: ServerModel;
  userDB: UserModel;
  channelDB: ChannelModel;
  svMetaDB: ServerMetadataModel;
  localranks: LocalRanksModel;
  rankings: RankingModel;
  responses: ResponsesModel;
  audits: AuditModel;
  miscDB: miscDB;
  buyables: miscDB['buyables'];
  fanart: miscDB['fanart'];
  globalDB: miscDB['global'];
  commends: miscDB['commends'];
  control: miscDB['control'];
  marketplace: miscDB['marketplace'];
  reactRoles: miscDB['reactRoles'];
  paidroles: miscDB['paidroles'];
  relationships: miscDB['relationships'];
  alerts: miscDB['alert'];
  feed: miscDB['feed'];
  usercols: miscDB['usercols'];
  gifts: miscDB['gift'];
  cosmetics: CosmeticsModel;
  collectibles: CollectiblesModel;
  items: ItemModel;
  achievements: AchievementModel;
  quests: QuestModel;
  advLocations: AdventureLocationModel;
  advJourneys: JourneyModel;
  mutes: MuteModel;
  temproles: TemproleModel;
  promocodes: PromoCodeModel;
  airlines: { AIRLINES: AirlineModel; ROUTES: AirlineRouteModel; AIRPORT: AirportsModel; AIRPLANES: AirplaneModel; SLOTS: AirportSlotsModel };
  users: UserModel;
  servers: ServerModel;
  guilds: ServerModel;
  channels: ChannelModel;
  globals: miscDB['global'];
  marketbase: (projection?: MarketbaseProjection) => Promise<Marketbase>;
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

declare function init(m: { hook: unknown; url: string; options: mongoose.ConnectOptions}, extras?: { redis: { host: string; port: number; options?: unknown } }): Promise<Schemas>; // TODO unknown = WebhookDigester, unknown = redis options

declare namespace init {
  export const redis: redis.RedisClient;
  export const DB: Schemas;
}

export = init;