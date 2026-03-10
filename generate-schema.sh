#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────────
# generate-schema.sh
# Scaffold a new per-schema folder with all required boilerplate.
#
# Usage:
#   bash generate-schema.sh <schema-name> [--virtuals]
#
# Options:
#   --virtuals   Also create a <name>.virtuals.js stub.
#
# Examples:
#   bash generate-schema.sh user_badges
#   bash generate-schema.sh guild_events --virtuals
# ──────────────────────────────────────────────────────────────────
set -e

NAME="$1"
WITH_VIRTUALS=false

for arg in "$@"; do
  [ "$arg" = "--virtuals" ] && WITH_VIRTUALS=true
done

if [ -z "$NAME" ]; then
  echo "Usage: $0 <schema-name> [--virtuals]" >&2
  echo "Example: $0 user_badges" >&2
  exit 1
fi

# Validate name (snake_case or camelCase, no spaces/slashes)
if ! echo "$NAME" | grep -qE '^[a-zA-Z][a-zA-Z0-9_]*$'; then
  echo "Error: schema name must be alphanumeric/underscore, no spaces." >&2
  exit 1
fi

DIR="schemas/$NAME"

if [ -d "$DIR" ]; then
  echo "Error: $DIR already exists." >&2
  exit 1
fi

mkdir -p "$DIR"

# ── Convert snake_case/camelCase → PascalCase ─────────────────────
PASCAL=$(echo "$NAME" | awk -F_ '{for(i=1;i<=NF;i++){$i=toupper(substr($i,1,1)) substr($i,2)};print}' OFS='')

# ── schema.js ─────────────────────────────────────────────────────
cat > "$DIR/${NAME}.js" << ENDJS
'use strict';
const mongoose = require('mongoose');

const _SCHEMA = new mongoose.Schema(
  {
    // TODO: define your fields here
    // id:   { type: String, required: true },
    // name: { type: String },
  },
  { collection: '${NAME}' }
);

_SCHEMA.statics.get = function get(query, projection) {
  return this.findOne(query, projection);
};

_SCHEMA.statics.set = function set(query, update, options = {}) {
  return this.findOneAndUpdate(query, update, { upsert: true, new: true, ...options });
};

/**
 * @param {import('mongoose').Connection} connection
 * @returns {import('./${NAME}.schema').${PASCAL}Model}
 */
module.exports = function (connection) {
  return connection.model('${PASCAL}', _SCHEMA);
};
ENDJS

# ── schema.d.ts ───────────────────────────────────────────────────
cat > "$DIR/${NAME}.schema.d.ts" << ENDTS
import mongoose from 'mongoose';
import { dbSetter, dbGetter } from '../../index';

/** Raw MongoDB document shape for the \`${NAME}\` collection. */
export interface ${PASCAL} {
  // TODO: map raw field types matching your Mongoose schema
  // id: string;
  // name: string;
}

export interface ${PASCAL}Schema extends mongoose.Document, ${PASCAL} {}

export interface ${PASCAL}Model extends mongoose.Model<${PASCAL}Schema> {
  set: dbSetter<${PASCAL}Schema>;
  get: dbGetter<${PASCAL}Schema, ${PASCAL}>;
}
ENDTS

# ── types.d.ts ────────────────────────────────────────────────────
cat > "$DIR/${NAME}.types.d.ts" << ENDTS
// import type { Rarity, Currency } from '../../types/generics';

/** Front-facing \`${PASCAL}\` type — clean unions for API/Bot consumption. */
export interface ${PASCAL}Data {
  // TODO: mirror your schema fields but with proper union types
  // id: string;
  // rarity: Rarity;
}
ENDTS

# ── virtuals.js (optional) ────────────────────────────────────────
if [ "$WITH_VIRTUALS" = true ]; then
  cat > "$DIR/${NAME}.virtuals.js" << ENDJS
'use strict';

/**
 * Virtuals for the ${PASCAL} schema.
 * Registered by virtuals.js at app init.
 *
 * @param {import('mongoose').Schema} ${PASCAL}Schema
 */
module.exports = function (${PASCAL}Schema) {
  // TODO: define virtual populate paths here
  // ${PASCAL}Schema.virtual('relatedData', {
  //   ref: 'OtherCollection',
  //   localField: 'someId',
  //   foreignField: 'id',
  //   justOne: true,
  // });
};
ENDJS
  echo "✓ Created $DIR/${NAME}.virtuals.js"
fi

echo ""
echo "✓ Created $DIR/${NAME}.js"
echo "✓ Created $DIR/${NAME}.schema.d.ts"
echo "✓ Created $DIR/${NAME}.types.d.ts"
echo ""
echo "Next steps:"
echo "  1. Edit $DIR/${NAME}.js           — define Mongoose schema fields and collection name."
echo "  2. Edit $DIR/${NAME}.schema.d.ts  — map raw MongoDB field types."
echo "  3. Edit $DIR/${NAME}.types.d.ts   — write lean front-facing types."
if [ "$WITH_VIRTUALS" = true ]; then
  echo "  4. Edit $DIR/${NAME}.virtuals.js  — define virtual populate paths."
  echo "  5. Register in virtuals.js:     require('./schemas/${NAME}/${NAME}.virtuals')(Schemas.${NAME}.schema);"
fi
echo ""
echo "  Then wire it up:"
echo "  + schemas.js:        ${NAME}: require('./schemas/${NAME}/${NAME}.js')(activeConnection),"
echo "  + types/index.d.ts:  export * from '../schemas/${NAME}/${NAME}.types';"
