const mongoose = require("mongoose");

const { Schema } = mongoose;
const utils = require("../utils.js");

const { Mixed } = Schema.Types;

module.exports = function COLLECT_DB(activeConnection){


  const collectibles = new Schema({
    name: String,
    id: { type: String, index: { unique: true } },
    rarity: String,
    icon: String,
    emoji: String,
    attribs: Mixed,

  });

  const MODEL = activeConnection.model("collectibles", collectibles, "collectibles");

  MODEL.set = utils.dbSetter;
  MODEL.get = utils.dbGetter;

  return MODEL;
}