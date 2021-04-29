const mongoose = require("mongoose");
const utils = require("../utils.js");

const { Mixed } = mongoose.Schema.Types;
module.exports = function SVMETA_DB(activeConnection){
  const ServerSchema = new mongoose.Schema({
    id: { type: String, required: true, index: { unique: true } },
    name: String,
    size: Number,
    roles: Array,
    adms: Array,
    channels: Array,
    icon: String,
  });

  const MODEL = activeConnection.model("ServerMetadata", ServerSchema, "sv_metadata");

  MODEL.set = utils.dbSetter;
  MODEL.get = utils.dbGetter;
  MODEL.cat = "sv_meta";



  return MODEL
}