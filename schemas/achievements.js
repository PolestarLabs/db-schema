const mongoose = require("mongoose");

const { Schema } = mongoose;
const utils = require("../utils.js");

const { Mixed } = Schema.Types;

module.exports = function MISC_DB(activeConnection){


  const Achievement = new Schema({

    name: String,
    icon: String,
    exp: Number,
    reveal_level: Number,
    reveal_requisites: Array,
    flavor_text_id: { type: String, index: { unique: true } },
    condition: { type: String, required: true },
    advanced_conditions: Array,
    id: { type: String, required: true, index: { unique: true } },

  });

  const Quests = new Schema({

    id: { type: Number, required: true, index: { unique: true } },
    name: String,
    flavor_text: String,
    instruction: String,
    reveal_level: Number,
    action: String,
    type: {type:String},
    condition: String,
    target: Number,
    tier: String,
    icon: String,
    reveal_requisites: String,
    advanced_conditions: String,
    
  });

  const ACHIEVEMENTS = activeConnection.model("achievements", Achievement, "achievements");
  const QUESTS = activeConnection.model("Quests", Quests, "Quests");

  ACHIEVEMENTS.award = (user, achiev) => {
    const userDB = require("./users.js");
    return new Promise(async (resolve) => {
      await userDB
        .updateOne({ id: user.id || user }, { $push: { "modules.achievements": { id: achiev, unlocked: Date.now() } } }).then((res) => resolve(res));
    });
  };

  ACHIEVEMENTS.set = utils.dbSetter;
  ACHIEVEMENTS.get = utils.dbGetter;

  QUESTS.set = utils.dbSetter;
  QUESTS.get = utils.dbGetter;

  return {ACHIEVEMENTS,QUESTS};

}
