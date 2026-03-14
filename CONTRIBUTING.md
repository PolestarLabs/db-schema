# Adding New Schemas

***Single source of truth for all Pollux database models, front-facing types, and shared constants.***

---

## Golden Rules

1. **No TypeScript compilation step.** This package is plain CommonJS JS. Types are provided via hand-written `.d.ts` declaration files.
2. **No runtime dependencies on consumers.** This package must work in both Node.js and Bun without special loaders.
3. **Bump `package.json` version** on every meaningful change (schemas, types, constants). Consumers pin to this version.

---

## Package Layout

```
database_schema/
├── index.js              # init(config, extras?) → Schemas object
├── index.d.ts            # Mongoose model types, raw doc interfaces, Schemas map
├── schemas.js            # Loads all schema modules, returns Schemas
├── virtuals.js           # Loader — delegates to per-schema *.virtuals.js
├── utils.js              # dbSetter / dbGetter / dbGetterFull helpers
├── leanDefaultPlugin.js  # Makes .lean() implicit on all queries
├── redisClient.js        # Optional Redis cache layer (.cache() / .noCache())
├── generate-schema.sh    # Scaffolding script for new schemas
│
├── schemas/              # One folder per MongoDB collection
│   ├── users_core/
│   │   ├── users_core.js            # Mongoose schema + model factory
│   │   ├── users_core.schema.d.ts   # Raw doc types (match Mongo 1:1)
│   │   ├── users_core.types.d.ts    # Front-facing pretty types
│   │   └── users_core.virtuals.js   # Virtual populate paths
│   ├── items/
│   │   ├── items.js
│   │   ├── items.schema.d.ts
│   │   ├── items.types.d.ts
│   │   └── items.virtuals.js
│   ├── _misc/                       # Multi-schema legacy bundle (not yet split)
│   │   ├── _misc.js
│   │   ├── marketplace.schema.d.ts
│   │   ├── marketplace.virtuals.js
│   │   ├── relationships.schema.d.ts
│   │   └── relationships.virtuals.js
│   └── <schema_name>/               # pattern for every other collection
│       ├── <schema_name>.js
│       ├── <schema_name>.schema.d.ts
│       ├── <schema_name>.types.d.ts  # only if consumer-facing
│       └── <schema_name>.virtuals.js # only if virtual populate needed
│
├── types/                # Barrel re-export of all front-facing types
│   ├── index.d.ts        # export * from generics + each *.types.d.ts
│   └── generics.d.ts     # Currency, Rarity, PrimeTier, Profilecard, …
│
└── constants/            # Runtime constant arrays
    ├── index.js          # CURRENCY_VALUES, RARITY_VALUES, PRIME_TIERS
    └── index.d.ts        # Type declarations for the above
```

### Three export paths

| Import path | What it provides | Has JS? |
|---|---|---|
| `@polestarlabs/database_schema` | `init()`, Mongoose models, raw doc types | Yes |
| `@polestarlabs/database_schema/types` | Front-facing types for bot/api/dashboard | No (`.d.ts` only) |
| `@polestarlabs/database_schema/constants` | Constant value arrays | Yes |

---

## Type Layers

There are **two layers** of types. Understand when to use each:

### Raw Doc types (`schemas/<name>/<name>.schema.d.ts`)

These mirror the MongoDB document shape 1:1. Used internally within this package and for low-level Mongo operations (aggregations, `findOne`, `updateOne`, etc.).

```ts
// in schemas/cosmetics/cosmetics.schema.d.ts
export interface Cosmetics {    // ← raw doc, matches what Mongo stores
  id: string;
  name: string;
  tags: string;
  rarity: string;              // raw string in DB
  type: string;
  // ...
}
export interface CosmeticsSchema extends mongoose.Document, Cosmetics {}
export interface CosmeticsModel extends mongoose.Model<CosmeticsSchema> {
  set: dbSetter<CosmeticsSchema>;
  get: dbGetter<CosmeticsSchema, Cosmetics>;
}
```

> The composite types (Data → Schema → Model) are also kept in `index.d.ts` for backwards compatibility with the main package exports.

### Front-facing types (`schemas/<name>/<name>.types.d.ts`)

These are the "pretty" types for consumers (bot, api, dashboard). They use proper unions, have cleaner shapes, and reflect what model methods actually return after transformation.

```ts
// in schemas/cosmetics/cosmetics.types.d.ts
import type { Rarity } from '../../types/generics';   // ← import from generics, NOT from types barrel

export interface CosmeticBaseItem {  // ← clean consumer type
  name: string;
  tags: string;
  rarity: Rarity;                   // typed union, not raw string
  type: CosmeticType;
  // ...
}
```

> **Important:** Schema `.types.d.ts` files must import generic types from `../../types/generics`, **not** from `../../types`. The barrel (`types/index.d.ts`) re-exports from schema type files — importing back from the barrel creates a circular reference.

### Generic types (`types/generics.d.ts`)

Shared primitive unions that multiple schemas reference: `Currency`, `CurrencyLabel`, `Rarity`, `PrimeTier`, `PrimeInfo`, `Profilecard`. When defining a new shared domain type, add it here.

### Public barrel (`types/index.d.ts`)

Re-exports everything from `generics.d.ts` and all per-schema `.types.d.ts` files. This is the only file consumers should import from:

```ts
import type { User, CosmeticItem, InventoryItem, Rarity } from '@polestarlabs/database_schema/types';
```

**Rule of thumb:**
- Consumer code → `@polestarlabs/database_schema/types` → gets `User`, `CosmeticItem`, `InventoryItem`, etc.
- Internal schema code or raw aggregations → raw doc types from `index.d.ts`

---

## How To: Add a New Collection

### 0. Use the generator (fastest path)

```bash
# From the database_schema package root:
bash generate-schema.sh my_collection
# With virtuals:
bash generate-schema.sh my_collection --virtuals
```

This creates `schemas/my_collection/` with all four boilerplate files. Then fill in the TODOs and wire it up per the steps below.

---

### 1. Create the schema folder

Create `schemas/my_collection/my_collection.js`:

```js
'use strict';
const mongoose = require('mongoose');

const MySchema = new mongoose.Schema(
  {
    id:    { type: String, index: { unique: true } },
    name:  String,
    value: Number,
  },
  { collection: 'my_collection' }
);

// Instance methods (available on full documents via getFull / { lean: false })
MySchema.methods.doSomething = function () {
  return this.constructor.updateOne({ id: this.id }, { $inc: { value: 1 } });
};

MySchema.statics.get = function get(query, projection) {
  return this.findOne(query, projection);
};
MySchema.statics.set = function set(query, update, options = {}) {
  return this.findOneAndUpdate(query, update, { upsert: true, new: true, ...options });
};

/**
 * @param {import('mongoose').Connection} connection
 */
module.exports = function (connection) {
  return connection.model('MyCollection', MySchema);
};
```

### 2. Add raw doc types — `schemas/my_collection/my_collection.schema.d.ts`

```ts
import mongoose from 'mongoose';
import { dbSetter, dbGetter } from '../../index';

export interface MyCollection {
  id: string;
  name: string;
  value: number;
}
export interface MyCollectionSchema extends mongoose.Document, MyCollection {
  doSomething(): Promise<any>;
}
export interface MyCollectionModel extends mongoose.Model<MyCollectionSchema> {
  set: dbSetter<MyCollectionSchema>;
  get: dbGetter<MyCollectionSchema, MyCollection>;
}
```

### 3. Add front-facing types — `schemas/my_collection/my_collection.types.d.ts`

Only needed if consumers (bot/api/dashboard) use this collection's data directly.

```ts
// import type { Rarity } from '../../types/generics';  ← import from generics, not types barrel

export interface MyThing {
  id: string;
  name: string;
  value: number;
}
```

### 4. (If applicable) Create virtuals — `schemas/my_collection/my_collection.virtuals.js`

```js
'use strict';
module.exports = function (MySchema) {
  MySchema.virtual('relatedData', {
    ref: 'OtherCollection',
    localField: 'someId',
    foreignField: 'id',
    justOne: true,
  });
};
```

Then register in `virtuals.js`:
```js
require('./schemas/my_collection/my_collection.virtuals')(Schemas.myCollection.schema);
```

### 5. Register in `schemas.js`

```js
// inside the returned object:
myCollection: require('./schemas/my_collection/my_collection.js')(activeConnection),
```

### 6. Wire into the type barrel — `types/index.d.ts`

```ts
export * from '../schemas/my_collection/my_collection.types';
```

### 7. Add to raw model map — `index.d.ts`

Add the triple pattern and update `Schemas`:

```ts
export interface MyCollection { ... }
export interface MyCollectionSchema extends mongoose.Document, MyCollection { ... }
export interface MyCollectionModel extends mongoose.Model<MyCollectionSchema> { ... }

export interface Schemas {
  // ...
  myCollection: MyCollectionModel;
}
```

---

## How To: Add a New Constant

### 1. Add the JS value to `constants/index.js`

```js
const MY_VALUES = Object.freeze(["a", "b", "c"]);

module.exports = { CURRENCY_VALUES, RARITY_VALUES, PRIME_TIERS, MY_VALUES };
```

### 2. Add the type declaration to `constants/index.d.ts`

```ts
import type { MyType } from '../types';

export declare const MY_VALUES: readonly MyType[];
```

### 3. Add the type union to `types/index.d.ts`

```ts
export type MyType = "a" | "b" | "c";
```

> The constant array and the type union must always stay in sync. The type is the source of truth; the constant is the runtime representation.

---

## How To: Add a Front-Facing Type

Add it to the relevant schema's `.types.d.ts` file. No JS file needed — these are pure type declarations.

```ts
// schemas/my_collection/my_collection.types.d.ts
import type { Rarity } from '../../types/generics';  // ← NOT from '../../types'

export interface MyThing { ... }
```

Then re-export it from the barrel in `types/index.d.ts`:

```ts
export * from '../schemas/my_collection/my_collection.types';
```

For new **generic** domain types shared across schemas (like a new currency or rarity tier), add them to `types/generics.d.ts` instead.

Keep these conventions:
- Use **type unions** for finite sets: `type Rarity = "C" | "U" | "R" | "SR" | "UR" | "XR"`
- Use **interfaces** for object shapes: `interface User { ... }`
- Use **intersection types** for variants: `type CosmeticBackground = CosmeticBaseItem & { type: "background"; code: string; }`
- Import generic types from `../../types/generics`, not from `../../types` (avoids circular barrel reference)

---

## Utility Methods Convention

Every model should expose at minimum:

| Method | Signature | Returns | Notes |
|---|---|---|---|
| `get` | `(id, project?)` | Lean POJO or `null` | Default projection excludes `_id` |
| `set` | `(id, update, options?)` | Write result | `upsert: true` by default |
| `getFull` | `(id, project?)` | Full Mongoose Document | Has instance methods, `.save()`, etc. |

These come from `utils.js` (`dbGetter`, `dbSetter`, `dbGetterFull`). Attach them to every new model.

### Lean by Default

All queries return lean (plain) objects via `leanDefaultPlugin.js`. To get a full Mongoose document (for `.save()` or instance methods), use:

```js
Model.findOne(query, project, { lean: false })
// or
Model.getFull(id)
```

---

## Instance Methods

Instance methods go on the **Schema** (not the Model). They are only available on full documents retrieved via `getFull` or `{ lean: false }`.

```js
MySchema.methods.doThing = function () {
  // `this` is the document instance
  // Use this.constructor for Model-level operations
  return this.constructor.updateOne({ id: this.id }, { ... });
};
```

Declare them in `index.d.ts` on the Schema interface, and if consumer-facing, also on the pretty type in `types/index.d.ts`.

---

## Checklist for Any Change

- [ ] Schema folder created: `schemas/<name>/`
- [ ] Schema JS created/updated: `schemas/<name>/<name>.js`
- [ ] Raw doc types added/updated: `schemas/<name>/<name>.schema.d.ts` (Interface + Schema + Model)
- [ ] Registered in `schemas.js` using new path: `require('./schemas/<name>/<name>.js')(activeConnection)`
- [ ] Raw model types added to `Schemas` interface in `index.d.ts`
- [ ] Front-facing type file added/updated: `schemas/<name>/<name>.types.d.ts` (if consumer-visible)
- [ ] Barrel updated: `export * from '../schemas/<name>/<name>.types'` added to `types/index.d.ts`
- [ ] Virtuals file created if needed: `schemas/<name>/<name>.virtuals.js`, registered in `virtuals.js`
- [ ] Constants added to `constants/index.js` + `constants/index.d.ts` (if applicable)
- [ ] Version bumped in `package.json`
