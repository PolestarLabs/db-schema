"use strict";

const CURRENCY_VALUES = Object.freeze(["RBN", "JDE", "SPH", "AMY", "EMD", "PSM", "EVT"]);
const RARITY_VALUES = Object.freeze(["C", "U", "R", "SR", "UR", "XR"]);
const PRIME_TIERS = Object.freeze([
  "plastic", "aluminium", "carbon", "iron",
  "iridium", "lithium", "palladium", "zircon",
  "uranium", "astatine", "antimatter", "neutrino",
]);

module.exports = { CURRENCY_VALUES, RARITY_VALUES, PRIME_TIERS };
