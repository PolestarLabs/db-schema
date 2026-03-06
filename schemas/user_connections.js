/**
 * User Connections — third-party linked accounts.
 * Collection: "user_connections"
 *
 * Extracted from:
 *   userdb.discordData.connections[] (Discord-linked accounts)
 *   userdb.connections.lastfm/twitter/spotify/twitch
 *
 * One document per (userId, type) pair.
 *
 * @module user_connections
 */
const mongoose = require("mongoose");

const { Mixed } = mongoose.Schema.Types;

module.exports = function USER_CONNECTIONS(activeConnection) {

  const UserConnectionsSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    type: { type: String, required: true },
    externalId: { type: String, default: "" },
    name: { type: String, default: "" },
    verified: { type: Boolean, default: false },
    visibility: { type: Number, default: 0 },
    show_activity: { type: Boolean, default: false },
    friend_sync: { type: Boolean, default: false },
    two_way_link: { type: Boolean, default: false },
    metadata_visibility: { type: Number, default: 0 },
    extra: { type: Mixed, default: null },
  }, {
    strict: true,
    collection: "user_connections",
    timestamps: false,
  });

  // Compound unique index matching mongoscript
  UserConnectionsSchema.index({ userId: 1, type: 1 }, { unique: true });

  const MODEL = activeConnection.model("UserConnection", UserConnectionsSchema, "user_connections");

  MODEL.get = function (query, project) {
    if (typeof query === "string") query = { userId: query };
    if (!project) project = { _id: 0 };
    return this.findOne(query, project).lean();
  };

  MODEL.set = function (query, alter, options = {}) {
    if (typeof query === "string") query = { userId: query };
    if (!options.upsert) options.upsert = true;
    return this.updateOne(query, alter, options).lean().exec();
  };

  /**
   * Get all connections for a user.
   * @param {string} userId
   * @returns {Promise<object[]>}
   */
  MODEL.allForUser = function (userId) {
    if (typeof userId === "object" && userId.id) userId = userId.id;
    return this.find({ userId: userId.toString() }, { _id: 0 }).lean();
  };

  /**
   * Bulk upsert connections from Discord OAuth response.
   * @param {string} userId
   * @param {object[]} connections - Array from Discord connections endpoint
   */
  MODEL.bulkUpsert = function (userId, connections) {
    if (!connections || !connections.length) return Promise.resolve();
    const ops = connections.map((c) => ({
      updateOne: {
        filter: { userId, type: c.type },
        update: {
          $set: {
            externalId: c.id || c.external_id || "",
            name: c.name || "",
            verified: c.verified || false,
            visibility: c.visibility || 0,
            show_activity: c.show_activity || false,
            friend_sync: c.friend_sync || false,
            two_way_link: c.two_way_link || false,
            metadata_visibility: c.metadata_visibility || 0,
            extra: c,
          },
        },
        upsert: true,
      },
    }));
    return this.bulkWrite(ops);
  };

  return MODEL;
};
