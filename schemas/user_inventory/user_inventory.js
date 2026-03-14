/**
 * User Cosmetics — inventory and collectible satellite collection.
 * Collection: "user_inventory"
 *
 * Extracted from the monolithic userdb.modules.* fields.
 * One document per user, keyed by userId.
 *
 * Old paths:
 *   modules.inventory       → user_inventory.inventory
 *   modules.bgInventory     → user_inventory.bgInventory
 *   modules.skinInventory   → user_inventory.skinInventory
 *   modules.flairsInventory → user_inventory.flairInventory
 *   modules.medalInventory  → user_inventory.medalInventory
 *   modules.stickerInventory→ user_inventory.stickerInventory
 *   modules.stickerCollection→user_inventory.stickerShowcase
 *   modules.fishes           → user_inventory.fishes
 *   modules.fishCollection   → user_inventory.fishShowcase
 *   modules.achievements     → user_inventory.achievements
 *
 * @module user_inventory
 */
const mongoose = require("mongoose");
const utils = require("../../utils.js");

const { Mixed } = mongoose.Schema.Types;

module.exports = function USER_COSMETICS(activeConnection) {

  const UserInventorySchema = new mongoose.Schema({
    userId: { type: String, required: true, index: { unique: true } },

    inventory: {
      type: [{
        id: { type: String, required: true },
        count: { type: Number, default: 0 },
        crafted: { type: Number, default: 0 },
      }],
      default: [{ id: "lootbox_dev", count: 1, crafted: 0 }],
    },

    bgInventory: { type: [String], default: ["5zhr3HWlQB4OmyCBFyHbFuoIhxrZY6l6"] },
    skinInventory: { type: [String], default: [] },
    flairInventory: { type: [String], default: [] },
    medalInventory: { type: [String], default: [] },
    stickerInventory: { type: [String], default: [] },
    stickerShowcase: { type: [String], default: [] },
    fishes: { type: [Mixed], default: [] },
    fishShowcase: { type: [Mixed], default: [] },
    achievements: { type: [Mixed], default: [] },

  }, {
    strict: true,
    collection: "user_inventory",
    timestamps: false,
  });

  // ── Instance methods (ported from legacy UserSchema) ────────────

  /**
   * Add an item to inventory.
   * @param {string} itemId
   * @param {number} [amt=1]
   * @param {boolean} [crafted=false]
   */
  UserInventorySchema.methods.addItem = function (itemId, amt = 1, crafted = false) {
    const existing = this.inventory.find((itm) => itm.id === itemId);
    if (!existing) {
      return this.constructor.updateOne(
        { userId: this.userId },
        { $addToSet: { inventory: { id: itemId, count: amt, crafted: crafted ? amt : 0 } } }
      );
    }
    return this.constructor.updateOne(
      { userId: this.userId },
      {
        $inc: {
          "inventory.$[item].count": amt,
          "inventory.$[item].crafted": crafted ? amt : 0,
        },
      },
      { arrayFilters: [{ "item.id": itemId }] }
    );
  };

  /**
   * Remove an item from inventory.
   * @param {string} itemId
   * @param {number} [amt=1]
   * @param {boolean} [crafted=false]
   */
  UserInventorySchema.methods.removeItem = function (itemId, amt = 1, crafted = false) {
    return this.addItem(itemId, -amt, crafted);
  };

  /**
   * Batch-modify multiple inventory items at once.
   * @param {Array<{id:string, count:number}>} items
   * @param {boolean} [debug=false]
   */
  UserInventorySchema.methods.modifyItems = async function (items, debug) {
    const arrayFilters = [];
    const increments = {};

    for (let i = 0; i < items.length; i++) {
      arrayFilters.push({ [`i${i}.id`]: items[i].id });
      Object.keys(items[i]).forEach((key) => {
        if (key !== "id") {
          increments[`inventory.$[i${i}].${key}`] = items[i][key];
        }
      });
    }

    const unowned = items.filter(
      (itm) => !this.inventory.some((inv) => inv.id === itm.id)
    );
    if (unowned.length) {
      await this.constructor.updateOne(
        { userId: this.userId },
        {
          $addToSet: {
            inventory: {
              $each: unowned.map((ni) => ({ id: ni.id, count: 0, crafted: 0 })),
            },
          },
        }
      );
    }

    if (debug) return [unowned, { userId: this.userId }, { $inc: increments }, { arrayFilters }];

    return this.constructor.updateOne(
      { userId: this.userId },
      { $inc: increments },
      { arrayFilters }
    );
  };

  /**
   * Check if user owns at least `count` of an item.
   * @param {string} itemId
   * @param {number} [count=1]
   * @returns {boolean}
   */
  UserInventorySchema.methods.hasItem = function (itemId, count = 1) {
    return (this.inventory.find((itm) => itm.id === itemId)?.count || 0) >= count;
  };

  /**
   * Get the quantity of an item in inventory.
   * @param {string} itemId
   * @returns {number}
   */
  UserInventorySchema.methods.amtItem = function (itemId) {
    return this.inventory.find((itm) => itm.id === itemId)?.count || 0;
  };

  // ── Model & statics ────────────────────────────────────────────

  const MODEL = activeConnection.model("UserInventory", UserInventorySchema, "user_inventory");

  /**
   * Get cosmetics doc by userId (lean).
   * @param {string} userId
   * @param {object} [project]
   * @returns {Promise<object|null>}
   */
  MODEL.get = function (userId, project) {
    if (typeof userId === "object" && userId.id) userId = userId.id;
    if (!project) project = { _id: 0 };
    return this.findOne({ userId: userId.toString() }, project).lean();
  };

  /**
   * Get full Mongoose document (with instance methods).
   * @param {string} userId
   * @returns {Promise<Document>}
   */
  MODEL.getFull = function (userId) {
    if (typeof userId === "object" && userId.id) userId = userId.id;
    return this.findOne({ userId: userId.toString() });
  };

  /**
   * Update cosmetics doc.
   * @param {string} userId
   * @param {object} alter
   * @param {object} [options]
   */
  MODEL.set = function (userId, alter, options = {}) {
    if (typeof userId === "object" && userId.id) userId = userId.id;
    if (!options.upsert) options.upsert = true;
    return this.updateOne({ userId: userId.toString() }, alter, options).lean().exec();
  };

  /**
   * Get or create a cosmetics document for a user.
   * @param {string} userId
   * @returns {Promise<Document>}
   */
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

  /**
   * Create a new cosmetics document.
   * @param {string} userId
   */
  MODEL.new = function (userId) {
    if (typeof userId === "object" && userId.id) userId = userId.id;
    return MODEL.getOrCreate(userId);
  };

  return MODEL;
};
