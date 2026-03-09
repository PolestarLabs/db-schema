import mongoose from 'mongoose';
import { dbSetter, dbGetter } from '../../index';

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

export interface MarketbaseProjection {
  bgBase?: boolean;
  mdBase?: boolean;
  stBase?: boolean;
  itBase?: boolean;
  fullbase?: boolean;
}
