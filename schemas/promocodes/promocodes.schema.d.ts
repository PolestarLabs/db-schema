import mongoose from 'mongoose';
import { dbSetter, dbGetter } from '../../index';

export interface PromoCode { code: string; locked: boolean; consumed: boolean; redeemedBy: any; maxUses: number; uses: number; prize: any; }
export interface PromoCodeSchema extends mongoose.Document, PromoCode {}
export interface PromoCodeModel extends mongoose.Model<PromoCodeSchema> {
  set: dbSetter<PromoCodeSchema>;
  get: dbGetter<PromoCodeSchema, PromoCode>;
}
