export const GAME_CONFIG = {
  gravity: 220,
  maxBaseSpeed: 350,
  bodyContactDamage: 12,
  projectileSpeed: 420,
  projectileLife: 3.2,
  arenaWidth: 900,
  arenaHeight: 560,
  middleWallEnabled: true,
  middleWallThickness: 16,
  middleWallLength: 560,
  parryDuration: 1
};

const basePreset = {
  health: 500,
  team: "Alpha",
  scale: 1,
  hasWeapon: true,
  weaponMode: "melee",
  weaponType: "sword",
  rpm: 20,
  damage: 14,
  weaponSize: 10,
  arrowCount: 1,
  acceleration: 220,
  maxSpeed: 190,
  gravityAffected: true,
  color: "#6aa3ff",
  strokeColor: "#20365a"
};

export const PRESET_DEFS = {
  custom: {
    ...basePreset,
    key: "custom",
    name: "Custom"
  },
  sword: {
    ...basePreset,
    key: "sword",
    name: "Sword Ball",
    weaponType: "sword",
    weaponMode: "melee",
    color: "#6aa3ff"
  },
  superSword: {
    ...basePreset,
    key: "superSword",
    name: "Super Sword Ball",
    weaponType: "sword",
    weaponMode: "melee",
    rpm: 2,
    color: "#ff6464"
  },
  dagger: {
    ...basePreset,
    key: "dagger",
    name: "Dagger Ball",
    weaponType: "dagger",
    weaponMode: "melee",
    color: "#02fc02"
  },
  superDagger: {
    ...basePreset,
    key: "superDagger",
    name: "Super Dagger Ball",
    weaponType: "dagger",
    weaponMode: "melee",
    weaponSize: basePreset.weaponSize * 5,
    color: "#02fc02"
  },
  bow: {
    ...basePreset,
    key: "bow",
    name: "Bow Ball",
    weaponType: "bow",
    weaponMode: "projectile",
    arrowCount: 1,
    damage: 11,
    color: "#dca86e",
    rpm: 3
  },
  superBow: {
    ...basePreset,
    key: "superBow",
    name: "Super Bow Ball",
    weaponType: "bow",
    weaponMode: "projectile",
    arrowCount: 2,
    damage: 11,
    color: "#f3c492",
    rpm: 10
  },
  unarmed: {
    ...basePreset,
    key: "unarmed",
    name: "Unarmed Ball",
    hasWeapon: false,
    weaponType: "unarmed",
    weaponMode: "melee",
    damage: 10,
    color: "#cfcfcf",
    strokeColor: "#868686"
  },
  superUnarmed: {
    ...basePreset,
    key: "superUnarmed",
    name: "Super Unarmed Ball",
    hasWeapon: false,
    weaponType: "unarmed",
    weaponMode: "melee",
    damage: 12,
    acceleration: 320,
    maxSpeed: 240,
    gravityAffected: false,
    color: "#ffffff",
    strokeColor: "#9f9f9f"
  }
};

export function getPresetList() {
  return Object.values(PRESET_DEFS).map((preset) => ({ key: preset.key, name: preset.name }));
}

export function clonePreset(key) {
  const preset = PRESET_DEFS[key] ?? PRESET_DEFS.custom;
  return structuredClone(preset);
}
