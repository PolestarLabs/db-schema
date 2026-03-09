/**
 * User Quests — per-quest progress tracking.
 * Collection: "user_quests"
 *
 * Extracted from userdb.quests[] (unwound per quest).
 * One document per (userId, questId) pair.
 *
 * @module user_quests
 */
const mongoose = require("mongoose");

module.exports = function USER_QUESTS(activeConnection) {

  const UserQuestsSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    questId: { type: Number, required: true },
    target: { type: Number, default: 0 },
    tracker: { type: String, default: "" },
    progress: { type: Number, default: 0 },
    completed: { type: Boolean, default: false },
    completedAt: { type: Date, default: null },
  }, {
    strict: true,
    collection: "user_quests",
    timestamps: false,
  });

  // Compound unique index matching mongoscript
  UserQuestsSchema.index({ userId: 1, questId: 1 }, { unique: true });

  const MODEL = activeConnection.model("UserQuest", UserQuestsSchema, "user_quests");

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
   * Get all quests for a user.
   * @param {string} userId
   * @returns {Promise<object[]>}
   */
  MODEL.allForUser = function (userId) {
    if (typeof userId === "object" && userId.id) userId = userId.id;
    return this.find({ userId: userId.toString() }, { _id: 0 }).lean();
  };

  /**
   * Increment quest progress. Marks as completed if target is reached.
   * @param {string} userId
   * @param {number} questId
   * @param {number} [amt=1]
   */
  MODEL.incrementProgress = async function (userId, questId, amt = 1) {
    const result = await this.findOneAndUpdate(
      { userId, questId, completed: false },
      { $inc: { progress: amt } },
      { new: true, upsert: false }
    );
    if (result && result.progress >= result.target && !result.completed) {
      await this.updateOne(
        { userId, questId },
        { $set: { completed: true, completedAt: new Date() } }
      );
    }
    return result;
  };

  return MODEL;
};
