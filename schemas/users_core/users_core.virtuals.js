'use strict';

/**
 * Virtuals for the UsersCore schema.
 * Registered by virtuals.js at app init.
 *
 * @param {import('mongoose').Schema} UsersSchema
 */
module.exports = function (UsersSchema) {
  UsersSchema.virtual('fanarts', {
    ref: 'fanart',
    localField: 'id',
    foreignField: 'author_ID',
    justOne: false,
  });

  UsersSchema.virtual('collections', {
    ref: 'UserCollection',
    localField: 'id',
    foreignField: 'id',
    select: 'collections',
    justOne: true,
  });

  UsersSchema.virtual('marriageData', {
    ref: 'Relationship',
    localField: 'profile.featuredMarriage', // Was "featuredMarriage" (top-level in legacy)
    foreignField: '_id',
    justOne: true,
  });
};
