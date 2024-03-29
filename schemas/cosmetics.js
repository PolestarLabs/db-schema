const mongoose = require("mongoose");

const { Schema } = mongoose;
const utils = require("../utils.js");

const { Mixed } = Schema.Types;

module.exports = function COSMO_DB(activeConnection){


  const cosmetics = Schema({
    id: String,
    name: String,
    tags: String,
    series: String,
    series_id: String,
    type: String,
    icon: String,
    code: String,
    rarity: String,
    price: Number,
    event: Mixed,
    droppable: Boolean,
    buyable: Boolean,
    howto: String,
    category: String,
    items: Array,
    color: String,
    for: String,
    localizer: String,
    exclusive: String,
    public: Boolean,
    filter: String,
    expires: Number,
  }, { strict: false });

  const MODEL = activeConnection.model("cosmetics", cosmetics, "cosmetics");

  MODEL.set = utils.dbSetter;
  MODEL.get = utils.dbGetter;

  MODEL.bgs = (filter) => MODEL.find(filter || { public: true, type: "background" }).sort({ _id: 1 });
  MODEL.medals = (filter) => MODEL.find(filter || { public: true, type: "medal" }).sort({ _id: 1 });
  MODEL.stickers = (filter) => MODEL.find(filter || { public: true, type: "sticker" }).sort({ _id: 1 });

  return MODEL;
}