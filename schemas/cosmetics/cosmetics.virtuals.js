'use strict';

/**
 * Virtuals for the Cosmetics schema.
 * Registered by virtuals.js at app init.
 *
 * @param {import('mongoose').Schema} CosmeticsSchema
 */
module.exports = function (CosmeticsSchema) {
  CosmeticsSchema.virtual('packData', {
    ref: 'Item',
    localField: 'series_id',
    foreignField: 'icon',
    justOne: true,
  });
};
