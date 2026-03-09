'use strict';

/**
 * Virtuals for the Items schema.
 * Registered by virtuals.js at app init.
 *
 * @param {import('mongoose').Schema} ItemsSchema
 */
module.exports = function (ItemsSchema) {
  ItemsSchema.virtual('stickers', {
    ref: 'Cosmetic',
    localField: 'icon',
    foreignField: 'id',
    justOne: false,
  });
};
