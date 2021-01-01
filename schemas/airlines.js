const mongoose = require("mongoose");

const { Schema } = mongoose;
const utils = require("../utils.js");

/* AIRPORTS */
const airports = new Schema({
  id: { type: String, required: true, index: {unique:true} },
  name: String,
  tier: Number,
  passengers: Number,
  slotAmount: Number,
  slotPrice: Number,
  location: {
    type: { type: String, enum: ['Point'], required: true },
    coordinates: { type: [Number], required: true }, // [LON (-90/90) ,LAT (-180/180)]
  }
});

airports.methods.withinRange = async function withinRange(kilometers) {
  return this.constructor.find({
    location:{
      $near:{
        $geometry:{
          type:"Point",
          coordinates: [ this.location.coordinates[0], this.location.coordinates[1] ]
        },
        $maxDistance: kilometers * 1000
      }
    }
  })
}

const AIRPORT = mongoose.model("Airports", airports, "Airports");

/* AIRLINES */
const airline = new Schema({
  id: { type: String, required: true, index: { unique: true } },
  acquiredAirplanes: { type: [{ id: String, assigned: Boolean }], default: [] },
  user: String,
  airlineName: String
});
const AIRLINES = mongoose.model("UserAirlineData", airline, "UserAirlineData");

/* SLOTS (they're a separate model because it'd be sad if everything was inside of AIRLINES) */
const slots = new Schema({
  airline: { type: String, required: true, index: true },
  airport: { type: String, required: true, index: true },
  expiresIn: Number
});
const SLOTS = mongoose.model("UserBoughtAirportSlots", slots, "UserBoughtAirportSlots");

/* ROUTES */
const routes = new Schema({
  startAirport: { type: String, required: true, index: true },
  endAirport: { type: String, required: true, index: true },
  airline: { type: String, required: true, index: true },
  airplane: { type: String, required: true },
  ticketPrice: { type: Number, required: true }
});
const ROUTES = mongoose.model("AirlineRoutes", routes, "AirlineRoutes");

const airplane = new Schema({
  id: { type: String, required: true, index: true },
  humanName: { type: String, required: true },
  price: { type: Number, required: true },
  passengerCap: { type: Number, required: true },
  maintenanceCost: { type: Number, required: true },
  make: String,
  tier: Number,
  range: { type: Number, required: true }
});
const AIRPLANES = mongoose.model("Airplanes", airplane, "Airplanes");

AIRPORT.set = utils.dbSetter;
AIRPORT.get = utils.dbGetter;
AIRPORT.getFull = utils.dbGetterFull;
AIRLINES.set = utils.dbSetter;
AIRLINES.get = utils.dbGetter;
ROUTES.set = utils.dbSetter;
ROUTES.get = utils.dbGetter;
AIRPLANES.set = utils.dbSetter;
AIRPLANES.get = utils.dbGetter;
SLOTS.set = utils.dbSetter;
SLOTS.get = utils.dbGetter;

/* ---------------- METHODS ----------------- */

SLOTS.new = async (id, airport, time) => { /* if time is 0 = pay-as-you-go */
  const airlineCheck = await AIRLINES.findOne({ id });
  if (!airlineCheck) return Promise.reject("Invalid airline ID.");
  
  const airportd = await AIRPORT.findOne({ id: airport });
  if (!airportd) return Promise.reject("Invalid airport ID.");
  
  const slotCheck = await SLOTS.findOne({ airport, airline: id });
  if (slotCheck) return Promise.reject("User already bought this slot.");
  
  const usedSlots = await SLOTS.find({ airport }).lean();
  if (usedSlots.length >= airportd.slotAmount) return Promise.reject("Airport hit max slot capacity!");
  
  const slot = new SLOTS({
    airline: id,
    airport,
    expiresIn: time
  });
  return slot.save();
};

AIRPLANES.buy = async (airline, id) => {
  const a = await AIRLINES.findOne({ id: airline });
  if (!a) return Promise.reject("Invalid airline ID!");

  a.acquiredAirplanes.push({ id, assigned: false });
  return a.save();
};

ROUTES.new = async (sa, ea, airline, airplane, price) => {
  const sac = await SLOTS.findOne({ airport: sa, airline });
  if (!sac) return Promise.reject(`User does not own a slot at "${sa}".`);
  
  const eac = await SLOTS.findOne({ airport: ea, airline });
  if (!eac) return Promise.reject(`User does not own a slot at "${ea}".`);
  
  const ac = await AIRLINES.findOne({ id: airline });
  if (!ac.acquiredAirplanes.some(a => a.id === airplane && !a.assigned)) return Promise.reject("User doesn't own the specified airplane, or it's already being used somewhere else");
  
  const rc = await ROUTES.findOne({ startAirport: sa, endAirport: ea, airline });
  if (rc) return Promise.reject("User always flies this route!");
  
  const airplaneIndex = ac.acquiredAirplanes.findIndex(a => a.id === airplane && !a.assigned);
  ac.acquiredAirplanes[airplaneIndex] = { id: ac.acquiredAirplanes[airplaneIndex].id, assigned: true };
  ac.save();
  
  const r = new ROUTES({
    startAirport: sa,
    endAirport: ea,
    airline,
    airplane,
    ticketPrice: price
  });
  
  return r.save();
};

ROUTES.check = async ({ id, airline, airplane, endAirport, startAirport }) => {
  const sac = await SLOTS.findOne({ airport: startAirport, airline });
  if (!sac) return ROUTES.shutdown({ id, airline });
  
  const eac = await SLOTS.findOne({ airport: endAirport, airline });
  if (!eac) return ROUTES.shutdown({ id, airline });

  const ac = await AIRLINES.findOne({ id: airline });
  if (!ac.acquiredAirplanes.some(a => a === airplane)) return ROUTES.shutdown({ id, airline });
};

ROUTES.shutdown = async ({ id, airline }) => {
  await ROUTES.deleteOne({ id, airline });
  // const { user } = AIRLINES.findOne({ id: airline })
  // TODO: Notify user of route shutdown
};

AIRLINES.new = async (user, id, airlineName) => {
  const airlineCheck = await AIRLINES.findOne({ id });
  if (airlineCheck) return Promise.reject("An airline already exists with that ID.");
  const airline = new AIRLINES({
    user,
    id,
    airlineName
  });
  
  return airline.save();
};

module.exports = { AIRLINES, ROUTES, AIRPORT, AIRPLANES, SLOTS };