/**
 * User Analytics — statistics and legacy metrics.
 * Collection: "user_analytics"
 *
 * Extracted from:
 *   userdb.progression.globalLV/globalXP → user_analytics.legacy.*
 *   userdb.counters.dashThemeClicks      → user_analytics.dashThemeClicks
 *   userdb.modules.statistics            → user_analytics.statistics
 *
 * @module user_analytics
 */
const mongoose = require("mongoose");

const { Mixed } = mongoose.Schema.Types;

module.exports = function USER_ANALYTICS(activeConnection) {

  const UserAnalyticsSchema = new mongoose.Schema({
    userId: { type: String, required: true, index: { unique: true } },

    legacy: {
      globalLV: { type: Number, default: 0 },
      globalXP: { type: Number, default: 0 },
    },

    dashThemeClicks: { type: Number, default: 0 },
    statistics: { type: Mixed, default: {} },

  }, {
    strict: true,
    collection: "user_analytics",
    timestamps: false,
  });

  const MODEL = activeConnection.model("UserAnalytics", UserAnalyticsSchema, "user_analytics");

  MODEL.get = function (userId, project) {
    if (typeof userId === "object" && userId.id) userId = userId.id;
    if (!project) project = { _id: 0 };
    return this.findOne({ userId: userId.toString() }, project).lean();
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
    return MODEL.getOrCreate(userId);
  };

  return MODEL;
};
