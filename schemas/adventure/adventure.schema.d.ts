import mongoose from 'mongoose';
import { dbSetter, dbGetter, dbGetterFull } from '../../index';

export interface AdventureLocationTraceRoute {
  _id: string; name: string; type: string; distance: number;
}
export interface AdventureLocationTraceRouteOptions {
  relocating?: boolean; soft?: boolean; exploring?: boolean;
}
export interface AdventureLocation {
  id: string; type: string; name: string; description: string; landmark: string;
  connects: string[]; drops: unknown[]; canSettle: boolean;
  coordinates: { x: number; y: number };
}
export interface AdventureLocationSchema extends mongoose.Document, AdventureLocation {
  id: string;
  isAdjacent: (locationID: string) => boolean;
}
export interface AdventureLocationModel extends mongoose.Model<AdventureLocationSchema> {
  traceRoutes: (start: string, depth: number, options?: AdventureLocationTraceRouteOptions) => Promise<AdventureLocationTraceRoute[]>;
  set: dbSetter<AdventureLocationSchema>;
  get: dbGetterFull<AdventureLocationSchema>;
  read: dbGetter<AdventureLocationSchema, AdventureLocation>;
}

export interface JourneyEvent { time: number; id: number; trueTime: number; interaction: any; }
export interface Journey {
  user: string; start: number; end: number; location: string; insurance: number; events: JourneyEvent[];
}
export interface JourneySchema extends mongoose.Document, Journey {}
export interface JourneyModel extends mongoose.Model<JourneySchema> {
  new: (user: string, journey: Omit<Journey, 'user' | 'events'>, events: JourneyEvent[]) => Promise<JourneySchema>;
  set: dbSetter<JourneySchema>;
  get: dbGetter<JourneySchema, Journey>;
}
