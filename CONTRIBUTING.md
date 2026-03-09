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
├── utils.js              # dbSetter / dbGetter / dbGetterFull helpers
├── leanDefaultPlugin.js  # Makes .lean() implicit on all queries
├── redisClient.js        # Optional Redis cache layer (.cache() / .noCache())
├── virtuals.js           # Mongoose virtual population definitions
│
├── schemas/              # One file per MongoDB collection (JS)
│   ├── users_core.js
│   ├── user_inventory.js
│   ├── cosmetics.js
│   ├── items.js
│   └── ...
│
├── types/                # Front-facing "pretty" types (type-only, no JS)
│   └── index.d.ts        # User, CosmeticItem, InventoryItem, Currency, etc.
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

### Raw Doc types (`index.d.ts`)

These mirror the MongoDB document shape 1:1. Used internally within this package and for low-level Mongo operations (aggregations, `findOne`, `updateOne`, etc.).

```ts
// in index.d.ts
export interface Cosmetics {    // ← raw doc, matches what Mongo stores
  id: string;
  name: string;
  tags: string;
  rarity: string;              // raw string in DB
  type: string;
  ...
}
```

### Front-facing types (`types/index.d.ts`)

These are the "pretty" types for consumers (bot, api, dashboard). They use proper unions, have cleaner shapes, and reflect what model methods actually return after transformation.

```ts
// in types/index.d.ts
export interface CosmeticBaseItem {  // ← clean consumer type
  name: string;
  tags: string;
  rarity: Rarity;                   // typed union, not raw string
  type: CosmeticType;
  ...
}
```

**Rule of thumb:**
- Consumer code imports from `types` → gets `User`, `CosmeticItem`, `InventoryItem`
- Internal schema code or raw aggregations → uses the doc types from `index.d.ts`

---

## How To: Add a New Collection

### 1. Create the schema file

Create `schemas/my_collection.js`:

```js
const mongoose = require("mongoose");
const utils = require("../utils.js");

module.exports = function MY_COLLECTION(activeConnection) {

  const MySchema = new mongoose.Schema({
    id: { type: String, index: { unique: true } },
    name: String,
    value: Number,
  }, {
    strict: true,
    collection: "my_collection",  // explicit collection name
  });

  // Instance methods (available on full documents via getFull)
  MySchema.methods.doSomething = function () {
    return this.constructor.updateOne(
      { id: this.id },
      { $inc: { value: 1 } }
    );
  };

  const MODEL = activeConnection.model("MyCollection", MySchema, "my_collection");

  // Standard accessors — always attach these
  MODEL.set = utils.dbSetter;
  MODEL.get = utils.dbGetter;

  return MODEL;
};
```

### 2. Register it in `schemas.js`

```js
// in schemas.js, inside the returned object:
myCollection: require("./schemas/my_collection.js")(activeConnection),
```

### 3. Add raw doc types to `index.d.ts`

Follow the existing triple pattern: `Interface` → `Schema` → `Model`:

```ts
export interface MyCollection {
  id: string;
  name: string;
  value: number;
}
export interface MyCollectionSchema extends mongoose.Document, MyCollection {
  id: string;
  doSomething(): Promise<any>;
}
export interface MyCollectionModel extends mongoose.Model<MyCollectionSchema> {
  set: dbSetter<MyCollectionSchema>;
  get: dbGetter<MyCollectionSchema, MyCollection>;
}
```

Then add it to the `Schemas` interface:

```ts
export interface Schemas {
  // ...existing...
  myCollection: MyCollectionModel;
}
```

### 4. (If applicable) Add front-facing types to `types/index.d.ts`

Only if this collection has consumer-facing data that the bot/api/dashboard will use directly:

```ts
export interface MyThing {
  id: string;
  name: string;
  value: number;
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

Add it to `types/index.d.ts`. No JS file needed — these are pure type declarations.

Keep these conventions:
- Use **type unions** for finite sets: `type Rarity = "C" | "U" | "R" | "SR" | "UR" | "XR"`
- Use **interfaces** for object shapes: `interface User { ... }`
- Use **intersection types** for variants: `type CosmeticBackground = CosmeticBaseItem & { type: "background"; code: string; }`
- Always reference other types from the same file (e.g., `Rarity`, `Currency`) — never duplicate definitions

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

- [ ] Schema file created/updated in `schemas/`
- [ ] Registered in `schemas.js`
- [ ] Raw doc types added/updated in `index.d.ts` (Interface + Schema + Model)
- [ ] Added to `Schemas` interface in `index.d.ts`
- [ ] Front-facing type added/updated in `types/index.d.ts` (if consumer-visible)
- [ ] Constants added to `constants/index.js` + `constants/index.d.ts` (if applicable)
- [ ] Version bumped in `package.json`
