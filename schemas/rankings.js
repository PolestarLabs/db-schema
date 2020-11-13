const mongoose = require("mongoose");

const { Schema } = mongoose;
const utils = require("../utils.js");

const { Mixed } = Schema.Types;

const Ranking = new Schema({
  user: {type: String, index: true},
  type: {type: String, index: true},
  points: {type: Number, index: true},
  data: Mixed
}, { strict: false });

Ranking.index({ type: 1, user: -1}, { unique: true });

const RANKINGS = mongoose.model("Rankings", Ranking, "Rankings");

// NO .new() METHOD SINCE .set() UPSERTS

RANKINGS.set = utils.dbSetter;
RANKINGS.get = utils.dbGetter;

module.exports = RANKINGS;
