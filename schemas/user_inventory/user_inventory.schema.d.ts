import mongoose from 'mongoose';
import mongodb from 'mongodb';
import { dbSetter, dbGetter, IDOrIDObject } from '../../index';
import { UserItem } from '../items/items.types';

export interface UserInventoryData {
  userId: string;
  inventory: Array<{ id: string; count: number; crafted?: number }>;
  bgInventory: string[];
  skinInventory: string[];
  flairInventory: string[];
  medalInventory: string[];
  stickerInventory: string[];
  stickerShowcase: string[];
  fishes: any[];
  fishShowcase: any[];
  achievements: any[];
}

export interface UserInventorySchema extends mongoose.Document, UserInventoryData {
  addItem: (item: string, amt?: number, crafted?: boolean) => Promise<mongodb.UpdateWriteOpResult['result']>;
  removeItem: (item: string, amt?: number, crafted?: boolean) => Promise<mongodb.UpdateWriteOpResult['result']>;
  modifyItems(items: UserItem[], debug: true): Promise<[UserItem[], { userId: string }, { $inc: any }, { arrayFilters: any[] }]>;
  modifyItems(items: UserItem[], debug?: boolean): Promise<mongodb.UpdateWriteOpResult['result']>;
  hasItem: (itemId: string, count?: number) => boolean;
  amtItem: (itemId: string) => number;
}

export interface UserInventoryModel extends mongoose.Model<UserInventorySchema> {
  get: (userId: IDOrIDObject, project?: any) => Promise<UserInventoryData | null>;
  getFull: (userId: IDOrIDObject) => Promise<UserInventorySchema | null>;
  set: (userId: IDOrIDObject, alter: mongoose.UpdateQuery<UserInventorySchema>, options?: mongoose.QueryOptions) => Promise<any>;
  getOrCreate: (userId: IDOrIDObject) => Promise<UserInventorySchema>;
  new: (userId: IDOrIDObject) => Promise<UserInventorySchema>;
}
