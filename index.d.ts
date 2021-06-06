import { User as ErisUser, Member, ChannelTypes } from 'eris';
import mongoose from 'mongoose';
import mongodb from 'mongodb';
import redis from 'redis';

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

type IDOrIDObject = string | { id: string };
interface US {
  U: IDOrIDObject;
  S: IDOrIDObject;
}
interface USE extends US {
  E?: number;
}
interface USER extends USE {
  R: string;
}


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
  parseFull: (userId: string | Member | ErisUser) => Promise<CommendsParsed>;
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

interface GreetModule {
  enabled: boolean;
  text: string;
  channel: string;
  timer: number;
}
type RoleNameIDPair = [string, string];
interface ServerModule {
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
interface LogsActions {
  userJoin: boolean;
  userLeave: boolean;
  messDel: boolean;
  messEdit: boolean;
}
interface LogsModeration {
  usrBan: boolean;
  usrKick: boolean;
  usrMute: boolean;
  usrUnmute: boolean;
}
interface LogsAdvanced {
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
interface ServerLogs {
  act: LogsActions;
  mod: LogsModeration;
  adv: LogsAdvanced;
}
interface Server {
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
interface ServerSchema extends mongoose.Document, Server {
  id: string;
}
interface ServerModel extends mongoose.Model<ServerSchema> {
  updateMeta: ServerMetadataModel['updateMeta'];
  meta: ServerMetadataModel['get'];
  new: (svData: Server) => void;
  cat: 'guilds';
  set: dbSetter<ServerSchema>;
  get: dbGetter<ServerSchema, Server>;
}

interface ServerMetadataChannel {
  name: string;
  pos: number;
  id: string;
  cat: string;
  type: Exclude<ChannelTypes, 1 | 3>;
  nsfw: boolean;
}
interface ServerMetadata {
  id: string;
  name: string;
  number: string;
  roles: RoleNameIDPair[];
  adms: string[];
  channels: ServerMetadataChannel[];
  icon: string;
}
interface ServerMetadataSchema extends mongoose.Document, ServerMetadata {
  id: string;
}
interface ServerMetadataModel extends mongoose.Model<ServerMetadataSchema> {
  set: dbSetter<ServerMetadataSchema>;
  get: dbGetter<ServerMetadataSchema, ServerMetadata>;
  cat: 'sv_meta';
  updateMeta: (S: ServerMetadata) => Promise<string | boolean>;
}

interface UserModules {
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
type Donator = 'plastic' | 'aluminium' | 'iron' | 'carbon' | 'lithium' | 'iridium' | 'palladium' | 'zircon' | 'uranium' | 'xastatine' | 'antimatter' | 'neutrino';
interface Quest {
  id: number;
  tracker: string; // TODO `${quest.action}.${quest.type}${quest.condition?"."+quest.condition:""}`
  completed: boolean;
  progress: number;
  target: number;
}
interface User {
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
interface UserItem {
  id: string;
  count: number;
}
interface UserSchema extends mongoose.Document, User {
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
interface UserModel extends mongoose.Model<UserSchema> {
  updateMeta: (U: ErisUser) => Promise<void>;
  new: (userData: User) => Promise<UserSchema>;
  cat: 'users';
  check: never; // NOTE This will error
  set: dbSetter<UserSchema>;
  get: dbGetter<UserSchema, User>;
  getFull: dbGetterFull<UserSchema>;
}

interface ChannelModules {
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
interface Channel {
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
interface ChannelSchema extends mongoose.Document, Channel {
  id: string;
}
interface ChannelModel extends mongoose.Model<ChannelSchema> {
  updateMeta(C: {name: string; topic: string; position: number; nsfw: boolean}): Promise<void>;
  new: (chanData: any) => void;
  set: dbSetter<ChannelSchema>;
  get: dbGetter<ChannelSchema, Channel>;
}

interface LocalRanks {
  server: string;
  user: string;
  level: number;
  exp: number;
  thx: number;
  lastUpdated: Date;
}
interface LocalRanksSchema extends mongoose.Document, LocalRanks {}
interface LocalRanksModel extends mongoose.Model<LocalRanksSchema> {
  set: dbSetter<LocalRanksSchema>;
  get: dbGetter<LocalRanksSchema, LocalRanks>;
  new: (US: US) => void;
  incrementExp: (US: US, X?: number) => mongoose.Query<mongodb.UpdateWriteOpResult['result'], LocalRanksSchema, {}>;
  incrementLv: (US: US, X?: number) => mongoose.Query<mongodb.UpdateWriteOpResult['result'], LocalRanksSchema, {}>;
}

interface Ranking {
  id: string;
  type: string;
  points: number;
  timestamp: number;
  data: any;
}
interface RankingSchema extends mongoose.Document, Ranking {
  id: string;
}
interface RankingModel extends mongoose.Model<RankingSchema> {
  set: dbSetter<RankingSchema>;
  get: dbGetter<RankingSchema, Ranking>;
}

interface Responses {
  trigger: string;
  response: string;
  server: string;
  id: string;
  embed: any;
  type: 'EMBED' | 'STRING' | 'FILE';
}
interface ResponsesSchema extends mongoose.Document, Responses {
  id: string;
}
interface ResponsesModel extends mongoose.Model<ResponsesSchema> {
  set: dbSetter<ResponsesSchema>;
  get: dbGetter<ResponsesSchema, Responses>;
}

interface Audit {
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
interface AuditSchema extends mongoose.Document, Audit {}
interface AuditModel extends mongoose.Model<AuditSchema> {
  set: dbSetter<AuditSchema>;
  get: dbGetter<AuditSchema, Audit>;
  new: (payload: Partial<Audit>) => Promise<string>;
  receive: (user: string, type: string, currency?: string, amt?: number) => Promise<string>;
  forfeit: (user: string, type: string, currency?: string, amt?: number) => Promise<string>;
}

interface Cosmetics {
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
interface CosmeticsSchema extends mongoose.Document, Cosmetics {
  id: string;
}
interface CosmeticsModel extends mongoose.Model<CosmeticsSchema> {
  set: dbSetter<CosmeticsSchema>;
  get: dbGetter<CosmeticsSchema, Cosmetics>;
  bgs: (filter?: mongoose.FilterQuery<CosmeticsSchema>) => mongoose.QueryWithHelpers<CosmeticsSchema[], CosmeticsSchema, {}>;
  medals: (filter?: mongoose.FilterQuery<CosmeticsSchema>) => mongoose.QueryWithHelpers<CosmeticsSchema[], CosmeticsSchema, {}>;
  stickers: (filter?: mongoose.FilterQuery<CosmeticsSchema>) => mongoose.QueryWithHelpers<CosmeticsSchema[], CosmeticsSchema, {}>;
}

interface Collectibles {
  name: string;
  id: string;
  rarity: string;
  icon: string;
  emoji: string;
  attribs: any;
}
interface CollectiblesSchema extends mongoose.Document, Collectibles {
  id: string;
}
interface CollectiblesModel extends mongoose.Model<CollectiblesSchema> {
  set: dbSetter<CollectiblesSchema>;
  get: dbGetter<CollectiblesSchema, Collectibles>;
}

interface Item {
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
interface ItemSchema extends mongoose.Document, Item {
  id: string;
}
interface ItemModel extends mongoose.Model<ItemSchema> {
  getAll: () => Promise<ItemSchema[]>;
  cat: (cat: string) => Promise<ItemSchema>;
  consume: (user: IDOrIDObject, itemID: string, amt?: number) => mongoose.QueryWithHelpers<mongodb.UpdateWriteOpResult['result'], ItemSchema, {}>;
  destroy: ItemModel['consume'];
  receive: (user: IDOrIDObject, itemID: string, amt?: number) => mongoose.QueryWithHelpers<mongodb.UpdateWriteOpResult['result'], ItemSchema, {}>;
  add: ItemModel['receive'];
  set: dbSetter<ItemSchema>;
  get: dbGetter<ItemSchema, Item>;
}

interface Achievement {
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
interface AchievementSchema extends mongoose.Document, Achievement {
  id: string;
}
interface AchievementModel extends mongoose.Model<AchievementSchema> {
  award: (user: IDOrIDObject, achiev: string) => Promise<mongodb.UpdateWriteOpResult['result']>;
  set: dbSetter<AchievementSchema>;
  get: dbGetter<AchievementSchema, Achievement>;
}

interface Quest {
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
interface QuestSchema extends mongoose.Document, Quest {
  id: number;
}
interface QuestModel extends mongoose.Model<QuestSchema> {
  set: dbSetter<QuestSchema>;
  get: dbGetter<QuestSchema, Quest>;
}

interface AdventureLocationTraceRoute {
  _id: string;
  name: string;
  type: string;
  distance: number;
}
interface AdventureLocationTraceRouteOptions {
  relocating?: boolean;
  soft?: boolean;
  exploring?: boolean;
}
interface AdventureLocation {
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
interface AdventureLocationSchema extends mongoose.Document, AdventureLocation {
  id: string;
  isAdjacent: (locationID: string) => boolean;
}
interface AdventureLocationModel extends mongoose.Model<AdventureLocationSchema> {
  traceRoutes: (start: string, depth: number, options?: AdventureLocationTraceRouteOptions) => Promise<AdventureLocationTraceRoute[]>;
  set: dbSetter<AdventureLocationSchema>;
  get: dbGetterFull<AdventureLocationSchema>;
  read: dbGetter<AdventureLocationSchema, AdventureLocation>;
}

interface Mute {
  server: string;
  user: string;
  expires: number;
}
interface MuteSchema extends mongoose.Document, Mute {}
interface MuteModel extends mongoose.Model<MuteSchema> {
  set: dbSetter<MuteSchema>;
  get: dbGetter<MuteSchema, Mute>;
  new: (US: USE) => void;
  add: (US: USE) => void;
  expire(US: US): mongoose.QueryWithHelpers<mongodb.DeleteWriteOpResultObject['result'] & { deletedCount?: number }, MuteSchema, {}>;
  expire(US: number): mongoose.QueryWithHelpers<mongodb.DeleteWriteOpResultObject['result'] & { deletedCount?: number }, MuteSchema, {}>;
}

interface JourneyEvent {
  time: number;
  id: number;
  trueTime: number;
  interaction: any;
}
interface Journey {
  user: string;
  start: number;
  end: number;
  location: string;
  insurance: number;
  events: JourneyEvent[];
}
interface JourneySchema extends mongoose.Document, Journey {}
interface JourneyModel extends mongoose.Model<JourneySchema> {
  new: (user: string, journey: Omit<Journey, 'user' | 'events'>, events: JourneyEvent[]) => Promise<JourneySchema>;
  set: dbSetter<JourneySchema>;
  get: dbGetter<JourneySchema, Journey>;
}

interface Temprole {
  server: string;
  user: string;
  role: string;
  expires: number;
}
interface TemproleSchema extends mongoose.Document, Temprole {}
interface TemproleModel extends mongoose.Model<TemproleSchema> {
  set: dbSetter<TemproleSchema>;
  get: dbGetter<TemproleSchema, Temprole>;
  new: (US: USER) => void;
  add: (US: USER) => void;
  expire(US: US): mongoose.QueryWithHelpers<mongodb.DeleteWriteOpResultObject['result'] & { deletedCount?: number }, MuteSchema, {}>;
  expire(US: number): mongoose.QueryWithHelpers<mongodb.DeleteWriteOpResultObject['result'] & { deletedCount?: number }, MuteSchema, {}>;
}

interface PromoCode {
  code: string;
  locked: boolean;
  consumed: boolean;
  redeemedBy: any;
  maxUses: number;
  uses: number;
  prize: any;
}
interface PromoCodeSchema extends mongoose.Document, PromoCode {}
interface PromoCodeModel extends mongoose.Model<PromoCodeSchema> {
  set: dbSetter<PromoCodeSchema>;
  get: dbGetter<PromoCodeSchema, PromoCode>;
}

interface Airports {
  id: string;
  name: string;
  tier: number;
  passengers: number;
  slotAmount: number;
  slotPrice: number;
  location: { type: string; coordinates: [number, number] };
}
interface AirportsSchema extends mongoose.Document, Airports {
  id: string;
  withinRange: (kilometers: number) => mongoose.QueryWithHelpers<AirportsSchema[], AirportsSchema, {}>;
}
interface AirportsModel extends mongoose.Model<AirportsSchema> {
  set: dbSetter<AirportsSchema>;
  get: dbGetter<AirportsSchema, Airports>;
  getFull: dbGetterFull<AirportsSchema>;
}

interface Airline {
  id: string;
  acquiredAirplanes: { id: string; assigned: boolean }[];
  user: string;
  airlineName: string;
}
interface AirlineSchema extends mongoose.Document, Airline {
  id: string;
}
interface AirlineModel extends mongoose.Model<AirlineSchema> {
  set: dbSetter<AirlineSchema>;
  get: dbGetter<AirlineSchema, Airline>;
  new: (user: string, id: string, airlineName: string) => Promise<AirlineSchema>;
}

interface AirportSlots {
  airline: string;
  airport: string;
  expiresIn: number;
}
interface AirportSlotsSchema extends mongoose.Document, AirportSlots {}
interface AirportSlotsModel extends mongoose.Model<AirportSlotsSchema> {
  set: dbSetter<AirportSlotsSchema>;
  get: dbGetter<AirportSlotsSchema, AirportSlots>;
  new: (id: string, airport: string, time: number) => Promise<AirportSlotsSchema>;
}

interface AirlineRoute {
  startAirport: string;
  endAirport: string;
  airline: string;
  airplane: string;
  ticketPrice: number;
}
interface AirlineRouteSchema extends mongoose.Document, AirlineRoute {}
interface AirlineRouteModel extends mongoose.Model<AirlineRouteSchema> {
  set: dbSetter<AirlineRouteSchema>;
  get: dbGetter<AirlineRouteSchema, AirlineRoute>;
  new: (sa: string, ea: string, airline: string, airplane: string, prie: number) => Promise<AirlineRouteSchema>;
  check: (a: AirlineRoute) => Promise<AirlineRouteSchema | true>;
  shutdown: (options: { _id: string, airplane: string, airline: string }) => Promise<AirlineRouteSchema>;
}

interface Airplane {
  id: string;
  humanName: string;
  price: number;
  passengerCap: number;
  maintenanceCost: number;
  make: string;
  tier: number;
  range: number;
}
interface AirplaneSchema extends mongoose.Document, Airplane {
  id: string;
}
interface AirplaneModel extends mongoose.Model<AirplaneSchema> {
  set: dbSetter<AirplaneSchema>;
  get: dbGetter<AirplaneSchema, Airplane>;
  buy: (airline: string, id: string) => Promise<AirplaneSchema>;
}

interface MarketbaseProjection {
  bgBase?: boolean;
  mdBase?: boolean;
  stBase?: boolean;
  itBase?: boolean;
  fullbase?: boolean;
}
interface Marketbase {
  bgBase: Cosmetics[];
  mdBase: Cosmetics[];
  stBase: Cosmetics[];
  itBase: Item[];
}

interface Schemas {
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

export = init;

declare module '@polestar/database_schema' {
  export const redis: redis.RedisClient;
  export const DB: Schemas;
}
