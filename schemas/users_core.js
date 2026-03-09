/**
 * Users (core) — the hot-path user document.
 * Collection: "users"
 *
 * Only data needed for profile rendering, command execution, and
 * economy transactions lives here. Everything else is split into
 * satellite collections (user_inventory, user_oauth, etc.).
 *
 * Field layout mirrors the canonical mongoscript.js migration output.
 *
 * @module users_core
 */
const mongoose = require("mongoose");
const utils = require("../utils.js");

const { Mixed } = mongoose.Schema.Types;

module.exports = function USERS_CORE(activeConnection) {

  const UsersCoreSchema = new mongoose.Schema({
    id: { type: String, required: true, index: { unique: true } },
    name: { type: String, default: "" },
    tag: { type: String, default: "" },
    avatar: { type: String, default: null },
    personalhandle: {
      type: String, trim: true, index: true, unique: true, sparse: true,
    },

    // ── Currencies ────────────────────────────────────────────────
    // Nested under currency.* per mongoscript requirement.
    // Old path: modules.RBN  →  New path: currency.RBN
    currency: {
      RBN: { type: Number, default: 500, index: true },
      SPH: { type: Number, default: 0, index: true },
      JDE: { type: Number, default: 2500, index: true },
      PSM: { type: Number, default: 0 },
      EVT: { type: Number, default: 0, index: true },
    },

    // ── Profile (equipped cosmetic state) ─────────────────────────
    // Old path: modules.bgID  →  New path: profile.bgID
    profile: {
      background: { type: String, default: null },
      flair: { type: String, default: "default" },
      flairDown: { type: String, default: "default" },
      sticker: { type: String, default: null },
      color: { type: String, default: "#eb497b" },
      about: { type: String, default: "I have no bio because I'm too lazy to set one." },
      tagline: { type: String, default: "A fellow Pollux user" },
      medals: { type: [Mixed], default: [0, 0, 0, 0, 0, 0, 0, 0, 0] },
      skins: { type: Mixed, default: {} },
      featuredMarriage: { type: String, default: null },
    },

    // ── Progression ───────────────────────────────────────────────
    // Old path: modules.level  →  New path: progression.level
    progression: {
      level: { type: Number, default: 0, index: true },
      exp: { type: Number, default: 0, min: 0, index: true },
      craftingExp: { type: Number, default: 0 },
    },

    // ── Meta ──────────────────────────────────────────────────────
    meta: {
      createdAt: { type: Date, default: Date.now },
      lastLogin: { type: Date, default: null },
      lastUpdated: { type: Date, default: Date.now },
      migrated: { type: Boolean, default: false },
      apiKey: { type: String, default: null, sparse: true },
      apiPerms: { type: String, default: "basic" },
    },

    // ── Subscription / Prime ──────────────────────────────────────
    // Old path: donator / prime  →  Unified under prime
    prime: {
      type: Object,
      default: null,
      tier: { type: String, index: true },
      lastClaimed: Number,
      active: Boolean,
      maxServers: Number,
      canReallocate: Boolean,
      custom_background: Boolean,
      custom_handle: Boolean,
      custom_shop: Boolean,
      servers: [String],
      misc: Mixed,
    },

    blacklisted: { type: String, default: null },

    // Preferences / feature toggles
    switches: { type: Mixed, default: {} },

    // Time-sensitive counters (dailies, event timers, etc.)
    counters: { type: Mixed, default: {} },

    // Ephemeral event data
    eventData: { type: Mixed, default: {} },

    // ── Legacy bridge fields (read-only, kept for transition) ─────
    // These are NOT authoritative. The shim layer populates them
    // when adapting legacy docs. New code should NEVER write to these.
    /** @deprecated read from prime.tier instead */
    donator: { type: String, default: null },

    // Misc fields carried over from old schema
    spdaily: Mixed,
    rewardsMonth: Number,
    rewardsClaimed: Boolean,
    hidden: Boolean,
    cherries: Number,
    cherrySet: Mixed,
    married: Array,
    limits: Mixed,

  }, {
    strict: true, // only persist declared paths; typos in $set no longer create ghost fields
    collection: "users",
    timestamps: false,
  });

  // ── Pre-save hook: update meta.lastUpdated ──────────────────────
  UsersCoreSchema.pre(/^update/, function () {
    this.update({}, { $set: { "meta.lastUpdated": new Date() } });
  });

  // ── Instance methods ────────────────────────────────────────────

  /**
   * Increment a currency by amount.
   * @param {"RBN"|"SPH"|"JDE"|"PSM"|"EVT"} curr
   * @param {number} amt
   */
  UsersCoreSchema.methods.addCurrency = function (curr, amt = 1) {
    return this.constructor.updateOne(
      { id: this.id },
      { $inc: { [`currency.${curr}`]: amt } }
    );
  };

  /**
   * Add XP to user.
   * @param {number} amt
   */
  UsersCoreSchema.methods.addXP = function (amt = 1) {
    return this.constructor.updateOne(
      { id: this.id },
      { $inc: { "progression.exp": amt } }
    );
  };

  /**
   * Generic attribute incrementer.
   * @param {string} attr  Dot-path relative to document root
   * @param {number} amt
   */
  UsersCoreSchema.methods.incrementAttr = function (attr, amt = 1) {
    return this.constructor.updateOne(
      { id: this.id },
      { $inc: { [attr]: amt } }
    );
  };

  // ── Model ───────────────────────────────────────────────────────

  const MODEL = activeConnection.model("UsersCore", UsersCoreSchema, "users");

  MODEL.updateMeta = (U) =>
    MODEL.updateOne(
      { id: U.id },
      {
        $set: {
          name: U.username || U.global_name || "",
          tag: U.tag || `${U.username}#${U.discriminator || "0"}`,
          avatar: U.displayAvatarURL || U.avatar || null,
          "meta.lastUpdated": new Date(),
        },
      },
      { upsert: false }
    );

  MODEL.new = (userDATA) => {
    if (!userDATA) return;
    return new Promise((resolve) => {
      MODEL.findOne({ id: userDATA.id }, (err, existing) => {
        if (err) console.error(err);
        if (existing) return resolve(existing);

        const user = new MODEL({
          id: userDATA.id,
          name: userDATA.username || userDATA.global_name || "",
          tag: userDATA.tag || "",
          avatar: userDATA.displayAvatarURL || userDATA.avatar || null,
          "meta.createdAt": new Date(),
          "meta.migrated": true,
        });
        user.save((err) => {
          if (err) console.error("[UsersCore] save error:", err);
          return resolve(user);
        });
      });
    });
  };

  MODEL.cat = "users";
  MODEL.check = utils.dbChecker;
  MODEL.set = utils.dbSetter;

  MODEL.get = function (query, project, avoidNew) {
    return new Promise(async (resolve) => {
      if (["string", "number"].includes(typeof query)) {
        query = { id: query.toString() };
      }
      if (!typeof project) project = { _id: 0 };
      const data = await this.findOne(query, project).lean();
      if (data === null && (query.id || typeof query === "string"))
        return resolve(this.new(await PLX.resolveUser?.(query.id || query)));
      return resolve(data);
    });
  };

  MODEL.getFull = utils.dbGetterFull;

  return MODEL;
};
