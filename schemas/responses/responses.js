const mongoose = require("mongoose");

const { Schema } = mongoose;
const utils = require("../utils.js");

const { Mixed } = Schema.Types;

module.exports = function RESPO_DB(activeConnection){


  const responses = new Schema({

    trigger: { type: String, required: true },
    response: String,
    server: { type: String, required: true, index: { unique: false } },
    id: { type: String, required: true, index: { unique: true } },
    embed: Mixed,
    tag: String,
    type: String, // EMBED, STRING, FILE

  });

  const MODEL = activeConnection.model("responses", responses, "responses");

  MODEL.set = utils.dbSetter;
  MODEL.get = utils.dbGetter;

  return MODEL;
}