'use strict';

/**
 * Virtuals for the Marketplace schema.
 * Registered by virtuals.js at app init.
 *
 * @param {import('mongoose').Schema} MarketplaceSchema
 */
module.exports = function (MarketplaceSchema) {
  MarketplaceSchema.virtual('authorData', {
    ref: 'UsersCore', // Was "UserDB" (legacy userdb collection)
    localField: 'author',
    foreignField: 'id',
    justOne: true,
  });

  MarketplaceSchema.virtual('moreFromAuthor', {
    ref: 'marketplace',
    localField: 'author',
    foreignField: 'author',
    justOne: false,
  });

  MarketplaceSchema.virtual('moreLikeThis', {
    ref: 'marketplace',
    localField: 'item_id',
    foreignField: 'item_id',
    justOne: false,
  });

  MarketplaceSchema.virtual('itemData', {
    ref: function () {
      return ['background', 'medal', 'flair', 'sticker', 'shade'].includes(this.item_type)
        ? 'Cosmetic'
        : 'Item';
    },
    localField: 'item_id',
    foreignField: '_id',
    justOne: true,
  });
};
