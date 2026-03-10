'use strict';

/**
 * Virtuals for the Relationships schema.
 * Registered by virtuals.js at app init.
 *
 * @param {import('mongoose').Schema} RelationshipsSchema
 */
module.exports = function (RelationshipsSchema) {
  RelationshipsSchema.virtual('usersData', {
    ref: 'UsersCore', // Was "UserDB" (legacy userdb collection)
    localField: 'users',
    foreignField: 'id',
    justOne: false,
  });
};
