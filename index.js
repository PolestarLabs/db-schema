const mongoose = require("mongoose");
const RedisCache = require("./redisClient.js");

const Schemas = require('./schemas.js');
const Virtuals = require('./virtuals.js');

module.exports = async function ({hook,	url, options},extras) {
	return new Promise(async resolve => {


		if (extras?.redis){
			RedisCache(
				extras.redis.host,
				extras.redis.port,
				extras.redis.options
			)
		}

		console.info("• ".blue, "Connecting to Database...");

		mongoose.connect(url, options, (err) => {
			if (err) return console.error(err, `${"• ".red}Failed to connect to Database!`);
			return console.log("• ".green, "Connection OK");
		});

		mongoose.set("useFindAndModify", false);
		mongoose.set("useCreateIndex", true);

		const db = mongoose.connection;
		db.on("error", console.error.bind(console, "• ".red + "DB connection error:".red));
		db.once("open", async () => {
			console.log("• ".green, "DB connection successful");
			Schemas.collections = Schemas.users.db.collections;
			Schemas.raw = Schemas.users.db;

			return resolve(Schemas);
		});		
		db.on("reconnected", () => {
			if (hook) hook.ok("**RECONNECTED:** Database connection recovered.");
			else console.info(" ".blue, "[DB] Reconnected")
		});
		db.on("reconnectFailed", () => {
			if (hook) hook.error("**CRITICAL:** Database shutdown detected. All reconnection attempts failed.");
			else console.warn(" ".yellow, "[DB] Reconnect Failed")
		});
		db.on("disconnected", () => {
			if (hook) hook.warn("**ATTENTION:** Database possible shutdown detected. Attempting recovery.");
			else console.error(" ".red, "[DB] Disconnected")
		});

	})
}