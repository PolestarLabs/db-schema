# Pollux Schemas

Shared MongoDB schemas, models, types, and constants for the Pollux ecosystem.  
Used by the **bot**, **dashboard API**, and **frontend**.

```bash
npm install @polestarlabs/database_schema
# requires github package repo
```

---

## Quick Start

```js
const DBSchema = require("@polestarlabs/database_schema");

const DB = await DBSchema({
  hook: webhookDigester,           // optional, for connection event alerts
  url: "mongodb://localhost/pollux",
  options: { useNewUrlParser: true, useUnifiedTopology: true },
}, {
  redis: { host: "127.0.0.1", port: 6379 },  // optional
});

// DB is the Schemas object — every collection is accessible from here
const user = await DB.users.get("123456789");
```

---

## High-Level Methods

Every model exposes three standard accessors. **These are the methods you should use 99% of the time.**

### `Model.get(id, projection?)`

Returns a **lean POJO** (plain object) or `null`. This is fast and lightweight — no Mongoose overhead.

```js
const user = await DB.users.get("123456789");
// user is a plain object: { id, name, currency, profile, ... }
// user.save()       ← does NOT exist (lean)
// user.addCurrency  ← does NOT exist (lean)
```

### `Model.set(id, update, options?)`

Runs `updateOne` with `upsert: true` by default (except for guilds/server metadata).

```js
await DB.users.set("123456789", { $inc: { "currency.RBN": 100 } });
```

### `Model.getFull(id, projection?)`

Returns a **full Mongoose Document** — has instance methods, `.save()`, change tracking, etc. Use this when you need to call instance methods.

```js
const user = await DB.users.getFull("123456789");
await user.addCurrency("RBN", 500);  // ← works (full document)
await user.addXP(25);                // ← works
```

### When to use which

| Scenario | Method | Why |
|---|---|---|
| Read data for display | `get` | Fast, no overhead |
| Update a field | `set` | Direct atomic update |
| Call instance methods | `getFull` | Methods live on Documents |
| Aggregation, bulk ops | Native Mongoose/Mongo | See "Low-Level" section |

---

## Low-Level Methods

For operations beyond basic CRUD, use Mongoose's native query interface directly on the model. These are **not** wrapped — you get the raw Mongoose API.

### Restrictions

- **All queries are lean by default.** A global plugin makes `find()` and `findOne()` return plain objects automatically. If you need a full Document, **opt out explicitly**:

  ```js
  // Returns a lean POJO (default):
  const doc = await DB.users.findOne({ id: "123" });

  // Returns a full Mongoose Document:
  const fullDoc = await DB.users.findOne({ id: "123" }, null, { lean: false });
  ```

- **Don't use `.save()` on lean results.** Lean objects are plain POJOs — they have no `.save()`, no instance methods, no change tracking. If you accidentally try, it will throw.

- **Use `.exec()` only on hand-offs.** When passing a query to `Promise.all()` or returning it, call `.exec()`. When `await`-ing in the same flow, don't bother — it's implicit.

  ```js
  // Awaiting directly — no .exec() needed:
  const items = await DB.items.find({ type: "material" });

  // Handing off — use .exec():
  const [items, cosmetics] = await Promise.all([
    DB.items.find({ type: "material" }).exec(),
    DB.cosmetics.find({ type: "sticker" }).exec(),
  ]);
  ```

- **Redis caching is optional.** If Redis was initialized, queries support `.cache(ttl)` and `.noCache()`. If not, these are no-ops.

  ```js
  const user = await DB.users.findOne({ id: "123" }).cache(60);   // cache 60s
  const fresh = await DB.users.findOne({ id: "123" }).noCache();  // bypass cache
  ```

### Common Low-Level Patterns

```js
// Aggregation
const topUsers = await DB.users.aggregate([
  { $sort: { "currency.RBN": -1 } },
  { $limit: 10 },
  { $project: { id: 1, name: 1, "currency.RBN": 1 } },
]);

// Distinct values
const allRarities = await DB.items.distinct("rarity");

// Bulk write
await DB.items.bulkWrite([
  { updateOne: { filter: { id: "sword" }, update: { $set: { price: 500 } } } },
  { updateOne: { filter: { id: "shield" }, update: { $set: { price: 300 } } } },
]);

// Count
const totalUsers = await DB.users.countDocuments({ "prime.active": true });

// Virtual population (defined in virtuals.js)
const listing = await DB.marketplace.findOne({ id: "abc" })
  .populate("authorData")
  .populate("itemData");
```

---

## Types

The package provides **two layers** of types, serving different purposes.

### Import Paths

```ts
// Main entry — Mongoose models, raw doc interfaces, init function
import DBSchema from "@polestarlabs/database_schema";

// Front-facing types — clean shapes for consumer code
import type { User, CosmeticItem, InventoryItem } from "@polestarlabs/database_schema/types";

// Constants — runtime arrays of valid values
import { CURRENCY_VALUES, RARITY_VALUES, PRIME_TIERS } from "@polestarlabs/database_schema/constants";
```

### Layer 1: Raw Doc Types (main entry)

These live in `index.d.ts` and mirror the MongoDB document shape exactly. Every collection follows a triple pattern:

```ts
interface Cosmetics { ... }          // Plain data shape (what .get() returns)
interface CosmeticsSchema            // Mongoose Document (what .getFull() returns)
  extends mongoose.Document, Cosmetics { ... }
interface CosmeticsModel             // The Model itself (DB.cosmetics)
  extends mongoose.Model<CosmeticsSchema> { ... }
```

Use these when:
- Writing low-level Mongo queries or aggregations
- Working with Mongoose-specific features (populate, hooks, etc.)
- You need the exact database field names

### Layer 2: Front-Facing Types (`/types`)

These live in `types/index.d.ts` and are the "pretty" types meant for bot commands, API responses, and dashboard rendering. They use proper type unions instead of raw strings, have cleaner names, and include instance method signatures.

```ts
import type { User, CosmeticItem, Rarity, Currency } from "@polestarlabs/database_schema/types";
```

| Raw Doc Type (`index.d.ts`) | Front-Facing Type (`types/`) | Difference |
|---|---|---|
| `Cosmetics` | `CosmeticItem` | Union of all subtypes, typed `rarity: Rarity` |
| `Item` | `InventoryItem` | Typed enums for `type`, `series`, `filter` |
| `UserCore` | `User` | Includes instance methods, cleaner shape |
| `rarity: string` | `rarity: Rarity` | `"C" \| "U" \| "R" \| "SR" \| "UR" \| "XR"` |
| `type: string` | `type: CosmeticType` | `"background" \| "medal" \| ...` |

**Rule of thumb:** Consumer code should always import from `/types`. Only reach for raw doc types when doing direct database operations.

### Constants (`/constants`)

Runtime arrays that correspond to the type unions. Use them for validation:

```ts
import { CURRENCY_VALUES, RARITY_VALUES, PRIME_TIERS } from "@polestarlabs/database_schema/constants";

CURRENCY_VALUES  // → ["RBN", "JDE", "SPH", "AMY", "EMD", "PSM", "EVT"]
RARITY_VALUES    // → ["C", "U", "R", "SR", "UR", "XR"]
PRIME_TIERS      // → ["plastic", "aluminium", ..., "neutrino"]

if (!CURRENCY_VALUES.includes(input)) throw new Error("Invalid currency");
```

---

## Available Collections

### User Collections (split architecture)

| Accessor | Collection | Description |
|---|---|---|
| `DB.users` | `users` | Core user data: profile, currencies, progression, prime |
| `DB.userInventory` | `user_inventory` | Items, cosmetics, achievements, showcases |
| `DB.userOAuth` | `user_oauth` | Discord/Patreon tokens, identity cache |
| `DB.userGuilds` | `user_guilds` | Guild memberships and permissions |
| `DB.userQuests` | `user_quests` | Quest progress tracking |
| `DB.userAnalytics` | `user_analytics` | Usage stats and legacy global level |
| `DB.userConnections` | `user_connections` | Third-party connections (Twitch, YouTube) |

### Content Collections

| Accessor | Collection | Description |
|---|---|---|
| `DB.cosmetics` | `cosmetics` | Backgrounds, medals, stickers, flairs, skins |
| `DB.items` | `items` | Inventory items (materials, consumables, keys, etc.) |
| `DB.collectibles` | `collectibles` | Collectible items |
| `DB.achievements` | `achievements` | Achievement definitions |
| `DB.quests` | `quests` | Quest definitions |

### Server Collections

| Accessor | Collection | Description |
|---|---|---|
| `DB.servers` | `guilds` | Server configuration and modules |
| `DB.svMetaDB` | `sv_meta` | Server metadata (channels, roles) |
| `DB.channels` | `channels` | Per-channel settings |
| `DB.localranks` | `localranks` | Per-server user XP/levels |

### Economy & Social

| Accessor | Description |
|---|---|
| `DB.marketplace` | Player-to-player item listings |
| `DB.relationships` | Marriages, parent/child bonds |
| `DB.commends` | User commendation system |
| `DB.transactions` | Economy transaction log |
| `DB.gifts` | Gift items in circulation |

### PascalCase Aliases

For cleaner code, PascalCase aliases are available on the Schemas object:

```js
DB.Users         // → DB.users (UserCoreModel)
DB.Items         // → DB.items (ItemModel)
DB.UserInventory // → DB.userInventory (UserInventoryModel)
```

---

## Instance Methods (common)

Available on full Documents returned by `getFull()`:

### Users
- `user.addCurrency(currency, amount)` — Increment a currency
- `user.addXP(amount)` — Add experience points
- `user.incrementAttr(path, amount)` — Increment any numeric field

### UserInventory
- `inv.addItem(itemId, amount, crafted?)` — Add item to inventory
- `inv.removeItem(itemId, amount, crafted?)` — Remove item from inventory
- `inv.hasItem(itemId, count?)` — Check if user owns enough of an item
- `inv.amtItem(itemId)` — Get owned quantity
- `inv.modifyItems(items[], debug?)` — Bulk add/remove multiple items

---

## See Also

- [CONTRIBUTING.md](./CONTRIBUTING.md) — How to add new collections, types, and constants
