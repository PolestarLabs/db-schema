// ──────────────────────────────────────────────────────────────────
// @polestarlabs/database_schema/types
//
// Front-facing types for Bot, Dashboard, and API consumption.
// These are the "pretty" types returned by model methods (.get, etc.)
//
// For raw MongoDB document types and Mongoose model interfaces,
// import from the main package entry instead.
// ──────────────────────────────────────────────────────────────────

// ── Currency ──────────────────────────────────────────────────────

export type Currency = "RBN" | "JDE" | "SPH" | "AMY" | "EMD" | "PSM" | "EVT";

export type CurrencyLabel = {
  RBN: "Rubine";
  JDE: "Jade";
  SPH: "Sapphire";
  AMY: "Amethyst";
  EMD: "Emerald";
  PSM: "Prism";
  EVT: "Event";
};

// ── Rarity ────────────────────────────────────────────────────────

export type Rarity = "C" | "U" | "R" | "SR" | "UR" | "XR";

// ── Prime ─────────────────────────────────────────────────────────

export type PrimeTier =
  | "plastic"
  | "aluminium"
  | "carbon"
  | "iron"
  | "iridium"
  | "lithium"
  | "palladium"
  | "zircon"
  | "uranium"
  | "astatine"
  | "antimatter"
  | "neutrino";

export interface PrimeInfo {
  tier: PrimeTier;
  lastClaimed: number;
  active: boolean;
  maxServers: number;
  canReallocate: boolean;
  custom_background: boolean;
  custom_handle: boolean;
  custom_shop: boolean;
  servers: string[];
  misc?: unknown;
}

// ── Profilecard ───────────────────────────────────────────────────

export interface Profilecard {
  background: string;
  sticker?: string;
  color: string;
  flair: string;
  about: string;
  tagline: string;
  medals: string[];
}

// ── Items ─────────────────────────────────────────────────────────

/** Slim inventory entry — what a user owns. */
export interface UserItem {
  id: string;
  count: number;
  crafted?: number;
}

export type ItemType =
  | "boosterpack"
  | "box"
  | "consumable"
  | "key"
  | "material"
  | "junk"
  | "other";

export type ItemSeries =
  | "artifact"
  | "booster"
  | "consumables"
  | "crafting"
  | "fishing"
  | "gem"
  | "event"
  | "ring"
  | "wtf"
  | "other";

export type ItemFilter =
  | "FLW"
  | "SFK"
  | "neutral"
  | "chibi"
  | "epic"
  | "event"
  | "plx_collection";

/** Full item definition from the items collection. */
export interface InventoryItem {
  id: string;
  name: string;
  rarity: Rarity;
  type: ItemType;
  icon: string;
  emoji: string;
  price: number;
  misc: Record<string, unknown>;
  public: boolean;
  tradeable: boolean;
  buyable: boolean;
  destroyable: boolean;
  crafted: boolean;
  event?: string;
  code?: string;
  features?: string;
  maxBulkCraft?: number;
  materials: UserItem[];
  typeCraft?: Array<{ type: string; count: number }>;
  rewards?: Array<{ type: string; id: string }>;
  gemcraft?: { [K in Currency]?: number };
  series?: ItemSeries;
  filter?: ItemFilter;
  subtype?: string;
  exclusive?: string;
}

// ── User ──────────────────────────────────────────────────────────

/** Front-facing user type with instance methods. */
export interface User {
  id: string;
  name: string;
  tag: string;
  avatar: string | null;
  personalHandle?: string;
  currency: { [K in Currency]: number };
  progression: {
    level: number;
    exp: number;
  };
  profile: Profilecard;
  prime: PrimeInfo | null;
  blacklisted: string | null;
  switches: Record<string, any>;
  counters: Record<string, any>;
  eventData: Record<string, any>;
  meta: {
    createdAt: Date;
    lastLogin: Date | null;
    lastUpdated: Date;
  };

  // Instance methods
  addItem(itemId: string, amount?: number): Promise<any>;
  removeItem(itemId: string, amount?: number): Promise<any>;
  hasItem(itemId: string, count?: number): boolean;
  getInventory(): Promise<UserItem[]>;
  addCurrency(currency: Currency, amount?: number): Promise<any>;
  addXP(amount?: number): Promise<any>;
  incrementAttr(attr: string, amount?: number): Promise<any>;
}

// ── Cosmetics ─────────────────────────────────────────────────────

export type CosmeticType = "background" | "medal" | "sticker" | "flair" | "skin";

export interface CosmeticBaseItem {
  _id: { toString(): string };
  id?: string;
  name: string;
  tags: string;
  rarity: Rarity;
  type: CosmeticType;
  event?: string;
  meta: Record<string, unknown>;
  price?: number;
  BUNDLE?: string;
  exclusive: string;
  public: boolean;
  destroyable: boolean;
  tradeable: boolean;
  droppable: boolean;
  buyable: boolean;
}

export type CosmeticSticker = CosmeticBaseItem & {
  id: string;
  type: "sticker";
  release_number?: number;
  series_id?: string;
  series?: string;
  GROUP?: string;
};

export type CosmeticBoosterpack = CosmeticBaseItem & {
  id: string;
  type: "boosterpack";
  color: string;
  GROUP: string;
  price: number;
  items: Array<{ id: string; type: string }>;
};

export type CosmeticBackground = CosmeticBaseItem & {
  id: string;
  type: "background";
  artistName?: string;
  artistLink?: string;
  code: string;
};

export type CosmeticMedal = CosmeticBaseItem & {
  type: "medal";
  category: string;
  howto: string;
  icon: string;
};

export type CosmeticFlair = CosmeticBaseItem & {
  type: "flair";
  id: string;
};

export type CosmeticBundle = CosmeticBaseItem & {
  type: "bundle";
  GROUP: string;
  price: number;
  items: Array<{ id: string; type: string }>;
};

type SkinCompatible = "casino" | "tarot";
type SkinSubtype = "deck";

export type CosmeticSkin = CosmeticBaseItem & {
  type: "skin";
  localizer: string;
  for: SkinCompatible;
  subtype: SkinSubtype;
  author?: string;
  author_link?: string;
  id: string;
};

/** Union of all cosmetic item subtypes. */
export type CosmeticItem =
  | CosmeticSkin
  | CosmeticFlair
  | CosmeticMedal
  | CosmeticBackground
  | CosmeticSticker
  | CosmeticBoosterpack
  | CosmeticBundle;
