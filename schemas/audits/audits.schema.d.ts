import mongoose from 'mongoose';
import mongodb from 'mongodb';
import { dbSetter, dbGetter } from '../../index';

export interface Audit {
  from: string; to: string; type: string; currency: string;
  transaction: string; amt: number; timestamp: number; transactionId: string; details: any;
}
export interface AuditSchema extends mongoose.Document, Audit {}
export interface AuditModel extends mongoose.Model<AuditSchema> {
  set: dbSetter<AuditSchema>;
  get: dbGetter<AuditSchema, Audit>;
  new: (payload: Partial<Audit>) => Promise<string>;
  receive: (user: string, type: string, currency?: string, amt?: number) => Promise<string>;
  forfeit: (user: string, type: string, currency?: string, amt?: number) => Promise<string>;
}
