
const miscDB = require("./schemas/_misc.js");
const serverDB = require("./schemas/servers.js");
const userDB = require("./schemas/users.js");
const channelDB = require("./schemas/channels.js");
const svMetaDB = require("./schemas/serverMeta.js");

module.exports = {
	native: miscDB.global.db,
	serverDB,
	userDB,
	channelDB,
	svMetaDB,
	localranks: require("./schemas/localranks.js"),
	rankings: require("./schemas/rankings.js"),
	responses: require("./schemas/responses.js"),
	audits: require("./schemas/audits.js"),
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

	cosmetics: require("./schemas/cosmetics.js"),
	collectibles: require("./schemas/collectibles.js"),
	items: require("./schemas/items.js"),
	achievements: require("./schemas/achievements.js").ACHIEVEMENTS,
	quests: require("./schemas/achievements.js").QUESTS,
	advLocations: (require("./schemas/adventure.js")).LOCATIONS,
	advJourneys: (require("./schemas/adventure.js")).JOURNEYS,
	mutes: require("./schemas/mutes.js"),
	temproles: require("./schemas/temproles.js"),
	promocodes: require("./schemas/promocodes.js"),
  	airlines: require("./schemas/airlines.js"),
	users: userDB,
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

};