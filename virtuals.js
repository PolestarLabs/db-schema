const Schemas = require("./schemas.js");

const MarketplaceSchema = Schemas.marketplace.schema;
const UserSchema = Schemas.users.schema;
const ItemSchema = Schemas.items.schema;
const CosmeticsSchema = Schemas.cosmetics.schema;

MarketplaceSchema.virtual("authorData",{
    ref: 'UserDB',
    localField: 'author',
    foreignField: 'id',
    justOne: true
});

MarketplaceSchema.virtual("moreFromAuthor",{
    ref: 'marketplace',
    localField: 'author',
    foreignField: 'author',
    justOne: false
});

MarketplaceSchema.virtual("moreLikeThis",{
    ref: 'marketplace',
    localField: 'item_id',
    foreignField: 'item_id',
    justOne: false
});

MarketplaceSchema.virtual("itemData",{
    ref: function () {
        return ['background','medal','flair','sticker','shade'].includes(this.item_type)
            ? "Cosmetic"
            : "Item";
    } ,
    localField: 'item_id',
    foreignField: '_id',
    justOne: true
});

UserSchema.virtual("itemsData",{
    ref: 'Item',
    localField: 'modules.inventory.id',
    foreignField: 'id',
    justOne: false
});


ItemSchema.virtual("stickers",{
    ref: 'Cosmetic',
    localField: 'icon',
    foreignField: 'id',
    justOne: false
});

CosmeticsSchema.virtual("packData",{
    ref: 'Item',
    localField: 'series_id',
    foreignField: 'icon',
    justOne: true
});

