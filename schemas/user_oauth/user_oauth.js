/**
 * User OAuth — authentication tokens and identity cache.
 * Collection: "user_oauth"
 *
 * Extracted from:
 *   userdb.discordData.*   → user_oauth.discord.* / discordIdentityCache
 *   userdb.connections.patreon → user_oauth.patreon
 *   userdb.personal        → user_oauth.geo
 *
 * @module user_oauth
 */
const mongoose = require("mongoose");

const { Mixed } = mongoose.Schema.Types;

module.exports = function USER_OAUTH(activeConnection) {

  const UserOAuthSchema = new mongoose.Schema({
    userId: { type: String, required: true, index: { unique: true } },

    // Cached Discord profile (non-sensitive identity fields)
    discordIdentityCache: {
      id: String,
      username: String,
      avatar: String,
      discriminator: String,
      global_name: String,
      banner: String,
      flags: Number,
      premium_type: Number,
    },

    // Discord OAuth tokens (sensitive)
    discord: {
      accessToken: String,
      refreshToken: String,
      expiresAt: Date,
      scope: String,
      email: String,
      locale: String,
      verified: Boolean,
      mfa_enabled: Boolean,
      premium_type: Number,
    },

    // Patreon OAuth (sensitive)
    patreon: {
      accessToken: String,
      refreshToken: String,
      expiresAt: Date,
      scope: String,
      identity: Mixed,
    },

    // Geolocation / personal info
    geo: { type: Mixed, default: null },

    fetchedAt: { type: Date, default: Date.now },

  }, {
    strict: true,
    collection: "user_oauth",
    timestamps: false,
  });

  // ── Model & statics ────────────────────────────────────────────

  const MODEL = activeConnection.model("UserOAuth", UserOAuthSchema, "user_oauth");

  MODEL.get = function (userId, project) {
    if (typeof userId === "object" && userId.id) userId = userId.id;
    if (!project) project = { _id: 0 };
    return this.findOne({ userId: userId.toString() }, project).lean();
  };

  MODEL.getFull = function (userId) {
    if (typeof userId === "object" && userId.id) userId = userId.id;
    return this.findOne({ userId: userId.toString() });
  };

  MODEL.set = function (userId, alter, options = {}) {
    if (typeof userId === "object" && userId.id) userId = userId.id;
    if (!options.upsert) options.upsert = true;
    return this.updateOne({ userId: userId.toString() }, alter, options).lean().exec();
  };

  MODEL.getOrCreate = async function (userId) {
    if (typeof userId === "object" && userId.id) userId = userId.id;
    userId = userId.toString();
    let doc = await this.findOne({ userId });
    if (!doc) {
      doc = new MODEL({ userId });
      await doc.save();
    }
    return doc;
  };

  MODEL.new = function (userId) {
    if (typeof userId === "object" && userId.id) userId = userId.id;
    return MODEL.getOrCreate(userId);
  };

  return MODEL;
};
