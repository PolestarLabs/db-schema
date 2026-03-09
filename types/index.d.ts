// ──────────────────────────────────────────────────────────────────
// @polestarlabs/database_schema/types
//
// Barrel re-export of all front-facing ("pretty") types.
// Import from here in Bot, Dashboard, and API code.
//
//   import type { User, InventoryItem, CosmeticItem } from
//     '@polestarlabs/database_schema/types';
//
// For raw Mongoose document types, import from the main package entry.
// ──────────────────────────────────────────────────────────────────

// Generic domain types (Currency, Rarity, PrimeTier, Profilecard, …)
export * from './generics';

// Schema-specific pretty types
export * from '../schemas/items/items.types';
export * from '../schemas/cosmetics/cosmetics.types';
export * from '../schemas/users_core/users_core.types';
export * from '../schemas/user_inventory/user_inventory.types';

