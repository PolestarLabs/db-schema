import type { UserItem } from '../items/items.types';

export type { UserItem };

/** Full inventory snapshot for a user. */
export interface UserInventoryData {
  userId: string;
  inventory: UserItem[];
  bgInventory: string[];
  skinInventory: string[];
  flairInventory: string[];
  medalInventory: string[];
  stickerInventory: string[];
  stickerShowcase: string[];
  fishes: any[];
  fishShowcase: any[];
  achievements: any[];

  // Instance methods (only on full documents via getFull)
  addItem(itemId: string, amount?: number, crafted?: boolean): Promise<any>;
  removeItem(itemId: string, amount?: number, crafted?: boolean): Promise<any>;
  hasItem(itemId: string, count?: number): boolean;
  amtItem(itemId: string): number;
}
