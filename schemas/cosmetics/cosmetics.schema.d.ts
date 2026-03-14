import mongoose from 'mongoose';
import { dbSetter, dbGetter } from '../../index';

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
