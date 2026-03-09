
const mongoose = require("mongoose");

const { Schema } = mongoose;
const utils = require("../utils.js");

const { Mixed } = Schema.Types; // future use

module.exports = function ADVENTURE_DB(activeConnection){


    const Location = new Schema({
        id: { type: String, required: true, index: { unique: true } },
        type: String,
        name: String,
        description: String,
        landmark: String,
        connects: [String],
        drops: Array,
        canSettle: Boolean,
        coordinates: {x:Number,y:Number}
    });

    const LOCATIONS = activeConnection.model("AdventureLocations", Location, "AdventureLocations");

    LOCATIONS.traceRoutes = (start,depth,options = {} ) => {

        const  relocating = options.relocating ?? true;
        const  soft       = options.soft       ?? false;
        const  exploring  = options.exploring  ?? false;

        // "exploring" will be used for places that cant be landed but can be explored from adjacent;

        const matchQuery = {"dest.id": { $ne: start }};
        if(!soft) matchQuery["dest.jumps"] = depth;
        if(relocating) matchQuery["dest.canSettle"] = true; 
        if(exploring) matchQuery["dest.canExplore"] = true;

        return new Promise(resolve=>{        
            LOCATIONS.aggregate([
                {$match: {id: start}},
                {
                    "$graphLookup": {
                        from: "AdventureLocations",
                        startWith: start,
                        connectFromField: "id",
                        connectToField: "connects",
                        as: "dest",
                        maxDepth: depth,
                        depthField: "jumps"
                    }
                },
                {$unwind: "$dest"},
                {$match: matchQuery},
                {$project: {id: 0}},
                {
                    $group: {
                        _id: "$dest.id",
                        name: {$first: "$dest.name"},
                        type: {$first: "$dest.type"},
                        distance: {$first: "$dest.jumps"}
                    }
                }
            ]).then(res=> resolve(res))
        })
    }

    Location.methods.isAdjacent = function isAdjacent(locationID) {
        return this.connects.includes(locationID);
    }

    ///////////////////////////////////////////////

    const Journey = new Schema({
        user: String,
        start: Number,
        end: Number,
        location: String,
        insurance: Number,
        events: [
            {
                time: Number,
                id: Number,
                trueTime: Number,
                interaction: Mixed
            }
        ],

    });

    const JOURNEYS = activeConnection.model("Journeys", Journey, "Journeys");

    JOURNEYS.new = async (user,journey,events) => {
        
        let jCheck = await JOURNEYS.findOne({ user , end: {$gte: Date.now() } });
        if (jCheck) return Promise.reject("User already in a Journey");
        let JNY = new JOURNEYS({
            user,
            events,
            start: Date.now(),
            end: journey.end,
            location: journey.location,
            insurance: journey.insurance,
        });
        return JNY.save();
    };



    LOCATIONS.set = utils.dbSetter;
    LOCATIONS.get = utils.dbGetterFull;
    LOCATIONS.read = utils.dbGetter;

    JOURNEYS.set = utils.dbSetter;
    JOURNEYS.get = utils.dbGetter;

    return {LOCATIONS,JOURNEYS}; // Journeys will be here
}