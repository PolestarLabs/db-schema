'use strict';
const mongoose = require('mongoose');
const utils = require("../../utils.js");
const { Schema } = mongoose;

const MarketplaceModel = new Schema({
  id: { type: String, required: true },
  item_id: { type: String, required: true },
  item_type: { type: String, required: true },
  price: { type: Number, required: true },
  currency: { type: String, required: true },
  author: { type: String, required: true },
  timestamp: Number,
  type: String,
  lock: Boolean,
  completed: Boolean,
}, { strict: false });

MarketplaceModel.statics.get = function get(query, projection) {
  return this.findOne(query, projection);
};

MarketplaceModel.statics.set = function set(query, update, options = {}) {
  return this.findOneAndUpdate(query, update, { upsert: true, new: true, ...options });
};

module.exports = function (connection) {

  const MARKETPLACE = connection.model("marketplace", MarketplaceModel, "marketplace");
  MARKETPLACE.set = utils.dbSetter;
  MARKETPLACE.get = utils.dbGetter;
  MARKETPLACE.new = (payload) => {
    const aud = new MARKETPLACE(payload);
    aud.save((err) => {
      if (err) return console.error(err);
      console.log("[NEW MARKETPLACE ENTRY]".blue, payload);
    });
    return aud;
  };




  /**
   * @param {import('mongoose').Connection} connection
   * @returns {import('./marketplace.schema').MarketplaceModel}
   */

  return MARKETPLACE;
};






