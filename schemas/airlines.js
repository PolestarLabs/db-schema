const mongoose = require("mongoose");

const { Schema } = mongoose;
const utils = require("../utils.js");

/* AIRPORTS */
const airports = new Schema({
  id: { type: String, required: true, index: true },
  name: String,
  tier: Number,
  passengers: Number,
  slotAmount: Number
})
const AIRPORT = mongoose.model("Airports", airports, "Airports")

/* AIRLINES */
const airline = new Schema({
  id: { type: String, required: true, index: true },
  user: String,
  airlineName: String,
})
const AIRLINES = mongoose.model("UserAirlineData", airline, "UserAirlineData")

/* AIRPORT SLOTS */
const airplaneSlot = new Schema({
  id: { type: String, required: true, index: true },
  expires: { type: Number, required: true, index: true },
  airport: String
})
const AIRLINESLOTS = mongoose.model("BoughtAirlineSlots", airplaneSlot, "BoughtAirplaneSlots")

AIRPORT.set = utils.dbSetter;
AIRPORT.get = utils.dbGetter;
AIRLINES.set = utils.dbSetter;
AIRLINES.get = utils.dbGetter;
AIRLINESLOTS.set = utils.dbSetter;
AIRLINESLOTS.get = utils.dbGetter;

/* ---------------- METHODS ----------------- */
AIRLINESLOTS.new = async (airport, id) => {
  const airlineCheck = await AIRLINES.findOne({ id });
  if (!airlineCheck) return Promise.reject("Invalid airline ID.");
  
  const airportd = await AIRPORT.findOne({ id: airport });
  if (!airportd) return Promise.reject("Invalid airport ID.");
  
  const slotCheck = await AIRLINESLOTS.findOne({ id, airport });
  if (slotCheck) return Promise.reject("User already bought this slot.");
  
  const usedSlots = await AIRLINESLOTS.find({ airport });
  if (usedSlots.length >= airportd.slotAmount) return Promise.reject("Airport hit max slot capacity!");
  
  const slot = new AIRLINESLOTS({
    id,
    airport,
    expires: Date.now() + 6.048e+8 // set the expiration date as 7 days from now 
  });
  
  return slot.save();
}

AIRLINES.new = async (user, id, airlineName) => {
  const airlineCheck = await AIRLINES.findOne({ id });
  if (airlineCheck) return Promise.reject("An airline already exists with that ID.");
  const airline = new AIRLINES({
    user,
    id,
    airlineName
  });
  
  return airline.save();
}

AIRLINESLOTS.expire = (S) => {
  if (typeof S === "number") {
    return AIRLINESLOTS.deleteMany({ expires: { $lte: S } });
  }
  return AIRLINESLOTS.deleteOne({ id: S.id, airport: S.airport });
}

AIRPORT.new = async (id, name, passengers, tier, slotAmount) => {
  const airportCheck = await AIRPORT.findOne({ id });
  if (airportCheck) return Promise.reject("An airport already exists with the same ID.");
  const airport = new AIRPORT({
    id,
    name,
    tier,
    passengers,
    slotAmount
  });
  
  return airport.save();
}

module.exports = { AIRLINES, AIRLINESLOTS, AIRPORT };