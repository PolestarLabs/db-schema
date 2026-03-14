import mongoose from 'mongoose';
import mongodb from 'mongodb';
import { CustomQuery, dbSetter, dbGetter, IDOrIDObject } from '../../index';

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
  materials: { id: string; count: number }[];
  typeCraft: { type: string; count: number }[];
  gemcraft: { RBN: number; JDE: number; SPH: number };
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
