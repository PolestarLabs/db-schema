const mongoose = require("mongoose");
const utils = require("../utils.js");

const { Mixed } = mongoose.Schema.Types;


const UserSchema = new mongoose.Schema({
  id: { type: String, required: true, index: { unique: true } },
  name: String,
  personalhandle: {
    type: String, trim: true, index: true, unique: true, sparse: true,
  },
  meta: Mixed,

  // PREMIUM
  switches: Mixed,
  progression: Mixed,
  spdaily: Mixed,
  rewardsMonth: Number,
  rewardsClaimed: Boolean,

  // CONTROL
  personal: Mixed,
  tag: String,
  hidden: Boolean,

  // COUNTERS
  eventDaily: Number,
  eventGoodie: Number,

  cherries: Number,
  cherrySet: Mixed,
  lastUpdated: { type: Mixed },

  // OLD BL
  blacklisted: String,
  married: Array,
  eventData: Mixed,

  // MODULES
  featuredMarriage: String,
  counters: Mixed,
  modules: {
    powerups: Mixed,
    lovepoints: Number,
    PERMS: { type: Number, default: 3 },

    // LEVEL
    level: { type: Number, default: 0, index: true },
    exp: {
      type: Number, default: 0, min: 0, index: true,
    },

    // PROFILE
    persotext: { type: String, default: "I have no personal text because I'm too lazy to set one." },
    tagline: { type: String, default: "A fellow Pollux user" },
    rep: { type: Number, default: 0 },
    repdaily: { type: Number, default: 0 },

    favcolor: { type: String, default: "#eb497b" },
    inventory: { type: Array, default: [{"lootbox_dev":1}] },
    bgID: { type: String, default: "5zhr3HWlQB4OmyCBFyHbFuoIhxrZY6l6" },
    sticker: String,
    bgInventory: { type: Array, default: ["5zhr3HWlQB4OmyCBFyHbFuoIhxrZY6l6"] },
    skins: Mixed,
    skinInventory: [String],
    // skin: {type: String, default:'default'},
    // skinsAvailable: Array,
    achievements: Array,

    // FINANCES
    SPH: { type: Number, default: 0 ,index: true},
    RBN: { type: Number, default: 500, index: true },
    JDE: { type: Number, default: 2500, index: true },
    coins: { type: Number, default: 0 },

    dyStreakHard: { type: Number, default: 0 },
    daily: { type: Number, default: 1486595162497 },

    flairTop: { type: String, default: "default" },
    flairDown: { type: String, default: "default" },
    flairsInventory: Array,

    // cosmetics

    // ----MEDALS
    medals: { type: Array, default: [0, 0, 0, 0, 0, 0, 0, 0, 0] },
    medalInventory: Array,

    // -/---CARDS
    // cards: Array,
    // cardInventory: Array,
    // cardCollection: Array,
    // ----STAMPS
    // stampInventory: Array,
    // stampCollection: Array,
    // ----STICKERS
    stickerInventory: Array,
    stickerCollection: Array,
    // ----FISHES
    fishes: Array,
    fishCollection: Array,
    // ----ELEMENTS
    // elements: Array,
    // elementCollection: Array,
    // ----FLOWERS
    // flowers: Array,
    // flowerCollection: Array,

    //-------------------------------

    // MIS

    /*
      build: {
          STR: {type:Number,default:10},
          DEX: {type:Number,default:10},
          CON: {type:Number,default:10},
          INT: {type:Number,default:10},
          WIS: {type:Number,default:10},
          CHA: {type:Number,default:10},
          weaponA: {type:String,default:'none'},
          weaponB: {type:String,default:'none'},
          shield: {type:String,default:'none'},
          armor: {type:String,default:'none'},
          invent: Array,
          skills: Array,
          HP: {type:Number,default:100},
          MP:{type:Number,default:100}
      },
      */
    commend: { type: Number, index: true },
    commended: { type: Number, index: true },
    fun: {
      waifu: Mixed,
      lovers: Mixed,
      shiprate: Mixed,
    },
    statistics: Mixed,
  },

  partner: Boolean,
  polluxmod: Boolean,
  donator: String,
  donatorActive: String,
  limits: Mixed,

}, { strict: false });

UserSchema.pre(/^update/, function () {
  this.update({}, { $set: { lastUpdated: new Date() } });
});

/**
 * 
 * @param {string} itemId ID of the item
 * @param {number} [amt=1] - Amount to add to inventory
 * @param {boolean} [crafted=false] - Whether increment the CRAFTED counter or not
 */

function addItem(USERDATA,itemId, amt = 1,crafted=false) {

  let unowned_item =  USERDATA.modules.inventory.find((itm) => itm.id == itemId);
  if(!unowned_item) return USERDATA.constructor.updateOne({id:USERDATA.id},{$addToSet:{'modules.inventory':{id: itemId, count: amt, crafted: crafted?amt:0}}});

  return USERDATA.constructor.updateOne(
    { id: USERDATA.id },
    {$inc:{
      "modules.inventory.$[item].count": amt,
      "modules.inventory.$[item].crafted": crafted ? amt : 0
    }},
    {arrayFilters: [
      {"item.id":itemId}
    ]}
  );
};

UserSchema.methods.addItem = function(item,amt,crafted){
  return addItem(this,item,amt,crafted)
}

/**
 * 
 * @param {array} items Array of items and counts
 * @param {string} items.id  Item ID
 * @param {number} items.count Item Amount
 */


UserSchema.methods.modifyItems = async function modifyItems(items) {

  const arrayFilters = [];
  const increments = {};
  
  for (i = 0; i < items.length; i++){
    arrayFilters.push({[`i${i}`]: items[i].id });
    Object.keys(items[i]).forEach(key=>{
      if (key !== "id"){
        increments[`modules.inventory.$[i${i}].${key}`] = items[i][key];
      }
    })
  };

  let unowned_items =  this.modules.inventory.filter((itm) => !(items.map(i=>i.id).includes(itm.id)) );
  if(unowned_items.length){
    await this.constructor.updateOne({id:this.id},{
      $addToSet:{
        'modules.inventory': {
          $each: unowned_items.map(newItem=> ({id: newItem.id, count: 0}) )
        }
      }
    });
  }

  const res = await this.constructor.updateOne(
    { id: this.id },
    {$inc: increments},
    {arrayFilters}
  );
  return res;
};

UserSchema.methods.removeItem = function(item,amt=1,crafted){
  return addItem(this,item,-amt,crafted)
}

UserSchema.methods.upCommend = function upCommend(USER, amt = 1) {
  const miscDB = require("./_misc.js");
  return new Promise(async (resolve) => {
    await Promise.all([
      miscDB.commends.add(this.id, USER.id, amt),
      miscDB.commends.new(USER),
    ]);
    const res = await miscDB.commends.parseFull(this.id);
    resolve(res);
  });
};

/**
 * 
 * @param {string} itemId ID of the item
 * @param {number} [count=1] - Amount to check against user inventory 
 * 
 */

UserSchema.methods.hasItem = function hasItem(itemId,count=1) {
  return this.modules.inventory.find((itm) => itm.id == itemId)?.count >= count;
};

/**
 * 
 * @param {string} itemId ID of the item
 * @param {string} search - Unused, meant for softmatch in the future
 */
UserSchema.methods.amtItem = function amountItem(itemId, search) {
  // find solution for itemtype search
  // if(search)  return this.modules.inventory.find(itm=>itm.id == itemId)?.count || 0;
  return this.modules.inventory.find((itm) => itm.id == itemId)?.count || 0;
};

/**
 * 
 * @param {number} [amt=1] EXP to add 
 */
UserSchema.methods.addXP = function addXP(amt = 1) {
  return this.constructor.updateOne({ id: this.id },{ $inc: { "modules.exp": amt } });
};

/**
 * 
 * @param {string} attr The attribute to be incremented.
 * @param {number} [amt=1] Amount
 * @param {bool} [upper=false] Whether the attribute is under "USERDATA.modules" or on the root of the document
 */
UserSchema.methods.incrementAttr = function incrementAttr(attr, amt = 1, upper = false) {
  const attrib = upper ? attr : `modules.${attr}`;
  return this.constructor.updateOne({ id: this.id }, { $inc: { [attrib]: amt } });
};

const MODEL = mongoose.model("UserDB", UserSchema, "userdb");

MODEL.updateMeta = (U) => new Promise(async (resolve) => MODEL.updateOne({ id: U.id }, {
  $set: {
    meta: {
      tag: U.tag,
      username: U.username,
      discriminator: U.discriminator,
      avatar: U.displayAvatarURL,
      staticAvatar: (U.displayAvatarURL || "").replace("gif", "png"),
    },
  },
}));

MODEL.new = (userDATA) => {
  if (!userDATA) return;

  return new Promise((resolve) => {
    MODEL.findOne({ id: userDATA.id }, (err, newUser) => {
      if (err) console.error(err);
      if (newUser) {
        return resolve(newUser);
      }
      const user = new MODEL({
        id: userDATA.id,
        name: userDATA.username,
        tag: userDATA.tag,
      });
      user.save((err) => {
        if (err) return console.error("USERSAVE ERROR".bgRed.white);
        MODEL.updateMeta(userDATA);
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

    if (data === null)  return resolve( this.new( await PLX.resolveUser?.(query.id||query) ) );

    return resolve(data);
  });

},
MODEL.getFull = utils.dbGetterFull;

module.exports = MODEL;
