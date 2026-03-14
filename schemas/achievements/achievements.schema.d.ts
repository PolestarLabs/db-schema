import mongoose from 'mongoose';
import mongodb from 'mongodb';
import { dbSetter, dbGetter } from '../../index';

export interface Achievement {
  name: string;
  icon: string;
  exp: number;
  reveal_level: number;
  reveal_requisites: unknown[];
  flavor_text_id: string;
  condition: string;
  advanced_conditions: string[];
  id: string;
}
export interface AchievementSchema extends mongoose.Document, Achievement { id: string; }
export interface AchievementModel extends mongoose.Model<AchievementSchema> {
  award: (user: any, achiev: string) => Promise<mongodb.UpdateWriteOpResult['result']>;
  set: dbSetter<AchievementSchema>;
  get: dbGetter<AchievementSchema, Achievement>;
}

export interface Quest {
  id: number;
  name: string;
  flavor_text: string;
  instruction: string;
  reveal_level: number;
  action: string;
  type: string;
  condition: string;
  target: number;
  tier: string;
  icon: string;
  reveal_requisites: string;
  advanced_conditions: string;
}
export interface QuestSchema extends mongoose.Document, Quest { id: number; }
export interface QuestModel extends mongoose.Model<QuestSchema> {
  set: dbSetter<QuestSchema>;
  get: dbGetter<QuestSchema, Quest>;
}
