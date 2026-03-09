'use strict';

/**
 * Virtuals for the UserInventory schema.
 * Registered by virtuals.js at app init.
 *
 * @param {import('mongoose').Schema} UserInventorySchema
 */
module.exports = function (UserInventorySchema) {
  UserInventorySchema.virtual('itemsData', {
    ref: 'Item',
    localField: 'inventory.id',
    foreignField: 'id',
    justOne: false,
  });
};
