const Schemas = require("./schemas.js");

const Marketplace = Schemas.marketplace.schema;
const Users = Schemas.users.schema;
const Items = Schemas.items.schema;
const Cosmetics = Schemas.cosmetics.schema;
const Relationships = Schemas.relationships.schema;

Marketplace.virtual("authorData",{
    ref: 'UserDB',
    localField: 'author',
    foreignField: 'id',
    justOne: true
});

Marketplace.virtual("moreFromAuthor",{
    ref: 'marketplace',
    localField: 'author',
    foreignField: 'author',
    justOne: false
});

Marketplace.virtual("moreLikeThis",{
    ref: 'marketplace',
    localField: 'item_id',
    foreignField: 'item_id',
    justOne: false
});

Marketplace.virtual("itemData",{
    ref: function () {
        return ['background','medal','flair','sticker','shade'].includes(this.item_type)
            ? "Cosmetic"
            : "Item";
    } ,
    localField: 'item_id',
    foreignField: '_id',
    justOne: true
});


// USER

Users.virtual("itemsData",{
    ref: 'Item',
    localField: 'modules.inventory.id',
    foreignField: 'id',
    justOne: false
});

Users.virtual("fanarts",{
    ref: 'fanart',
    localField: 'id',
    foreignField: 'author_ID',
    justOne: false
});

Users.virtual("collections",{
    ref: 'UserCollection',
    localField: 'id',
    foreignField: 'id',
    select: "collections",
    justOne: true
});

Users.virtual("marriageData",{
    ref: 'Relationship',
    localField: 'featuredMarriage',
    foreignField: '_id',
    justOne: true
});

// RELATIONSHIPS

Relationships.virtual("usersData",{
    ref: 'UserDB',
    localField: 'users',
    foreignField: 'id',
    justOne: false
});



// ITEM

Items.virtual("stickers",{
    ref: 'Cosmetic',
    localField: 'icon',
    foreignField: 'id',
    justOne: false
});

Cosmetics.virtual("packData",{
    ref: 'Item',
    localField: 'series_id',
    foreignField: 'icon',
    justOne: true
});

