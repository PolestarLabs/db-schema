'use strict';
const mongoose = require('mongoose');


const RelationShipModel = new Schema({
  id: String,
  users: [{ type: String }],
  ring: { type: String },
  ringCollection: [{ type: String }],
  initiative: { type: String },
  since: Number,
  lovepoints: Number,
  type: String, // MARRIAGE / PARENTS / CHILDREN

}, { strict: false });


RelationShipModel.statics.get = function get(query, projection) {
  return this.findOne(query, projection);
};

RelationShipModel.statics.set = function set(query, update, options = {}) {
  return this.findOneAndUpdate(query, update, { upsert: true, new: true, ...options });
};

/**
 * @param {import('mongoose').Connection} connection
 * @returns {import('./relationships.schema').RelationshipsModel}
 */
module.exports = function (connection) {
  return connection.model('Relationships', RelationShipModel);
};
