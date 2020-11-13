const mongoose = require("mongoose");

const { Schema } = mongoose;
const utils = require("../utils.js");

/* AIRLINES */
const airline = new Schema({
  id: { type: String, required: true, index: { unique: true } },
  user: String,
  airlineName: String,
})
const AIRLINES = mongoose.model("UserAirlineData", airline, "UserAirlineData")

/* AIRPORT SLOTS */
const airplaneSlot = new Schema({
  id: String,
  expiresIn: String,
  airport: String
})
const AIRLINESLOTS = mongoose.model("BoughtAirlineSlots", airplaneSlot, "BoughtAirplaneSlots")

AIRLINES.set = utils.dbSetter;
AIRLINES.get = utils.dbGetter;
AIRLINESLOTS.set = utils.dbSetter;
AIRLINESLOTS.get = utils.dbGetter;

/* ---------------- METHODS ----------------- */
AIRLINESLOTS.new = async (airport, id) => {
  const airlineCheck = await AIRLINES.findOne({ id })
  if (!airlineCheck) return Promise.reject("Invalid airline ID.")
  const slotCheck = await AIRLINESLOTS.findOne({ id, airport })
  if (slotCheck) return Promise.reject("User already bought this slot.")
  // TODO: add max slot check, needs airports registering through database.
  
  const slot = new AIRLINESLOTS({
    id,
    airport,
    expiresIn: Date.now() + 6.048e+8 // set the expiration date as 7 days from now 
  })
  
  return slot.save()
}

AIRLINES.new = async (user, id, airlineName) => {
  const airlineCheck = await AIRLINES.findOne({ id })
  if (airlineCheck) return Promise.reject("An airline already exists with that ID.")
  const airline = new AIRLINES({
    user,
    id,
    airlineName
  })
  
  return airline.save()
}

module.exports = { AIRLINES, AIRLINESLOTS }