import mongoose from 'mongoose';

export interface UserQuestData {
  userId: string;
  questId: number;
  target: number;
  tracker: string;
  progress: number;
  completed: boolean;
  completedAt: Date | null;
}
export interface UserQuestSchema extends mongoose.Document, UserQuestData {}
export interface UserQuestModel extends mongoose.Model<UserQuestSchema> {
  get: (query: any, project?: any) => Promise<UserQuestData | null>;
  set: (query: any, alter: mongoose.UpdateQuery<UserQuestSchema>, options?: mongoose.QueryOptions) => Promise<any>;
  allForUser: (userId: string) => Promise<UserQuestData[]>;
  incrementProgress: (userId: string, questId: number, amt?: number) => Promise<UserQuestSchema | null>;
}
