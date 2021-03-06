const mongoose = require("mongoose");
const utils = require("../utils.js");

const { Mixed } = mongoose.Schema.Types;

module.exports = function CHANNEL_DB(activeConnection){


  const ChannelSchema = new mongoose.Schema({
    meta: Mixed,
    snipe: Mixed,
    name: String,
    server: String,
    guild: String,
    slowmode: Boolean,
    ignored: Boolean,
    settings: Mixed,
    slowmodeTimer: Number,
    LANGUAGE: String,
    id: { type: String, required: true, index: { unique: true } },
    modules: {
      BUSTER: Mixed,
      DROPSLY: { type: Number, default: 0 },
      EXP: { type: Boolean, default: true },
      LVUP: { type: Boolean, default: true },
      DROPS: { type: Boolean, default: true },
      BYPASS: { type: Boolean, default: false },
      DISABLED: Array,
      ENABLED: Array,
      statistics: Mixed,
    },
  }, { strict: false });

  ChannelSchema.pre(/^update/, function () {
    this.update({}, { $set: { lastUpdated: new Date() } });
  });

  const MODEL = activeConnection.model("ChannelDB", ChannelSchema, "channeldb");

  MODEL.updateMeta = (C) => {
    const spam = C.name.includes("spam") || C.name.includes("poke") || C.name.includes("poké");
    return new Promise(async (resolve) => MODEL.updateOne({ id: C.id }, {
      $set: {
        name: C.name,
        meta: {
          name: C.name,
          topic: C.topic,
          position: C.position,
          nsfw: C.nsfw,
        },
        "modules.DROPS": spam,
      },
    }));
  };

  MODEL.new = (chanData) => {
    MODEL.findOne({ id: chanData.id }, (err, newChan) => {
      if (err) {
        console.error(err);
      }
      if (newChan) {
        // Nothing
      } else {
        const user = new MODEL({
          id: chanData.id,
          name: chanData.name,
        });
        user.save((err) => {
          if (err) return console.error(err);
          // console.log("[NEW CHANNEL]".blue,"#"+chanData.name.yellow,`(ID:${chanData.id})`);
          MODEL.updateMeta(chanData);
        });
      }
    });
  };
  MODEL.set = utils.dbSetter;
  MODEL.get = utils.dbGetter;
  return MODEL;
}