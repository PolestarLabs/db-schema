const mongoose = require("mongoose");

const { Schema } = mongoose;
const { Mixed } = Schema.Types;
const utils = require("../utils.js");
const crypto = require('crypto')

// NOTE Other indexes will be manually added to the database manually (compound from/to pair)
const Audit = new Schema({
    from: String,
    to: String,
    type: String,
    currency: String,
    transaction: String,
    amt: Number,
    timestamp: { type: Number, required: true, index: true },
    transactionId: { type: String, required: true, index: { unique: true } },
    details: Mixed
  }, { strict: false });

const AUDIT = mongoose.model("Audit", Audit, "transactions");
AUDIT.set = utils.dbSetter;
AUDIT.get = utils.dbGetter;

AUDIT.new = (payload) => {
    const newAudit = new AUDIT(payload);

    if (!payload.transactionId) payload.transactionId = (  (currency || type) + (~~(Date.now()/1000)).toString(32) + crypto.randomBytes(3).toString('hex')).toUpperCase()
    if (!payload.from && !!payload.to) payload.from = PLX?.user?.id || "UNKNOWN";
    if (!payload.to && !!payload.from) payload.to   = PLX?.user?.id || "UNKNOWN";
    payload.timestamp ??= Date.now();

    return new Promise((resolve,reject) => {        
        newAudit.save((err) => {
            if (err) {
                console.error(err);
                return reject(err);
            }
            console.log("[NEW AUDIT]".blue, payload);
            return resolve(payload.transactionId);
        });
    })
};

AUDIT.receive = (user,type, currency = "N/A", amt = 1) => {
    return AUDIT.new({
        to: user,
        type, currency, amt,
        timestamp: Date.now(),
        transaction: "|<"        
    })
}
AUDIT.forfeit = (user,type, currency = "N/A", amt = 1) => {
    return AUDIT.new({
        from: user,
        type, currency, amt,
        timestamp: Date.now(),
        transaction: ">|"        
    })
}

module.exports = AUDIT;