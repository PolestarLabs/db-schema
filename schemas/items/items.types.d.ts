import type { Rarity, Currency } from '../../types/generics';

export type ItemType =
  | 'boosterpack' | 'box' | 'consumable'
  | 'key' | 'material' | 'junk' | 'other';

export type ItemSeries =
  | 'artifact' | 'booster' | 'consumables' | 'crafting'
  | 'fishing' | 'gem' | 'event' | 'ring' | 'wtf' | 'other';

export type ItemFilter =
  | 'FLW' | 'SFK' | 'neutral' | 'chibi' | 'epic' | 'event' | 'plx_collection';

/** Slim inventory entry — what a user owns. */
export interface UserItem {
  id: string;
  count: number;
  crafted?: number;
}

/** Full item definition — what the items collection stores. */
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
