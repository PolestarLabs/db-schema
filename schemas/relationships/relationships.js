'use strict';
const mongoose = require('mongoose');
const utils = require("../../utils.js");
const { Schema } = mongoose;

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
  const relationships = connection.model("Relationships", RelationShipModel, "relationships");
  relationships.set = utils.dbSetter;
  relationships.get = utils.dbGetter;
  relationships.create = function (type, users, initiative, ring, date) {
    return new Promise(async (resolve, reject) => {
      const rel = await relationships.find({ type, users: { $all: users } });
      if (rel.length > 0) return reject(`Duplicate Relationship: \n${JSON.stringify(rel, null, 2)}`);

      relationship = new relationships({
        type, users, initiative, ring, ringCollection: [ring], since: date || Date.now(),
      });
      relationship.save((err, item) => {
        resolve(item);
      });
    });
  };


  return relationships;
};
