
const mongoose = require("mongoose");

const { Schema } = mongoose;
const utils = require("../utils.js");

const { Mixed } = Schema.Types; // future use

const Location = new Schema({
    id: { type: String, required: true, index: { unique: true } },
    type: String,
    name: String,
    description: String,
    landmark: String,
    connects: [String],
    drops: Array,
    canSettle: Boolean,
});

const LOCATIONS = mongoose.model("AdventureLocations", Location, "AdventureLocations");

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


LOCATIONS.set = utils.dbSetter;
LOCATIONS.get = utils.dbGetterFull;
LOCATIONS.read = utils.dbGetter;

module.exports = {LOCATIONS}; // Journeys will be here
