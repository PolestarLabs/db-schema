import mongoose from 'mongoose';
import { IDOrIDObject } from '../../index';

export interface UserAnalyticsData {
  userId: string;
  legacy: { globalLV: number; globalXP: number };
  dashThemeClicks: number;
  statistics: any;
}
export interface UserAnalyticsSchema extends mongoose.Document, UserAnalyticsData {}
export interface UserAnalyticsModel extends mongoose.Model<UserAnalyticsSchema> {
  get: (userId: IDOrIDObject, project?: any) => Promise<UserAnalyticsData | null>;
  set: (userId: IDOrIDObject, alter: mongoose.UpdateQuery<UserAnalyticsSchema>, options?: mongoose.QueryOptions) => Promise<any>;
  getOrCreate: (userId: IDOrIDObject) => Promise<UserAnalyticsSchema>;
  new: (userId: IDOrIDObject) => Promise<UserAnalyticsSchema>;
}
