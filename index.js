
const mongoose = require("mongoose");

// Default all find/findOne to lean. Opt out with findOne(q, proj, { lean: false }).
mongoose.plugin(require("./plugins/leanDefaultPlugin.js"));

// lightweight color helpers (replacing the `colors` package usage)
function red(s){return `\x1b[31m${s}\x1b[0m`;}
function green(s){return `\x1b[32m${s}\x1b[0m`;}
function yellow(s){return `\x1b[33m${s}\x1b[0m`;}
function blue(s){return `\x1b[34m${s}\x1b[0m`;}

//FIXME: REDIS IS MANDATORY, MUST MAKE IT NOT MANDATORY OTHERWISE .cache() and .noCache() will fail
const RedisCache = require("./plugins/redisClient.js");

module.exports = async function ({hook, url, options},extras) {

	return new Promise(async resolve => {


		if (extras?.redis){
			RedisCache(
				extras.redis.host,
				extras.redis.port,
				extras.redis.options
			)
		}else{
			// Only install no-op stubs if RedisCache was never initialized.
			// Without this guard, a second DBSchema() call (vanilla connection
			// with redis:null) would overwrite the real .cache()/.noCache()
			// methods that the first call installed.
			if (!RedisCache.isInitialized()) {
				mongoose.Query.prototype.noCache = function() {return this};
				mongoose.Query.prototype.cache = function() {return this};
			}
		}

		console.info(blue("• "), "Connecting to Database...");

		const mongooseMajor = parseInt(mongoose.version.split('.')[0], 10);
		const cleanedOptions = { ...(options || {}) };
		if (mongooseMajor >= 6) {
			// Mongoose 6+ removed these flags entirely; passing them throws.
			["useNewUrlParser", "useUnifiedTopology", "useFindAndModify", "useCreateIndex"].forEach(
				(k) => delete cleanedOptions[k]
			);
		} else {
			// Mongoose 5.x: these flags suppress deprecation warnings from the
			// legacy MongoDB driver and must be set explicitly.
			cleanedOptions.useNewUrlParser    = true;
			cleanedOptions.useUnifiedTopology = true;
			cleanedOptions.useCreateIndex     = true;
			cleanedOptions.useFindAndModify   = false;
			mongoose.set('useCreateIndex', true);
			mongoose.set('useFindAndModify', false);
		}

		const db = mongoose.createConnection(url, cleanedOptions, (err) => {
			if (err) return console.error(err, `${red("• ")}Failed to connect to Database ${url}!`);
			return console.log(green("• "), "Connection OK");
		});

		const Schemas = require('./schemas.js')(db);
		const Virtuals = require('./virtuals.js')(Schemas);

		db.on("error", console.error.bind(console, red("• ") + red("DB connection error:")));

		db.once("open", async () => {
			console.log(green("• "), "DB connection successful");
			Schemas.collections = Schemas.users.db.collections;
			Schemas.raw = Schemas.users.db;

			return resolve(Schemas);
		});		
		db.on("reconnected", () => {
			if (hook) hook.ok("**RECONNECTED:** Database connection recovered.");
			else console.info(blue(" "), "[DB] Reconnected");
		});
		db.on("reconnectFailed", () => {
			if (hook) hook.error("**CRITICAL:** Database shutdown detected. All reconnection attempts failed.");
			else console.warn(yellow(" "), "[DB] Reconnect Failed")
		});
		db.on("disconnected", () => {
			if (hook) hook.warn("**ATTENTION:** Database possible shutdown detected. Attempting recovery.");
			else console.error(red(" "), "[DB] Disconnected")
		});

	})
}