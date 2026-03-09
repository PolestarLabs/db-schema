/**
 * Central virtual registration.
 * Each schema has its own *.virtuals.js that receives only its own schema
 * and defines its virtual populate paths.
 */
module.exports = function VIRTUALS(Schemas) {
  require('./schemas/items/items.virtuals')(Schemas.items.schema);
  require('./schemas/cosmetics/cosmetics.virtuals')(Schemas.cosmetics.schema);
  require('./schemas/user_inventory/user_inventory.virtuals')(Schemas.userInventory.schema);
  require('./schemas/users_core/users_core.virtuals')(Schemas.users.schema);
  require('./schemas/_misc/marketplace.virtuals')(Schemas.marketplace.schema);
  require('./schemas/_misc/relationships.virtuals')(Schemas.relationships.schema);
};
