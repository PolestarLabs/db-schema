import mongoose from 'mongoose';
import { dbSetter, dbGetter } from '../../index';

export interface Relationship {
  id: string;
  users: [string, string];
  ring: 'jade' | 'sapphire' | 'stardust' | 'rubine';
  ringCollection: string[];
  initiative: string;
  since: number;
  lovepoints: number;
  type: 'marriage' | 'parents' | 'children';
}
export interface RelationshipSchema extends mongoose.Document, Relationship {
  id: string;
}
// @ts-ignore
export interface RelationshipModel extends mongoose.Model<RelationshipSchema> {
  set: dbSetter<RelationshipSchema>;
  get: dbGetter<RelationshipSchema, Relationship>;
  create: (type: 'marriage' | 'parents' | 'children', users: [string, string], initiative: string, ring: 'jade' | 'sapphire' | 'stardust' | 'rubine', date?: number) => Promise<RelationshipSchema>;
}
