import type { Rarity } from '../../types/generics';

export type CosmeticType = 'background' | 'medal' | 'sticker' | 'flair' | 'skin';
type SkinCompatible = 'casino' | 'tarot';
type SkinSubtype = 'deck';

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

export type CosmeticBackground = CosmeticBaseItem & {
  id: string;
  type: 'background';
  artistName?: string;
  artistLink?: string;
  code: string;
};

export type CosmeticMedal = CosmeticBaseItem & {
  type: 'medal';
  category: string;
  howto: string;
  icon: string;
};

export type CosmeticSticker = CosmeticBaseItem & {
  id: string;
  type: 'sticker';
  release_number?: number;
  series_id?: string;
  series?: string;
  GROUP?: string;
};

export type CosmeticFlair = CosmeticBaseItem & {
  type: 'flair';
  id: string;
};

export type CosmeticSkin = CosmeticBaseItem & {
  type: 'skin';
  localizer: string;
  for: SkinCompatible;
  subtype: SkinSubtype;
  author?: string;
  author_link?: string;
  id: string;
};

export type CosmeticBoosterpack = CosmeticBaseItem & {
  id: string;
  type: 'boosterpack';
  color: string;
  GROUP: string;
  price: number;
  items: Array<{ id: string; type: string }>;
};

export type CosmeticBundle = CosmeticBaseItem & {
  type: 'bundle';
  GROUP: string;
  price: number;
  items: Array<{ id: string; type: string }>;
};

export type CosmeticItem =
  | CosmeticBackground
  | CosmeticMedal
  | CosmeticSticker
  | CosmeticFlair
  | CosmeticSkin
  | CosmeticBoosterpack
  | CosmeticBundle;
