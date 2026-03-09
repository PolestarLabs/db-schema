import mongoose from 'mongoose';
import { dbSetter, dbGetter } from '../../index';

export interface Collectibles { name: string; id: string; rarity: string; icon: string; emoji: string; attribs: any; }
export interface CollectiblesSchema extends mongoose.Document, Collectibles { id: string; }
export interface CollectiblesModel extends mongoose.Model<CollectiblesSchema> {
  set: dbSetter<CollectiblesSchema>;
  get: dbGetter<CollectiblesSchema, Collectibles>;
}
