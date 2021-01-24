const mongoose = require("mongoose");

const { Schema } = mongoose;
const utils = require("../utils.js");

const { Mixed } = Schema.Types;

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

const Progression = new Schema({

  user: String,
  achievement: String,
  type: {type: String}, // achievement | quest
  tracker: Number,
  completed: Boolean,
  awarded: Boolean,
  
});

const ACHIEVEMENTS = mongoose.model("achievements", Achievement, "achievements");
const PROGRESSION = mongoose.model("Progression", Progression, "Progression");

ACHIEVEMENTS.award = (user, achiev) => {
  const userDB = require("./users.js");
  return new Promise(async (resolve) => {
    await userDB
      .updateOne({ id: user.id || user }, { $push: { "modules.achievements": { id: achiev, unlocked: Date.now() } } }).then((res) => resolve(res));
  });
};

ACHIEVEMENTS.set = utils.dbSetter;
ACHIEVEMENTS.get = utils.dbGetter;

PROGRESSION.set = utils.dbSetter;
PROGRESSION.get = utils.dbGetter;



module.exports = {ACHIEVEMENTS,PROGRESSION};
