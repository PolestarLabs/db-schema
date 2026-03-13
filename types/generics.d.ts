// ──────────────────────────────────────────────────────────────────
// @polestarlabs/database_schema — generic domain types
//
// Schema-specific type files import directly from this file to avoid
// circular references with the barrel at types/index.d.ts.
// External consumers should import from '@polestarlabs/database_schema/types'
// which re-exports everything from here.
// ──────────────────────────────────────────────────────────────────

// ── Currency ──────────────────────────────────────────────────────

export type Currency = "RBN" | "JDE" | "SPH" | "AMY" | "EMD" | "PSM" | "COS" | "EVT";

export type CurrencyLabel = {
  RBN: "Rubine";
  JDE: "Jade";
  SPH: "Sapphire";
  AMY: "Amethyst";
  EMD: "Emerald";
  PSM: "Prism";
  COS: "Cosmic Fragment";
  EVT: "Event Token";
};

// ── Rarity ────────────────────────────────────────────────────────

export type Rarity = "C" | "U" | "R" | "SR" | "UR" | "XR";

// ── Prime ─────────────────────────────────────────────────────────

export type PrimeTier =
  | "plastic"
  | "aluminium"
  | "carbon"
  | "iron"
  | "iridium"
  | "lithium"
  | "palladium"
  | "zircon"
  | "uranium"
  | "astatine"
  | "antimatter"
  | "neutrino";

export interface PrimeInfo {
  tier: PrimeTier;
  lastClaimed: number;
  active: boolean;
  maxServers: number;
  canReallocate: boolean;
  custom_background: boolean;
  custom_handle: boolean;
  custom_shop: boolean;
  servers: string[];
  misc?: unknown;
}

// ── Profilecard ───────────────────────────────────────────────────

export interface Profilecard {
  background: string;
  sticker?: string;
  color: string;
  flair: string;
  about: string;
  tagline: string;
  medals: string[];
}
