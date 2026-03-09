/**
 * User Guilds — cached Discord guild memberships.
 * Collection: "user_guilds"
 *
 * Extracted from userdb.discordData.guilds (unwound per guild).
 * One document per (userId, guildId) pair.
 *
 * @module user_guilds
 */
const mongoose = require("mongoose");

const { Mixed } = mongoose.Schema.Types;

module.exports = function USER_GUILDS(activeConnection) {

  const UserGuildsSchema = new mongoose.Schema({
    userId: { type: String, required: true, index: true },
    guildId: { type: String, required: true, index: true },
    name: { type: String, default: "" },
    icon: { type: String, default: null },
    banner: { type: String, default: null },
    owner: { type: Boolean, default: false },
    permissions: { type: Number, default: 0 },
    permissions_new: { type: String, default: null },
    features: { type: [String], default: [] },
    cachedAt: { type: Date, default: Date.now },
  }, {
    strict: true,
    collection: "user_guilds",
    timestamps: false,
  });

  // Compound unique index matching mongoscript
  UserGuildsSchema.index({ userId: 1, guildId: 1 }, { unique: true });

  const MODEL = activeConnection.model("UserGuild", UserGuildsSchema, "user_guilds");

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
   * Get all guilds for a user.
   * @param {string} userId
   * @returns {Promise<object[]>}
   */
  MODEL.allForUser = function (userId) {
    if (typeof userId === "object" && userId.id) userId = userId.id;
    return this.find({ userId: userId.toString() }, { _id: 0 }).lean();
  };

  /**
   * Upsert multiple guilds for a user at once.
   * @param {string} userId
   * @param {Array<object>} guilds
   */
  MODEL.bulkUpsert = function (userId, guilds) {
    if (!guilds || !guilds.length) return Promise.resolve();
    const ops = guilds.map((g) => ({
      updateOne: {
        filter: { userId, guildId: g.id },
        update: {
          $set: {
            name: g.name,
            icon: g.icon,
            banner: g.banner,
            owner: g.owner,
            permissions: g.permissions,
            permissions_new: g.permissions_new,
            features: g.features,
            cachedAt: new Date(),
          },
        },
        upsert: true,
      },
    }));
    return this.bulkWrite(ops);
  };

  return MODEL;
};
