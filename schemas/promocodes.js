const mongoose = require("mongoose");

const { Schema } = mongoose;
const utils = require("../utils.js");

const { Mixed } = Schema.Types;

const promo = new Schema({
  code: { type: String, required: true, index: { unique: true } },
  locked: Boolean,
  consumed: Boolean,
  redeemedBy:  Mixed,
  maxUses: Number,
  uses: Number,
  prize: Mixed,
});

const MODEL = mongoose.model("promo-codes", promo, "promo-codes");

MODEL.set = utils.dbSetter;
MODEL.get = utils.dbGetter;

module.exports = MODEL;
