/** Mongoose query conventions (.lean(), .exec()): see ./utils.js JSDoc. */
module.exports = function SCHEMAS(activeConnection){
const collections = {
	miscDBrequire("./schemas/_misc/_misc.js")(activeConnection),
	serverDBrequire("./schemas/servers/servers.js")(activeConnection),
	channelDBrequire("./schemas/channels/channels.js")(activeConnection),
	svMetaDBrequire("./schemas/serverMeta/serverMeta.js")(activeConnection),
	marketplacerequire("./schemas/marketplace/marketplace.js")(activeConnection),
	relationshipsrequire("./schemas/relationships/relationships.js")(activeConnection),

	// ── New split user collections ────────────────────────────────
	usersCorerequire("./schemas/users_core/users_core.js")(activeConnection),
	userInventoryrequire("./schemas/user_inventory/user_inventory.js")(activeConnection),
	userOAuthrequire("./schemas/user_oauth/user_oauth.js")(activeConnection),
	userGuildsrequire("./schemas/user_guilds/user_guilds.js")(activeConnection),
	userQuestsrequire("./schemas/user_quests/user_quests.js")(activeConnection),
	userAnalyticsrequire("./schemas/user_analytics/user_analytics.js")(activeConnection),
	userConnectionsrequire("./schemas/user_connections/user_connections.js")(activeConnection),
}

	// ── Legacy monolithic userdb (fallback only) ──────────────────
	/** @deprecated Only used by _legacy_userdb_shim files. Will be removed. */
	const _legacyUserDB  = require("./schemas/_legacy_users.js")(activeConnection);

	return {
		version: require('./package.json').version,
		native: miscDB.global.db,
		serverDB,
		/** @deprecated Use DB._legacyUserDB for explicit legacy access. DB.users now points to new collection. */
		userDB: _legacyUserDB,
		channelDB,
		svMetaDB,
		localranks: require("./schemas/localranks/localranks.js")(activeConnection),
		rankings: require("./schemas/rankings/rankings.js")(activeConnection),
		responses: require("./schemas/responses/responses.js")(activeConnection),
		audits: require("./schemas/audits/audits.js")(activeConnection),
		miscDB,
			buyables: miscDB.buyables,
			fanart: miscDB.fanart,
			globalDB: miscDB.global,
			commends: miscDB.commends,
			control: miscDB.control,
			marketplace: miscDB.marketplace,
			reactRoles: miscDB.reactRoles,
			paidroles: miscDB.paidroles,
			relationships: miscDB.relationships,
			alerts: miscDB.alert,
			feed: miscDB.feed,
			usercols: miscDB.usercols,
			gifts: miscDB.gift,

		cosmetics: require("./schemas/cosmetics/cosmetics.js")(activeConnection),
		collectibles: require("./schemas/collectibles/collectibles.js")(activeConnection),
		items: require("./schemas/items/items.js")(activeConnection),
		achievements: require("./schemas/achievements/achievements.js")(activeConnection).ACHIEVEMENTS,
		quests: require("./schemas/achievements/achievements.js")(activeConnection).QUESTS,
		advLocations: (require("./schemas/adventure/adventure.js"))(activeConnection).LOCATIONS,
		advJourneys: (require("./schemas/adventure/adventure.js"))(activeConnection).JOURNEYS,
		mutes: require("./schemas/mutes/mutes.js")(activeConnection),
		temproles: require("./schemas/temproles/temproles.js")(activeConnection),
		promocodes: require("./schemas/promocodes/promocodes.js")(activeConnection),
		airlines: require("./schemas/airlines/airlines.js")(activeConnection),

		// ── New collections (authoritative) ───────────────────────
		users: usersCore,
		userInventory,
		userOAuth,
		userGuilds,
		userQuests,
		userAnalytics,
		userConnections,

		// ── Legacy (fallback shim only) ───────────────────────────
		/** @deprecated Only for _legacy_userdb_shim. Delete when sunset. */
		_legacyUserDB,

		servers: serverDB,
		guilds: serverDB,
		channels: channelDB,
		globals: miscDB.global,
		marketbase: async function refreshBases(projection) {
			let [bgBase, mdBase, stBase, itBase] = await Promise.all([
				this.cosmetics.find({
					type: "background" /* tradeable:true */
				}, {
					type: 1,
					rarity: 1,
					id: 1,
					name: 1,
					price: 1,
					code: 1,
				}).lean().exec(),
				this.cosmetics.find({
					type: "medal" /* tradeable:true */
				}, {
					type: 1,
					rarity: 1,
					id: 1,
					name: 1,
					price: 1,
					icon: 1,
				}).lean().exec(),
				this.cosmetics.find({
					type: "sticker" /* tradeable:true */
				}, {
					type: 1,
					rarity: 1,
					id: 1,
					name: 1,
					price: 1,
				}).lean().exec(),
				this.items.find({
					/* tradeable:true */ }, {
					type: 1,
					rarity: 1,
					id: 1,
					name: 1,
					price: 1,
					icon: 1,
				}).lean().exec(),
			]);
			bgBase = bgBase.map((itm) => ({
				name: itm.name,
				img: `/build/backdrops/${itm.code}.png`,
				id: itm.code,
				type: itm.type,
				rarity: itm.rarity,
				price: itm.price,
				_id: itm._id,
			}));
			mdBase = mdBase.map((itm) => ({
				name: itm.name,
				img: `/medals/${itm.icon}.png`,
				id: itm.icon,
				type: itm.type,
				rarity: itm.rarity,
				price: itm.price,
				_id: itm._id,
			}));
			stBase = stBase.map((itm) => ({
				name: itm.name,
				img: `/build/stickers/${itm.id}.png`,
				id: itm.id,
				type: itm.type,
				rarity: itm.rarity,
				price: itm.price,
				_id: itm._id,
			}));
			itBase = itBase.map((itm) => ({
				name: itm.name,
				img: itm.type == "boosterpack" ? `/boosters/showcase/${itm.id.replace("_booster", ".png")}` : `/build/items/${itm.icon}.png`,
				id: itm.id,
				type: itm.type,
				rarity: itm.rarity,
				price: itm.price,
				_id: itm._id,
			}));

			fullbase = [].concat.apply([], [bgBase, mdBase, stBase, itBase]);
			if (projection) {
				bgBase = !projection.bgBase ? null : bgBase;
				mdBase = !projection.mdBase ? null : mdBase;
				stBase = !projection.stBase ? null : stBase;
				itBase = !projection.itBase ? null : itBase;
				fullbase = !projection.fullbase ? null : fullbase;
			}
			return {
				bgBase,
				mdBase,
				stBase,
				itBase,
				fullbase,
			};
		},

		...collections,
	};
}