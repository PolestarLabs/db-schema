import mongoose from 'mongoose';
import mongodb from 'mongodb';
import { dbSetter, dbGetter, dbGetterFull } from '../../index';

export interface Airports {
  id: string; name: string; tier: number; passengers: number;
  slotAmount: number; slotPrice: number; location: { type: string; coordinates: [number, number] };
}
export interface AirportsSchema extends mongoose.Document, Airports {
  id: string;
  withinRange: (km: number) => mongoose.QueryWithHelpers<AirportsSchema[], AirportsSchema, {}>;
}
export interface AirportsModel extends mongoose.Model<AirportsSchema> {
  set: dbSetter<AirportsSchema>; get: dbGetter<AirportsSchema, Airports>; getFull: dbGetterFull<AirportsSchema>;
}

export interface Airline {
  id: string; acquiredAirplanes: { id: string; assigned: boolean }[]; user: string; airlineName: string;
}
export interface AirlineSchema extends mongoose.Document, Airline { id: string; }
export interface AirlineModel extends mongoose.Model<AirlineSchema> {
  set: dbSetter<AirlineSchema>; get: dbGetter<AirlineSchema, Airline>;
  new: (user: string, id: string, airlineName: string) => Promise<AirlineSchema>;
}

export interface AirportSlots { airline: string; airport: string; expiresIn: number; }
export interface AirportSlotsSchema extends mongoose.Document, AirportSlots {}
export interface AirportSlotsModel extends mongoose.Model<AirportSlotsSchema> {
  set: dbSetter<AirportSlotsSchema>; get: dbGetter<AirportSlotsSchema, AirportSlots>;
  new: (id: string, airport: string, time: number) => Promise<AirportSlotsSchema>;
}

export interface AirlineRoute {
  startAirport: string; endAirport: string; airline: string; airplane: string; ticketPrice: number;
}
export interface AirlineRouteSchema extends mongoose.Document, AirlineRoute {}
export interface AirlineRouteModel extends mongoose.Model<AirlineRouteSchema> {
  set: dbSetter<AirlineRouteSchema>; get: dbGetter<AirlineRouteSchema, AirlineRoute>;
  new: (sa: string, ea: string, airline: string, airplane: string, price: number) => Promise<AirlineRouteSchema>;
  check: (a: AirlineRoute) => Promise<AirlineRouteSchema | true>;
  shutdown: (options: { _id: string; airplane: string; airline: string }) => Promise<AirlineRouteSchema>;
}

export interface Airplane {
  id: string; humanName: string; price: number; passengerCap: number;
  maintenanceCost: number; make: string; tier: number; range: number;
}
export interface AirplaneSchema extends mongoose.Document, Airplane { id: string; }
export interface AirplaneModel extends mongoose.Model<AirplaneSchema> {
  set: dbSetter<AirplaneSchema>; get: dbGetter<AirplaneSchema, Airplane>;
  buy: (airline: string, id: string) => Promise<AirplaneSchema>;
}
