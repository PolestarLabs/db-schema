const mongoose = require("mongoose");

const { Schema } = mongoose;
const utils = require("../utils.js");

module.exports = function AIRLINES_DB(activeConnection){


  /* AIRPORTS */
  const airports = new Schema({
    ICAO: { type: String, required: true, index: {unique:true} },
    IATA: { type: String, required: true, index: {unique:true} },
    name: String,
    tier: Number,
    starter: Boolean,
    city: String,
    continent: String,
    region: String,
    country: String,
    passengers: Number,
    slotAmount: Number,
    slotPrice: Number,
    location: {
      type: { type: String, enum: ['Point'], required: true },
      coordinates: { type: [Number], required: true }, // [LON (-90/90) ,LAT (-180/180)]
    }
  });
  // NOTE This Schema requires a 2dsphere index preconfigured in the database to work 

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

  const AIRPORT = activeConnection.model("Airports", airports, "Airports");

  /* AIRLINES */
  const airline = new Schema({
    id: { type: String, required: true, index: { unique: true } },
    acquiredAirplanes: { type: [{ id: String, assigned: Boolean, mods: Mixed }], default: [] },
    user: String,
    airlineName: String
  });
  const AIRLINES = activeConnection.model("UserAirlineData", airline, "UserAirlineData");

  /* SLOTS (they're a separate model because it'd be sad if everything was inside of AIRLINES) */
  const slots = new Schema({
    airline: { type: String, required: true, index: true },
    airport: { type: String, required: true, index: true },
    expiresIn: Number
  });
  const SLOTS = activeConnection.model("UserBoughtAirportSlots", slots, "UserBoughtAirportSlots");

  /* ROUTES */
  const routes = new Schema({
    startAirport: { type: String, required: true, index: true },
    endAirport: { type: String, required: true, index: true },
    airline: { type: String, required: true, index: true },
    airplane: { type: String, required: true },
    ticketPrice: { type: Number, required: true }
  });
  const ROUTES = activeConnection.model("AirlineRoutes", routes, "AirlineRoutes");

  const airplane = new Schema({
    id: { type: String, required: true, index: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    capacity: { type: Number, required: true },
    maintenanceCost: { type: Number, required: true },
    make: String,
    country: String,
    starter: Boolean,
    tier: Number,
    range: { type: Number, required: true }
  });
  const AIRPLANES = activeConnection.model("Airplanes", airplane, "Airplanes");

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


  SLOTS.validate = async (id, airport) => {
    const airlineCheck = await AIRLINES.findOne({ id });
    if (!airlineCheck) return Promise.reject("Invalid airline ID.");
    
    const airportd = await AIRPORT.findOne({ ICAO: airport });
    if (!airportd) return Promise.reject("Invalid airport ID.");
    
    const slotCheck = await SLOTS.findOne({ airport, airline: id });
    if (slotCheck) return Promise.reject("User already bought this slot.");
    
    const usedSlots = await SLOTS.find({ airport }).lean();
    if ( !usedSlots.starter && usedSlots.length >= (airportd.slotAmount||0)) return Promise.reject("Airport hit max slot capacity!");

    return Promise.resolve("OK")
  }

  SLOTS.new = async (id, airport, time) => { /* if time is 0 = pay-as-you-go */
    return SLOTS.validate(id,airport).then(res=>{      
      const slot = new SLOTS({
        airline: id,
        airport,
        expiresIn: time
      });
      return slot.save();
    }).catch(err=>{
      return err;
    })
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

  ROUTES.check = async (a) => {
    const sac = await SLOTS.findOne({ airport: a.startAirport, airline: a.airline });
    if (!sac) return ROUTES.shutdown(a);
    
    const eac = await SLOTS.findOne({ airport: a.endAirport, airline: a.airline });
    if (!eac) return ROUTES.shutdown(a);

    const ac = await AIRLINES.findOne({ id: a.airline });
    if (!ac.acquiredAirplanes.some(b => b.id === a.airplane && b.assigned)) return ROUTES.shutdown(a);

    return true;
  };

  ROUTES.shutdown = async ({ _id, airplane, airline }) => {
    await ROUTES.deleteOne({ _id });
    const ac = await AIRLINES.findOne({ id: airline });
    
    const airplaneIndex = ac.acquiredAirplanes.findIndex(a => a.id === airplane && a.assigned);
    ac.acquiredAirplanes[airplaneIndex] = { id: ac.acquiredAirplanes[airplaneIndex].id, assigned: false };
    return ac.save();
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

 return { AIRLINES, ROUTES, AIRPORT, AIRPLANES, SLOTS };
}