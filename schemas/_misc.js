const mongoose = require("mongoose");

const { Schema } = mongoose;
const { Mixed } = Schema.Types;
const utils = require("../utils.js");

const UserCollection = new Schema({
  id: String,
  collections: Mixed,
});

const usercols = mongoose.model("UserCollection", UserCollection, "usercollections");
usercols.set = utils.dbSetter;
usercols.get = utils.dbGetter;
usercols.new = (payload) => {
  const aud = new usercols(payload);
  aud.save((err) => {
    if (err) return console.error(err);
  });
};

const Buyable = new Schema({
  id: String,
  price_USD: Number,
  price_BRL: Number,
  sendTo: String,
  name: String,
  description: String,
  img: String,
  filter: String,
  other: Mixed,
});

const Commends = new Schema({
  //NOTE: COMPOUND INDEX MUST BE MANUALLY CREATED FOR FROM/TO
  from: { type: String, required: true, index: true},
  to: { type: String, required: true, index: true},
  count: { type: Number, required: true, index: true},
});

const Globals = new Schema({
  id: { type: Number, default: 0, unique: true },
  data: Mixed,
}, { strict: false });

const Control = new Schema({
  id: { type: String, unique: true },
  data: Mixed,
}, { strict: false });

const ReactionRoles = new Schema({
  channel: String,
  message: String,
  server: String,
  rolemoji: Array,
}, { strict: false });

const PaidRoles = new Schema({
  server: String,
  role: String,
  price: String,
  temp: Number,
  unique: Mixed,

}, { strict: false });

const FanartModel = new Schema({
  id: String,
  src: String,
  thumb: String,
  title: String,
  description: String,
  date: Date,
  author: String,
  author_ID: String,
  publish: Boolean,
  extras: Mixed,
}, { strict: false });

const MarketplaceModel = new Schema({
  id: String,
  item_id: String,
  item_type: String,
  price: Number,
  currency: String,
  author: String,
  timestamp: Number,
  type: String,
  lock: Boolean,
  completed: Boolean,
}, { strict: false });

const RelationShipModel = new Schema({
  id: String,
  users: [{type:String, ref:'User'}],
  ring: {type:String, ref:'Item'},
  ringCollection: [{type:String, ref: 'Item'}],
  initiative: {type:String, ref:'User'},
  since: Schema.Types.int64,
  lovepoints: Number,
  type: String, // MARRIAGE / PARENTS / CHILDREN

}, { strict: false });
RelationShipModel.virtual()


const GiftItem = new Schema({
  id: String,
  creator: String,
  holder: String,
  previous: Array, 
  type: String, // Cosmetic | Item
  querystring: Mixed,
  icon: { type: String, default: "wrap" },
  message: String,

}, { strict: false });

const gift = mongoose.model("Gift", GiftItem, "GIFTS");
gift.set = utils.dbSetter;
gift.get = utils.dbGetter;



const FeedModel = new Schema({
  server: String,
  type: String, // RSS, TWITCH, YouTube
  url: String,
  last: Mixed,
  channel: String,
  thumb: String,
  name: String,
  expires: Number,
  repeat: Number,
});
const feed = mongoose.model("Feeds", FeedModel, "Feeds");
feed.set = utils.dbSetter;
feed.get = utils.dbGetter;
feed.new = (payload) => {
  const ff = new feed(payload);
  ff.save((err) => {
    if (err) return console.error(err);
    console.log("[NEW FEED ENTRY]".blue, payload);
  });
};

const AlertsModel = new Schema({
  type: { type: String }, // RECURRING, ONETIME
  scope: String, // SERVER, DM
  channel: String,
  alerts: [{
    time: Number,
    interval: Number,
    text: String,
  }],
});

const alert = mongoose.model("Alert", AlertsModel, "Alerts");
alert.set = utils.dbSetter;
alert.get = utils.dbGetter;

const control = mongoose.model("Control", Control, "control");
control.set = utils.dbSetter;
control.get = utils.dbGetter;

const reactRoles = mongoose.model("ReactionRoles", ReactionRoles, "ReactionRoles");
reactRoles.set = utils.dbSetter;
reactRoles.get = utils.dbGetter;

const paidroles = mongoose.model("PaidRoles", PaidRoles, "PaidRoles");
paidroles.set = utils.dbSetter;
paidroles.get = utils.dbGetter;
paidroles.new = (payload) => {
  const aud = new paidroles(payload);
  aud.save((err) => {
    if (err) return console.error(err);
    console.log("[NEW PAID ROLE]".blue, payload);
  });
};

const global = mongoose.model("Global", Globals, "globals");
global.set = function (alter) {
  if (!typeof alter) console.warn("Invalid Alter Object");
  return this.updateOne({ id: 0 }, alter);
};
global.get = async function () {
  try {
    return (await this.findOne()).data;
  } catch (e) {
    return (await this.findOne());
  }
};

const MARKETPLACE = mongoose.model("marketplace", MarketplaceModel, "marketplace");
MARKETPLACE.set = utils.dbSetter;
MARKETPLACE.get = utils.dbGetter;
MARKETPLACE.new = (payload) => {
  const aud = new MARKETPLACE(payload);
  aud.save((err) => {
    if (err) return console.error(err);
    console.log("[NEW MARKETPLACE ENTRY]".blue, payload);
  });
  return aud;
};

const relationships = mongoose.model("Relationship", RelationShipModel, "relationships");
relationships.set = utils.dbSetter;
relationships.get = utils.dbGetter;
relationships.create = function (type, users, initiative, ring, date) {
  return new Promise(async (resolve, reject) => {
    const rel = await relationships.find({ type, users: { $all: users } });
    if (rel.length > 0) return reject(`Duplicate Relationship: \n${JSON.stringify(rel, null, 2)}`);

    relationship = new relationships({
      type, users, initiative, ring, since: date || Date.now(),
    });
    relationship.save((err, item) => {
      resolve(item);
    });
  });
};

const fanart = mongoose.model("fanart", FanartModel, "fanart");
fanart.set = utils.dbSetter;
fanart.get = utils.dbGetter;

const buyables = mongoose.model("buyables", Buyable, "buyables");
buyables.set = utils.dbSetter;
buyables.get = utils.dbGetter;

const commends = mongoose.model("commends", Commends, "commends");
commends.set = utils.dbSetter;
commends.get = utils.dbGetter;

commends.add = function(idFrom,idTo){
  return new Promise( async (resolve,reject) => {
    let currentCommend = await commends.findOne({from: idFrom, to: idTo}).catch(reject);
    if (!currentCommend) return (new commends({from: idFrom, to: idTo, count: 1})).save(err=> err?reject(err):resolve(1));
    return commends.updateOne({from: idFrom, to: idTo},{$inc: {count:1}}).then(res=> resolve(currentCommend.count + 1)).catch(reject);
  })
}

commends.parseFull  = async function(userId){
  // LEGACY FORMAT
  // { id: Target.id, whoIn: [], whoOut: [] };

  userId = userId.id || userId;

  let [_out,_in] = await Promise.all([ commends.find({from:userId}), commends.find({to:userId})]);

  return {
    id: userId,
    whoIn: _in.map(comm=> ({id:comm.from,count:comm.count}) ),
    whoOut: _out.map(comm=> ({id:comm.to,count:comm.count}) ),
    get totalIn(){
      return this.whoIn?.reduce( (a,b)=> a + b.count, 0 );
    },
    get totalOut(){
      return this.whoOut?.reduce( (a,b)=> a + b.count, 0 );
    }
  }
}

module.exports = {
  gift, paidroles, usercols, global, fanart, buyables, commends, reactRoles, marketplace: MARKETPLACE, relationships, alert, feed, control,
};
