const mongoose = require("mongoose");

const { Schema } = mongoose;
const utils = require("../utils.js");

const { Mixed } = Schema.Types;

module.exports = function ITEM_DB(activeConnection){


  const Item = new Schema({
    name: String,
    id: { type: String, index: { unique: true } },
    rarity: { type: String, default: "C" },
    icon: { type: String, default: "item" },
    emoji: { type: String, default: ":package:" },
    price: { type: Number, default: 1000 },
    altEmoji: { type: String, default: ":package:" },
    event: String,
    event_id: Number,
    type: { type: String, default: "item" },
    tradeable: { type: Boolean, default: true },
    buyable: { type: Boolean, default: true },
    destroyable: { type: Boolean, default: true },
    usefile: { type: String, default: "notusable" },
    code: String,
    misc: Mixed,
    subtype: String,
    series: String,
    filter: String,
    crafted: Boolean,
    color: String,
    exclusive: String,
    public: Boolean,
    materials: Array,
    typeCraft: Array,
    gemcraft: {
      RBN: Number,
      JDE: Number,
      SPH: Number,
    },

  }, { strict: false });

  const MODEL = activeConnection.model("Item", Item, "items");

  MODEL.getAll = async function () { return (await MODEL.find({})); };

  MODEL.cat = async function (cat) {
    return (await MODEL.findOne({ type: cat }));
  };

  const itemOperation = (user, itemId, field, amt=1) => {
    return this.model("UserDB").updateOne(
      { id: user.id||user },
      {$inc:{
        ["modules.inventory.$[item]."+field]: amt
      }},
      {arrayFilters: [
        {"item.id":itemId}
      ]}
    );
  };

  MODEL.consume = function (user, item, amt = 1) {
    return itemOperation(user, item, "count", -amt);
  };
  MODEL.destroy = MODEL.consume;

  MODEL.receive = function (user, item, amt = 1) {
    return itemOperation(user, item, "count", amt);
  };
  MODEL.add = MODEL.receive;

  MODEL.set = utils.dbSetter;
  MODEL.get = utils.dbGetter;

  return MODEL;
}