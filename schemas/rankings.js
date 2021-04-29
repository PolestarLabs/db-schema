const mongoose = require("mongoose");

const { Schema } = mongoose;
const utils = require("../utils.js");

const { Mixed } = Schema.Types;

module.exports = function RANK_DB(activeConnection){


  const Ranking = new Schema({
    id: {type: String, index: true},
    type: {type: String, index: true},
    points: {type: Number, index: true},
    timestamp: {type: Number},
    data: Mixed
  }, { strict: false });

  Ranking.index({ type: 1, user: -1});

  const RANKINGS = mongoose.model("Rankings", Ranking, "Rankings");

  // NO .new() METHOD SINCE .set() UPSERTS

  RANKINGS.set = utils.dbSetter;
  RANKINGS.get = utils.dbGetter;

  return RANKINGS;
}