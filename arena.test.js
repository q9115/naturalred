// tests/multiplayer.test.ts
import { expect, it } from "vitest";

// src/core/DeterministicRNG.ts
var DeterministicRNG = class _DeterministicRNG {
  constructor(seed) {
    this.seed = seed;
    let hash = 2166136261;
    for (const char of seed)
      hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
    this.state = hash >>> 0;
  }
  state;
  snapshot() {
    return this.state;
  }
  restore(state) {
    if (!Number.isInteger(state) || state < 0 || state > 4294967295)
      throw new Error("Invalid RNG state");
    this.state = state;
  }
  next() {
    let value = this.state += 1831565813;
    value = Math.imul(value ^ value >>> 15, value | 1);
    value ^= value + Math.imul(value ^ value >>> 7, value | 61);
    this.state >>>= 0;
    return ((value ^ value >>> 14) >>> 0) / 4294967296;
  }
  range(min, max) {
    return min + this.next() * (max - min);
  }
  fork(label) {
    return new _DeterministicRNG(`${this.seed}:${label}`);
  }
};

// src/data/itemSummary.ts
var stats = {
  damage: ["\uACF5\uACA9\uB825", 12],
  rate: ["\uACF5\uACA9\uC18D\uB3C4", 3],
  speed: ["\uC774\uB3D9\uC18D\uB3C4", 220],
  bulletSpeed: ["\uD0C4\uC18D", 520],
  range: ["\uC0AC\uAC70\uB9AC", 325],
  size: ["\uD0C4\uD658 \uD06C\uAE30", 1],
  maxHp: ["\uCCB4\uB825", 6],
  critChance: ["\uCE58\uBA85\uD0C0", 1],
  pickup: ["\uD68C\uC218 \uBC94\uC704", 1],
  duration: ["\uC0C1\uD0DC \uC9C0\uC18D", 1],
  explosionRadius: ["\uD3ED\uBC1C \uBC94\uC704", 1],
  splitCount: ["\uD30C\uD3B8 \uC218", 2],
  splitDamage: ["\uD30C\uD3B8 \uC704\uB825", 0.3],
  orbitDamage: ["\uB3D9\uB8CC \uC704\uB825", 1],
  movingRate: ["\uC774\uB3D9 \uC911 \uC5F0\uC0AC", 1],
  burnBonus: ["\uBD88\uBD99\uC740 \uC801 \uD53C\uD574", 1],
  multishotBonus: ["\uB2E4\uC911\uD0C4 \uC704\uB825", 1],
  dotPower: ["\uC9C0\uC18D \uD53C\uD574", 1],
  knockback: ["\uBC00\uCCD0\uB0B4\uAE30", 1],
  pierce: ["\uAD00\uD1B5", 1],
  bounce: ["\uB3C4\uD0C4", 1],
  homing: ["\uC720\uB3C4\uB825", 1],
  dodge: ["\uD68C\uD53C", 1],
  resist: ["\uD53C\uD574 \uC800\uD56D", 1],
  burn: ["\uD654\uC0C1", 1],
  slow: ["\uB454\uD654", 1],
  lightning: ["\uAC10\uC804", 1],
  poison: ["\uC911\uB3C5", 1]
};
var mechanics = {
  shatter: "\uBE59\uACB0\uC744 \uAE68\uB728\uB9AC\uB294 \uAC15\uD0C0",
  singleCore: "\uD0C4\uC218\uB97C \uD55C \uBC1C\uC758 \uC704\uB825\uC73C\uB85C \uC555\uCD95",
  thermalShock: "\uBD88\uACFC \uB0C9\uAE30\uB97C \uC18C\uBAA8\uD574 \uC5F4\uCDA9\uACA9",
  conduction: "\uC816\uC740 \uC801\uC744 \uD0C0\uACE0 \uBC88\uC9C0\uB294 \uAC10\uC804",
  execution: "\uC628\uC804\uD55C \uC801\uC5D0\uAC8C \uAC15\uD55C \uCCAB \uC77C\uACA9",
  helix: "\uC5C7\uAC08\uB9AC\uB294 \uB098\uC120\uD0C4",
  waveShot: "\uBB3C\uACB0\uCE58\uB294 \uD0C4\uD658",
  zigzag: "\uC9C0\uADF8\uC7AC\uADF8 \uD0C4\uD658",
  accelerator: "\uC810\uC810 \uBE68\uB77C\uC9C0\uB294 \uD0C4\uD658",
  brakeShot: "\uC810\uC810 \uB290\uB824\uC9C0\uB294 \uD0C4\uD658",
  swerve: "\uD718\uC5B4\uC9C0\uB294 \uD0C4\uD658",
  spiralShot: "\uD68C\uC804\uD558\uB294 \uCD1D\uAD6C",
  petalShot: "\uAF43\uC78E\uCC98\uB7FC \uD37C\uC9C0\uB294 \uD0C4\uD658",
  crossShot: "\uC2ED\uC790\uB85C \uD37C\uC9C0\uB294 \uD0C4\uD658",
  parallelShot: "\uB098\uB780\uD788 \uB098\uAC00\uB294 \uD0C4\uD658",
  sweepShot: "\uC88C\uC6B0\uB85C \uD6D1\uB294 \uC0AC\uACA9",
  scatterShot: "\uB113\uAC8C \uD769\uBFCC\uB9AC\uAE30",
  convergeShot: "\uD55C\uACF3\uC73C\uB85C \uBAA8\uC774\uB294 \uD0C4\uD658",
  alternatingShot: "\uC5C7\uAC08\uB9AC\uB294 \uBC1C\uC0AC \uC704\uCE58",
  trainShot: "\uB4A4\uB530\uB974\uB294 \uD0C4\uD658",
  delayedShot: "\uC7A0\uC2DC \uBA48\uCDC4\uB2E4\uAC00 \uBC1C\uC0AC",
  pulseSize: "\uC228 \uC26C\uB4EF \uCEE4\uC9C0\uB294 \uD0C4\uD658",
  beam: "\uAD00\uD1B5 \uAD11\uC120",
  ringShot: "\uACE0\uB9AC \uAD11\uC120",
  lobShot: "\uD558\uB298\uC5D0\uC11C \uB0B4\uB824\uAF42\uAE30",
  meleeShot: "\uADFC\uC811 \uBCA0\uAE30",
  remoteOrb: "\uC6D0\uACA9 \uC870\uC885 \uD575",
  extraProjectiles: "\uD0C4\uC218\u2191",
  repeatShots: "\uC5F0\uC18D \uACF5\uACA9\u2191",
  stasis: "\uB193\uC73C\uBA74 \uC3DF\uC544\uC9C0\uB294 \uC800\uC7A5 \uC0AC\uACA9",
  fusion: "\uD0C4\uD658\uC744 \uBA39\uACE0 \uC790\uB77C\uB294 \uD575",
  autoCharge: "\uC790\uB3D9 \uCDA9\uC804",
  wrap: "\uBCBD \uB108\uBA38\uB85C \uC774\uC5B4\uC9C0\uB294 \uACF5\uACA9",
  bombShot: "\uD3ED\uD0C4 \uBC1C\uC0AC",
  rangePower: "\uAC00\uAE4C\uC6B8\uC218\uB85D \uAC15\uD55C \uACF5\uACA9",
  conduit: "\uC804\uADF9 \uC5F0\uACB0",
  shieldShot: "\uC801\uD0C4\uC744 \uC9C0\uC6B0\uB294 \uACF5\uACA9",
  boomerang: "\uB418\uB3CC\uC544\uC624\uB294 \uCE7C\uB0A0",
  adhesive: "\uB2EC\uB77C\uBD99\uB294 \uD3ED\uC57D",
  charged: "\uCDA9\uC804 \uC0AC\uACA9",
  tether: "\uC801\uC744 \uC787\uB294 \uC804\uAE30\uC120",
  chainFuse: "\uC774\uC5B4\uC9C0\uB294 \uAE30\uD3ED",
  wallLink: "\uBCBD\uC5D0 \uB0A8\uAE30\uB294 \uC804\uADF9",
  seekingShards: "\uC801\uC744 \uCC3E\uB294 \uD30C\uD3B8",
  chargedArc: "\uCDA9\uC804 \uB4A4 \uC5F0\uC1C4 \uBC29\uC804",
  returnNova: "\uB3CC\uC544\uC62C \uB54C \uD30C\uD3B8 \uBC29\uCD9C",
  retreatOrbit: "\uD6C4\uD1F4 \uC911 \uACF5\uC804\uD0C4",
  longEntry: "\uC785\uC7A5 \uAC15\uD654 \uC9C0\uC18D\u2191",
  reflectBuff: "\uBC18\uC0AC \uB4A4 \uACF5\uACA9 \uAC15\uD654",
  shieldBreakShort: "\uBCF4\uD638\uB9C9 \uD30C\uAD34 \uB4A4 \uC7A0\uC2DC \uBB34\uC801",
  orbitAccelerate: "\uB3D9\uB8CC \uD68C\uC804 \uAC00\uC18D",
  stickyHoming: "\uB048\uC801\uD55C \uC801\uC744 \uCD94\uC801",
  bounceHoming: "\uB3C4\uD0C4 \uB4A4 \uC720\uB3C4",
  retarget: "\uCC98\uCE58 \uD6C4 \uB2E4\uC74C \uC801 \uCD94\uC801",
  betterHeal: "\uD68C\uBCF5 \uD6A8\uC728\u2191",
  dodgeMark: "\uD68C\uD53C\uD55C \uC801\uC5D0\uAC8C \uD45C\uC2DD",
  mergeTrails: "\uC7A5\uD310\uC774 \uB9CC\uB098 \uD655\uC7A5",
  frozenZone: "\uBE59\uACB0 \uC8FC\uBCC0 \uB0C9\uAE30",
  standResist: "\uBA48\uCD94\uBA74 \uB2E8\uB2E8\uD574\uC9D0",
  healthySize: "\uAC74\uAC15\uD560\uC218\uB85D \uD070 \uD0C4\uD658",
  movingGrowth: "\uC6C0\uC9C1\uC77C\uC218\uB85D \uC131\uC7A5",
  bleedGauge: "\uCD9C\uD608\uB85C \uBCF4\uD638\uB9C9 \uCDA9\uC804",
  absorb: "\uC801\uD0C4 \uD761\uC218",
  activeFreeze: "\uC561\uD2F0\uBE0C \xB7 \uC8FC\uBCC0 \uBE59\uACB0",
  arcHoming: "\uB3CC\uC544\uC11C \uCD94\uC801",
  auraSlow: "\uC8FC\uBCC0\uC5D0 \uB0C9\uAE30",
  autoReflect: "\uAC00\uAE4C\uC6B4 \uC801\uD0C4 \uBC18\uC0AC",
  bigTrail: "\uD070 \uD0C4\uD658\uC758 \uD754\uC801",
  bleed: "\uCE58\uBA85\uD0C0\uC5D0 \uCD9C\uD608",
  blockOrbit: "\uBC29\uC5B4 \uB3D9\uB8CC",
  bossHeal: "\uBCF4\uC2A4 \uCC98\uCE58 \uD6C4 \uD68C\uBCF5",
  bounceFalloff: "\uB3C4\uD0C4 \uD53C\uD574 \uC720\uC9C0",
  bounceGain: "\uD295\uAE38\uC218\uB85D \uAC15\uD574\uC9D0",
  burstEvery: "\uC8FC\uAE30\uC801\uC778 \uC810\uC0AC",
  champion: "\uAC15\uC801 \uC720\uC778",
  chargeLightning: "\uCDA9\uC804 \uC911 \uBC88\uAC1C",
  cloneEffect: "\uC7A5\uBE44 \uD6A8\uACFC\uC758 \uD76C\uBBF8\uD55C \uBCF5\uC81C",
  dashExplosion: "\uB3CC\uC9C4 \uB4A4 \uD3ED\uBC1C",
  drone: "\uD68C\uC218 \uB3D9\uB8CC",
  duplicate: "\uACF5\uACA9 \uBCF5\uC81C",
  echo: "\uB4A4\uB2A6\uAC8C \uC6B8\uB9AC\uB294 \uACF5\uACA9",
  entryArmor: "\uC785\uC7A5 \uC9C1\uD6C4 \uB2E8\uB2E8\uD574\uC9D0",
  entryContact: "\uC785\uC7A5 \uC9C1\uD6C4 \uC811\uCD09 \uAC15\uD654",
  entryRate: "\uC785\uC7A5 \uC9C1\uD6C4 \uC5F0\uC0AC \uAC15\uD654",
  expireSplit: "\uB05D\uC5D0\uC11C \uAC08\uB77C\uC9C0\uB294 \uD0C4\uD658",
  firstGuard: "\uCCAB \uD53C\uD574 \uC644\uD654",
  growth: "\uBCF4\uC2A4\uB97C \uB118\uC744\uC218\uB85D \uC131\uC7A5",
  halfOrbit: "\uB3CC\uC544 \uB098\uAC00\uB294 \uD0C4\uD658",
  healChanceRooms: "\uD68C\uBCF5\uC758 \uAE30\uD68C",
  healRooms: "\uC804\uD22C \uC0AC\uC774 \uD68C\uBCF5",
  healthyArmor: "\uAC74\uAC15\uD560\uC218\uB85D \uB2E8\uB2E8\uD574\uC9D0",
  killShards: "\uCC98\uCE58 \uC2DC \uD30C\uD3B8",
  lowHpRate: "\uC704\uAE30\uC5D0\uC11C \uBE60\uB978 \uC5F0\uC0AC",
  mark: "\uCE58\uBA85\uD0C0\uC5D0 \uD45C\uC2DD",
  miniLightning: "\uC791\uC740 \uC5F0\uC1C4 \uBC88\uAC1C",
  movingDodge: "\uC774\uB3D9 \uC911 \uD68C\uD53C",
  orbitCount: "\uACF5\uC804 \uB3D9\uB8CC",
  orbitEvery: "\uC8FC\uAE30\uC801\uC778 \uACF5\uC804\uD0C4",
  pierceFalloff: "\uAD00\uD1B5 \uD53C\uD574 \uC720\uC9C0",
  pierceSpeed: "\uAFF0\uB6AB\uC744\uC218\uB85D \uAC00\uC18D",
  randomRoom: "\uBC29\uB9C8\uB2E4 \uB2EC\uB77C\uC9C0\uB294 \uD798",
  randomStatus: "\uC608\uCE21 \uBD88\uAC00\uD55C \uC18D\uC131",
  reflect: "\uD53C\uACA9 \uC2DC \uBC18\uC0AC",
  retreatDamage: "\uBB3C\uB7EC\uC11C\uBA70 \uAC15\uD55C \uC0AC\uACA9",
  return: "\uD0C4\uD658 \uD68C\uC218",
  revive: "\uB9C8\uC9C0\uB9C9 \uAE30\uD68C",
  rewind: "\uC783\uC740 \uCCB4\uB825\uC744 \uB418\uAC10\uAE30",
  shieldArmor: "\uBCF4\uD638\uB9C9 \uC7A5\uCC29",
  side: "\uCE21\uBA74 \uC0AC\uACA9",
  sideEvery: "\uC8FC\uAE30\uC801\uC778 \uCE21\uBA74 \uC0AC\uACA9",
  sprout: "\uC790\uB77C\uB098\uB294 \uB3D9\uB8CC",
  standDamage: "\uBA48\uCD94\uBA74 \uACF5\uACA9 \uAC15\uD654",
  sticky: "\uB048\uC801\uD55C \uD0C4\uD658",
  synergyDiscount: "\uC138\uD2B8 \uC644\uC131\uC5D0 \uD544\uC694\uD55C \uC7AC\uB8CC\u2193",
  tagDamage: "\uB2E4\uC591\uD55C \uBD84\uB958\uAC00 \uD798\uC774 \uB428",
  trail: "\uACF5\uACA9\uC774 \uB0A8\uAE30\uB294 \uD754\uC801",
  turret: "\uACE0\uC815 \uD3EC\uD0D1",
  double: "\uACB9\uCCD0 \uC3D8\uAE30",
  triple: "\uAC08\uB798 \uC0AC\uACA9",
  rear: "\uD6C4\uBC29 \uC0AC\uACA9",
  freezeStacks: "\uB0C9\uAE30\uAC00 \uC313\uC774\uBA74 \uBE59\uACB0",
  split: "\uBA85\uC911 \uC2DC \uBD84\uC5F4",
  explosion: "\uBA85\uC911 \uC2DC \uD3ED\uBC1C",
  zone: "\uC704\uD5D8\uD55C \uC7A5\uD310",
  statusBonus: "\uC5EC\uB7EC \uC18D\uC131\uC774 \uB9CC\uB098 \uAC15\uD654",
  iceShards: "\uBE59\uACB0 \uD30C\uD3B8",
  splitBurn: "\uBD88\uBD99\uC740 \uD30C\uD3B8",
  pierceLightning: "\uAD00\uD1B5 \uB4A4 \uC5F0\uC1C4 \uAC10\uC804",
  spreadTargets: "\uAC08\uB798\uB9C8\uB2E4 \uB2E4\uB978 \uC801 \uCD94\uC801"
};
function summarizeItem(effects) {
  const labels2 = effects.filter((e) => e.value !== 0).map((e) => {
    const stat = stats[e.key];
    if (!stat) {
      const text = mechanics[e.key];
      if (!text) throw new Error(`Missing item summary: ${e.key}`);
      return text;
    }
    const [name, base] = stat;
    const delta = e.op === "multiply" ? e.value - 1 : e.op === "additive" ? e.value : e.op === "override" ? (e.value - base) / base : e.value / base;
    if (delta === 0) return name;
    const magnitude = Math.abs(delta), count = magnitude >= 0.75 ? 3 : magnitude >= 0.25 ? 2 : 1;
    return name + (delta < 0 ? "\u2193" : "\u2191").repeat(count);
  });
  return [...new Set(labels2)].join(" \xB7 ") || "\uC791\uC740 \uBCC0\uD654";
}

// node_modules/.pnpm/zod@3.24.2/node_modules/zod/lib/index.mjs
var util;
(function(util2) {
  util2.assertEqual = (val) => val;
  function assertIs(_arg) {
  }
  util2.assertIs = assertIs;
  function assertNever(_x) {
    throw new Error();
  }
  util2.assertNever = assertNever;
  util2.arrayToEnum = (items) => {
    const obj = {};
    for (const item of items) {
      obj[item] = item;
    }
    return obj;
  };
  util2.getValidEnumValues = (obj) => {
    const validKeys = util2.objectKeys(obj).filter((k) => typeof obj[obj[k]] !== "number");
    const filtered = {};
    for (const k of validKeys) {
      filtered[k] = obj[k];
    }
    return util2.objectValues(filtered);
  };
  util2.objectValues = (obj) => {
    return util2.objectKeys(obj).map(function(e) {
      return obj[e];
    });
  };
  util2.objectKeys = typeof Object.keys === "function" ? (obj) => Object.keys(obj) : (object) => {
    const keys = [];
    for (const key2 in object) {
      if (Object.prototype.hasOwnProperty.call(object, key2)) {
        keys.push(key2);
      }
    }
    return keys;
  };
  util2.find = (arr, checker) => {
    for (const item of arr) {
      if (checker(item))
        return item;
    }
    return void 0;
  };
  util2.isInteger = typeof Number.isInteger === "function" ? (val) => Number.isInteger(val) : (val) => typeof val === "number" && isFinite(val) && Math.floor(val) === val;
  function joinValues(array, separator = " | ") {
    return array.map((val) => typeof val === "string" ? `'${val}'` : val).join(separator);
  }
  util2.joinValues = joinValues;
  util2.jsonStringifyReplacer = (_, value) => {
    if (typeof value === "bigint") {
      return value.toString();
    }
    return value;
  };
})(util || (util = {}));
var objectUtil;
(function(objectUtil2) {
  objectUtil2.mergeShapes = (first, second) => {
    return {
      ...first,
      ...second
      // second overwrites first
    };
  };
})(objectUtil || (objectUtil = {}));
var ZodParsedType = util.arrayToEnum([
  "string",
  "nan",
  "number",
  "integer",
  "float",
  "boolean",
  "date",
  "bigint",
  "symbol",
  "function",
  "undefined",
  "null",
  "array",
  "object",
  "unknown",
  "promise",
  "void",
  "never",
  "map",
  "set"
]);
var getParsedType = (data) => {
  const t = typeof data;
  switch (t) {
    case "undefined":
      return ZodParsedType.undefined;
    case "string":
      return ZodParsedType.string;
    case "number":
      return isNaN(data) ? ZodParsedType.nan : ZodParsedType.number;
    case "boolean":
      return ZodParsedType.boolean;
    case "function":
      return ZodParsedType.function;
    case "bigint":
      return ZodParsedType.bigint;
    case "symbol":
      return ZodParsedType.symbol;
    case "object":
      if (Array.isArray(data)) {
        return ZodParsedType.array;
      }
      if (data === null) {
        return ZodParsedType.null;
      }
      if (data.then && typeof data.then === "function" && data.catch && typeof data.catch === "function") {
        return ZodParsedType.promise;
      }
      if (typeof Map !== "undefined" && data instanceof Map) {
        return ZodParsedType.map;
      }
      if (typeof Set !== "undefined" && data instanceof Set) {
        return ZodParsedType.set;
      }
      if (typeof Date !== "undefined" && data instanceof Date) {
        return ZodParsedType.date;
      }
      return ZodParsedType.object;
    default:
      return ZodParsedType.unknown;
  }
};
var ZodIssueCode = util.arrayToEnum([
  "invalid_type",
  "invalid_literal",
  "custom",
  "invalid_union",
  "invalid_union_discriminator",
  "invalid_enum_value",
  "unrecognized_keys",
  "invalid_arguments",
  "invalid_return_type",
  "invalid_date",
  "invalid_string",
  "too_small",
  "too_big",
  "invalid_intersection_types",
  "not_multiple_of",
  "not_finite"
]);
var quotelessJson = (obj) => {
  const json = JSON.stringify(obj, null, 2);
  return json.replace(/"([^"]+)":/g, "$1:");
};
var ZodError = class _ZodError extends Error {
  get errors() {
    return this.issues;
  }
  constructor(issues) {
    super();
    this.issues = [];
    this.addIssue = (sub) => {
      this.issues = [...this.issues, sub];
    };
    this.addIssues = (subs = []) => {
      this.issues = [...this.issues, ...subs];
    };
    const actualProto = new.target.prototype;
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(this, actualProto);
    } else {
      this.__proto__ = actualProto;
    }
    this.name = "ZodError";
    this.issues = issues;
  }
  format(_mapper) {
    const mapper = _mapper || function(issue) {
      return issue.message;
    };
    const fieldErrors = { _errors: [] };
    const processError = (error) => {
      for (const issue of error.issues) {
        if (issue.code === "invalid_union") {
          issue.unionErrors.map(processError);
        } else if (issue.code === "invalid_return_type") {
          processError(issue.returnTypeError);
        } else if (issue.code === "invalid_arguments") {
          processError(issue.argumentsError);
        } else if (issue.path.length === 0) {
          fieldErrors._errors.push(mapper(issue));
        } else {
          let curr = fieldErrors;
          let i = 0;
          while (i < issue.path.length) {
            const el = issue.path[i];
            const terminal = i === issue.path.length - 1;
            if (!terminal) {
              curr[el] = curr[el] || { _errors: [] };
            } else {
              curr[el] = curr[el] || { _errors: [] };
              curr[el]._errors.push(mapper(issue));
            }
            curr = curr[el];
            i++;
          }
        }
      }
    };
    processError(this);
    return fieldErrors;
  }
  static assert(value) {
    if (!(value instanceof _ZodError)) {
      throw new Error(`Not a ZodError: ${value}`);
    }
  }
  toString() {
    return this.message;
  }
  get message() {
    return JSON.stringify(this.issues, util.jsonStringifyReplacer, 2);
  }
  get isEmpty() {
    return this.issues.length === 0;
  }
  flatten(mapper = (issue) => issue.message) {
    const fieldErrors = {};
    const formErrors = [];
    for (const sub of this.issues) {
      if (sub.path.length > 0) {
        fieldErrors[sub.path[0]] = fieldErrors[sub.path[0]] || [];
        fieldErrors[sub.path[0]].push(mapper(sub));
      } else {
        formErrors.push(mapper(sub));
      }
    }
    return { formErrors, fieldErrors };
  }
  get formErrors() {
    return this.flatten();
  }
};
ZodError.create = (issues) => {
  const error = new ZodError(issues);
  return error;
};
var errorMap = (issue, _ctx) => {
  let message;
  switch (issue.code) {
    case ZodIssueCode.invalid_type:
      if (issue.received === ZodParsedType.undefined) {
        message = "Required";
      } else {
        message = `Expected ${issue.expected}, received ${issue.received}`;
      }
      break;
    case ZodIssueCode.invalid_literal:
      message = `Invalid literal value, expected ${JSON.stringify(issue.expected, util.jsonStringifyReplacer)}`;
      break;
    case ZodIssueCode.unrecognized_keys:
      message = `Unrecognized key(s) in object: ${util.joinValues(issue.keys, ", ")}`;
      break;
    case ZodIssueCode.invalid_union:
      message = `Invalid input`;
      break;
    case ZodIssueCode.invalid_union_discriminator:
      message = `Invalid discriminator value. Expected ${util.joinValues(issue.options)}`;
      break;
    case ZodIssueCode.invalid_enum_value:
      message = `Invalid enum value. Expected ${util.joinValues(issue.options)}, received '${issue.received}'`;
      break;
    case ZodIssueCode.invalid_arguments:
      message = `Invalid function arguments`;
      break;
    case ZodIssueCode.invalid_return_type:
      message = `Invalid function return type`;
      break;
    case ZodIssueCode.invalid_date:
      message = `Invalid date`;
      break;
    case ZodIssueCode.invalid_string:
      if (typeof issue.validation === "object") {
        if ("includes" in issue.validation) {
          message = `Invalid input: must include "${issue.validation.includes}"`;
          if (typeof issue.validation.position === "number") {
            message = `${message} at one or more positions greater than or equal to ${issue.validation.position}`;
          }
        } else if ("startsWith" in issue.validation) {
          message = `Invalid input: must start with "${issue.validation.startsWith}"`;
        } else if ("endsWith" in issue.validation) {
          message = `Invalid input: must end with "${issue.validation.endsWith}"`;
        } else {
          util.assertNever(issue.validation);
        }
      } else if (issue.validation !== "regex") {
        message = `Invalid ${issue.validation}`;
      } else {
        message = "Invalid";
      }
      break;
    case ZodIssueCode.too_small:
      if (issue.type === "array")
        message = `Array must contain ${issue.exact ? "exactly" : issue.inclusive ? `at least` : `more than`} ${issue.minimum} element(s)`;
      else if (issue.type === "string")
        message = `String must contain ${issue.exact ? "exactly" : issue.inclusive ? `at least` : `over`} ${issue.minimum} character(s)`;
      else if (issue.type === "number")
        message = `Number must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${issue.minimum}`;
      else if (issue.type === "date")
        message = `Date must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${new Date(Number(issue.minimum))}`;
      else
        message = "Invalid input";
      break;
    case ZodIssueCode.too_big:
      if (issue.type === "array")
        message = `Array must contain ${issue.exact ? `exactly` : issue.inclusive ? `at most` : `less than`} ${issue.maximum} element(s)`;
      else if (issue.type === "string")
        message = `String must contain ${issue.exact ? `exactly` : issue.inclusive ? `at most` : `under`} ${issue.maximum} character(s)`;
      else if (issue.type === "number")
        message = `Number must be ${issue.exact ? `exactly` : issue.inclusive ? `less than or equal to` : `less than`} ${issue.maximum}`;
      else if (issue.type === "bigint")
        message = `BigInt must be ${issue.exact ? `exactly` : issue.inclusive ? `less than or equal to` : `less than`} ${issue.maximum}`;
      else if (issue.type === "date")
        message = `Date must be ${issue.exact ? `exactly` : issue.inclusive ? `smaller than or equal to` : `smaller than`} ${new Date(Number(issue.maximum))}`;
      else
        message = "Invalid input";
      break;
    case ZodIssueCode.custom:
      message = `Invalid input`;
      break;
    case ZodIssueCode.invalid_intersection_types:
      message = `Intersection results could not be merged`;
      break;
    case ZodIssueCode.not_multiple_of:
      message = `Number must be a multiple of ${issue.multipleOf}`;
      break;
    case ZodIssueCode.not_finite:
      message = "Number must be finite";
      break;
    default:
      message = _ctx.defaultError;
      util.assertNever(issue);
  }
  return { message };
};
var overrideErrorMap = errorMap;
function setErrorMap(map) {
  overrideErrorMap = map;
}
function getErrorMap() {
  return overrideErrorMap;
}
var makeIssue = (params) => {
  const { data, path, errorMaps, issueData } = params;
  const fullPath = [...path, ...issueData.path || []];
  const fullIssue = {
    ...issueData,
    path: fullPath
  };
  if (issueData.message !== void 0) {
    return {
      ...issueData,
      path: fullPath,
      message: issueData.message
    };
  }
  let errorMessage = "";
  const maps = errorMaps.filter((m) => !!m).slice().reverse();
  for (const map of maps) {
    errorMessage = map(fullIssue, { data, defaultError: errorMessage }).message;
  }
  return {
    ...issueData,
    path: fullPath,
    message: errorMessage
  };
};
var EMPTY_PATH = [];
function addIssueToContext(ctx, issueData) {
  const overrideMap = getErrorMap();
  const issue = makeIssue({
    issueData,
    data: ctx.data,
    path: ctx.path,
    errorMaps: [
      ctx.common.contextualErrorMap,
      // contextual error map is first priority
      ctx.schemaErrorMap,
      // then schema-bound map if available
      overrideMap,
      // then global override map
      overrideMap === errorMap ? void 0 : errorMap
      // then global default map
    ].filter((x) => !!x)
  });
  ctx.common.issues.push(issue);
}
var ParseStatus = class _ParseStatus {
  constructor() {
    this.value = "valid";
  }
  dirty() {
    if (this.value === "valid")
      this.value = "dirty";
  }
  abort() {
    if (this.value !== "aborted")
      this.value = "aborted";
  }
  static mergeArray(status, results) {
    const arrayValue = [];
    for (const s of results) {
      if (s.status === "aborted")
        return INVALID;
      if (s.status === "dirty")
        status.dirty();
      arrayValue.push(s.value);
    }
    return { status: status.value, value: arrayValue };
  }
  static async mergeObjectAsync(status, pairs) {
    const syncPairs = [];
    for (const pair of pairs) {
      const key2 = await pair.key;
      const value = await pair.value;
      syncPairs.push({
        key: key2,
        value
      });
    }
    return _ParseStatus.mergeObjectSync(status, syncPairs);
  }
  static mergeObjectSync(status, pairs) {
    const finalObject = {};
    for (const pair of pairs) {
      const { key: key2, value } = pair;
      if (key2.status === "aborted")
        return INVALID;
      if (value.status === "aborted")
        return INVALID;
      if (key2.status === "dirty")
        status.dirty();
      if (value.status === "dirty")
        status.dirty();
      if (key2.value !== "__proto__" && (typeof value.value !== "undefined" || pair.alwaysSet)) {
        finalObject[key2.value] = value.value;
      }
    }
    return { status: status.value, value: finalObject };
  }
};
var INVALID = Object.freeze({
  status: "aborted"
});
var DIRTY = (value) => ({ status: "dirty", value });
var OK = (value) => ({ status: "valid", value });
var isAborted = (x) => x.status === "aborted";
var isDirty = (x) => x.status === "dirty";
var isValid = (x) => x.status === "valid";
var isAsync = (x) => typeof Promise !== "undefined" && x instanceof Promise;
function __classPrivateFieldGet(receiver, state, kind, f) {
  if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
  if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
  return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
}
function __classPrivateFieldSet(receiver, state, value, kind, f) {
  if (kind === "m") throw new TypeError("Private method is not writable");
  if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
  if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
  return kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value), value;
}
var errorUtil;
(function(errorUtil2) {
  errorUtil2.errToObj = (message) => typeof message === "string" ? { message } : message || {};
  errorUtil2.toString = (message) => typeof message === "string" ? message : message === null || message === void 0 ? void 0 : message.message;
})(errorUtil || (errorUtil = {}));
var _ZodEnum_cache;
var _ZodNativeEnum_cache;
var ParseInputLazyPath = class {
  constructor(parent, value, path, key2) {
    this._cachedPath = [];
    this.parent = parent;
    this.data = value;
    this._path = path;
    this._key = key2;
  }
  get path() {
    if (!this._cachedPath.length) {
      if (this._key instanceof Array) {
        this._cachedPath.push(...this._path, ...this._key);
      } else {
        this._cachedPath.push(...this._path, this._key);
      }
    }
    return this._cachedPath;
  }
};
var handleResult = (ctx, result) => {
  if (isValid(result)) {
    return { success: true, data: result.value };
  } else {
    if (!ctx.common.issues.length) {
      throw new Error("Validation failed but no issues detected.");
    }
    return {
      success: false,
      get error() {
        if (this._error)
          return this._error;
        const error = new ZodError(ctx.common.issues);
        this._error = error;
        return this._error;
      }
    };
  }
};
function processCreateParams(params) {
  if (!params)
    return {};
  const { errorMap: errorMap2, invalid_type_error, required_error, description } = params;
  if (errorMap2 && (invalid_type_error || required_error)) {
    throw new Error(`Can't use "invalid_type_error" or "required_error" in conjunction with custom error map.`);
  }
  if (errorMap2)
    return { errorMap: errorMap2, description };
  const customMap = (iss, ctx) => {
    var _a, _b;
    const { message } = params;
    if (iss.code === "invalid_enum_value") {
      return { message: message !== null && message !== void 0 ? message : ctx.defaultError };
    }
    if (typeof ctx.data === "undefined") {
      return { message: (_a = message !== null && message !== void 0 ? message : required_error) !== null && _a !== void 0 ? _a : ctx.defaultError };
    }
    if (iss.code !== "invalid_type")
      return { message: ctx.defaultError };
    return { message: (_b = message !== null && message !== void 0 ? message : invalid_type_error) !== null && _b !== void 0 ? _b : ctx.defaultError };
  };
  return { errorMap: customMap, description };
}
var ZodType = class {
  get description() {
    return this._def.description;
  }
  _getType(input) {
    return getParsedType(input.data);
  }
  _getOrReturnCtx(input, ctx) {
    return ctx || {
      common: input.parent.common,
      data: input.data,
      parsedType: getParsedType(input.data),
      schemaErrorMap: this._def.errorMap,
      path: input.path,
      parent: input.parent
    };
  }
  _processInputParams(input) {
    return {
      status: new ParseStatus(),
      ctx: {
        common: input.parent.common,
        data: input.data,
        parsedType: getParsedType(input.data),
        schemaErrorMap: this._def.errorMap,
        path: input.path,
        parent: input.parent
      }
    };
  }
  _parseSync(input) {
    const result = this._parse(input);
    if (isAsync(result)) {
      throw new Error("Synchronous parse encountered promise.");
    }
    return result;
  }
  _parseAsync(input) {
    const result = this._parse(input);
    return Promise.resolve(result);
  }
  parse(data, params) {
    const result = this.safeParse(data, params);
    if (result.success)
      return result.data;
    throw result.error;
  }
  safeParse(data, params) {
    var _a;
    const ctx = {
      common: {
        issues: [],
        async: (_a = params === null || params === void 0 ? void 0 : params.async) !== null && _a !== void 0 ? _a : false,
        contextualErrorMap: params === null || params === void 0 ? void 0 : params.errorMap
      },
      path: (params === null || params === void 0 ? void 0 : params.path) || [],
      schemaErrorMap: this._def.errorMap,
      parent: null,
      data,
      parsedType: getParsedType(data)
    };
    const result = this._parseSync({ data, path: ctx.path, parent: ctx });
    return handleResult(ctx, result);
  }
  "~validate"(data) {
    var _a, _b;
    const ctx = {
      common: {
        issues: [],
        async: !!this["~standard"].async
      },
      path: [],
      schemaErrorMap: this._def.errorMap,
      parent: null,
      data,
      parsedType: getParsedType(data)
    };
    if (!this["~standard"].async) {
      try {
        const result = this._parseSync({ data, path: [], parent: ctx });
        return isValid(result) ? {
          value: result.value
        } : {
          issues: ctx.common.issues
        };
      } catch (err) {
        if ((_b = (_a = err === null || err === void 0 ? void 0 : err.message) === null || _a === void 0 ? void 0 : _a.toLowerCase()) === null || _b === void 0 ? void 0 : _b.includes("encountered")) {
          this["~standard"].async = true;
        }
        ctx.common = {
          issues: [],
          async: true
        };
      }
    }
    return this._parseAsync({ data, path: [], parent: ctx }).then((result) => isValid(result) ? {
      value: result.value
    } : {
      issues: ctx.common.issues
    });
  }
  async parseAsync(data, params) {
    const result = await this.safeParseAsync(data, params);
    if (result.success)
      return result.data;
    throw result.error;
  }
  async safeParseAsync(data, params) {
    const ctx = {
      common: {
        issues: [],
        contextualErrorMap: params === null || params === void 0 ? void 0 : params.errorMap,
        async: true
      },
      path: (params === null || params === void 0 ? void 0 : params.path) || [],
      schemaErrorMap: this._def.errorMap,
      parent: null,
      data,
      parsedType: getParsedType(data)
    };
    const maybeAsyncResult = this._parse({ data, path: ctx.path, parent: ctx });
    const result = await (isAsync(maybeAsyncResult) ? maybeAsyncResult : Promise.resolve(maybeAsyncResult));
    return handleResult(ctx, result);
  }
  refine(check, message) {
    const getIssueProperties = (val) => {
      if (typeof message === "string" || typeof message === "undefined") {
        return { message };
      } else if (typeof message === "function") {
        return message(val);
      } else {
        return message;
      }
    };
    return this._refinement((val, ctx) => {
      const result = check(val);
      const setError = () => ctx.addIssue({
        code: ZodIssueCode.custom,
        ...getIssueProperties(val)
      });
      if (typeof Promise !== "undefined" && result instanceof Promise) {
        return result.then((data) => {
          if (!data) {
            setError();
            return false;
          } else {
            return true;
          }
        });
      }
      if (!result) {
        setError();
        return false;
      } else {
        return true;
      }
    });
  }
  refinement(check, refinementData) {
    return this._refinement((val, ctx) => {
      if (!check(val)) {
        ctx.addIssue(typeof refinementData === "function" ? refinementData(val, ctx) : refinementData);
        return false;
      } else {
        return true;
      }
    });
  }
  _refinement(refinement) {
    return new ZodEffects({
      schema: this,
      typeName: ZodFirstPartyTypeKind.ZodEffects,
      effect: { type: "refinement", refinement }
    });
  }
  superRefine(refinement) {
    return this._refinement(refinement);
  }
  constructor(def) {
    this.spa = this.safeParseAsync;
    this._def = def;
    this.parse = this.parse.bind(this);
    this.safeParse = this.safeParse.bind(this);
    this.parseAsync = this.parseAsync.bind(this);
    this.safeParseAsync = this.safeParseAsync.bind(this);
    this.spa = this.spa.bind(this);
    this.refine = this.refine.bind(this);
    this.refinement = this.refinement.bind(this);
    this.superRefine = this.superRefine.bind(this);
    this.optional = this.optional.bind(this);
    this.nullable = this.nullable.bind(this);
    this.nullish = this.nullish.bind(this);
    this.array = this.array.bind(this);
    this.promise = this.promise.bind(this);
    this.or = this.or.bind(this);
    this.and = this.and.bind(this);
    this.transform = this.transform.bind(this);
    this.brand = this.brand.bind(this);
    this.default = this.default.bind(this);
    this.catch = this.catch.bind(this);
    this.describe = this.describe.bind(this);
    this.pipe = this.pipe.bind(this);
    this.readonly = this.readonly.bind(this);
    this.isNullable = this.isNullable.bind(this);
    this.isOptional = this.isOptional.bind(this);
    this["~standard"] = {
      version: 1,
      vendor: "zod",
      validate: (data) => this["~validate"](data)
    };
  }
  optional() {
    return ZodOptional.create(this, this._def);
  }
  nullable() {
    return ZodNullable.create(this, this._def);
  }
  nullish() {
    return this.nullable().optional();
  }
  array() {
    return ZodArray.create(this);
  }
  promise() {
    return ZodPromise.create(this, this._def);
  }
  or(option) {
    return ZodUnion.create([this, option], this._def);
  }
  and(incoming) {
    return ZodIntersection.create(this, incoming, this._def);
  }
  transform(transform) {
    return new ZodEffects({
      ...processCreateParams(this._def),
      schema: this,
      typeName: ZodFirstPartyTypeKind.ZodEffects,
      effect: { type: "transform", transform }
    });
  }
  default(def) {
    const defaultValueFunc = typeof def === "function" ? def : () => def;
    return new ZodDefault({
      ...processCreateParams(this._def),
      innerType: this,
      defaultValue: defaultValueFunc,
      typeName: ZodFirstPartyTypeKind.ZodDefault
    });
  }
  brand() {
    return new ZodBranded({
      typeName: ZodFirstPartyTypeKind.ZodBranded,
      type: this,
      ...processCreateParams(this._def)
    });
  }
  catch(def) {
    const catchValueFunc = typeof def === "function" ? def : () => def;
    return new ZodCatch({
      ...processCreateParams(this._def),
      innerType: this,
      catchValue: catchValueFunc,
      typeName: ZodFirstPartyTypeKind.ZodCatch
    });
  }
  describe(description) {
    const This = this.constructor;
    return new This({
      ...this._def,
      description
    });
  }
  pipe(target) {
    return ZodPipeline.create(this, target);
  }
  readonly() {
    return ZodReadonly.create(this);
  }
  isOptional() {
    return this.safeParse(void 0).success;
  }
  isNullable() {
    return this.safeParse(null).success;
  }
};
var cuidRegex = /^c[^\s-]{8,}$/i;
var cuid2Regex = /^[0-9a-z]+$/;
var ulidRegex = /^[0-9A-HJKMNP-TV-Z]{26}$/i;
var uuidRegex = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/i;
var nanoidRegex = /^[a-z0-9_-]{21}$/i;
var jwtRegex = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/;
var durationRegex = /^[-+]?P(?!$)(?:(?:[-+]?\d+Y)|(?:[-+]?\d+[.,]\d+Y$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:(?:[-+]?\d+W)|(?:[-+]?\d+[.,]\d+W$))?(?:(?:[-+]?\d+D)|(?:[-+]?\d+[.,]\d+D$))?(?:T(?=[\d+-])(?:(?:[-+]?\d+H)|(?:[-+]?\d+[.,]\d+H$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:[-+]?\d+(?:[.,]\d+)?S)?)??$/;
var emailRegex = /^(?!\.)(?!.*\.\.)([A-Z0-9_'+\-\.]*)[A-Z0-9_+-]@([A-Z0-9][A-Z0-9\-]*\.)+[A-Z]{2,}$/i;
var _emojiRegex = `^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$`;
var emojiRegex;
var ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/;
var ipv4CidrRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/(3[0-2]|[12]?[0-9])$/;
var ipv6Regex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;
var ipv6CidrRegex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/;
var base64Regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
var base64urlRegex = /^([0-9a-zA-Z-_]{4})*(([0-9a-zA-Z-_]{2}(==)?)|([0-9a-zA-Z-_]{3}(=)?))?$/;
var dateRegexSource = `((\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-((0[13578]|1[02])-(0[1-9]|[12]\\d|3[01])|(0[469]|11)-(0[1-9]|[12]\\d|30)|(02)-(0[1-9]|1\\d|2[0-8])))`;
var dateRegex = new RegExp(`^${dateRegexSource}$`);
function timeRegexSource(args) {
  let regex = `([01]\\d|2[0-3]):[0-5]\\d:[0-5]\\d`;
  if (args.precision) {
    regex = `${regex}\\.\\d{${args.precision}}`;
  } else if (args.precision == null) {
    regex = `${regex}(\\.\\d+)?`;
  }
  return regex;
}
function timeRegex(args) {
  return new RegExp(`^${timeRegexSource(args)}$`);
}
function datetimeRegex(args) {
  let regex = `${dateRegexSource}T${timeRegexSource(args)}`;
  const opts = [];
  opts.push(args.local ? `Z?` : `Z`);
  if (args.offset)
    opts.push(`([+-]\\d{2}:?\\d{2})`);
  regex = `${regex}(${opts.join("|")})`;
  return new RegExp(`^${regex}$`);
}
function isValidIP(ip, version) {
  if ((version === "v4" || !version) && ipv4Regex.test(ip)) {
    return true;
  }
  if ((version === "v6" || !version) && ipv6Regex.test(ip)) {
    return true;
  }
  return false;
}
function isValidJWT(jwt, alg) {
  if (!jwtRegex.test(jwt))
    return false;
  try {
    const [header] = jwt.split(".");
    const base64 = header.replace(/-/g, "+").replace(/_/g, "/").padEnd(header.length + (4 - header.length % 4) % 4, "=");
    const decoded = JSON.parse(atob(base64));
    if (typeof decoded !== "object" || decoded === null)
      return false;
    if (!decoded.typ || !decoded.alg)
      return false;
    if (alg && decoded.alg !== alg)
      return false;
    return true;
  } catch (_a) {
    return false;
  }
}
function isValidCidr(ip, version) {
  if ((version === "v4" || !version) && ipv4CidrRegex.test(ip)) {
    return true;
  }
  if ((version === "v6" || !version) && ipv6CidrRegex.test(ip)) {
    return true;
  }
  return false;
}
var ZodString = class _ZodString extends ZodType {
  _parse(input) {
    if (this._def.coerce) {
      input.data = String(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.string) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.string,
        received: ctx2.parsedType
      });
      return INVALID;
    }
    const status = new ParseStatus();
    let ctx = void 0;
    for (const check of this._def.checks) {
      if (check.kind === "min") {
        if (input.data.length < check.value) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            minimum: check.value,
            type: "string",
            inclusive: true,
            exact: false,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "max") {
        if (input.data.length > check.value) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            maximum: check.value,
            type: "string",
            inclusive: true,
            exact: false,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "length") {
        const tooBig = input.data.length > check.value;
        const tooSmall = input.data.length < check.value;
        if (tooBig || tooSmall) {
          ctx = this._getOrReturnCtx(input, ctx);
          if (tooBig) {
            addIssueToContext(ctx, {
              code: ZodIssueCode.too_big,
              maximum: check.value,
              type: "string",
              inclusive: true,
              exact: true,
              message: check.message
            });
          } else if (tooSmall) {
            addIssueToContext(ctx, {
              code: ZodIssueCode.too_small,
              minimum: check.value,
              type: "string",
              inclusive: true,
              exact: true,
              message: check.message
            });
          }
          status.dirty();
        }
      } else if (check.kind === "email") {
        if (!emailRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "email",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "emoji") {
        if (!emojiRegex) {
          emojiRegex = new RegExp(_emojiRegex, "u");
        }
        if (!emojiRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "emoji",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "uuid") {
        if (!uuidRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "uuid",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "nanoid") {
        if (!nanoidRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "nanoid",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "cuid") {
        if (!cuidRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "cuid",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "cuid2") {
        if (!cuid2Regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "cuid2",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "ulid") {
        if (!ulidRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "ulid",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "url") {
        try {
          new URL(input.data);
        } catch (_a) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "url",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "regex") {
        check.regex.lastIndex = 0;
        const testResult = check.regex.test(input.data);
        if (!testResult) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "regex",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "trim") {
        input.data = input.data.trim();
      } else if (check.kind === "includes") {
        if (!input.data.includes(check.value, check.position)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: { includes: check.value, position: check.position },
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "toLowerCase") {
        input.data = input.data.toLowerCase();
      } else if (check.kind === "toUpperCase") {
        input.data = input.data.toUpperCase();
      } else if (check.kind === "startsWith") {
        if (!input.data.startsWith(check.value)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: { startsWith: check.value },
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "endsWith") {
        if (!input.data.endsWith(check.value)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: { endsWith: check.value },
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "datetime") {
        const regex = datetimeRegex(check);
        if (!regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: "datetime",
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "date") {
        const regex = dateRegex;
        if (!regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: "date",
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "time") {
        const regex = timeRegex(check);
        if (!regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: "time",
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "duration") {
        if (!durationRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "duration",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "ip") {
        if (!isValidIP(input.data, check.version)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "ip",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "jwt") {
        if (!isValidJWT(input.data, check.alg)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "jwt",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "cidr") {
        if (!isValidCidr(input.data, check.version)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "cidr",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "base64") {
        if (!base64Regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "base64",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "base64url") {
        if (!base64urlRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "base64url",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else {
        util.assertNever(check);
      }
    }
    return { status: status.value, value: input.data };
  }
  _regex(regex, validation, message) {
    return this.refinement((data) => regex.test(data), {
      validation,
      code: ZodIssueCode.invalid_string,
      ...errorUtil.errToObj(message)
    });
  }
  _addCheck(check) {
    return new _ZodString({
      ...this._def,
      checks: [...this._def.checks, check]
    });
  }
  email(message) {
    return this._addCheck({ kind: "email", ...errorUtil.errToObj(message) });
  }
  url(message) {
    return this._addCheck({ kind: "url", ...errorUtil.errToObj(message) });
  }
  emoji(message) {
    return this._addCheck({ kind: "emoji", ...errorUtil.errToObj(message) });
  }
  uuid(message) {
    return this._addCheck({ kind: "uuid", ...errorUtil.errToObj(message) });
  }
  nanoid(message) {
    return this._addCheck({ kind: "nanoid", ...errorUtil.errToObj(message) });
  }
  cuid(message) {
    return this._addCheck({ kind: "cuid", ...errorUtil.errToObj(message) });
  }
  cuid2(message) {
    return this._addCheck({ kind: "cuid2", ...errorUtil.errToObj(message) });
  }
  ulid(message) {
    return this._addCheck({ kind: "ulid", ...errorUtil.errToObj(message) });
  }
  base64(message) {
    return this._addCheck({ kind: "base64", ...errorUtil.errToObj(message) });
  }
  base64url(message) {
    return this._addCheck({
      kind: "base64url",
      ...errorUtil.errToObj(message)
    });
  }
  jwt(options) {
    return this._addCheck({ kind: "jwt", ...errorUtil.errToObj(options) });
  }
  ip(options) {
    return this._addCheck({ kind: "ip", ...errorUtil.errToObj(options) });
  }
  cidr(options) {
    return this._addCheck({ kind: "cidr", ...errorUtil.errToObj(options) });
  }
  datetime(options) {
    var _a, _b;
    if (typeof options === "string") {
      return this._addCheck({
        kind: "datetime",
        precision: null,
        offset: false,
        local: false,
        message: options
      });
    }
    return this._addCheck({
      kind: "datetime",
      precision: typeof (options === null || options === void 0 ? void 0 : options.precision) === "undefined" ? null : options === null || options === void 0 ? void 0 : options.precision,
      offset: (_a = options === null || options === void 0 ? void 0 : options.offset) !== null && _a !== void 0 ? _a : false,
      local: (_b = options === null || options === void 0 ? void 0 : options.local) !== null && _b !== void 0 ? _b : false,
      ...errorUtil.errToObj(options === null || options === void 0 ? void 0 : options.message)
    });
  }
  date(message) {
    return this._addCheck({ kind: "date", message });
  }
  time(options) {
    if (typeof options === "string") {
      return this._addCheck({
        kind: "time",
        precision: null,
        message: options
      });
    }
    return this._addCheck({
      kind: "time",
      precision: typeof (options === null || options === void 0 ? void 0 : options.precision) === "undefined" ? null : options === null || options === void 0 ? void 0 : options.precision,
      ...errorUtil.errToObj(options === null || options === void 0 ? void 0 : options.message)
    });
  }
  duration(message) {
    return this._addCheck({ kind: "duration", ...errorUtil.errToObj(message) });
  }
  regex(regex, message) {
    return this._addCheck({
      kind: "regex",
      regex,
      ...errorUtil.errToObj(message)
    });
  }
  includes(value, options) {
    return this._addCheck({
      kind: "includes",
      value,
      position: options === null || options === void 0 ? void 0 : options.position,
      ...errorUtil.errToObj(options === null || options === void 0 ? void 0 : options.message)
    });
  }
  startsWith(value, message) {
    return this._addCheck({
      kind: "startsWith",
      value,
      ...errorUtil.errToObj(message)
    });
  }
  endsWith(value, message) {
    return this._addCheck({
      kind: "endsWith",
      value,
      ...errorUtil.errToObj(message)
    });
  }
  min(minLength, message) {
    return this._addCheck({
      kind: "min",
      value: minLength,
      ...errorUtil.errToObj(message)
    });
  }
  max(maxLength, message) {
    return this._addCheck({
      kind: "max",
      value: maxLength,
      ...errorUtil.errToObj(message)
    });
  }
  length(len, message) {
    return this._addCheck({
      kind: "length",
      value: len,
      ...errorUtil.errToObj(message)
    });
  }
  /**
   * Equivalent to `.min(1)`
   */
  nonempty(message) {
    return this.min(1, errorUtil.errToObj(message));
  }
  trim() {
    return new _ZodString({
      ...this._def,
      checks: [...this._def.checks, { kind: "trim" }]
    });
  }
  toLowerCase() {
    return new _ZodString({
      ...this._def,
      checks: [...this._def.checks, { kind: "toLowerCase" }]
    });
  }
  toUpperCase() {
    return new _ZodString({
      ...this._def,
      checks: [...this._def.checks, { kind: "toUpperCase" }]
    });
  }
  get isDatetime() {
    return !!this._def.checks.find((ch) => ch.kind === "datetime");
  }
  get isDate() {
    return !!this._def.checks.find((ch) => ch.kind === "date");
  }
  get isTime() {
    return !!this._def.checks.find((ch) => ch.kind === "time");
  }
  get isDuration() {
    return !!this._def.checks.find((ch) => ch.kind === "duration");
  }
  get isEmail() {
    return !!this._def.checks.find((ch) => ch.kind === "email");
  }
  get isURL() {
    return !!this._def.checks.find((ch) => ch.kind === "url");
  }
  get isEmoji() {
    return !!this._def.checks.find((ch) => ch.kind === "emoji");
  }
  get isUUID() {
    return !!this._def.checks.find((ch) => ch.kind === "uuid");
  }
  get isNANOID() {
    return !!this._def.checks.find((ch) => ch.kind === "nanoid");
  }
  get isCUID() {
    return !!this._def.checks.find((ch) => ch.kind === "cuid");
  }
  get isCUID2() {
    return !!this._def.checks.find((ch) => ch.kind === "cuid2");
  }
  get isULID() {
    return !!this._def.checks.find((ch) => ch.kind === "ulid");
  }
  get isIP() {
    return !!this._def.checks.find((ch) => ch.kind === "ip");
  }
  get isCIDR() {
    return !!this._def.checks.find((ch) => ch.kind === "cidr");
  }
  get isBase64() {
    return !!this._def.checks.find((ch) => ch.kind === "base64");
  }
  get isBase64url() {
    return !!this._def.checks.find((ch) => ch.kind === "base64url");
  }
  get minLength() {
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      }
    }
    return min;
  }
  get maxLength() {
    let max = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return max;
  }
};
ZodString.create = (params) => {
  var _a;
  return new ZodString({
    checks: [],
    typeName: ZodFirstPartyTypeKind.ZodString,
    coerce: (_a = params === null || params === void 0 ? void 0 : params.coerce) !== null && _a !== void 0 ? _a : false,
    ...processCreateParams(params)
  });
};
function floatSafeRemainder(val, step2) {
  const valDecCount = (val.toString().split(".")[1] || "").length;
  const stepDecCount = (step2.toString().split(".")[1] || "").length;
  const decCount = valDecCount > stepDecCount ? valDecCount : stepDecCount;
  const valInt = parseInt(val.toFixed(decCount).replace(".", ""));
  const stepInt = parseInt(step2.toFixed(decCount).replace(".", ""));
  return valInt % stepInt / Math.pow(10, decCount);
}
var ZodNumber = class _ZodNumber extends ZodType {
  constructor() {
    super(...arguments);
    this.min = this.gte;
    this.max = this.lte;
    this.step = this.multipleOf;
  }
  _parse(input) {
    if (this._def.coerce) {
      input.data = Number(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.number) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.number,
        received: ctx2.parsedType
      });
      return INVALID;
    }
    let ctx = void 0;
    const status = new ParseStatus();
    for (const check of this._def.checks) {
      if (check.kind === "int") {
        if (!util.isInteger(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: "integer",
            received: "float",
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "min") {
        const tooSmall = check.inclusive ? input.data < check.value : input.data <= check.value;
        if (tooSmall) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            minimum: check.value,
            type: "number",
            inclusive: check.inclusive,
            exact: false,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "max") {
        const tooBig = check.inclusive ? input.data > check.value : input.data >= check.value;
        if (tooBig) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            maximum: check.value,
            type: "number",
            inclusive: check.inclusive,
            exact: false,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "multipleOf") {
        if (floatSafeRemainder(input.data, check.value) !== 0) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.not_multiple_of,
            multipleOf: check.value,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "finite") {
        if (!Number.isFinite(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.not_finite,
            message: check.message
          });
          status.dirty();
        }
      } else {
        util.assertNever(check);
      }
    }
    return { status: status.value, value: input.data };
  }
  gte(value, message) {
    return this.setLimit("min", value, true, errorUtil.toString(message));
  }
  gt(value, message) {
    return this.setLimit("min", value, false, errorUtil.toString(message));
  }
  lte(value, message) {
    return this.setLimit("max", value, true, errorUtil.toString(message));
  }
  lt(value, message) {
    return this.setLimit("max", value, false, errorUtil.toString(message));
  }
  setLimit(kind, value, inclusive, message) {
    return new _ZodNumber({
      ...this._def,
      checks: [
        ...this._def.checks,
        {
          kind,
          value,
          inclusive,
          message: errorUtil.toString(message)
        }
      ]
    });
  }
  _addCheck(check) {
    return new _ZodNumber({
      ...this._def,
      checks: [...this._def.checks, check]
    });
  }
  int(message) {
    return this._addCheck({
      kind: "int",
      message: errorUtil.toString(message)
    });
  }
  positive(message) {
    return this._addCheck({
      kind: "min",
      value: 0,
      inclusive: false,
      message: errorUtil.toString(message)
    });
  }
  negative(message) {
    return this._addCheck({
      kind: "max",
      value: 0,
      inclusive: false,
      message: errorUtil.toString(message)
    });
  }
  nonpositive(message) {
    return this._addCheck({
      kind: "max",
      value: 0,
      inclusive: true,
      message: errorUtil.toString(message)
    });
  }
  nonnegative(message) {
    return this._addCheck({
      kind: "min",
      value: 0,
      inclusive: true,
      message: errorUtil.toString(message)
    });
  }
  multipleOf(value, message) {
    return this._addCheck({
      kind: "multipleOf",
      value,
      message: errorUtil.toString(message)
    });
  }
  finite(message) {
    return this._addCheck({
      kind: "finite",
      message: errorUtil.toString(message)
    });
  }
  safe(message) {
    return this._addCheck({
      kind: "min",
      inclusive: true,
      value: Number.MIN_SAFE_INTEGER,
      message: errorUtil.toString(message)
    })._addCheck({
      kind: "max",
      inclusive: true,
      value: Number.MAX_SAFE_INTEGER,
      message: errorUtil.toString(message)
    });
  }
  get minValue() {
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      }
    }
    return min;
  }
  get maxValue() {
    let max = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return max;
  }
  get isInt() {
    return !!this._def.checks.find((ch) => ch.kind === "int" || ch.kind === "multipleOf" && util.isInteger(ch.value));
  }
  get isFinite() {
    let max = null, min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "finite" || ch.kind === "int" || ch.kind === "multipleOf") {
        return true;
      } else if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      } else if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return Number.isFinite(min) && Number.isFinite(max);
  }
};
ZodNumber.create = (params) => {
  return new ZodNumber({
    checks: [],
    typeName: ZodFirstPartyTypeKind.ZodNumber,
    coerce: (params === null || params === void 0 ? void 0 : params.coerce) || false,
    ...processCreateParams(params)
  });
};
var ZodBigInt = class _ZodBigInt extends ZodType {
  constructor() {
    super(...arguments);
    this.min = this.gte;
    this.max = this.lte;
  }
  _parse(input) {
    if (this._def.coerce) {
      try {
        input.data = BigInt(input.data);
      } catch (_a) {
        return this._getInvalidInput(input);
      }
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.bigint) {
      return this._getInvalidInput(input);
    }
    let ctx = void 0;
    const status = new ParseStatus();
    for (const check of this._def.checks) {
      if (check.kind === "min") {
        const tooSmall = check.inclusive ? input.data < check.value : input.data <= check.value;
        if (tooSmall) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            type: "bigint",
            minimum: check.value,
            inclusive: check.inclusive,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "max") {
        const tooBig = check.inclusive ? input.data > check.value : input.data >= check.value;
        if (tooBig) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            type: "bigint",
            maximum: check.value,
            inclusive: check.inclusive,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "multipleOf") {
        if (input.data % check.value !== BigInt(0)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.not_multiple_of,
            multipleOf: check.value,
            message: check.message
          });
          status.dirty();
        }
      } else {
        util.assertNever(check);
      }
    }
    return { status: status.value, value: input.data };
  }
  _getInvalidInput(input) {
    const ctx = this._getOrReturnCtx(input);
    addIssueToContext(ctx, {
      code: ZodIssueCode.invalid_type,
      expected: ZodParsedType.bigint,
      received: ctx.parsedType
    });
    return INVALID;
  }
  gte(value, message) {
    return this.setLimit("min", value, true, errorUtil.toString(message));
  }
  gt(value, message) {
    return this.setLimit("min", value, false, errorUtil.toString(message));
  }
  lte(value, message) {
    return this.setLimit("max", value, true, errorUtil.toString(message));
  }
  lt(value, message) {
    return this.setLimit("max", value, false, errorUtil.toString(message));
  }
  setLimit(kind, value, inclusive, message) {
    return new _ZodBigInt({
      ...this._def,
      checks: [
        ...this._def.checks,
        {
          kind,
          value,
          inclusive,
          message: errorUtil.toString(message)
        }
      ]
    });
  }
  _addCheck(check) {
    return new _ZodBigInt({
      ...this._def,
      checks: [...this._def.checks, check]
    });
  }
  positive(message) {
    return this._addCheck({
      kind: "min",
      value: BigInt(0),
      inclusive: false,
      message: errorUtil.toString(message)
    });
  }
  negative(message) {
    return this._addCheck({
      kind: "max",
      value: BigInt(0),
      inclusive: false,
      message: errorUtil.toString(message)
    });
  }
  nonpositive(message) {
    return this._addCheck({
      kind: "max",
      value: BigInt(0),
      inclusive: true,
      message: errorUtil.toString(message)
    });
  }
  nonnegative(message) {
    return this._addCheck({
      kind: "min",
      value: BigInt(0),
      inclusive: true,
      message: errorUtil.toString(message)
    });
  }
  multipleOf(value, message) {
    return this._addCheck({
      kind: "multipleOf",
      value,
      message: errorUtil.toString(message)
    });
  }
  get minValue() {
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      }
    }
    return min;
  }
  get maxValue() {
    let max = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return max;
  }
};
ZodBigInt.create = (params) => {
  var _a;
  return new ZodBigInt({
    checks: [],
    typeName: ZodFirstPartyTypeKind.ZodBigInt,
    coerce: (_a = params === null || params === void 0 ? void 0 : params.coerce) !== null && _a !== void 0 ? _a : false,
    ...processCreateParams(params)
  });
};
var ZodBoolean = class extends ZodType {
  _parse(input) {
    if (this._def.coerce) {
      input.data = Boolean(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.boolean) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.boolean,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
};
ZodBoolean.create = (params) => {
  return new ZodBoolean({
    typeName: ZodFirstPartyTypeKind.ZodBoolean,
    coerce: (params === null || params === void 0 ? void 0 : params.coerce) || false,
    ...processCreateParams(params)
  });
};
var ZodDate = class _ZodDate extends ZodType {
  _parse(input) {
    if (this._def.coerce) {
      input.data = new Date(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.date) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.date,
        received: ctx2.parsedType
      });
      return INVALID;
    }
    if (isNaN(input.data.getTime())) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_date
      });
      return INVALID;
    }
    const status = new ParseStatus();
    let ctx = void 0;
    for (const check of this._def.checks) {
      if (check.kind === "min") {
        if (input.data.getTime() < check.value) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            message: check.message,
            inclusive: true,
            exact: false,
            minimum: check.value,
            type: "date"
          });
          status.dirty();
        }
      } else if (check.kind === "max") {
        if (input.data.getTime() > check.value) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            message: check.message,
            inclusive: true,
            exact: false,
            maximum: check.value,
            type: "date"
          });
          status.dirty();
        }
      } else {
        util.assertNever(check);
      }
    }
    return {
      status: status.value,
      value: new Date(input.data.getTime())
    };
  }
  _addCheck(check) {
    return new _ZodDate({
      ...this._def,
      checks: [...this._def.checks, check]
    });
  }
  min(minDate, message) {
    return this._addCheck({
      kind: "min",
      value: minDate.getTime(),
      message: errorUtil.toString(message)
    });
  }
  max(maxDate, message) {
    return this._addCheck({
      kind: "max",
      value: maxDate.getTime(),
      message: errorUtil.toString(message)
    });
  }
  get minDate() {
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      }
    }
    return min != null ? new Date(min) : null;
  }
  get maxDate() {
    let max = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return max != null ? new Date(max) : null;
  }
};
ZodDate.create = (params) => {
  return new ZodDate({
    checks: [],
    coerce: (params === null || params === void 0 ? void 0 : params.coerce) || false,
    typeName: ZodFirstPartyTypeKind.ZodDate,
    ...processCreateParams(params)
  });
};
var ZodSymbol = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.symbol) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.symbol,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
};
ZodSymbol.create = (params) => {
  return new ZodSymbol({
    typeName: ZodFirstPartyTypeKind.ZodSymbol,
    ...processCreateParams(params)
  });
};
var ZodUndefined = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.undefined) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.undefined,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
};
ZodUndefined.create = (params) => {
  return new ZodUndefined({
    typeName: ZodFirstPartyTypeKind.ZodUndefined,
    ...processCreateParams(params)
  });
};
var ZodNull = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.null) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.null,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
};
ZodNull.create = (params) => {
  return new ZodNull({
    typeName: ZodFirstPartyTypeKind.ZodNull,
    ...processCreateParams(params)
  });
};
var ZodAny = class extends ZodType {
  constructor() {
    super(...arguments);
    this._any = true;
  }
  _parse(input) {
    return OK(input.data);
  }
};
ZodAny.create = (params) => {
  return new ZodAny({
    typeName: ZodFirstPartyTypeKind.ZodAny,
    ...processCreateParams(params)
  });
};
var ZodUnknown = class extends ZodType {
  constructor() {
    super(...arguments);
    this._unknown = true;
  }
  _parse(input) {
    return OK(input.data);
  }
};
ZodUnknown.create = (params) => {
  return new ZodUnknown({
    typeName: ZodFirstPartyTypeKind.ZodUnknown,
    ...processCreateParams(params)
  });
};
var ZodNever = class extends ZodType {
  _parse(input) {
    const ctx = this._getOrReturnCtx(input);
    addIssueToContext(ctx, {
      code: ZodIssueCode.invalid_type,
      expected: ZodParsedType.never,
      received: ctx.parsedType
    });
    return INVALID;
  }
};
ZodNever.create = (params) => {
  return new ZodNever({
    typeName: ZodFirstPartyTypeKind.ZodNever,
    ...processCreateParams(params)
  });
};
var ZodVoid = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.undefined) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.void,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
};
ZodVoid.create = (params) => {
  return new ZodVoid({
    typeName: ZodFirstPartyTypeKind.ZodVoid,
    ...processCreateParams(params)
  });
};
var ZodArray = class _ZodArray extends ZodType {
  _parse(input) {
    const { ctx, status } = this._processInputParams(input);
    const def = this._def;
    if (ctx.parsedType !== ZodParsedType.array) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.array,
        received: ctx.parsedType
      });
      return INVALID;
    }
    if (def.exactLength !== null) {
      const tooBig = ctx.data.length > def.exactLength.value;
      const tooSmall = ctx.data.length < def.exactLength.value;
      if (tooBig || tooSmall) {
        addIssueToContext(ctx, {
          code: tooBig ? ZodIssueCode.too_big : ZodIssueCode.too_small,
          minimum: tooSmall ? def.exactLength.value : void 0,
          maximum: tooBig ? def.exactLength.value : void 0,
          type: "array",
          inclusive: true,
          exact: true,
          message: def.exactLength.message
        });
        status.dirty();
      }
    }
    if (def.minLength !== null) {
      if (ctx.data.length < def.minLength.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_small,
          minimum: def.minLength.value,
          type: "array",
          inclusive: true,
          exact: false,
          message: def.minLength.message
        });
        status.dirty();
      }
    }
    if (def.maxLength !== null) {
      if (ctx.data.length > def.maxLength.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_big,
          maximum: def.maxLength.value,
          type: "array",
          inclusive: true,
          exact: false,
          message: def.maxLength.message
        });
        status.dirty();
      }
    }
    if (ctx.common.async) {
      return Promise.all([...ctx.data].map((item, i) => {
        return def.type._parseAsync(new ParseInputLazyPath(ctx, item, ctx.path, i));
      })).then((result2) => {
        return ParseStatus.mergeArray(status, result2);
      });
    }
    const result = [...ctx.data].map((item, i) => {
      return def.type._parseSync(new ParseInputLazyPath(ctx, item, ctx.path, i));
    });
    return ParseStatus.mergeArray(status, result);
  }
  get element() {
    return this._def.type;
  }
  min(minLength, message) {
    return new _ZodArray({
      ...this._def,
      minLength: { value: minLength, message: errorUtil.toString(message) }
    });
  }
  max(maxLength, message) {
    return new _ZodArray({
      ...this._def,
      maxLength: { value: maxLength, message: errorUtil.toString(message) }
    });
  }
  length(len, message) {
    return new _ZodArray({
      ...this._def,
      exactLength: { value: len, message: errorUtil.toString(message) }
    });
  }
  nonempty(message) {
    return this.min(1, message);
  }
};
ZodArray.create = (schema, params) => {
  return new ZodArray({
    type: schema,
    minLength: null,
    maxLength: null,
    exactLength: null,
    typeName: ZodFirstPartyTypeKind.ZodArray,
    ...processCreateParams(params)
  });
};
function deepPartialify(schema) {
  if (schema instanceof ZodObject) {
    const newShape = {};
    for (const key2 in schema.shape) {
      const fieldSchema = schema.shape[key2];
      newShape[key2] = ZodOptional.create(deepPartialify(fieldSchema));
    }
    return new ZodObject({
      ...schema._def,
      shape: () => newShape
    });
  } else if (schema instanceof ZodArray) {
    return new ZodArray({
      ...schema._def,
      type: deepPartialify(schema.element)
    });
  } else if (schema instanceof ZodOptional) {
    return ZodOptional.create(deepPartialify(schema.unwrap()));
  } else if (schema instanceof ZodNullable) {
    return ZodNullable.create(deepPartialify(schema.unwrap()));
  } else if (schema instanceof ZodTuple) {
    return ZodTuple.create(schema.items.map((item) => deepPartialify(item)));
  } else {
    return schema;
  }
}
var ZodObject = class _ZodObject extends ZodType {
  constructor() {
    super(...arguments);
    this._cached = null;
    this.nonstrict = this.passthrough;
    this.augment = this.extend;
  }
  _getCached() {
    if (this._cached !== null)
      return this._cached;
    const shape = this._def.shape();
    const keys = util.objectKeys(shape);
    return this._cached = { shape, keys };
  }
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.object) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.object,
        received: ctx2.parsedType
      });
      return INVALID;
    }
    const { status, ctx } = this._processInputParams(input);
    const { shape, keys: shapeKeys } = this._getCached();
    const extraKeys = [];
    if (!(this._def.catchall instanceof ZodNever && this._def.unknownKeys === "strip")) {
      for (const key2 in ctx.data) {
        if (!shapeKeys.includes(key2)) {
          extraKeys.push(key2);
        }
      }
    }
    const pairs = [];
    for (const key2 of shapeKeys) {
      const keyValidator = shape[key2];
      const value = ctx.data[key2];
      pairs.push({
        key: { status: "valid", value: key2 },
        value: keyValidator._parse(new ParseInputLazyPath(ctx, value, ctx.path, key2)),
        alwaysSet: key2 in ctx.data
      });
    }
    if (this._def.catchall instanceof ZodNever) {
      const unknownKeys = this._def.unknownKeys;
      if (unknownKeys === "passthrough") {
        for (const key2 of extraKeys) {
          pairs.push({
            key: { status: "valid", value: key2 },
            value: { status: "valid", value: ctx.data[key2] }
          });
        }
      } else if (unknownKeys === "strict") {
        if (extraKeys.length > 0) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.unrecognized_keys,
            keys: extraKeys
          });
          status.dirty();
        }
      } else if (unknownKeys === "strip") ;
      else {
        throw new Error(`Internal ZodObject error: invalid unknownKeys value.`);
      }
    } else {
      const catchall = this._def.catchall;
      for (const key2 of extraKeys) {
        const value = ctx.data[key2];
        pairs.push({
          key: { status: "valid", value: key2 },
          value: catchall._parse(
            new ParseInputLazyPath(ctx, value, ctx.path, key2)
            //, ctx.child(key), value, getParsedType(value)
          ),
          alwaysSet: key2 in ctx.data
        });
      }
    }
    if (ctx.common.async) {
      return Promise.resolve().then(async () => {
        const syncPairs = [];
        for (const pair of pairs) {
          const key2 = await pair.key;
          const value = await pair.value;
          syncPairs.push({
            key: key2,
            value,
            alwaysSet: pair.alwaysSet
          });
        }
        return syncPairs;
      }).then((syncPairs) => {
        return ParseStatus.mergeObjectSync(status, syncPairs);
      });
    } else {
      return ParseStatus.mergeObjectSync(status, pairs);
    }
  }
  get shape() {
    return this._def.shape();
  }
  strict(message) {
    errorUtil.errToObj;
    return new _ZodObject({
      ...this._def,
      unknownKeys: "strict",
      ...message !== void 0 ? {
        errorMap: (issue, ctx) => {
          var _a, _b, _c, _d;
          const defaultError = (_c = (_b = (_a = this._def).errorMap) === null || _b === void 0 ? void 0 : _b.call(_a, issue, ctx).message) !== null && _c !== void 0 ? _c : ctx.defaultError;
          if (issue.code === "unrecognized_keys")
            return {
              message: (_d = errorUtil.errToObj(message).message) !== null && _d !== void 0 ? _d : defaultError
            };
          return {
            message: defaultError
          };
        }
      } : {}
    });
  }
  strip() {
    return new _ZodObject({
      ...this._def,
      unknownKeys: "strip"
    });
  }
  passthrough() {
    return new _ZodObject({
      ...this._def,
      unknownKeys: "passthrough"
    });
  }
  // const AugmentFactory =
  //   <Def extends ZodObjectDef>(def: Def) =>
  //   <Augmentation extends ZodRawShape>(
  //     augmentation: Augmentation
  //   ): ZodObject<
  //     extendShape<ReturnType<Def["shape"]>, Augmentation>,
  //     Def["unknownKeys"],
  //     Def["catchall"]
  //   > => {
  //     return new ZodObject({
  //       ...def,
  //       shape: () => ({
  //         ...def.shape(),
  //         ...augmentation,
  //       }),
  //     }) as any;
  //   };
  extend(augmentation) {
    return new _ZodObject({
      ...this._def,
      shape: () => ({
        ...this._def.shape(),
        ...augmentation
      })
    });
  }
  /**
   * Prior to zod@1.0.12 there was a bug in the
   * inferred type of merged objects. Please
   * upgrade if you are experiencing issues.
   */
  merge(merging) {
    const merged = new _ZodObject({
      unknownKeys: merging._def.unknownKeys,
      catchall: merging._def.catchall,
      shape: () => ({
        ...this._def.shape(),
        ...merging._def.shape()
      }),
      typeName: ZodFirstPartyTypeKind.ZodObject
    });
    return merged;
  }
  // merge<
  //   Incoming extends AnyZodObject,
  //   Augmentation extends Incoming["shape"],
  //   NewOutput extends {
  //     [k in keyof Augmentation | keyof Output]: k extends keyof Augmentation
  //       ? Augmentation[k]["_output"]
  //       : k extends keyof Output
  //       ? Output[k]
  //       : never;
  //   },
  //   NewInput extends {
  //     [k in keyof Augmentation | keyof Input]: k extends keyof Augmentation
  //       ? Augmentation[k]["_input"]
  //       : k extends keyof Input
  //       ? Input[k]
  //       : never;
  //   }
  // >(
  //   merging: Incoming
  // ): ZodObject<
  //   extendShape<T, ReturnType<Incoming["_def"]["shape"]>>,
  //   Incoming["_def"]["unknownKeys"],
  //   Incoming["_def"]["catchall"],
  //   NewOutput,
  //   NewInput
  // > {
  //   const merged: any = new ZodObject({
  //     unknownKeys: merging._def.unknownKeys,
  //     catchall: merging._def.catchall,
  //     shape: () =>
  //       objectUtil.mergeShapes(this._def.shape(), merging._def.shape()),
  //     typeName: ZodFirstPartyTypeKind.ZodObject,
  //   }) as any;
  //   return merged;
  // }
  setKey(key2, schema) {
    return this.augment({ [key2]: schema });
  }
  // merge<Incoming extends AnyZodObject>(
  //   merging: Incoming
  // ): //ZodObject<T & Incoming["_shape"], UnknownKeys, Catchall> = (merging) => {
  // ZodObject<
  //   extendShape<T, ReturnType<Incoming["_def"]["shape"]>>,
  //   Incoming["_def"]["unknownKeys"],
  //   Incoming["_def"]["catchall"]
  // > {
  //   // const mergedShape = objectUtil.mergeShapes(
  //   //   this._def.shape(),
  //   //   merging._def.shape()
  //   // );
  //   const merged: any = new ZodObject({
  //     unknownKeys: merging._def.unknownKeys,
  //     catchall: merging._def.catchall,
  //     shape: () =>
  //       objectUtil.mergeShapes(this._def.shape(), merging._def.shape()),
  //     typeName: ZodFirstPartyTypeKind.ZodObject,
  //   }) as any;
  //   return merged;
  // }
  catchall(index) {
    return new _ZodObject({
      ...this._def,
      catchall: index
    });
  }
  pick(mask) {
    const shape = {};
    util.objectKeys(mask).forEach((key2) => {
      if (mask[key2] && this.shape[key2]) {
        shape[key2] = this.shape[key2];
      }
    });
    return new _ZodObject({
      ...this._def,
      shape: () => shape
    });
  }
  omit(mask) {
    const shape = {};
    util.objectKeys(this.shape).forEach((key2) => {
      if (!mask[key2]) {
        shape[key2] = this.shape[key2];
      }
    });
    return new _ZodObject({
      ...this._def,
      shape: () => shape
    });
  }
  /**
   * @deprecated
   */
  deepPartial() {
    return deepPartialify(this);
  }
  partial(mask) {
    const newShape = {};
    util.objectKeys(this.shape).forEach((key2) => {
      const fieldSchema = this.shape[key2];
      if (mask && !mask[key2]) {
        newShape[key2] = fieldSchema;
      } else {
        newShape[key2] = fieldSchema.optional();
      }
    });
    return new _ZodObject({
      ...this._def,
      shape: () => newShape
    });
  }
  required(mask) {
    const newShape = {};
    util.objectKeys(this.shape).forEach((key2) => {
      if (mask && !mask[key2]) {
        newShape[key2] = this.shape[key2];
      } else {
        const fieldSchema = this.shape[key2];
        let newField = fieldSchema;
        while (newField instanceof ZodOptional) {
          newField = newField._def.innerType;
        }
        newShape[key2] = newField;
      }
    });
    return new _ZodObject({
      ...this._def,
      shape: () => newShape
    });
  }
  keyof() {
    return createZodEnum(util.objectKeys(this.shape));
  }
};
ZodObject.create = (shape, params) => {
  return new ZodObject({
    shape: () => shape,
    unknownKeys: "strip",
    catchall: ZodNever.create(),
    typeName: ZodFirstPartyTypeKind.ZodObject,
    ...processCreateParams(params)
  });
};
ZodObject.strictCreate = (shape, params) => {
  return new ZodObject({
    shape: () => shape,
    unknownKeys: "strict",
    catchall: ZodNever.create(),
    typeName: ZodFirstPartyTypeKind.ZodObject,
    ...processCreateParams(params)
  });
};
ZodObject.lazycreate = (shape, params) => {
  return new ZodObject({
    shape,
    unknownKeys: "strip",
    catchall: ZodNever.create(),
    typeName: ZodFirstPartyTypeKind.ZodObject,
    ...processCreateParams(params)
  });
};
var ZodUnion = class extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const options = this._def.options;
    function handleResults(results) {
      for (const result of results) {
        if (result.result.status === "valid") {
          return result.result;
        }
      }
      for (const result of results) {
        if (result.result.status === "dirty") {
          ctx.common.issues.push(...result.ctx.common.issues);
          return result.result;
        }
      }
      const unionErrors = results.map((result) => new ZodError(result.ctx.common.issues));
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_union,
        unionErrors
      });
      return INVALID;
    }
    if (ctx.common.async) {
      return Promise.all(options.map(async (option) => {
        const childCtx = {
          ...ctx,
          common: {
            ...ctx.common,
            issues: []
          },
          parent: null
        };
        return {
          result: await option._parseAsync({
            data: ctx.data,
            path: ctx.path,
            parent: childCtx
          }),
          ctx: childCtx
        };
      })).then(handleResults);
    } else {
      let dirty = void 0;
      const issues = [];
      for (const option of options) {
        const childCtx = {
          ...ctx,
          common: {
            ...ctx.common,
            issues: []
          },
          parent: null
        };
        const result = option._parseSync({
          data: ctx.data,
          path: ctx.path,
          parent: childCtx
        });
        if (result.status === "valid") {
          return result;
        } else if (result.status === "dirty" && !dirty) {
          dirty = { result, ctx: childCtx };
        }
        if (childCtx.common.issues.length) {
          issues.push(childCtx.common.issues);
        }
      }
      if (dirty) {
        ctx.common.issues.push(...dirty.ctx.common.issues);
        return dirty.result;
      }
      const unionErrors = issues.map((issues2) => new ZodError(issues2));
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_union,
        unionErrors
      });
      return INVALID;
    }
  }
  get options() {
    return this._def.options;
  }
};
ZodUnion.create = (types, params) => {
  return new ZodUnion({
    options: types,
    typeName: ZodFirstPartyTypeKind.ZodUnion,
    ...processCreateParams(params)
  });
};
var getDiscriminator = (type) => {
  if (type instanceof ZodLazy) {
    return getDiscriminator(type.schema);
  } else if (type instanceof ZodEffects) {
    return getDiscriminator(type.innerType());
  } else if (type instanceof ZodLiteral) {
    return [type.value];
  } else if (type instanceof ZodEnum) {
    return type.options;
  } else if (type instanceof ZodNativeEnum) {
    return util.objectValues(type.enum);
  } else if (type instanceof ZodDefault) {
    return getDiscriminator(type._def.innerType);
  } else if (type instanceof ZodUndefined) {
    return [void 0];
  } else if (type instanceof ZodNull) {
    return [null];
  } else if (type instanceof ZodOptional) {
    return [void 0, ...getDiscriminator(type.unwrap())];
  } else if (type instanceof ZodNullable) {
    return [null, ...getDiscriminator(type.unwrap())];
  } else if (type instanceof ZodBranded) {
    return getDiscriminator(type.unwrap());
  } else if (type instanceof ZodReadonly) {
    return getDiscriminator(type.unwrap());
  } else if (type instanceof ZodCatch) {
    return getDiscriminator(type._def.innerType);
  } else {
    return [];
  }
};
var ZodDiscriminatedUnion = class _ZodDiscriminatedUnion extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.object) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.object,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const discriminator = this.discriminator;
    const discriminatorValue = ctx.data[discriminator];
    const option = this.optionsMap.get(discriminatorValue);
    if (!option) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_union_discriminator,
        options: Array.from(this.optionsMap.keys()),
        path: [discriminator]
      });
      return INVALID;
    }
    if (ctx.common.async) {
      return option._parseAsync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      });
    } else {
      return option._parseSync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      });
    }
  }
  get discriminator() {
    return this._def.discriminator;
  }
  get options() {
    return this._def.options;
  }
  get optionsMap() {
    return this._def.optionsMap;
  }
  /**
   * The constructor of the discriminated union schema. Its behaviour is very similar to that of the normal z.union() constructor.
   * However, it only allows a union of objects, all of which need to share a discriminator property. This property must
   * have a different value for each object in the union.
   * @param discriminator the name of the discriminator property
   * @param types an array of object schemas
   * @param params
   */
  static create(discriminator, options, params) {
    const optionsMap = /* @__PURE__ */ new Map();
    for (const type of options) {
      const discriminatorValues = getDiscriminator(type.shape[discriminator]);
      if (!discriminatorValues.length) {
        throw new Error(`A discriminator value for key \`${discriminator}\` could not be extracted from all schema options`);
      }
      for (const value of discriminatorValues) {
        if (optionsMap.has(value)) {
          throw new Error(`Discriminator property ${String(discriminator)} has duplicate value ${String(value)}`);
        }
        optionsMap.set(value, type);
      }
    }
    return new _ZodDiscriminatedUnion({
      typeName: ZodFirstPartyTypeKind.ZodDiscriminatedUnion,
      discriminator,
      options,
      optionsMap,
      ...processCreateParams(params)
    });
  }
};
function mergeValues(a, b) {
  const aType = getParsedType(a);
  const bType = getParsedType(b);
  if (a === b) {
    return { valid: true, data: a };
  } else if (aType === ZodParsedType.object && bType === ZodParsedType.object) {
    const bKeys = util.objectKeys(b);
    const sharedKeys = util.objectKeys(a).filter((key2) => bKeys.indexOf(key2) !== -1);
    const newObj = { ...a, ...b };
    for (const key2 of sharedKeys) {
      const sharedValue = mergeValues(a[key2], b[key2]);
      if (!sharedValue.valid) {
        return { valid: false };
      }
      newObj[key2] = sharedValue.data;
    }
    return { valid: true, data: newObj };
  } else if (aType === ZodParsedType.array && bType === ZodParsedType.array) {
    if (a.length !== b.length) {
      return { valid: false };
    }
    const newArray = [];
    for (let index = 0; index < a.length; index++) {
      const itemA = a[index];
      const itemB = b[index];
      const sharedValue = mergeValues(itemA, itemB);
      if (!sharedValue.valid) {
        return { valid: false };
      }
      newArray.push(sharedValue.data);
    }
    return { valid: true, data: newArray };
  } else if (aType === ZodParsedType.date && bType === ZodParsedType.date && +a === +b) {
    return { valid: true, data: a };
  } else {
    return { valid: false };
  }
}
var ZodIntersection = class extends ZodType {
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    const handleParsed = (parsedLeft, parsedRight) => {
      if (isAborted(parsedLeft) || isAborted(parsedRight)) {
        return INVALID;
      }
      const merged = mergeValues(parsedLeft.value, parsedRight.value);
      if (!merged.valid) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.invalid_intersection_types
        });
        return INVALID;
      }
      if (isDirty(parsedLeft) || isDirty(parsedRight)) {
        status.dirty();
      }
      return { status: status.value, value: merged.data };
    };
    if (ctx.common.async) {
      return Promise.all([
        this._def.left._parseAsync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        }),
        this._def.right._parseAsync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        })
      ]).then(([left, right]) => handleParsed(left, right));
    } else {
      return handleParsed(this._def.left._parseSync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      }), this._def.right._parseSync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      }));
    }
  }
};
ZodIntersection.create = (left, right, params) => {
  return new ZodIntersection({
    left,
    right,
    typeName: ZodFirstPartyTypeKind.ZodIntersection,
    ...processCreateParams(params)
  });
};
var ZodTuple = class _ZodTuple extends ZodType {
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.array) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.array,
        received: ctx.parsedType
      });
      return INVALID;
    }
    if (ctx.data.length < this._def.items.length) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.too_small,
        minimum: this._def.items.length,
        inclusive: true,
        exact: false,
        type: "array"
      });
      return INVALID;
    }
    const rest = this._def.rest;
    if (!rest && ctx.data.length > this._def.items.length) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.too_big,
        maximum: this._def.items.length,
        inclusive: true,
        exact: false,
        type: "array"
      });
      status.dirty();
    }
    const items = [...ctx.data].map((item, itemIndex) => {
      const schema = this._def.items[itemIndex] || this._def.rest;
      if (!schema)
        return null;
      return schema._parse(new ParseInputLazyPath(ctx, item, ctx.path, itemIndex));
    }).filter((x) => !!x);
    if (ctx.common.async) {
      return Promise.all(items).then((results) => {
        return ParseStatus.mergeArray(status, results);
      });
    } else {
      return ParseStatus.mergeArray(status, items);
    }
  }
  get items() {
    return this._def.items;
  }
  rest(rest) {
    return new _ZodTuple({
      ...this._def,
      rest
    });
  }
};
ZodTuple.create = (schemas, params) => {
  if (!Array.isArray(schemas)) {
    throw new Error("You must pass an array of schemas to z.tuple([ ... ])");
  }
  return new ZodTuple({
    items: schemas,
    typeName: ZodFirstPartyTypeKind.ZodTuple,
    rest: null,
    ...processCreateParams(params)
  });
};
var ZodRecord = class _ZodRecord extends ZodType {
  get keySchema() {
    return this._def.keyType;
  }
  get valueSchema() {
    return this._def.valueType;
  }
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.object) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.object,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const pairs = [];
    const keyType = this._def.keyType;
    const valueType = this._def.valueType;
    for (const key2 in ctx.data) {
      pairs.push({
        key: keyType._parse(new ParseInputLazyPath(ctx, key2, ctx.path, key2)),
        value: valueType._parse(new ParseInputLazyPath(ctx, ctx.data[key2], ctx.path, key2)),
        alwaysSet: key2 in ctx.data
      });
    }
    if (ctx.common.async) {
      return ParseStatus.mergeObjectAsync(status, pairs);
    } else {
      return ParseStatus.mergeObjectSync(status, pairs);
    }
  }
  get element() {
    return this._def.valueType;
  }
  static create(first, second, third) {
    if (second instanceof ZodType) {
      return new _ZodRecord({
        keyType: first,
        valueType: second,
        typeName: ZodFirstPartyTypeKind.ZodRecord,
        ...processCreateParams(third)
      });
    }
    return new _ZodRecord({
      keyType: ZodString.create(),
      valueType: first,
      typeName: ZodFirstPartyTypeKind.ZodRecord,
      ...processCreateParams(second)
    });
  }
};
var ZodMap = class extends ZodType {
  get keySchema() {
    return this._def.keyType;
  }
  get valueSchema() {
    return this._def.valueType;
  }
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.map) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.map,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const keyType = this._def.keyType;
    const valueType = this._def.valueType;
    const pairs = [...ctx.data.entries()].map(([key2, value], index) => {
      return {
        key: keyType._parse(new ParseInputLazyPath(ctx, key2, ctx.path, [index, "key"])),
        value: valueType._parse(new ParseInputLazyPath(ctx, value, ctx.path, [index, "value"]))
      };
    });
    if (ctx.common.async) {
      const finalMap = /* @__PURE__ */ new Map();
      return Promise.resolve().then(async () => {
        for (const pair of pairs) {
          const key2 = await pair.key;
          const value = await pair.value;
          if (key2.status === "aborted" || value.status === "aborted") {
            return INVALID;
          }
          if (key2.status === "dirty" || value.status === "dirty") {
            status.dirty();
          }
          finalMap.set(key2.value, value.value);
        }
        return { status: status.value, value: finalMap };
      });
    } else {
      const finalMap = /* @__PURE__ */ new Map();
      for (const pair of pairs) {
        const key2 = pair.key;
        const value = pair.value;
        if (key2.status === "aborted" || value.status === "aborted") {
          return INVALID;
        }
        if (key2.status === "dirty" || value.status === "dirty") {
          status.dirty();
        }
        finalMap.set(key2.value, value.value);
      }
      return { status: status.value, value: finalMap };
    }
  }
};
ZodMap.create = (keyType, valueType, params) => {
  return new ZodMap({
    valueType,
    keyType,
    typeName: ZodFirstPartyTypeKind.ZodMap,
    ...processCreateParams(params)
  });
};
var ZodSet = class _ZodSet extends ZodType {
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.set) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.set,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const def = this._def;
    if (def.minSize !== null) {
      if (ctx.data.size < def.minSize.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_small,
          minimum: def.minSize.value,
          type: "set",
          inclusive: true,
          exact: false,
          message: def.minSize.message
        });
        status.dirty();
      }
    }
    if (def.maxSize !== null) {
      if (ctx.data.size > def.maxSize.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_big,
          maximum: def.maxSize.value,
          type: "set",
          inclusive: true,
          exact: false,
          message: def.maxSize.message
        });
        status.dirty();
      }
    }
    const valueType = this._def.valueType;
    function finalizeSet(elements2) {
      const parsedSet = /* @__PURE__ */ new Set();
      for (const element of elements2) {
        if (element.status === "aborted")
          return INVALID;
        if (element.status === "dirty")
          status.dirty();
        parsedSet.add(element.value);
      }
      return { status: status.value, value: parsedSet };
    }
    const elements = [...ctx.data.values()].map((item, i) => valueType._parse(new ParseInputLazyPath(ctx, item, ctx.path, i)));
    if (ctx.common.async) {
      return Promise.all(elements).then((elements2) => finalizeSet(elements2));
    } else {
      return finalizeSet(elements);
    }
  }
  min(minSize, message) {
    return new _ZodSet({
      ...this._def,
      minSize: { value: minSize, message: errorUtil.toString(message) }
    });
  }
  max(maxSize, message) {
    return new _ZodSet({
      ...this._def,
      maxSize: { value: maxSize, message: errorUtil.toString(message) }
    });
  }
  size(size, message) {
    return this.min(size, message).max(size, message);
  }
  nonempty(message) {
    return this.min(1, message);
  }
};
ZodSet.create = (valueType, params) => {
  return new ZodSet({
    valueType,
    minSize: null,
    maxSize: null,
    typeName: ZodFirstPartyTypeKind.ZodSet,
    ...processCreateParams(params)
  });
};
var ZodFunction = class _ZodFunction extends ZodType {
  constructor() {
    super(...arguments);
    this.validate = this.implement;
  }
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.function) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.function,
        received: ctx.parsedType
      });
      return INVALID;
    }
    function makeArgsIssue(args, error) {
      return makeIssue({
        data: args,
        path: ctx.path,
        errorMaps: [
          ctx.common.contextualErrorMap,
          ctx.schemaErrorMap,
          getErrorMap(),
          errorMap
        ].filter((x) => !!x),
        issueData: {
          code: ZodIssueCode.invalid_arguments,
          argumentsError: error
        }
      });
    }
    function makeReturnsIssue(returns, error) {
      return makeIssue({
        data: returns,
        path: ctx.path,
        errorMaps: [
          ctx.common.contextualErrorMap,
          ctx.schemaErrorMap,
          getErrorMap(),
          errorMap
        ].filter((x) => !!x),
        issueData: {
          code: ZodIssueCode.invalid_return_type,
          returnTypeError: error
        }
      });
    }
    const params = { errorMap: ctx.common.contextualErrorMap };
    const fn = ctx.data;
    if (this._def.returns instanceof ZodPromise) {
      const me = this;
      return OK(async function(...args) {
        const error = new ZodError([]);
        const parsedArgs = await me._def.args.parseAsync(args, params).catch((e) => {
          error.addIssue(makeArgsIssue(args, e));
          throw error;
        });
        const result = await Reflect.apply(fn, this, parsedArgs);
        const parsedReturns = await me._def.returns._def.type.parseAsync(result, params).catch((e) => {
          error.addIssue(makeReturnsIssue(result, e));
          throw error;
        });
        return parsedReturns;
      });
    } else {
      const me = this;
      return OK(function(...args) {
        const parsedArgs = me._def.args.safeParse(args, params);
        if (!parsedArgs.success) {
          throw new ZodError([makeArgsIssue(args, parsedArgs.error)]);
        }
        const result = Reflect.apply(fn, this, parsedArgs.data);
        const parsedReturns = me._def.returns.safeParse(result, params);
        if (!parsedReturns.success) {
          throw new ZodError([makeReturnsIssue(result, parsedReturns.error)]);
        }
        return parsedReturns.data;
      });
    }
  }
  parameters() {
    return this._def.args;
  }
  returnType() {
    return this._def.returns;
  }
  args(...items) {
    return new _ZodFunction({
      ...this._def,
      args: ZodTuple.create(items).rest(ZodUnknown.create())
    });
  }
  returns(returnType) {
    return new _ZodFunction({
      ...this._def,
      returns: returnType
    });
  }
  implement(func) {
    const validatedFunc = this.parse(func);
    return validatedFunc;
  }
  strictImplement(func) {
    const validatedFunc = this.parse(func);
    return validatedFunc;
  }
  static create(args, returns, params) {
    return new _ZodFunction({
      args: args ? args : ZodTuple.create([]).rest(ZodUnknown.create()),
      returns: returns || ZodUnknown.create(),
      typeName: ZodFirstPartyTypeKind.ZodFunction,
      ...processCreateParams(params)
    });
  }
};
var ZodLazy = class extends ZodType {
  get schema() {
    return this._def.getter();
  }
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const lazySchema = this._def.getter();
    return lazySchema._parse({ data: ctx.data, path: ctx.path, parent: ctx });
  }
};
ZodLazy.create = (getter, params) => {
  return new ZodLazy({
    getter,
    typeName: ZodFirstPartyTypeKind.ZodLazy,
    ...processCreateParams(params)
  });
};
var ZodLiteral = class extends ZodType {
  _parse(input) {
    if (input.data !== this._def.value) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        received: ctx.data,
        code: ZodIssueCode.invalid_literal,
        expected: this._def.value
      });
      return INVALID;
    }
    return { status: "valid", value: input.data };
  }
  get value() {
    return this._def.value;
  }
};
ZodLiteral.create = (value, params) => {
  return new ZodLiteral({
    value,
    typeName: ZodFirstPartyTypeKind.ZodLiteral,
    ...processCreateParams(params)
  });
};
function createZodEnum(values, params) {
  return new ZodEnum({
    values,
    typeName: ZodFirstPartyTypeKind.ZodEnum,
    ...processCreateParams(params)
  });
}
var ZodEnum = class _ZodEnum extends ZodType {
  constructor() {
    super(...arguments);
    _ZodEnum_cache.set(this, void 0);
  }
  _parse(input) {
    if (typeof input.data !== "string") {
      const ctx = this._getOrReturnCtx(input);
      const expectedValues = this._def.values;
      addIssueToContext(ctx, {
        expected: util.joinValues(expectedValues),
        received: ctx.parsedType,
        code: ZodIssueCode.invalid_type
      });
      return INVALID;
    }
    if (!__classPrivateFieldGet(this, _ZodEnum_cache, "f")) {
      __classPrivateFieldSet(this, _ZodEnum_cache, new Set(this._def.values), "f");
    }
    if (!__classPrivateFieldGet(this, _ZodEnum_cache, "f").has(input.data)) {
      const ctx = this._getOrReturnCtx(input);
      const expectedValues = this._def.values;
      addIssueToContext(ctx, {
        received: ctx.data,
        code: ZodIssueCode.invalid_enum_value,
        options: expectedValues
      });
      return INVALID;
    }
    return OK(input.data);
  }
  get options() {
    return this._def.values;
  }
  get enum() {
    const enumValues = {};
    for (const val of this._def.values) {
      enumValues[val] = val;
    }
    return enumValues;
  }
  get Values() {
    const enumValues = {};
    for (const val of this._def.values) {
      enumValues[val] = val;
    }
    return enumValues;
  }
  get Enum() {
    const enumValues = {};
    for (const val of this._def.values) {
      enumValues[val] = val;
    }
    return enumValues;
  }
  extract(values, newDef = this._def) {
    return _ZodEnum.create(values, {
      ...this._def,
      ...newDef
    });
  }
  exclude(values, newDef = this._def) {
    return _ZodEnum.create(this.options.filter((opt) => !values.includes(opt)), {
      ...this._def,
      ...newDef
    });
  }
};
_ZodEnum_cache = /* @__PURE__ */ new WeakMap();
ZodEnum.create = createZodEnum;
var ZodNativeEnum = class extends ZodType {
  constructor() {
    super(...arguments);
    _ZodNativeEnum_cache.set(this, void 0);
  }
  _parse(input) {
    const nativeEnumValues = util.getValidEnumValues(this._def.values);
    const ctx = this._getOrReturnCtx(input);
    if (ctx.parsedType !== ZodParsedType.string && ctx.parsedType !== ZodParsedType.number) {
      const expectedValues = util.objectValues(nativeEnumValues);
      addIssueToContext(ctx, {
        expected: util.joinValues(expectedValues),
        received: ctx.parsedType,
        code: ZodIssueCode.invalid_type
      });
      return INVALID;
    }
    if (!__classPrivateFieldGet(this, _ZodNativeEnum_cache, "f")) {
      __classPrivateFieldSet(this, _ZodNativeEnum_cache, new Set(util.getValidEnumValues(this._def.values)), "f");
    }
    if (!__classPrivateFieldGet(this, _ZodNativeEnum_cache, "f").has(input.data)) {
      const expectedValues = util.objectValues(nativeEnumValues);
      addIssueToContext(ctx, {
        received: ctx.data,
        code: ZodIssueCode.invalid_enum_value,
        options: expectedValues
      });
      return INVALID;
    }
    return OK(input.data);
  }
  get enum() {
    return this._def.values;
  }
};
_ZodNativeEnum_cache = /* @__PURE__ */ new WeakMap();
ZodNativeEnum.create = (values, params) => {
  return new ZodNativeEnum({
    values,
    typeName: ZodFirstPartyTypeKind.ZodNativeEnum,
    ...processCreateParams(params)
  });
};
var ZodPromise = class extends ZodType {
  unwrap() {
    return this._def.type;
  }
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.promise && ctx.common.async === false) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.promise,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const promisified = ctx.parsedType === ZodParsedType.promise ? ctx.data : Promise.resolve(ctx.data);
    return OK(promisified.then((data) => {
      return this._def.type.parseAsync(data, {
        path: ctx.path,
        errorMap: ctx.common.contextualErrorMap
      });
    }));
  }
};
ZodPromise.create = (schema, params) => {
  return new ZodPromise({
    type: schema,
    typeName: ZodFirstPartyTypeKind.ZodPromise,
    ...processCreateParams(params)
  });
};
var ZodEffects = class extends ZodType {
  innerType() {
    return this._def.schema;
  }
  sourceType() {
    return this._def.schema._def.typeName === ZodFirstPartyTypeKind.ZodEffects ? this._def.schema.sourceType() : this._def.schema;
  }
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    const effect = this._def.effect || null;
    const checkCtx = {
      addIssue: (arg) => {
        addIssueToContext(ctx, arg);
        if (arg.fatal) {
          status.abort();
        } else {
          status.dirty();
        }
      },
      get path() {
        return ctx.path;
      }
    };
    checkCtx.addIssue = checkCtx.addIssue.bind(checkCtx);
    if (effect.type === "preprocess") {
      const processed = effect.transform(ctx.data, checkCtx);
      if (ctx.common.async) {
        return Promise.resolve(processed).then(async (processed2) => {
          if (status.value === "aborted")
            return INVALID;
          const result = await this._def.schema._parseAsync({
            data: processed2,
            path: ctx.path,
            parent: ctx
          });
          if (result.status === "aborted")
            return INVALID;
          if (result.status === "dirty")
            return DIRTY(result.value);
          if (status.value === "dirty")
            return DIRTY(result.value);
          return result;
        });
      } else {
        if (status.value === "aborted")
          return INVALID;
        const result = this._def.schema._parseSync({
          data: processed,
          path: ctx.path,
          parent: ctx
        });
        if (result.status === "aborted")
          return INVALID;
        if (result.status === "dirty")
          return DIRTY(result.value);
        if (status.value === "dirty")
          return DIRTY(result.value);
        return result;
      }
    }
    if (effect.type === "refinement") {
      const executeRefinement = (acc) => {
        const result = effect.refinement(acc, checkCtx);
        if (ctx.common.async) {
          return Promise.resolve(result);
        }
        if (result instanceof Promise) {
          throw new Error("Async refinement encountered during synchronous parse operation. Use .parseAsync instead.");
        }
        return acc;
      };
      if (ctx.common.async === false) {
        const inner = this._def.schema._parseSync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        });
        if (inner.status === "aborted")
          return INVALID;
        if (inner.status === "dirty")
          status.dirty();
        executeRefinement(inner.value);
        return { status: status.value, value: inner.value };
      } else {
        return this._def.schema._parseAsync({ data: ctx.data, path: ctx.path, parent: ctx }).then((inner) => {
          if (inner.status === "aborted")
            return INVALID;
          if (inner.status === "dirty")
            status.dirty();
          return executeRefinement(inner.value).then(() => {
            return { status: status.value, value: inner.value };
          });
        });
      }
    }
    if (effect.type === "transform") {
      if (ctx.common.async === false) {
        const base = this._def.schema._parseSync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        });
        if (!isValid(base))
          return base;
        const result = effect.transform(base.value, checkCtx);
        if (result instanceof Promise) {
          throw new Error(`Asynchronous transform encountered during synchronous parse operation. Use .parseAsync instead.`);
        }
        return { status: status.value, value: result };
      } else {
        return this._def.schema._parseAsync({ data: ctx.data, path: ctx.path, parent: ctx }).then((base) => {
          if (!isValid(base))
            return base;
          return Promise.resolve(effect.transform(base.value, checkCtx)).then((result) => ({ status: status.value, value: result }));
        });
      }
    }
    util.assertNever(effect);
  }
};
ZodEffects.create = (schema, effect, params) => {
  return new ZodEffects({
    schema,
    typeName: ZodFirstPartyTypeKind.ZodEffects,
    effect,
    ...processCreateParams(params)
  });
};
ZodEffects.createWithPreprocess = (preprocess, schema, params) => {
  return new ZodEffects({
    schema,
    effect: { type: "preprocess", transform: preprocess },
    typeName: ZodFirstPartyTypeKind.ZodEffects,
    ...processCreateParams(params)
  });
};
var ZodOptional = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType === ZodParsedType.undefined) {
      return OK(void 0);
    }
    return this._def.innerType._parse(input);
  }
  unwrap() {
    return this._def.innerType;
  }
};
ZodOptional.create = (type, params) => {
  return new ZodOptional({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodOptional,
    ...processCreateParams(params)
  });
};
var ZodNullable = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType === ZodParsedType.null) {
      return OK(null);
    }
    return this._def.innerType._parse(input);
  }
  unwrap() {
    return this._def.innerType;
  }
};
ZodNullable.create = (type, params) => {
  return new ZodNullable({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodNullable,
    ...processCreateParams(params)
  });
};
var ZodDefault = class extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    let data = ctx.data;
    if (ctx.parsedType === ZodParsedType.undefined) {
      data = this._def.defaultValue();
    }
    return this._def.innerType._parse({
      data,
      path: ctx.path,
      parent: ctx
    });
  }
  removeDefault() {
    return this._def.innerType;
  }
};
ZodDefault.create = (type, params) => {
  return new ZodDefault({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodDefault,
    defaultValue: typeof params.default === "function" ? params.default : () => params.default,
    ...processCreateParams(params)
  });
};
var ZodCatch = class extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const newCtx = {
      ...ctx,
      common: {
        ...ctx.common,
        issues: []
      }
    };
    const result = this._def.innerType._parse({
      data: newCtx.data,
      path: newCtx.path,
      parent: {
        ...newCtx
      }
    });
    if (isAsync(result)) {
      return result.then((result2) => {
        return {
          status: "valid",
          value: result2.status === "valid" ? result2.value : this._def.catchValue({
            get error() {
              return new ZodError(newCtx.common.issues);
            },
            input: newCtx.data
          })
        };
      });
    } else {
      return {
        status: "valid",
        value: result.status === "valid" ? result.value : this._def.catchValue({
          get error() {
            return new ZodError(newCtx.common.issues);
          },
          input: newCtx.data
        })
      };
    }
  }
  removeCatch() {
    return this._def.innerType;
  }
};
ZodCatch.create = (type, params) => {
  return new ZodCatch({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodCatch,
    catchValue: typeof params.catch === "function" ? params.catch : () => params.catch,
    ...processCreateParams(params)
  });
};
var ZodNaN = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.nan) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.nan,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return { status: "valid", value: input.data };
  }
};
ZodNaN.create = (params) => {
  return new ZodNaN({
    typeName: ZodFirstPartyTypeKind.ZodNaN,
    ...processCreateParams(params)
  });
};
var BRAND = Symbol("zod_brand");
var ZodBranded = class extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const data = ctx.data;
    return this._def.type._parse({
      data,
      path: ctx.path,
      parent: ctx
    });
  }
  unwrap() {
    return this._def.type;
  }
};
var ZodPipeline = class _ZodPipeline extends ZodType {
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.common.async) {
      const handleAsync = async () => {
        const inResult = await this._def.in._parseAsync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        });
        if (inResult.status === "aborted")
          return INVALID;
        if (inResult.status === "dirty") {
          status.dirty();
          return DIRTY(inResult.value);
        } else {
          return this._def.out._parseAsync({
            data: inResult.value,
            path: ctx.path,
            parent: ctx
          });
        }
      };
      return handleAsync();
    } else {
      const inResult = this._def.in._parseSync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      });
      if (inResult.status === "aborted")
        return INVALID;
      if (inResult.status === "dirty") {
        status.dirty();
        return {
          status: "dirty",
          value: inResult.value
        };
      } else {
        return this._def.out._parseSync({
          data: inResult.value,
          path: ctx.path,
          parent: ctx
        });
      }
    }
  }
  static create(a, b) {
    return new _ZodPipeline({
      in: a,
      out: b,
      typeName: ZodFirstPartyTypeKind.ZodPipeline
    });
  }
};
var ZodReadonly = class extends ZodType {
  _parse(input) {
    const result = this._def.innerType._parse(input);
    const freeze = (data) => {
      if (isValid(data)) {
        data.value = Object.freeze(data.value);
      }
      return data;
    };
    return isAsync(result) ? result.then((data) => freeze(data)) : freeze(result);
  }
  unwrap() {
    return this._def.innerType;
  }
};
ZodReadonly.create = (type, params) => {
  return new ZodReadonly({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodReadonly,
    ...processCreateParams(params)
  });
};
function cleanParams(params, data) {
  const p = typeof params === "function" ? params(data) : typeof params === "string" ? { message: params } : params;
  const p2 = typeof p === "string" ? { message: p } : p;
  return p2;
}
function custom(check, _params = {}, fatal) {
  if (check)
    return ZodAny.create().superRefine((data, ctx) => {
      var _a, _b;
      const r = check(data);
      if (r instanceof Promise) {
        return r.then((r2) => {
          var _a2, _b2;
          if (!r2) {
            const params = cleanParams(_params, data);
            const _fatal = (_b2 = (_a2 = params.fatal) !== null && _a2 !== void 0 ? _a2 : fatal) !== null && _b2 !== void 0 ? _b2 : true;
            ctx.addIssue({ code: "custom", ...params, fatal: _fatal });
          }
        });
      }
      if (!r) {
        const params = cleanParams(_params, data);
        const _fatal = (_b = (_a = params.fatal) !== null && _a !== void 0 ? _a : fatal) !== null && _b !== void 0 ? _b : true;
        ctx.addIssue({ code: "custom", ...params, fatal: _fatal });
      }
      return;
    });
  return ZodAny.create();
}
var late = {
  object: ZodObject.lazycreate
};
var ZodFirstPartyTypeKind;
(function(ZodFirstPartyTypeKind2) {
  ZodFirstPartyTypeKind2["ZodString"] = "ZodString";
  ZodFirstPartyTypeKind2["ZodNumber"] = "ZodNumber";
  ZodFirstPartyTypeKind2["ZodNaN"] = "ZodNaN";
  ZodFirstPartyTypeKind2["ZodBigInt"] = "ZodBigInt";
  ZodFirstPartyTypeKind2["ZodBoolean"] = "ZodBoolean";
  ZodFirstPartyTypeKind2["ZodDate"] = "ZodDate";
  ZodFirstPartyTypeKind2["ZodSymbol"] = "ZodSymbol";
  ZodFirstPartyTypeKind2["ZodUndefined"] = "ZodUndefined";
  ZodFirstPartyTypeKind2["ZodNull"] = "ZodNull";
  ZodFirstPartyTypeKind2["ZodAny"] = "ZodAny";
  ZodFirstPartyTypeKind2["ZodUnknown"] = "ZodUnknown";
  ZodFirstPartyTypeKind2["ZodNever"] = "ZodNever";
  ZodFirstPartyTypeKind2["ZodVoid"] = "ZodVoid";
  ZodFirstPartyTypeKind2["ZodArray"] = "ZodArray";
  ZodFirstPartyTypeKind2["ZodObject"] = "ZodObject";
  ZodFirstPartyTypeKind2["ZodUnion"] = "ZodUnion";
  ZodFirstPartyTypeKind2["ZodDiscriminatedUnion"] = "ZodDiscriminatedUnion";
  ZodFirstPartyTypeKind2["ZodIntersection"] = "ZodIntersection";
  ZodFirstPartyTypeKind2["ZodTuple"] = "ZodTuple";
  ZodFirstPartyTypeKind2["ZodRecord"] = "ZodRecord";
  ZodFirstPartyTypeKind2["ZodMap"] = "ZodMap";
  ZodFirstPartyTypeKind2["ZodSet"] = "ZodSet";
  ZodFirstPartyTypeKind2["ZodFunction"] = "ZodFunction";
  ZodFirstPartyTypeKind2["ZodLazy"] = "ZodLazy";
  ZodFirstPartyTypeKind2["ZodLiteral"] = "ZodLiteral";
  ZodFirstPartyTypeKind2["ZodEnum"] = "ZodEnum";
  ZodFirstPartyTypeKind2["ZodEffects"] = "ZodEffects";
  ZodFirstPartyTypeKind2["ZodNativeEnum"] = "ZodNativeEnum";
  ZodFirstPartyTypeKind2["ZodOptional"] = "ZodOptional";
  ZodFirstPartyTypeKind2["ZodNullable"] = "ZodNullable";
  ZodFirstPartyTypeKind2["ZodDefault"] = "ZodDefault";
  ZodFirstPartyTypeKind2["ZodCatch"] = "ZodCatch";
  ZodFirstPartyTypeKind2["ZodPromise"] = "ZodPromise";
  ZodFirstPartyTypeKind2["ZodBranded"] = "ZodBranded";
  ZodFirstPartyTypeKind2["ZodPipeline"] = "ZodPipeline";
  ZodFirstPartyTypeKind2["ZodReadonly"] = "ZodReadonly";
})(ZodFirstPartyTypeKind || (ZodFirstPartyTypeKind = {}));
var instanceOfType = (cls, params = {
  message: `Input not instance of ${cls.name}`
}) => custom((data) => data instanceof cls, params);
var stringType = ZodString.create;
var numberType = ZodNumber.create;
var nanType = ZodNaN.create;
var bigIntType = ZodBigInt.create;
var booleanType = ZodBoolean.create;
var dateType = ZodDate.create;
var symbolType = ZodSymbol.create;
var undefinedType = ZodUndefined.create;
var nullType = ZodNull.create;
var anyType = ZodAny.create;
var unknownType = ZodUnknown.create;
var neverType = ZodNever.create;
var voidType = ZodVoid.create;
var arrayType = ZodArray.create;
var objectType = ZodObject.create;
var strictObjectType = ZodObject.strictCreate;
var unionType = ZodUnion.create;
var discriminatedUnionType = ZodDiscriminatedUnion.create;
var intersectionType = ZodIntersection.create;
var tupleType = ZodTuple.create;
var recordType = ZodRecord.create;
var mapType = ZodMap.create;
var setType = ZodSet.create;
var functionType = ZodFunction.create;
var lazyType = ZodLazy.create;
var literalType = ZodLiteral.create;
var enumType = ZodEnum.create;
var nativeEnumType = ZodNativeEnum.create;
var promiseType = ZodPromise.create;
var effectsType = ZodEffects.create;
var optionalType = ZodOptional.create;
var nullableType = ZodNullable.create;
var preprocessType = ZodEffects.createWithPreprocess;
var pipelineType = ZodPipeline.create;
var ostring = () => stringType().optional();
var onumber = () => numberType().optional();
var oboolean = () => booleanType().optional();
var coerce = {
  string: ((arg) => ZodString.create({ ...arg, coerce: true })),
  number: ((arg) => ZodNumber.create({ ...arg, coerce: true })),
  boolean: ((arg) => ZodBoolean.create({
    ...arg,
    coerce: true
  })),
  bigint: ((arg) => ZodBigInt.create({ ...arg, coerce: true })),
  date: ((arg) => ZodDate.create({ ...arg, coerce: true }))
};
var NEVER = INVALID;
var z = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  defaultErrorMap: errorMap,
  setErrorMap,
  getErrorMap,
  makeIssue,
  EMPTY_PATH,
  addIssueToContext,
  ParseStatus,
  INVALID,
  DIRTY,
  OK,
  isAborted,
  isDirty,
  isValid,
  isAsync,
  get util() {
    return util;
  },
  get objectUtil() {
    return objectUtil;
  },
  ZodParsedType,
  getParsedType,
  ZodType,
  datetimeRegex,
  ZodString,
  ZodNumber,
  ZodBigInt,
  ZodBoolean,
  ZodDate,
  ZodSymbol,
  ZodUndefined,
  ZodNull,
  ZodAny,
  ZodUnknown,
  ZodNever,
  ZodVoid,
  ZodArray,
  ZodObject,
  ZodUnion,
  ZodDiscriminatedUnion,
  ZodIntersection,
  ZodTuple,
  ZodRecord,
  ZodMap,
  ZodSet,
  ZodFunction,
  ZodLazy,
  ZodLiteral,
  ZodEnum,
  ZodNativeEnum,
  ZodPromise,
  ZodEffects,
  ZodTransformer: ZodEffects,
  ZodOptional,
  ZodNullable,
  ZodDefault,
  ZodCatch,
  ZodNaN,
  BRAND,
  ZodBranded,
  ZodPipeline,
  ZodReadonly,
  custom,
  Schema: ZodType,
  ZodSchema: ZodType,
  late,
  get ZodFirstPartyTypeKind() {
    return ZodFirstPartyTypeKind;
  },
  coerce,
  any: anyType,
  array: arrayType,
  bigint: bigIntType,
  boolean: booleanType,
  date: dateType,
  discriminatedUnion: discriminatedUnionType,
  effect: effectsType,
  "enum": enumType,
  "function": functionType,
  "instanceof": instanceOfType,
  intersection: intersectionType,
  lazy: lazyType,
  literal: literalType,
  map: mapType,
  nan: nanType,
  nativeEnum: nativeEnumType,
  never: neverType,
  "null": nullType,
  nullable: nullableType,
  number: numberType,
  object: objectType,
  oboolean,
  onumber,
  optional: optionalType,
  ostring,
  pipeline: pipelineType,
  preprocess: preprocessType,
  promise: promiseType,
  record: recordType,
  set: setType,
  strictObject: strictObjectType,
  string: stringType,
  symbol: symbolType,
  transformer: effectsType,
  tuple: tupleType,
  "undefined": undefinedType,
  union: unionType,
  unknown: unknownType,
  "void": voidType,
  NEVER,
  ZodIssueCode,
  quotelessJson,
  ZodError
});

// src/data/expansionItems.ts
var add = (key2, value = 1) => ({
  key: key2,
  value,
  op: "add"
});
var mul = (key2, value) => ({
  key: key2,
  value,
  op: "multiply"
});
var concepts = [
  [
    "\uC774\uC911\uB098\uC120 \uBAA8\uADFC",
    "\uC5C7\uAC08\uB9AC\uB294 \uB450 \uB098\uC120\uD0C4 \xB7 \uAC01 \uD0C4\uD658 \uD53C\uD574 60%",
    "rare",
    add("helix")
  ],
  [
    "\uD30C\uB3C4 \uBE57\uC0B4",
    "\uD0C4\uD658\uC774 \uBB3C\uACB0 \uADA4\uB3C4\uB85C \uBE44\uD589 \xB7 \uAD00\uD1B5 +1",
    "uncommon",
    add("waveShot"),
    add("pierce")
  ],
  [
    "\uBC88\uAC1C \uC9C0\uD37C",
    "\uD0C4\uD658\uC774 \uC88C\uC6B0\uB85C \uAEBE\uC774\uBA70 \uBE44\uD589 \xB7 \uAC10\uC804 \uD655\uB960 +15%",
    "rare",
    add("zigzag"),
    add("lightning", 0.15)
  ],
  [
    "\uC9C4\uACF5 \uAC00\uC18D\uAD00",
    "\uB0A0\uC544\uAC08\uC218\uB85D \uD0C4\uC18D \uC99D\uAC00 \xB7 \uCD08\uAE30 \uD0C4\uC18D -30%",
    "uncommon",
    add("accelerator"),
    mul("bulletSpeed", 0.7)
  ],
  [
    "\uAE09\uC815\uAC70 \uD074\uB7EC\uCE58",
    "\uD0C4\uD658\uC774 \uAC10\uC18D\uD558\uBA70 \uC624\uB798 \uBA38\uBB3E \xB7 \uD06C\uAE30 +35%",
    "uncommon",
    add("brakeShot"),
    mul("size", 1.35)
  ],
  [
    "\uD718\uC5B4\uC9C4 \uCD1D\uC5F4",
    "\uD0C4\uD658\uC774 \uD55C\uCABD\uC73C\uB85C \uD718\uC5B4\uC9D0 \xB7 \uBCBD \uBC18\uC0AC +2",
    "uncommon",
    add("swerve"),
    add("bounce", 2)
  ],
  [
    "\uD68C\uC804\uC2DD \uAC00\uB974\uB9C8",
    "\uBC1C\uC0AC\uD560 \uB54C\uB9C8\uB2E4 \uCD1D\uAD6C \uAC01\uB3C4 \uD68C\uC804 \xB7 \uD53C\uD574 +20%",
    "rare",
    add("spiralShot"),
    mul("damage", 1.2)
  ],
  [
    "\uC5EC\uC12F \uC78E \uD0C4\uCC3D",
    "\uC8FC\uBCC0 \uC5EC\uC12F \uBC29\uD5A5\uC73C\uB85C \uBC1C\uC0AC \xB7 \uAC01 \uD0C4\uD658 \uD53C\uD574 30%",
    "rare",
    add("petalShot")
  ],
  [
    "\uC0AC\uAC70\uB9AC \uC2ED\uC790\uD0A4",
    "\uC804\uD6C4\uC88C\uC6B0 \uC2ED\uC790 \uBC1C\uC0AC \xB7 \uAC01 \uD0C4\uD658 \uD53C\uD574 45%",
    "rare",
    add("crossShot")
  ],
  [
    "\uD3C9\uD589\uC120 \uBE57",
    "\uC138 \uC904 \uD3C9\uD589 \uBC1C\uC0AC \xB7 \uAC01 \uD0C4\uD658 \uD53C\uD574 44%",
    "rare",
    add("parallelShot")
  ],
  [
    "\uC88C\uC6B0 \uB3C4\uB9AC\uB3C4\uB9AC",
    "\uC5F0\uC18D \uACF5\uACA9\uC758 \uC870\uC900\uAC01\uC774 \uBD80\uCC44\uCC98\uB7FC \uC655\uBCF5 \xB7 \uD53C\uD574 +15%",
    "uncommon",
    add("sweepShot"),
    mul("damage", 1.15)
  ],
  [
    "\uC0B0\uD0C4 \uC18C\uAE08\uD1B5",
    "\uB2E4\uC12F \uAC08\uB798 \uC0B0\uD0C4 \xB7 \uAC01 \uD0C4\uD658 \uD53C\uD574 28% \xB7 \uC0AC\uAC70\uB9AC -20%",
    "rare",
    add("scatterShot"),
    mul("range", 0.8)
  ],
  [
    "\uC218\uB834 \uC9D1\uAC8C",
    "\uC591\uC606 \uCD1D\uAD6C\uC5D0\uC11C \uC870\uC900\uC120\uC73C\uB85C \uAD50\uCC28 \uBC1C\uC0AC \xB7 \uAC01 \uD53C\uD574 65%",
    "rare",
    add("convergeShot")
  ],
  [
    "\uAC08\uC9C0\uC790 \uBD84\uBC30\uAE30",
    "\uACF5\uACA9\uB9C8\uB2E4 \uC88C\uC6B0 \uCD1D\uAD6C \uAD50\uB300 \xB7 \uACF5\uACA9 \uC18D\uB3C4 +12%",
    "uncommon",
    add("alternatingShot"),
    mul("rate", 1.12)
  ],
  [
    "\uD0C4\uD658 \uAE30\uAD00\uCC28",
    "\uD55C \uC904\uB85C \uC2DC\uAC04\uCC28 3\uC5F0\uBC1C \xB7 \uAC01 \uD53C\uD574 45%",
    "rare",
    add("trainShot")
  ],
  [
    "\uC608\uC57D \uBC1C\uC0AC \uC2DC\uACC4",
    "\uBC1C\uC0AC \uD6C4 \uC7A0\uC2DC \uBA48\uCDC4\uB2E4\uAC00 \uCD9C\uBC1C \xB7 \uD53C\uD574 +30%",
    "uncommon",
    add("delayedShot"),
    mul("damage", 1.3)
  ],
  [
    "\uC2EC\uC7A5 \uC555\uCD95\uAE30",
    "\uD0C4\uD658 \uD06C\uAE30\uAC00 \uB9E5\uB3D9 \xB7 \uAD00\uD1B5 +1",
    "uncommon",
    add("pulseSize"),
    add("pierce")
  ],
  [
    "\uC6A9\uC218\uCCA0 \uC870\uC900\uAE30",
    "\uBB3C\uACB0\uD0C4\uC774 \uC801\uC744 \uC720\uB3C4 \uCD94\uC801 \xB7 \uC720\uB3C4 +15%",
    "rare",
    add("waveShot"),
    add("homing", 0.15)
  ],
  [
    "\uB098\uC120\uD615 \uC1A1\uACF3",
    "\uB450 \uB098\uC120 \uAD00\uD1B5\uD0C4 \xB7 \uAD00\uD1B5 +2 \xB7 \uBC1C\uC0AC \uC18D\uB3C4 -15%",
    "rare",
    add("helix"),
    add("pierce", 2),
    mul("rate", 0.85)
  ],
  [
    "\uB09C\uBC18\uC0AC \uD504\uB9AC\uC998",
    "\uAD74\uC808 \uC0B0\uD0C4 \xB7 \uBC18\uC0AC +2 \xB7 \uD53C\uD574 -15%",
    "anomaly",
    add("scatterShot"),
    add("bounce", 2),
    mul("damage", 0.85)
  ],
  [
    "\uACE0\uC7A5 \uB09C \uC2E0\uD638\uB4F1",
    "\uAC10\uC18D\uD0C4\uC774 \uC801\uC744 \uB454\uD654 \xB7 \uB454\uD654 +35%",
    "uncommon",
    add("brakeShot"),
    add("slow", 0.35)
  ],
  [
    "\uB808\uC774\uC800 \uC7AC\uBD09\uD2C0",
    "\uD3C9\uD589 \uAD11\uC120 \uC138 \uC904 \xB7 \uBC1C\uC0AC \uC18D\uB3C4 -30%",
    "exotic",
    add("parallelShot"),
    add("beam"),
    mul("rate", 0.7)
  ],
  [
    "\uAD11\uD559 \uD48D\uCC28",
    "\uACF5\uACA9\uB9C8\uB2E4 \uD68C\uC804\uD558\uB294 \uAD00\uD1B5 \uAD11\uC120 \xB7 \uBC1C\uC0AC \uC18D\uB3C4 -25%",
    "rare",
    add("spiralShot"),
    add("beam"),
    mul("rate", 0.75)
  ],
  [
    "\uC2ED\uC790 \uC808\uAC1C\uAE30",
    "\uC804\uD6C4\uC88C\uC6B0 \uADFC\uC811 \uBCA0\uAE30 \xB7 \uACF5\uACA9 \uC18D\uB3C4 -15%",
    "rare",
    add("crossShot"),
    add("meleeShot"),
    mul("rate", 0.85)
  ],
  [
    "\uB3D9\uC2EC\uC6D0 \uBC1C\uC9C4\uAE30",
    "\uC2DC\uAC04\uCC28 \uACE0\uB9AC 3\uC5F0\uBC1C \xB7 \uAC01 \uACE0\uB9AC \uD53C\uD574 45%",
    "exotic",
    add("trainShot"),
    add("ringShot")
  ],
  [
    "\uC6B0\uC0B0 \uBC15\uACA9\uD3EC",
    "\uC5EC\uC12F \uBC29\uD5A5 \uACE1\uC0AC \uACF5\uACA9 \xB7 \uC0AC\uAC70\uB9AC +20%",
    "exotic",
    add("petalShot"),
    add("lobShot"),
    mul("range", 1.2)
  ],
  [
    "\uC591\uB0A0 \uBA74\uB3C4 \uC2E4",
    "\uAD50\uCC28 \uBC1C\uC0AC\uD558\uB294 \uADC0\uD658 \uCE7C\uB0A0 \xB7 \uAD00\uD1B5 +1",
    "rare",
    add("convergeShot"),
    add("boomerang"),
    add("pierce")
  ],
  [
    "\uB0C9\uB3D9 \uBC1C\uC0AC\uD568",
    "\uACF5\uACA9\uC744 \uC800\uC7A5\uD588\uB2E4 \uB193\uC73C\uBA74 \uCD9C\uBC1C \xB7 \uBE59\uACB0 \uB204\uC801 +1",
    "rare",
    add("stasis"),
    add("freezeStacks")
  ],
  [
    "\uC6D0\uACA9 \uAF43\uBC2D",
    "\uC5EC\uC12F \uBC29\uD5A5\uC5D0 \uC6D0\uACA9 \uACF5\uACA9 \uD575 \uBC30\uCE58 \xB7 \uBC1C\uC0AC \uC18D\uB3C4 -25%",
    "exotic",
    add("petalShot"),
    add("remoteOrb"),
    mul("rate", 0.75)
  ],
  [
    "\uCD95\uC804 \uAD6C\uC2AC\uCE58\uAE30",
    "\uCDA9\uC804\uD55C \uACE0\uB9AC\uB97C \uBC1C\uC0AC \xB7 \uBC18\uC0AC +1",
    "rare",
    add("charged"),
    add("ringShot"),
    add("bounce")
  ],
  [
    "\uBE57\uBC29\uC6B8 \uD0C4\uB450",
    "\uACE1\uC0AC \uCC29\uD0C4\uC5D0 \uD654\uC0C1 +25% \xB7 \uD3ED\uBC1C +20%",
    "rare",
    add("lobShot"),
    add("burn", 0.25),
    add("explosion", 0.2)
  ],
  [
    "\uC811\uCC29 \uBD88\uAF43\uB180\uC774",
    "\uC0B0\uD0C4\uC5D0 \uD3ED\uC57D \uBD80\uCC29 \xB7 \uBD80\uCC29 \uC704\uB825 +35%",
    "rare",
    add("scatterShot"),
    add("adhesive", 0.35)
  ],
  [
    "\uC774\uB3D9\uC2DD \uC804\uBD07\uB300",
    "\uAC10\uC18D \uD0C4\uD658 \uC0AC\uC774 \uC804\uAE30\uB9DD \xB7 \uBC1C\uC0AC \uC18D\uB3C4 -15%",
    "rare",
    add("brakeShot"),
    add("conduit"),
    mul("rate", 0.85)
  ],
  [
    "\uAD11\uC120 \uB09A\uC2EF\uB300",
    "\uC6D0\uACA9 \uD575\uC774 \uAD11\uC120 \uBC1C\uC0AC \xB7 \uBC1C\uC0AC \uC18D\uB3C4 -30%",
    "exotic",
    add("remoteOrb"),
    add("beam"),
    mul("rate", 0.7)
  ],
  [
    "\uD1B5\uC870\uB9BC \uD0DC\uC591",
    "\uC800\uC7A5\uD55C \uD3ED\uD0C4\uC744 \uC77C\uC81C \uBC1C\uC0AC \xB7 \uD53C\uD574 -15%",
    "anomaly",
    add("stasis"),
    add("bombShot"),
    mul("damage", 0.85)
  ],
  [
    "\uC9C0\uC5F0 \uB1CC\uAD00",
    "\uC2DC\uAC04\uCC28 \uD3ED\uD0C4 3\uC5F0\uBC1C \xB7 \uAC01 \uD53C\uD574 45%",
    "rare",
    add("trainShot"),
    add("bombShot")
  ],
  [
    "\uAE30\uC5B5\uD558\uB294 \uBD80\uBA54\uB791",
    "\uADC0\uD658 \uCE7C\uB0A0\uC774 \uC801\uC744 \uC7AC\uCD94\uC801 \xB7 \uC720\uB3C4 +10%",
    "rare",
    add("boomerang"),
    add("retarget"),
    add("homing", 0.1)
  ],
  [
    "\uB098\uBE44 \uB0A0\uAC1C \uCE7C\uB0A0",
    "\uC88C\uC6B0 \uAD50\uB300 \uADFC\uC811 \uBCA0\uAE30\uC640 \uACE0\uB9AC \xB7 \uD53C\uD574 -15%",
    "exotic",
    add("alternatingShot"),
    add("meleeShot"),
    add("ringShot"),
    mul("damage", 0.85)
  ],
  [
    "\uBB34\uD55C \uBCF5\uC0AC \uC6A9\uC9C0",
    "\uACF5\uACA9 1\uD68C \uCD94\uAC00 \uBC18\uBCF5 \xB7 \uAC01 \uACF5\uACA9 \uD53C\uD574 -25%",
    "anomaly",
    add("repeatShots"),
    mul("damage", 0.75)
  ],
  [
    "\uB450\uD53C \uC704\uC131 \uC548\uD14C\uB098",
    "\uC606\uC73C\uB85C \uBC1C\uC0AC \xB7 \uACF5\uC804 \uB3D9\uB8CC +1 \xB7 \uB3D9\uB8CC \uD53C\uD574 +20%",
    "rare",
    add("side", 0.35),
    add("orbitCount"),
    add("orbitDamage", 0.2)
  ],
  [
    "\uC131\uB0E5\uAC11 \uC5D4\uC9C4",
    "\uAC00\uC18D \uD654\uC5FC\uD0C4 \xB7 \uD654\uC0C1 +25%",
    "uncommon",
    add("accelerator"),
    add("burn", 0.25)
  ],
  [
    "\uC5BC\uC74C \uD1B1\uB2C8",
    "\uC9C0\uADF8\uC7AC\uADF8 \uBE59\uACB0\uD0C4 \xB7 \uBE59\uACB0 \uB204\uC801 +1",
    "rare",
    add("zigzag"),
    add("freezeStacks")
  ],
  [
    "\uC804\uAE30 \uBC40\uC7A5\uC5B4",
    "\uAD7D\uB294 \uD0C4\uD658 \uBA85\uC911 \uC2DC \uC804\uAE30 \uC5F0\uACB0 +30%",
    "rare",
    add("swerve"),
    add("tether", 0.3)
  ],
  [
    "\uB3C5 \uBB3B\uC740 \uC7A5\uBBF8",
    "\uC5EC\uC12F \uBC29\uD5A5 \uB454\uD654\uD0C4 \xB7 \uB454\uD654 +25% \xB7 \uC7A5\uD310 +15%",
    "rare",
    add("petalShot"),
    add("slow", 0.25),
    add("zone", 0.15)
  ],
  [
    "\uC751\uACE0 \uBC29\uC9C0 \uBC14\uB298",
    "\uAD00\uD1B5 +2 \xB7 \uCD9C\uD608 +20% \xB7 \uD06C\uAE30 -20%",
    "uncommon",
    add("pierce", 2),
    add("bleed", 0.2),
    mul("size", 0.8)
  ],
  [
    "\uB728\uAC70\uC6B4 \uC5BC\uC74C",
    "\uD654\uC0C1 +20% \xB7 \uBE59\uACB0 \uB204\uC801 +1 \xB7 \uC0C1\uD0DC \uC9C0\uC18D -20%",
    "anomaly",
    add("burn", 0.2),
    add("freezeStacks"),
    mul("duration", 0.8)
  ],
  [
    "\uC7AC\uCC44\uAE30 \uD544\uD130",
    "\uC0B0\uD0C4 \uBD84\uC5F4 \uD655\uB960 +25% \xB7 \uD30C\uD3B8 \uC218 +1",
    "rare",
    add("scatterShot"),
    add("split", 0.25),
    add("splitCount")
  ],
  [
    "\uC804\uB3C4\uC131 \uBA38\uB9AC\uB760",
    "\uD3C9\uD589 \uD0C4\uD658 \uBA85\uC911 \uC2DC \uAC10\uC804 +20%",
    "rare",
    add("parallelShot"),
    add("lightning", 0.2)
  ],
  [
    "\uC18C\uAE08 \uC5BC\uC74C \uC2DC\uACC4",
    "\uC9C0\uC5F0 \uCD9C\uBC1C \uBE59\uACB0\uD0C4 \xB7 \uC0C1\uD0DC \uC9C0\uC18D +40%",
    "rare",
    add("delayedShot"),
    add("freezeStacks"),
    mul("duration", 1.4)
  ],
  [
    "\uC2EC\uBC15 \uD3ED\uC57D",
    "\uB9E5\uB3D9 \uD0C4\uD658 \uD3ED\uBC1C +25% \xB7 \uD3ED\uBC1C \uBC94\uC704 +15%",
    "rare",
    add("pulseSize"),
    add("explosion", 0.25),
    mul("explosionRadius", 1.15)
  ],
  [
    "\uD540\uBCFC \uAD6C\uB450",
    "\uBCBD \uBC18\uC0AC +3 \xB7 \uBC18\uC0AC\uD560 \uB54C \uD53C\uD574 \uAC10\uC18C \uC644\uD654",
    "rare",
    add("bounce", 3),
    add("bounceFalloff", 0.1)
  ],
  [
    "\uCD9C\uAD6C \uC5C6\uB294 \uD45C\uC9C0\uD310",
    "\uD654\uBA74 \uACBD\uACC4 \uC774\uB3D9 +1 \xB7 \uD0C4\uD658 \uAC10\uC18D",
    "rare",
    add("wrap"),
    add("brakeShot")
  ],
  [
    "\uBD84\uC5F4 \uB3C4\uC7A5",
    "\uBD84\uC5F4 \uD655\uB960 +45% \xB7 \uD30C\uD3B8 \uD53C\uD574 +10%",
    "rare",
    add("split", 0.45),
    add("splitDamage", 0.1)
  ],
  [
    "\uD68C\uC218\uC6A9 \uAC08\uACE0\uB9AC",
    "\uADC0\uD658\uD0C4 \xB7 \uD68C\uC218 \uC2DC \uD30C\uD3B8 \uD3ED\uBC1C",
    "rare",
    add("boomerang"),
    add("returnNova")
  ],
  [
    "\uAFC0\uBC8C \uD56D\uBC95\uAE30",
    "\uC720\uB3C4 +18% \xB7 \uD0C4\uD658 \uAC00\uC18D",
    "rare",
    add("homing", 0.18),
    add("accelerator")
  ],
  [
    "\uB2EB\uD78C \uACE0\uC18D\uB3C4\uB85C",
    "\uD3C9\uD589 \uAD00\uD1B5\uD0C4 \xB7 \uAD00\uD1B5 +2 \xB7 \uD0C4\uC18D -15%",
    "rare",
    add("parallelShot"),
    add("pierce", 2),
    mul("bulletSpeed", 0.85)
  ],
  [
    "\uD6A1\uB2E8\uBCF4\uB3C4 \uBC1C\uC0AC\uB300",
    "\uC2ED\uC790\uD0C4\uC5D0 \uC804\uAE30 \uC5F0\uACB0 +25%",
    "rare",
    add("crossShot"),
    add("tether", 0.25)
  ],
  [
    "\uC790\uC11D \uB2EC\uB9B0 \uB208\uAC00\uB9AC\uAC1C",
    "\uC720\uB3C4 +35% \xB7 \uC870\uC900\uAC01\uC774 \uD68C\uC804 \xB7 \uC0AC\uAC70\uB9AC -15%",
    "anomaly",
    add("homing", 0.35),
    add("spiralShot"),
    mul("range", 0.85)
  ],
  [
    "\uD1B1\uB0A0 \uBBFC\uB4E4\uB808",
    "\uC5EC\uC12F \uBC29\uD5A5 \uADC0\uD658\uD0C4 \xB7 \uAC01 \uD53C\uD574 30%",
    "rare",
    add("petalShot"),
    add("boomerang")
  ],
  [
    "\uC885\uCC29\uC5ED \uC5C6\uB294 \uC5F4\uCC28",
    "\uC2DC\uAC04\uCC28 3\uC5F0\uBC1C \xB7 \uAD00\uD1B5 +2 \xB7 \uBC1C\uC0AC \uC18D\uB3C4 -20%",
    "rare",
    add("trainShot"),
    add("pierce", 2),
    mul("rate", 0.8)
  ],
  [
    "\uD638\uC2E0\uC6A9 \uC120\uD48D\uAE30",
    "\uBD80\uCC44\uAF34 \uC870\uC900 \uC655\uBCF5 \xB7 \uACF5\uACA9\uC73C\uB85C \uC801\uD0C4 \uC81C\uAC70 \xB7 \uD53C\uD574 -20%",
    "rare",
    add("sweepShot"),
    add("shieldShot"),
    mul("damage", 0.8)
  ],
  [
    "\uACFC\uC789\uBCF4\uD638 \uC720\uB9AC\uBCD1",
    "\uAC10\uC18D \uACE0\uB9AC \xB7 \uACF5\uACA9\uC73C\uB85C \uC801\uD0C4 \uC81C\uAC70 \xB7 \uD53C\uD574 -25%",
    "anomaly",
    add("ringShot"),
    add("brakeShot"),
    add("shieldShot"),
    mul("damage", 0.75)
  ],
  [
    "\uADA4\uB3C4 \uACBD\uBE44\uACAC",
    "\uACF5\uC804 \uB3D9\uB8CC +2 \xB7 \uB3D9\uB8CC\uC758 \uC801\uD0C4 \uBC29\uC5B4 +1",
    "rare",
    add("orbitCount", 2),
    add("blockOrbit")
  ],
  [
    "\uD734\uB300\uC6A9 \uB300\uD53C\uC18C",
    "\uC800\uC7A5 \uBC1C\uC0AC \xB7 \uC815\uC9C0 \uC800\uD56D +15%",
    "uncommon",
    add("stasis"),
    add("standResist", 0.15)
  ],
  [
    "\uB3CC\uC544\uC624\uB294 \uBC29\uD328",
    "\uADC0\uD658 \uACF5\uACA9\uC774 \uC801\uD0C4 \uC81C\uAC70 \xB7 \uD53C\uD574 -25%",
    "rare",
    add("boomerang"),
    add("shieldShot"),
    mul("damage", 0.75)
  ],
  [
    "\uBE44\uC0C1 \uD0C8\uCD9C \uB098\uC0AC",
    "\uC774\uB3D9 \uD68C\uD53C +8% \xB7 \uD6C4\uD1F4 \uC911 \uACF5\uC804\uD0C4 \uC0DD\uC131",
    "rare",
    add("movingDodge", 0.08),
    add("retreatOrbit")
  ],
  [
    "\uAC00\uC2DC \uB3CB\uCE5C \uBCF4\uD638\uB300",
    "\uADFC\uC811 \uBCA0\uAE30 \xB7 \uCD9C\uD608 +25% \xB7 \uD53C\uD574 \uC800\uD56D +8%",
    "rare",
    add("meleeShot"),
    add("bleed", 0.25),
    add("resist", 0.08)
  ],
  [
    "\uBA38\uB9AC \uC704 \uC791\uC740 \uB2EC",
    "\uACF5\uC804 \uB3D9\uB8CC +1 \xB7 \uACF5\uC804 \uAC00\uC18D \xB7 \uB9E5\uB3D9\uD0C4",
    "rare",
    add("orbitCount"),
    add("orbitAccelerate"),
    add("pulseSize")
  ],
  [
    "\uCCA0\uBCBD \uC7AC\uBD09\uC120",
    "\uD3C9\uD589 \uD0C4\uD658 \xB7 \uC801\uD0C4 \uC81C\uAC70 \xB7 \uBC1C\uC0AC \uC18D\uB3C4 -20%",
    "rare",
    add("parallelShot"),
    add("shieldShot"),
    mul("rate", 0.8)
  ],
  [
    "\uC808\uBC15\uD55C \uC790\uB3D9\uC2EC\uC7A5",
    "\uCD5C\uB300 \uCCB4\uB825 -1 \xB7 \uC790\uB3D9 \uCDA9\uC804 \uACF5\uACA9",
    "anomaly",
    add("maxHp", -1),
    add("charged"),
    add("autoCharge")
  ],
  [
    "\uBA54\uC544\uB9AC \uB179\uC74C\uAE30",
    "35% \uC704\uB825\uC73C\uB85C \uACF5\uACA9 \uBA54\uC544\uB9AC \xB7 \uC9C0\uC5F0 \uCD9C\uBC1C",
    "rare",
    add("echo", 0.35),
    add("delayedShot")
  ],
  [
    "\uC138 \uBC15\uC790 \uBA54\uD2B8\uB85C\uB188",
    "\uC2DC\uAC04\uCC28 3\uC5F0\uBC1C \xB7 \uB9E4 3\uD68C \uACF5\uACA9 \uCD94\uAC00 \uC5F0\uC0AC",
    "exotic",
    add("trainShot"),
    add("burstEvery", 3)
  ],
  [
    "\uC774\uC911\uB178\uCD9C \uCE74\uBA54\uB77C",
    "\uB450 \uB098\uC120\uD0C4 \xB7 \uACF5\uACA9 \uBCF5\uC81C \uD655\uB960 +20%",
    "rare",
    add("helix"),
    add("duplicate", 0.2)
  ],
  [
    "\uBC30\uD130\uB9AC \uC5C6\uB294 \uB9AC\uBAA8\uCEE8",
    "\uC800\uC7A5\uD55C \uC6D0\uACA9 \uD575 \uBC29\uCD9C \xB7 \uBC1C\uC0AC \uC18D\uB3C4 -20%",
    "anomaly",
    add("stasis"),
    add("remoteOrb"),
    mul("rate", 0.8)
  ],
  [
    "\uD640\uB85C\uADF8\uB7A8 \uBA74\uB3C4\uC0AC",
    "\uADFC\uC811 \uBCA0\uAE30\uB97C 40% \uC704\uB825\uC73C\uB85C \uBA54\uC544\uB9AC",
    "rare",
    add("meleeShot"),
    add("echo", 0.4)
  ],
  [
    "\uBC31\uC5C5\uC6A9 \uC2EC\uC9C0",
    "\uD3ED\uD0C4 \uACF5\uACA9 \xB7 \uC5F0\uC1C4 \uAE30\uD3ED \uC704\uB825 +35%",
    "rare",
    add("bombShot"),
    add("chainFuse", 0.35)
  ],
  [
    "\uC78A\uC5B4\uBC84\uB9B0 \uC608\uC57D\uD45C",
    "\uC9C0\uC5F0 \uCD9C\uBC1C \xB7 \uC0AC\uAC70\uB9AC \uB05D\uC5D0\uC11C \uBD84\uC5F4 +1",
    "uncommon",
    add("delayedShot"),
    add("expireSplit")
  ],
  [
    "\uC30D\uBC29\uD5A5 \uD638\uCD9C\uAE30",
    "\uD6C4\uBC29 25% \uD0C4\uD658 \xB7 \uC2DC\uAC04\uCC28 3\uC5F0\uBC1C",
    "rare",
    add("rear"),
    add("trainShot")
  ],
  [
    "\uACF5\uC804 \uBC29\uC1A1\uAD6D",
    "\uC6D0\uACA9 \uD575 \uBC30\uCE58 \xB7 \uC804\uAE30\uB9DD \uC0DD\uC131 \xB7 \uD53C\uD574 -20%",
    "exotic",
    add("remoteOrb"),
    add("conduit"),
    mul("damage", 0.8)
  ],
  [
    "\uBA48\uCD98 \uC138\uACC4\uC758 \uCD08\uCE68",
    "\uC800\uC7A5 \uBC1C\uC0AC \xB7 \uB454\uD654 +30% \xB7 \uC0AC\uAC70\uB9AC +20%",
    "rare",
    add("stasis"),
    add("slow", 0.3),
    mul("range", 1.2)
  ],
  [
    "\uC77C\uACF1 \uBC88\uC9F8 \uB098\uC0AC",
    "\uBC1C\uC0AC\uCCB4 +3 \xB7 \uAC01 \uD53C\uD574 -25%",
    "rare",
    add("extraProjectiles", 3),
    mul("damage", 0.75)
  ],
  [
    "\uAC08\uB77C\uC9C4 \uD655\uC131\uAE30",
    "\uBC1C\uC0AC\uCCB4 +2 \xB7 \uD0C4\uD658\uC774 \uBB3C\uACB0 \uBE44\uD589 \xB7 \uD53C\uD574 -20%",
    "rare",
    add("extraProjectiles", 2),
    add("waveShot"),
    mul("damage", 0.8)
  ],
  [
    "\uAD6C\uACA8\uC9C4 \uBCC4\uC9C0\uB3C4",
    "\uC5EC\uC12F \uBC29\uD5A5 \uD0C4\uD658 \xB7 \uC720\uB3C4 +12%",
    "rare",
    add("petalShot"),
    add("homing", 0.12)
  ],
  [
    "\uC2EC\uD574 \uD0D0\uCE68",
    "\uAC10\uC18D \uAD00\uD1B5\uD0C4 \xB7 \uAD00\uD1B5 +3 \xB7 \uC0AC\uAC70\uB9AC +20%",
    "rare",
    add("brakeShot"),
    add("pierce", 3),
    mul("range", 1.2)
  ],
  [
    "\uBD84\uD64D \uC18C\uC6A9\uB3CC\uC774",
    "\uD718\uC5B4\uC9C0\uB294 \uACE0\uB9AC \xB7 \uD3ED\uBC1C +15%",
    "rare",
    add("ringShot"),
    add("swerve"),
    add("explosion", 0.15)
  ],
  [
    "\uC0B0\uC5C5\uC6A9 \uC813\uAC00\uB77D",
    "\uAD50\uCC28 \uAD11\uC120 \uBC1C\uC0AC \xB7 \uBC1C\uC0AC \uC18D\uB3C4 -25%",
    "exotic",
    add("convergeShot"),
    add("beam"),
    mul("rate", 0.75)
  ],
  [
    "\uADA4\uB3C4 \uC624\uBC30\uC1A1 \uC0C1\uC790",
    "\uD68C\uC804 \uACE1\uC0AC \uACF5\uACA9 \xB7 \uD3ED\uBC1C \uBC94\uC704 +25%",
    "rare",
    add("spiralShot"),
    add("lobShot"),
    mul("explosionRadius", 1.25)
  ],
  [
    "\uACE0\uC591\uC774 \uC218\uC5FC \uC790\uC11D",
    "\uC88C\uC6B0 \uAD50\uB300 \uCD1D\uAD6C \xB7 \uC720\uB3C4 +20%",
    "uncommon",
    add("alternatingShot"),
    add("homing", 0.2)
  ],
  [
    "\uC591\uC790 \uC885\uC774\uBE44\uD589\uAE30",
    "\uB450 \uB098\uC120\uD0C4 \xB7 \uACBD\uACC4 \uC774\uB3D9 +1",
    "exotic",
    add("helix"),
    add("wrap")
  ],
  [
    "\uCD95\uC81C\uC6A9 \uC18C\uC74C\uAE30",
    "\uC0B0\uD0C4\uC5D0 30% \uC704\uB825 \uBA54\uC544\uB9AC \xB7 \uD0C4\uC18D -15%",
    "anomaly",
    add("scatterShot"),
    add("echo", 0.3),
    mul("bulletSpeed", 0.85)
  ],
  [
    "\uBE5A\uC73C\uB85C \uC0B0 \uD0DC\uC591",
    "\uCDA9\uC804 \uD3ED\uD0C4 \xB7 \uD3ED\uBC1C \uBC94\uC704 +40% \xB7 \uCD5C\uB300 \uCCB4\uB825 -1",
    "anomaly",
    add("charged"),
    add("bombShot"),
    mul("explosionRadius", 1.4),
    add("maxHp", -1)
  ],
  [
    "\uAE08\uB2E8\uC758 \uAC00\uC9C0\uCE58\uAE30",
    "\uBD84\uC5F4 \uD655\uB960 +60% \xB7 \uD30C\uD3B8 \uC218 +2 \xB7 \uC9C1\uC811 \uD53C\uD574 -25%",
    "anomaly",
    add("split", 0.6),
    add("splitCount", 2),
    mul("damage", 0.75)
  ],
  [
    "\uBD80\uC11C\uC9C4 \uBD81\uADF9\uC131",
    "\uC2ED\uC790 \uBE59\uACB0\uD0C4 \xB7 \uBE59\uACB0 \uB204\uC801 +2 \xB7 \uBC1C\uC0AC \uC18D\uB3C4 -20%",
    "anomaly",
    add("crossShot"),
    add("freezeStacks", 2),
    mul("rate", 0.8)
  ],
  [
    "\uC790\uAC00\uC99D\uC2DD \uBA38\uB9AC\uCE74\uB77D",
    "\uD0C4\uD658 \uC735\uD569 \xB7 \uB9E5\uB3D9 \xB7 \uD53C\uD574 -15%",
    "anomaly",
    add("fusion"),
    add("pulseSize"),
    mul("damage", 0.85)
  ],
  [
    "\uC911\uB825\uC138 \uB0A9\uBD80\uC11C",
    "\uAC10\uC18D \uB300\uD615\uD0C4 \xB7 \uC801\uD0C4 \uD761\uC218 \xB7 \uC774\uB3D9 \uC18D\uB3C4 -10%",
    "anomaly",
    add("brakeShot"),
    mul("size", 1.6),
    add("absorb"),
    mul("speed", 0.9)
  ],
  [
    "\uBA74\uD5C8 \uC5C6\uB294 \uBC88\uAC1C",
    "\uC9C0\uADF8\uC7AC\uADF8 \uAD11\uC120 \xB7 \uAC10\uC804 +30% \xB7 \uBC1C\uC0AC \uC18D\uB3C4 -25%",
    "anomaly",
    add("zigzag"),
    add("beam"),
    add("lightning", 0.3),
    mul("rate", 0.75)
  ],
  [
    "\uBD88\uBA74\uC758 \uAD00\uC81C\uD0D1",
    "\uC6D0\uACA9 \uD575 \xB7 \uBC18\uBCF5 \uACF5\uACA9 +1 \xB7 \uD53C\uD574 -30%",
    "anomaly",
    add("remoteOrb"),
    add("repeatShots"),
    mul("damage", 0.7)
  ],
  [
    "\uCD5C\uD6C4\uC758 \uAF43\uB2E4\uBC1C",
    "\uC5EC\uC12F \uBC29\uD5A5 \uCDA9\uC804\uD0C4 \xB7 \uD3ED\uBC1C +30% \xB7 \uCD5C\uB300 \uCCB4\uB825 -1",
    "anomaly",
    add("petalShot"),
    add("charged"),
    add("explosion", 0.3),
    add("maxHp", -1)
  ],
  [
    "\uBD84\uC2E4\uB41C \uBB34\uD55C\uB300",
    "\uACE0\uB9AC \uACBD\uACC4 \uC774\uB3D9 +2 \xB7 \uC0AC\uAC70\uB9AC +40% \xB7 \uD53C\uD574 -25%",
    "exotic",
    add("ringShot"),
    add("wrap", 2),
    mul("range", 1.4),
    mul("damage", 0.75)
  ],
  [
    "\uC644\uBCBD\uD558\uC9C0 \uC54A\uC740 \uBCF5\uC81C\uAE30",
    "\uBC18\uBCF5 \uACF5\uACA9 +1 \xB7 \uACF5\uACA9 \uBCF5\uC81C +25% \xB7 \uD53C\uD574 -35%",
    "anomaly",
    add("repeatShots"),
    add("duplicate", 0.25),
    mul("damage", 0.65)
  ]
];
var EXPANSION_ITEMS = concepts.map(
  ([name, description, rarity, ...effects], i) => ({
    id: String(137 + i),
    name,
    description,
    rarity,
    maxStack: 1,
    price: { common: 10, uncommon: 15, rare: 22, exotic: 30, anomaly: 24 }[rarity],
    effects
  })
);

// src/data/buildItems.ts
var add2 = (key2, value) => ({ key: key2, value, op: "add" });
var mul2 = (key2, value) => ({
  key: key2,
  value,
  op: "multiply"
});
var concepts2 = [
  [
    "\uB2E8\uC77C\uC131 \uBAA8\uADFC\uD3EC",
    "\uACF5\uACA9\uB825 \xD72 \xB7 \uACF5\uACA9\uC18D\uB3C4 -55% \xB7 \uAD00\uD1B5 +1. \uBC1C\uC0AC \uD0C4\uC218\xB7\uBC18\uBCF5\uC744 \uD55C \uBC1C\uB85C \uC555\uCD95\uD574 \uC704\uB825\uC73C\uB85C \uC804\uD658(\uCD5C\uB300 +150%). \uC720\uB3C4\xB7\uC18D\uC131\xB7\uBB34\uAE30 \uD615\uD0DC\uB294 \uC720\uC9C0.",
    "exotic",
    add2("singleCore", 1),
    mul2("damage", 2),
    mul2("rate", 0.45),
    mul2("size", 1.6),
    add2("pierce", 1)
  ],
  [
    "\uB3C5\uC131 \uBC30\uC591\uB0AD",
    "\uBA85\uC911 \uC2DC \uC911\uB3C5 \uD655\uB960 +70% \xB7 3\uCD08\uAC04 \uCD08\uB2F9 \uC9C1\uACA9 \uD53C\uD574\uC758 45% \xB7 \uC9C1\uC811 \uACF5\uACA9\uB825 -15%. \uC7AC\uBA85\uC911\uC740 \uC9C0\uC18D\uC2DC\uAC04\uC744 \uAC31\uC2E0\uD558\uBA70 \uC911\uCCA9\uB418\uC9C0 \uC54A\uC74C.",
    "rare",
    add2("poison", 0.7),
    mul2("damage", 0.85)
  ],
  [
    "\uB290\uB9B0 \uC5F0\uC18C\uC2E4",
    "\uD654\uC0C1\xB7\uC911\uB3C5\xB7\uCD9C\uD608 \uC9C0\uC18D \uD53C\uD574 +100% \xB7 \uC0C1\uD0DC \uC9C0\uC18D\uC2DC\uAC04 +25% \xB7 \uC9C1\uC811 \uACF5\uACA9\uB825 -20%.",
    "rare",
    add2("dotPower", 1),
    mul2("duration", 1.25),
    mul2("damage", 0.8)
  ],
  [
    "\uC5F4\uCDA9\uACA9 \uC720\uB9AC\uCE68",
    "\uD654\uC0C1 \uB610\uB294 \uB454\uD654 \uC0C1\uD0DC\uC758 \uC801\uC5D0\uAC8C \uBC18\uB300 \uC18D\uC131\uC744 \uC785\uD788\uBA74 \uB458\uC744 \uC18C\uBAA8\uD558\uACE0 \uC9C1\uACA9 \uD53C\uD574 150%\uC758 \uC5F4\uCDA9\uACA9. \uB300\uC0C1\uB9C8\uB2E4 0.75\uCD08 \uAC04\uACA9. \uB454\uD654 \uD655\uB960 +15%.",
    "rare",
    add2("thermalShock", 1),
    add2("slow", 0.15)
  ],
  [
    "\uC816\uC740 \uC804\uB3C4\uB9C9",
    "\uAC10\uC804 \uD655\uB960 +20%. \uC911\uB3C5\xB7\uB454\uD654\uB41C \uC801\uC744 \uAC10\uC804\uC2DC\uD0A4\uBA74 \uC9C1\uACA9 \uD53C\uD574 80%\uB97C \uCD94\uAC00\uD558\uACE0 \uC8FC\uBCC0 \uCD5C\uB300 2\uBA85\uC5D0\uAC8C 40% \uC804\uB3C4. \uB300\uC0C1\uB9C8\uB2E4 0.75\uCD08 \uAC04\uACA9.",
    "rare",
    add2("conduction", 1),
    add2("lightning", 0.2)
  ],
  [
    "\uC11C\uB9AC \uD30C\uC1C4\uC410\uAE30",
    "\uBE59\uACB0\uB41C \uC801\uC5D0\uAC8C \uC9C1\uACA9 \uD53C\uD574 +120% \xB7 \uBE59\uACB0\uC744 \uC18C\uBAA8. \uB454\uD654 \uD655\uB960 +20% \xB7 \uB454\uD654 3\uD68C \uB204\uC801 \uC2DC \uBE59\uACB0 \xB7 \uACF5\uACA9\uC18D\uB3C4 -15%.",
    "rare",
    add2("shatter", 1.2),
    add2("slow", 0.2),
    add2("freezeStacks", 3),
    mul2("rate", 0.85)
  ]
];
var BUILD_ITEMS = concepts2.map(
  ([name, description, rarity, ...effects], i) => ({
    id: String(245 + i),
    name,
    description,
    rarity,
    effects,
    maxStack: 1,
    price: rarity === "exotic" ? 30 : 22
  })
);

// src/data/powerItems.ts
var boost = (key2, value) => ({
  key: key2,
  value,
  op: "additive"
});
var add3 = (key2, value) => ({
  key: key2,
  value,
  op: "add"
});
var mul3 = (key2, value) => ({
  key: key2,
  value,
  op: "multiply"
});
var concepts3 = [
  ["\uACE0\uBC00\uB3C4 \uBAA8\uADFC\uCD94", "\uACF5\uACA9\uB825 +16%", "uncommon", boost("damage", 0.16)],
  [
    "\uD608\uC561 \uC555\uCD95 \uD38C\uD504",
    "\uCD5C\uB300 \uCCB4\uB825 -1\uCE78 \xB7 \uACF5\uACA9\uB825 +40%",
    "anomaly",
    add3("maxHp", -1),
    boost("damage", 0.4)
  ],
  [
    "\uBCF5\uB3D9\uC2DD \uBAA8\uADFC \uC5D4\uC9C4",
    "\uACF5\uACA9\uB825 +10% \xB7 \uACF5\uACA9\uC18D\uB3C4 +8%",
    "uncommon",
    boost("damage", 0.1),
    boost("rate", 0.08)
  ],
  [
    "\uC911\uB7C9 \uD0C0\uACA9 \uCF54\uC5B4",
    "\uACF5\uACA9\uB825 +28% \xB7 \uACF5\uACA9\uC18D\uB3C4 -12%",
    "rare",
    boost("damage", 0.28),
    mul3("rate", 0.88)
  ],
  [
    "\uADFC\uC811 \uC9D1\uC18D \uB80C\uC988",
    "\uACF5\uACA9\uB825 +24% \xB7 \uC0AC\uAC70\uB9AC -15%",
    "rare",
    boost("damage", 0.24),
    mul3("range", 0.85)
  ],
  [
    "\uC815\uBC00 \uC808\uC0AD\uB0A0",
    "\uACF5\uACA9\uB825 +10% \xB7 \uCE58\uBA85\uD0C0 \uD655\uB960 +6%",
    "rare",
    boost("damage", 0.1),
    add3("critChance", 0.06)
  ],
  [
    "\uACBD\uB7C9 \uC804\uD22C \uC2E0\uACBD",
    "\uACF5\uACA9\uB825 +10% \xB7 \uC774\uB3D9\uC18D\uB3C4 +5%",
    "uncommon",
    boost("damage", 0.1),
    boost("speed", 0.05)
  ],
  [
    "\uC555\uCD95 \uCD94\uC9C4\uC57D",
    "\uACF5\uACA9\uB825 +22% \xB7 \uD0C4\uC18D -15%",
    "uncommon",
    boost("damage", 0.22),
    mul3("bulletSpeed", 0.85)
  ]
];
var POWER_ITEMS = concepts3.map(
  ([name, description, rarity, ...effects], i) => ({
    id: String(237 + i),
    name,
    description,
    rarity,
    effects,
    maxStack: 1,
    price: rarity === "anomaly" ? 24 : rarity === "rare" ? 22 : 15
  })
);

// src/data/items.ts
var effectKeys = [
  "shatter",
  "singleCore",
  "poison",
  "dotPower",
  "thermalShock",
  "conduction",
  "execution",
  "helix",
  "waveShot",
  "zigzag",
  "accelerator",
  "brakeShot",
  "swerve",
  "spiralShot",
  "petalShot",
  "crossShot",
  "parallelShot",
  "sweepShot",
  "scatterShot",
  "convergeShot",
  "alternatingShot",
  "trainShot",
  "delayedShot",
  "pulseSize",
  "beam",
  "ringShot",
  "lobShot",
  "meleeShot",
  "remoteOrb",
  "extraProjectiles",
  "repeatShots",
  "stasis",
  "fusion",
  "autoCharge",
  "wrap",
  "bombShot",
  "rangePower",
  "conduit",
  "shieldShot",
  "boomerang",
  "adhesive",
  "charged",
  "tether",
  "chainFuse",
  "wallLink",
  "seekingShards",
  "chargedArc",
  "returnNova",
  "retreatOrbit",
  "longEntry",
  "reflectBuff",
  "shieldBreakShort",
  "orbitAccelerate",
  "stickyHoming",
  "bounceHoming",
  "retarget",
  "betterHeal",
  "dodgeMark",
  "mergeTrails",
  "frozenZone",
  "standResist",
  "healthySize",
  "movingGrowth",
  "bleedGauge",
  "absorb",
  "activeFreeze",
  "arcHoming",
  "auraSlow",
  "autoReflect",
  "bigTrail",
  "bleed",
  "blockOrbit",
  "bossHeal",
  "bounceFalloff",
  "bounceGain",
  "burstEvery",
  "champion",
  "chargeLightning",
  "cloneEffect",
  "dashExplosion",
  "dodge",
  "drone",
  "duplicate",
  "echo",
  "entryArmor",
  "entryContact",
  "entryRate",
  "expireSplit",
  "firstGuard",
  "growth",
  "halfOrbit",
  "healChanceRooms",
  "healRooms",
  "healthyArmor",
  "killShards",
  "knockback",
  "lowHpRate",
  "mark",
  "miniLightning",
  "movingDodge",
  "multishotBonus",
  "orbitCount",
  "orbitDamage",
  "orbitEvery",
  "pierceFalloff",
  "pierceSpeed",
  "randomRoom",
  "randomStatus",
  "reflect",
  "resist",
  "retreatDamage",
  "return",
  "revive",
  "rewind",
  "shieldArmor",
  "side",
  "sideEvery",
  "splitCount",
  "splitDamage",
  "sprout",
  "standDamage",
  "sticky",
  "synergyDiscount",
  "tagDamage",
  "trail",
  "turret",
  "damage",
  "rate",
  "speed",
  "bulletSpeed",
  "range",
  "size",
  "homing",
  "pierce",
  "bounce",
  "pickup",
  "maxHp",
  "double",
  "triple",
  "rear",
  "movingRate",
  "critChance",
  "burn",
  "slow",
  "burnBonus",
  "duration",
  "freezeStacks",
  "split",
  "explosion",
  "zone",
  "lightning",
  "statusBonus",
  "iceShards",
  "splitBurn",
  "pierceLightning",
  "explosionRadius",
  "spreadTargets"
];
var effectSchema = z.object({
  key: z.enum(effectKeys),
  op: z.enum(["add", "additive", "multiply", "override"]),
  value: z.number().finite()
});
var itemSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  rarity: z.enum(["common", "uncommon", "rare", "exotic", "anomaly"]),
  price: z.number().int().positive(),
  maxStack: z.number().int().positive(),
  effects: z.array(effectSchema).min(1)
});
var fx = (key2, value, op = "multiply") => ({ key: key2, value, op });
var ITEMS = z.array(itemSchema).length(250).parse(
  [
    {
      id: "006",
      name: "\uCD08\uAC15\uB825 \uC641\uC2A4",
      description: "\uD0C4\uC18D +15% \xB7 \uC0AC\uAC70\uB9AC +5%",
      effects: [fx("bulletSpeed", 1.15), fx("range", 1.05)],
      price: 10
    },
    {
      id: "009",
      name: "\uAC80\uC740\uCF69 \uB450\uC54C",
      description: "\uB098\uB780\uD55C \uD0C4\uD658 2\uAC1C \xB7 \uAC01 \uD53C\uD574 55%",
      effects: [fx("double", 1, "add")],
      price: 12,
      maxStack: 1
    },
    {
      id: "018",
      name: "\uD64D\uC0BC\uBC1C\uBAA8\uC561",
      description: "\uCD5C\uB300 \uCCB4\uB825 +1 \xB7 \uBD80\uC0C1 \uC0C1\uD0DC\uB77C\uBA74 \uCCB4\uB825 +1",
      effects: [fx("maxHp", 1, "add")],
      price: 12
    },
    {
      id: "019",
      name: "\uC544\uBC84\uC9C0\uC758 \uAC80\uC740\uCF69",
      description: "\uD53C\uD574 +10%",
      effects: [fx("damage", 1.1)],
      price: 10
    },
    {
      id: "020",
      name: "\uCE74\uD398\uC778 \uC0F4\uD478",
      description: "\uC774\uB3D9 \uC911 \uACF5\uACA9 \uC18D\uB3C4 +10%",
      effects: [fx("movingRate", 1.1)],
      price: 10
    },
    {
      id: "023",
      name: "\uCD08\uAC15\uB825 \uD5E4\uC5B4\uD540",
      description: "\uAD00\uD1B5 +1 \xB7 \uAD00\uD1B5 \uD6C4 \uD53C\uD574 -15%",
      effects: [fx("pierce", 1, "add")],
      price: 12
    },
    {
      id: "024",
      name: "\uD0C4\uC131 \uD5E4\uC5B4\uBC34\uB4DC",
      description: "\uBCBD \uBC18\uC0AC +1 \xB7 \uBC18\uC0AC \uD6C4 \uD53C\uD574 -20%",
      effects: [fx("bounce", 1, "add")],
      price: 12
    },
    {
      id: "025",
      name: "\uBAA8\uADFC \uB098\uCE68\uBC18",
      description: "\uAC00\uAE4C\uC6B4 \uC801\uC744 \uD5A5\uD574 \uC57D\uD558\uAC8C \uC720\uB3C4",
      effects: [fx("homing", 0.14, "add")],
      price: 12
    },
    {
      id: "027",
      name: "\uB450\uD53C \uB9C8\uC0AC\uC9C0\uAE30",
      description: "\uBCF4\uAE09\uD488 \uD68C\uC218 \uBC18\uACBD +45%",
      effects: [fx("pickup", 1.45)],
      price: 8
    },
    {
      id: "029",
      name: "\uB4B7\uBA38\uB9AC \uC13C\uC11C",
      description: "\uB4A4\uB85C \uD53C\uD574 25% \uBCF4\uC870\uD0C4 \uBC1C\uC0AC",
      effects: [fx("rear", 1, "add")],
      price: 10,
      maxStack: 1
    },
    {
      id: "031",
      name: "\uBFCC\uB9AC\uC601\uC591 \uC570\uD50C",
      description: "\uD0C4\uC18D +12% \xB7 \uC0AC\uAC70\uB9AC +10%",
      effects: [fx("bulletSpeed", 1.12), fx("range", 1.1)],
      price: 10
    },
    {
      id: "032",
      name: "\uC655\uB300\uBE57",
      description: "\uD0C4\uD658 \uD06C\uAE30 +20%",
      effects: [fx("size", 1.2)],
      price: 10
    },
    {
      id: "034",
      name: "\uBAA8\uBC1C \uC555\uCD95\uD0C4",
      description: "\uD53C\uD574 +14% \xB7 \uACF5\uACA9 \uC18D\uB3C4 -4%",
      effects: [fx("damage", 1.14), fx("rate", 0.96)],
      price: 10
    },
    {
      id: "040",
      name: "\uC608\uBE44 \uBA38\uB9AC\uB048",
      description: "\uC774\uB3D9 \uC18D\uB3C4 +8%",
      effects: [fx("speed", 1.08)],
      price: 10
    },
    {
      id: "059",
      name: "\uC0BC\uC9C0\uCC3D \uBE57",
      description: "3\uBC29\uD5A5 \uBC1C\uC0AC \xB7 \uAC01 \uD53C\uD574 48%",
      effects: [fx("triple", 1, "add")],
      price: 18,
      rarity: "uncommon",
      maxStack: 1
    },
    {
      id: "010",
      name: "\uACE0\uB370\uAE30 \uC9D1\uAC8C",
      description: "12% \uD655\uB960\uB85C \uD654\uC0C1 \xB7 3\uCD08\uAC04 \uCD08\uB2F9 \uD0C4\uD658 \uD53C\uD574 25%",
      effects: [{ key: "burn", value: 0.12, op: "add" }],
      rarity: "common",
      price: 10,
      maxStack: 1
    },
    {
      id: "021",
      name: "\uBBFC\uD2B8\uC0F4\uD478",
      description: "15% \uD655\uB960\uB85C 1\uCD08\uAC04 15% \uB454\uD654",
      effects: [{ key: "slow", value: 0.15, op: "add" }],
      rarity: "common",
      price: 10,
      maxStack: 1
    },
    {
      id: "026",
      name: "\uB4DC\uB77C\uC774\uC5B4 1800\uC640\uD2B8",
      description: "\uD654\uC0C1 \uB300\uC0C1 \uC9C1\uC811 \uD53C\uD574 +10%",
      effects: [{ key: "burnBonus", value: 0.1, op: "add" }],
      rarity: "common",
      price: 10,
      maxStack: 99
    },
    {
      id: "036",
      name: "\uBD80\uB7EC\uC9C4 \uBC14\uB9AC\uAE61\uB0A0",
      description: "\uCE58\uBA85\uD0C0 \uD655\uB960 +5%\uD3EC\uC778\uD2B8",
      effects: [{ key: "critChance", value: 0.05, op: "add" }],
      rarity: "common",
      price: 10,
      maxStack: 99
    },
    {
      id: "038",
      name: "\uACE0\uAE09\uB9B0\uC2A4",
      description: "\uC0C1\uD0DC\uD6A8\uACFC \uC9C0\uC18D\uC2DC\uAC04 +10%",
      effects: [{ key: "duration", value: 1.1, op: "multiply" }],
      rarity: "common",
      price: 10,
      maxStack: 99
    },
    {
      id: "039",
      name: "\uBC30\uC218\uAD6C\uC790\uC11D",
      description: "\uBCF4\uAE09\uD488 \uD68C\uC218 \uBC18\uACBD +80%",
      effects: [{ key: "pickup", value: 1.8, op: "multiply" }],
      rarity: "common",
      price: 10,
      maxStack: 99
    },
    {
      id: "054",
      name: "\uB450\uD53C\uB0C9\uAC01\uD329",
      description: "\uB454\uD654 4\uD68C \uC911\uCCA9 \uC2DC 1\uCD08 \uBE59\uACB0 \xB7 \uBCF4\uC2A4\uB294 60% \uAC10\uC18D",
      effects: [{ key: "freezeStacks", value: 4, op: "add" }],
      rarity: "uncommon",
      price: 18,
      maxStack: 1
    },
    {
      id: "060",
      name: "\uAC08\uB77C\uC9C4 \uBA38\uB9AC\uB05D",
      description: "\uBA85\uC911 \uC2DC \uD53C\uD574 30% \uD30C\uD3B8 2\uAC1C \xB7 \uC7AC\uBD84\uC5F4 \uC5C6\uC74C",
      effects: [{ key: "split", value: 1, op: "add" }],
      rarity: "uncommon",
      price: 18,
      maxStack: 1
    },
    {
      id: "061",
      name: "\uD5E4\uC5B4\uC2A4\uD504\uB808\uC774 \uD3ED\uD0C4",
      description: "\uBA85\uC911 \uC2DC \uBC18\uACBD 65 \uD3ED\uBC1C \xB7 \uD0C4\uD658 \uD53C\uD574 35%",
      effects: [{ key: "explosion", value: 0.35, op: "add" }],
      rarity: "uncommon",
      price: 18,
      maxStack: 1
    },
    {
      id: "062",
      name: "\uC9C0\uC18D\uD615 \uD5E4\uC5B4\uBB34\uC2A4",
      description: "\uD3ED\uBC1C\uACFC \uC870\uD569\uD558\uBA74 1\uCD08 \uC7A5\uD310 \xB7 \uCD08\uB2F9 \uD53C\uD574 30%",
      effects: [{ key: "zone", value: 0.3, op: "add" }],
      rarity: "uncommon",
      price: 18,
      maxStack: 1
    },
    {
      id: "065",
      name: "\uBAA8\uADFC\uCD94\uC801\uAE30",
      description: "\uC720\uB3C4 +30% \xB7 \uD0C4\uC18D -5%",
      effects: [
        { key: "homing", value: 0.3, op: "add" },
        { key: "bulletSpeed", value: 0.95, op: "multiply" }
      ],
      rarity: "uncommon",
      price: 18,
      maxStack: 99
    },
    {
      id: "067",
      name: "\uBAA8\uBC1C\uAC10\uC804\uAE30",
      description: "15% \uD655\uB960\uB85C \uADFC\uCC98 2\uBA85 \uC5F0\uC1C4 \uAC10\uC804 \xB7 \uD53C\uD574 45%",
      effects: [{ key: "lightning", value: 0.15, op: "add" }],
      rarity: "uncommon",
      price: 18,
      maxStack: 1
    },
    {
      id: "072",
      name: "\uD3ED\uD0C4\uBA38\uB9AC \uD38C",
      description: "\uD0C4\uD658 \uD06C\uAE30 +45% \xB7 \uD53C\uD574 +25% \xB7 \uBC1C\uC0AC -12%",
      effects: [
        { key: "size", value: 1.45, op: "multiply" },
        { key: "damage", value: 1.25, op: "multiply" },
        { key: "rate", value: 0.88, op: "multiply" }
      ],
      rarity: "rare",
      price: 28,
      maxStack: 99
    },
    {
      id: "077",
      name: "\uBAA8\uBC1C\uD569\uC131\uBC18\uC751\uAE30",
      description: "\uC0C1\uD0DC 2\uC885 \uB300\uC0C1 \uD53C\uD574 +25% \xB7 3\uC885 \uC774\uC0C1 +45%",
      effects: [{ key: "statusBonus", value: 1, op: "add" }],
      rarity: "rare",
      price: 28,
      maxStack: 1
    },
    {
      id: "078",
      name: "\uB0C9\uB3D9\uBE44\uB4EC \uD3ED\uD48D",
      description: "\uBE59\uACB0 \uCC98\uCE58 \uC2DC \uD53C\uD574 35% \uC5BC\uC74C \uD30C\uD3B8 6\uAC1C",
      effects: [{ key: "iceShards", value: 1, op: "add" }],
      rarity: "rare",
      price: 28,
      maxStack: 1
    },
    {
      id: "001",
      name: "\uD6C4\uD1F4\uD558\uB294 \uC55E\uBA38\uB9AC",
      description: "\uB4A4\uB85C \uC774\uB3D9 \uC911 \uD53C\uD574 +12%. \uC801\uC5D0\uAC8C\uC11C \uB3C4\uB9DD\uAC00\uBA70 \uC2F8\uC6B8 \uB54C \uC720\uB9AC\uD558\uB2E4.",
      effects: [{ key: "retreatDamage", value: 0.12, op: "add" }],
      rarity: "common",
      price: 10,
      maxStack: 1
    },
    {
      id: "002",
      name: "\uC57C\uADFC\uC0F4\uD478",
      description: "\uBC29 \uC785\uC7A5 \uD6C4 8\uCD08\uAC04 \uACF5\uACA9 \uC18D\uB3C4 +12%.",
      effects: [{ key: "entryRate", value: 0.12, op: "add" }],
      rarity: "common",
      price: 10,
      maxStack: 1
    },
    {
      id: "003",
      name: "\uBC18\uC9DD\uB450\uD53C \uC0D8\uD50C",
      description: "\uC801\uD0C4\uC5D0 \uB9DE\uC744 \uB54C 8% \uD655\uB960\uB85C \uD53C\uD574 \uBB34\uD6A8.",
      effects: [{ key: "dodge", value: 0.08, op: "add" }],
      rarity: "common",
      price: 10,
      maxStack: 1
    },
    {
      id: "004",
      name: "2:8 \uAC00\uB974\uB9C8",
      description: "\uB9E4 8\uBC88\uC9F8 \uD0C4\uD658\uC774 \uC88C\uC6B0\uB85C \uD53C\uD574 40% \uBCF4\uC870\uD0C4 2\uAC1C\uB97C \uBC1C\uC0AC\uD55C\uB2E4.",
      effects: [{ key: "sideEvery", value: 8, op: "add" }],
      rarity: "common",
      price: 10,
      maxStack: 1
    },
    {
      id: "005",
      name: "\uCD95\uC804 \uC548\uC804\uBAA8",
      description: "\uBC29 \uC785\uC7A5 \uD6C4 2\uCD08 \uB3D9\uC548 \uCDA9\uB3CC \uD53C\uD574 -40%.",
      effects: [{ key: "entryContact", value: 0.4, op: "add" }],
      rarity: "common",
      price: 10,
      maxStack: 1
    },
    {
      id: "007",
      name: "\uCC0D\uCC0D\uC774 \uAC00\uBC1C",
      description: "\uC720\uB3C4 \uAC15\uB3C4 +0.10.",
      effects: [{ key: "homing", value: 0.1, op: "add" }],
      rarity: "common",
      price: 10,
      maxStack: 1
    },
    {
      id: "008",
      name: "\uC811\uC774\uC2DD \uBE57",
      description: "\uD0C4\uD658\uC774 \uBCBD\uC5D0\uC11C 1\uD68C \uC57D\uD558\uAC8C \uBC18\uC0AC\uB41C\uB2E4. \uBC18\uC0AC\uD0C4 \uD53C\uD574 80%.",
      effects: [{ key: "bounce", value: 1, op: "add" }],
      rarity: "common",
      price: 10,
      maxStack: 1
    },
    {
      id: "011",
      name: "\uC804\uD22C \uD68C\uBCF5 \uC601\uC591\uC81C",
      description: "\uC804\uD22C\uBC29 4\uAC1C \uD074\uB9AC\uC5B4\uB9C8\uB2E4 \uCCB4\uB825 1 \uD68C\uBCF5.",
      effects: [{ key: "healRooms", value: 4, op: "add" }],
      rarity: "common",
      price: 10,
      maxStack: 1
    },
    {
      id: "012",
      name: "\uBBF8\uB044\uB7EC\uC6B4 \uC5D0\uC13C\uC2A4",
      description: "\uD68C\uD53C \uD655\uB960 +6%, \uC774\uB3D9 \uC18D\uB3C4 +4%.",
      effects: [
        { key: "dodge", value: 0.06, op: "add" },
        { key: "speed", value: 1.04, op: "multiply" }
      ],
      rarity: "common",
      price: 10,
      maxStack: 1
    },
    {
      id: "013",
      name: "\uBD80\uC2DD\uC131 \uC810\uC561\uBCD1",
      description: "\uC774\uB3D9 \uACBD\uB85C\uC5D0 \uAC08\uC0C9 \uD754\uC801\uC744 \uB0A8\uAE34\uB2E4. 0.9\uCD08 \uC9C0\uC18D, \uC801\uC5D0\uAC8C \uCD08\uB2F9 \uD53C\uD574\uC758 25% \uD53C\uD574.",
      effects: [{ key: "trail", value: 0.25, op: "add" }],
      rarity: "common",
      price: 10,
      maxStack: 1
    },
    {
      id: "014",
      name: "\uBE44\uB4EC\uD3ED\uC124",
      description: "\uD0C4\uD658 \uC18C\uBA78 \uC2DC 35% \uD655\uB960\uB85C \uD53C\uD574 15% \uBE44\uB4EC \uD30C\uD3B8 3\uAC1C \uC0DD\uC131.",
      effects: [{ key: "expireSplit", value: 0.35, op: "add" }],
      rarity: "common",
      price: 10,
      maxStack: 1
    },
    {
      id: "015",
      name: "\uBC14\uB78C\uB9C9\uC774 \uAC00\uBC1C",
      description: "\uBC00\uCE58\uAE30 \uC800\uD56D +30%, \uC774\uB3D9 \uC18D\uB3C4 +5%.",
      effects: [
        { key: "resist", value: 0.3, op: "add" },
        { key: "speed", value: 1.05, op: "multiply" }
      ],
      rarity: "common",
      price: 10,
      maxStack: 1
    },
    {
      id: "016",
      name: "\uC7A5\uAD70\uBE57",
      description: "\uD0C4\uD658 \uD06C\uAE30 +18% \xB7 \uC801\uC744 12\uD53D\uC140 \uBC00\uCE68 \xB7 \uBCF4\uC2A4\uB294 2.4\uD53D\uC140",
      effects: [
        { key: "size", value: 1.18, op: "multiply" },
        { key: "knockback", value: 0.15, op: "add" }
      ],
      rarity: "common",
      price: 10,
      maxStack: 1
    },
    {
      id: "017",
      name: "\uC9C4\uC785 \uBC29\uD638 \uAC00\uBC1C",
      description: "\uBC29 \uC785\uC7A5 \uD6C4 3\uCD08\uAC04 \uD53C\uD574 \uAC10\uC18C +20%.",
      effects: [{ key: "entryArmor", value: 0.2, op: "add" }],
      rarity: "common",
      price: 10,
      maxStack: 1
    },
    {
      id: "022",
      name: "\uC815\uC804\uAE30 \uBE57",
      description: "14% \uD655\uB960\uB85C \uAC00\uAE4C\uC6B4 \uC801 1\uBA85\uC5D0\uAC8C \uD53C\uD574 35% \uC804\uAE30 \uD53C\uD574.",
      effects: [{ key: "miniLightning", value: 0.14, op: "add" }],
      rarity: "common",
      price: 10,
      maxStack: 1
    },
    {
      id: "028",
      name: "\uBE44\uB4EC \uD3ED\uD0C4",
      description: "\uC801 \uCC98\uCE58 \uC2DC 12% \uD655\uB960\uB85C \uC791\uC740 \uD30C\uD3B8 \uD3ED\uBC1C.",
      effects: [{ key: "killShards", value: 0.12, op: "add" }],
      rarity: "common",
      price: 10,
      maxStack: 1
    },
    {
      id: "030",
      name: "\uD0C8\uBAA8 \uC2A4\uD2B8\uB808\uC2A4",
      description: "\uCCB4\uB825 30% \uC774\uD558 \uACF5\uACA9 \uC18D\uB3C4 +15%.",
      effects: [{ key: "lowHpRate", value: 0.15, op: "add" }],
      rarity: "common",
      price: 10,
      maxStack: 1
    },
    {
      id: "033",
      name: "\uD5E4\uC5B4\uB864",
      description: "\uB9E4 6\uBC88\uC9F8 \uD0C4\uD658\uC774 0.35\uCD08\uAC04 \uD50C\uB808\uC774\uC5B4 \uC8FC\uBCC0\uC744 \uD68C\uC804\uD55C \uD6C4 \uBC1C\uC0AC.",
      effects: [{ key: "orbitEvery", value: 6, op: "add" }],
      rarity: "common",
      price: 10,
      maxStack: 1
    },
    {
      id: "035",
      name: "\uCD09\uB9E4 \uCF54\uD305\uC9C0",
      description: "\uD654\uC0C1\xB7\uC911\uB3C5\xB7\uCD9C\uD608 \uC9C0\uC18D \uD53C\uD574 +20%.",
      effects: [{ key: "dotPower", value: 0.2, op: "add" }],
      rarity: "common",
      price: 10,
      maxStack: 1
    },
    {
      id: "037",
      name: "\uC0F4\uD478\uCEA1",
      description: "\uBC29 \uC785\uC7A5 \uD6C4 \uCCAB \uD53C\uD574\uB97C 25% \uAC10\uC18C.",
      effects: [{ key: "firstGuard", value: 0.25, op: "add" }],
      rarity: "common",
      price: 10,
      maxStack: 1
    },
    {
      id: "041",
      name: "\uD68C\uC804\uBB38 \uAC00\uB974\uB9C8",
      description: "\uB9E4 5\uBC88\uC9F8 \uBC1C\uC0AC\uAC00 \uD50C\uB808\uC774\uC5B4 \uC8FC\uBCC0\uC744 \uBC18 \uBC14\uD034 \uD68C\uC804\uD55C \uB4A4 \uC801\uC744 \uD5A5\uD574 \uB0A0\uC544\uAC04\uB2E4. \uD53C\uD574 90%.",
      effects: [{ key: "halfOrbit", value: 5, op: "add" }],
      rarity: "uncommon",
      price: 18,
      maxStack: 1
    },
    {
      id: "042",
      name: "\uC5F0\uC18D \uAC00\uC18D \uB4DC\uB77C\uC774\uC5B4",
      description: "12\uBC88\uC9F8 \uACF5\uACA9\uB9C8\uB2E4 \uBE60\uB974\uAC8C 3\uC5F0\uBC1C. \uAC01 \uD53C\uD574 55%.",
      effects: [{ key: "burstEvery", value: 12, op: "add" }],
      rarity: "uncommon",
      price: 18,
      maxStack: 1
    },
    {
      id: "043",
      name: "\uAD11\uD0DD \uCF54\uD305\uC81C",
      description: "\uC801 \uD0C4\uD658 \uD53C\uACA9 \uC2DC 9% \uD655\uB960\uB85C \uD53C\uD574 \uBB34\uD6A8 \uD6C4 \uBC18\uC0AC.",
      effects: [{ key: "reflect", value: 0.09, op: "add" }],
      rarity: "uncommon",
      price: 18,
      maxStack: 1
    },
    {
      id: "044",
      name: "\uAE09\uC18D \uB0C9\uAC01\uD310",
      description: "\uB454\uD654 \uD655\uB960 +25% \xB7 \uB454\uD654 3\uD68C \uB204\uC801 \uC2DC \uBE59\uACB0.",
      effects: [
        { key: "slow", value: 0.25, op: "add" },
        { key: "freezeStacks", value: 3, op: "add" }
      ],
      rarity: "uncommon",
      price: 18,
      maxStack: 1
    },
    {
      id: "045",
      name: "\uBC29\uD0C4\uAC00\uBC1C",
      description: "\uBCF4\uD638\uB9C9\uC744 \uAC00\uC9C4 \uB3D9\uC548 \uD53C\uD574 \uAC10\uC18C +18%. \uCE35 \uC2DC\uC791 \uC2DC \uBCF4\uD638\uB9C9 1.",
      effects: [{ key: "shieldArmor", value: 0.18, op: "add" }],
      rarity: "uncommon",
      price: 18,
      maxStack: 1
    },
    {
      id: "046",
      name: "\uC30D\uADA4\uB3C4 \uD5E4\uC5B4\uB864",
      description: "\uC791\uC740 \uD5E4\uC5B4\uB864 2\uAC1C\uAC00 \uD50C\uB808\uC774\uC5B4\uB97C \uACF5\uC804\uD558\uBA70 \uC811\uCD09 \uD53C\uD574 25%/\uCD08.",
      effects: [
        { key: "orbitDamage", value: 0.25, op: "add" },
        { key: "orbitCount", value: 2, op: "add" }
      ],
      rarity: "uncommon",
      price: 18,
      maxStack: 1
    },
    {
      id: "047",
      name: "\uCE58\uC988\uC641\uC2A4",
      description: "\uD0C4\uD658 \uBA85\uC911 \uC9C0\uC810\uC5D0 0.7\uCD08\uAC04 \uB048\uC801\uD55C \uC7A5\uD310 \uC0DD\uC131. \uC801 \uC774\uB3D9 \uC18D\uB3C4 -20%.",
      effects: [{ key: "sticky", value: 0.2, op: "add" }],
      rarity: "uncommon",
      price: 18,
      maxStack: 1
    },
    {
      id: "048",
      name: "\uD544\uC2B9 \uD30C\uB9C8",
      description: "\uBCBD \uBC18\uC0AC \uD6C4 \uD0C4\uD658 \uD53C\uD574 +22%.",
      effects: [{ key: "bounceGain", value: 0.22, op: "add" }],
      rarity: "uncommon",
      price: 18,
      maxStack: 1
    },
    {
      id: "049",
      name: "\uAC80\uC740\uCF69 \uB18D\uCD95\uC561",
      description: "\uB2E4\uC911 \uC0AC\uACA9 \uD0C4\uD658 \uAC01\uAC01 \uD53C\uD574 +12%. `\uAC80\uC740\uCF69 \uB450\uC54C` \uBCF4\uC720 \uC2DC \uB450 \uAD6C\uCCB4\uAC00 \uAC01\uAC01 \uC791\uC740 \uCF69 1\uAC1C\uB97C \uCD94\uAC00 \uBC1C\uC0AC.",
      effects: [{ key: "multishotBonus", value: 0.12, op: "add" }],
      rarity: "uncommon",
      price: 18,
      maxStack: 1
    },
    {
      id: "050",
      name: "\uC2B9\uCC9C \uC55E\uBA38\uB9AC",
      description: "\uD0C4\uD658\uC774 \uC57D\uAC04 \uC704\uB85C \uD718\uC5C8\uB2E4\uAC00 \uAC00\uC7A5 \uAC00\uAE4C\uC6B4 \uC801\uC5D0\uAC8C \uC720\uB3C4. \uD53C\uD574 +8%.",
      effects: [
        { key: "arcHoming", value: 1, op: "add" },
        { key: "damage", value: 1.08, op: "multiply" }
      ],
      rarity: "uncommon",
      price: 18,
      maxStack: 1
    },
    {
      id: "051",
      name: "\uC9C0\uC18D \uD68C\uBCF5 \uC7A5\uCE58",
      description: "\uBC29 4\uAC1C\uB97C \uD074\uB9AC\uC5B4\uD560 \uB54C\uB9C8\uB2E4 35% \uD655\uB960 \uCCB4\uB825 1 \uD68C\uBCF5.",
      effects: [{ key: "healChanceRooms", value: 4, op: "add" }],
      rarity: "uncommon",
      price: 18,
      maxStack: 1
    },
    {
      id: "052",
      name: "\uD615\uAD11 \uAC00\uB974\uB9C8",
      description: "\uCE58\uBA85\uD0C0\uB97C \uB9DE\uC740 \uC801\uC5D0\uAC8C 3\uCD08\uAC04 \uD45C\uC2DD \xB7 \uD45C\uC2DD \uB300\uC0C1\uC774 \uBC1B\uB294 \uD53C\uD574 +12%",
      effects: [{ key: "mark", value: 0.12, op: "add" }],
      rarity: "uncommon",
      price: 18,
      maxStack: 1
    },
    {
      id: "053",
      name: "\uBD80\uC2DD \uD754\uC801 \uC99D\uD3ED\uAE30",
      description: "4\uCD08\uB9C8\uB2E4 \uC774\uB3D9 \uACBD\uB85C\uC5D0 \uD070 \uAC08\uC0C9 \uC6C5\uB369\uC774\uB97C \uD558\uB098 \uC0DD\uC131. 1.5\uCD08 \uC9C0\uC18D, \uCD08\uB2F9 \uD53C\uD574 45%.",
      effects: [{ key: "bigTrail", value: 0.45, op: "add" }],
      rarity: "uncommon",
      price: 18,
      maxStack: 1
    },
    {
      id: "055",
      name: "\uC601\uAD6C\uACE0\uC815 \uC2A4\uD504\uB808\uC774",
      description: "0.5\uCD08 \uC774\uC0C1 \uC815\uC9C0\uD558\uBA74 \uD53C\uD574 +24%. \uC6C0\uC9C1\uC774\uBA74 \uC989\uC2DC \uD574\uC81C.",
      effects: [{ key: "standDamage", value: 0.24, op: "add" }],
      rarity: "uncommon",
      price: 18,
      maxStack: 1
    },
    {
      id: "056",
      name: "\uCCA0\uBAA8 \uC18D \uBA38\uB9AC\uCE74\uB77D",
      description: "\uCCB4\uB825 70% \uC774\uC0C1\uC77C \uB54C \uD53C\uD574 \uAC10\uC18C +12%, \uD53C\uD574 +10%.",
      effects: [{ key: "healthyArmor", value: 0.12, op: "add" }],
      rarity: "uncommon",
      price: 18,
      maxStack: 1
    },
    {
      id: "057",
      name: "\uD68C\uC804 \uC758\uC790",
      description: "2\uCD08 \uC774\uC0C1 \uC5F0\uC18D \uC774\uB3D9\uD558\uBA74 \uD68C\uD53C \uD655\uB960 +10%. \uC815\uC9C0\uD558\uBA74 \uD574\uC81C.",
      effects: [{ key: "movingDodge", value: 0.1, op: "add" }],
      rarity: "uncommon",
      price: 18,
      maxStack: 1
    },
    {
      id: "058",
      name: "\uD64D\uC0C9 \uD5E4\uC5B4\uD1A0\uB2C9",
      description: "\uCE58\uBA85\uD0C0 \uBA85\uC911 \uC2DC 3\uCD08\uAC04 \uCD9C\uD608. \uCD9C\uD608 \uC801 \uCC98\uCE58 \uC2DC 5% \uD655\uB960 \uCCB4\uB825 1 \uD68C\uBCF5.",
      effects: [{ key: "bleed", value: 1, op: "add" }],
      rarity: "uncommon",
      price: 18,
      maxStack: 1
    },
    {
      id: "063",
      name: "\uC2E4\uD540 \uD55C \uD1B5",
      description: "\uAD00\uD1B5 +2, \uAD00\uD1B5\uB9C8\uB2E4 \uD53C\uD574 -12%.",
      effects: [
        { key: "pierce", value: 2, op: "add" },
        { key: "pierceFalloff", value: 0.88, op: "override" }
      ],
      rarity: "uncommon",
      price: 18,
      maxStack: 1
    },
    {
      id: "064",
      name: "\uD0F1\uD0F1\uD55C \uD5E4\uC5B4\uBC34\uB4DC",
      description: "\uBC18\uC0AC +1. \uBC18\uC0AC \uD6C4 \uD53C\uD574 +15%.",
      effects: [
        { key: "bounce", value: 1, op: "add" },
        { key: "bounceFalloff", value: 1.15, op: "override" }
      ],
      rarity: "uncommon",
      price: 18,
      maxStack: 1
    },
    {
      id: "066",
      name: "\uBA58\uD1A8 \uD3ED\uD48D",
      description: "\uD50C\uB808\uC774\uC5B4 150\uD53D\uC140 \uB0B4 \uC801 \uC774\uB3D9 \uC18D\uB3C4 -12%.",
      effects: [{ key: "auraSlow", value: 0.12, op: "add" }],
      rarity: "uncommon",
      price: 18,
      maxStack: 1
    },
    {
      id: "068",
      name: "\uBC29\uBCBD \uCC9C\uACF5\uAE30",
      description: "\uAD00\uD1B5 +1 \xB7 \uD0C4\uC18D -10%.",
      effects: [
        { key: "pierce", value: 1, op: "add" },
        { key: "bulletSpeed", value: 0.9, op: "multiply" }
      ],
      rarity: "uncommon",
      price: 18,
      maxStack: 1
    },
    {
      id: "069",
      name: "\uACE8\uC218 \uC5F0\uC18C\uAE30",
      description: "\uCD5C\uB300 \uCCB4\uB825 -1\uCE78 \xB7 \uACF5\uACA9\uB825 +35%.",
      effects: [
        { key: "maxHp", value: -1, op: "add" },
        { key: "damage", value: 0.35, op: "additive" }
      ],
      rarity: "uncommon",
      price: 18,
      maxStack: 1
    },
    {
      id: "070",
      name: "\uAC00\uBC1C \uC218\uAC70\uB4DC\uB860",
      description: "\uBCF4\uAE09\uD488\uC744 \uC790\uB3D9\uC73C\uB85C \uAC00\uC838\uC624\uB294 \uB3D9\uB8CC \uC0DD\uC131.",
      effects: [{ key: "drone", value: 1, op: "add" }],
      rarity: "uncommon",
      price: 18,
      maxStack: 1
    },
    {
      id: "071",
      name: "\uD30C\uC5F4\uB41C \uBA38\uB9AC\uB05D \uAC15\uD654\uD615",
      description: "\uBA85\uC911 \uC2DC \uD53C\uD574 35% \uD0C4\uD658 3\uAC1C \uBD84\uC5F4.",
      effects: [
        { key: "split", value: 1, op: "add" },
        { key: "splitCount", value: 3, op: "override" },
        { key: "splitDamage", value: 0.35, op: "override" }
      ],
      rarity: "rare",
      price: 28,
      maxStack: 1
    },
    {
      id: "073",
      name: "\uBAA8\uADFC \uB4DC\uB9B4",
      description: "\uAD00\uD1B5 +4. \uAD00\uD1B5\uB9C8\uB2E4 \uD0C4\uC18D +8%.",
      effects: [
        { key: "pierce", value: 4, op: "add" },
        { key: "pierceSpeed", value: 0.08, op: "add" }
      ],
      rarity: "rare",
      price: 28,
      maxStack: 1
    },
    {
      id: "074",
      name: "\uB530\uB77C\uC7C1\uC774 \uAC00\uBC1C",
      description: "\uD50C\uB808\uC774\uC5B4 \uACF5\uACA9 0.18\uCD08 \uB4A4 \uD53C\uD574 28%\uB85C \uBAA8\uBC29.",
      effects: [{ key: "echo", value: 0.28, op: "add" }],
      rarity: "rare",
      price: 28,
      maxStack: 1
    },
    {
      id: "075",
      name: "\uC790\uB3D9 \uACE0\uB370\uAE30",
      description: "\uACF5\uACA9\uC6A9 \uACF5\uC804 \uB3D9\uB8CC 1\uAC1C. \uC811\uCD09 \uD53C\uD574 55%/\uCD08.",
      effects: [
        { key: "orbitDamage", value: 0.55, op: "add" },
        { key: "orbitCount", value: 1, op: "add" }
      ],
      rarity: "rare",
      price: 28,
      maxStack: 1
    },
    {
      id: "076",
      name: "\uD3ED\uBC1C \uD5E4\uC5B4\uB864",
      description: "4.5\uCD08\uB9C8\uB2E4 \uC801\uC5D0\uAC8C \uB3CC\uC9C4 \uD6C4 \uD53C\uD574 170% \uD3ED\uBC1C.",
      effects: [{ key: "dashExplosion", value: 1.7, op: "add" }],
      rarity: "rare",
      price: 28,
      maxStack: 1
    },
    {
      id: "079",
      name: "\uD0C8\uBAA8 \uBCF4\uD5D8\uC57D\uAD00",
      description: "\uAC15\uD654 \uC801 \uCD9C\uD604 \uD655\uB960 +25% \xB7 \uAC15\uD654 \uC801 \uCC98\uCE58 \uBCF4\uC0C1 \uC99D\uAC00",
      effects: [{ key: "champion", value: 0.25, op: "add" }],
      rarity: "rare",
      price: 28,
      maxStack: 1
    },
    {
      id: "080",
      name: "\uD5E4\uC5B4\uCEEC\uB809\uD130\uC758 \uC9D1\uCC29",
      description: "\uC11C\uB85C \uB2E4\uB978 \uC544\uC774\uD15C \uBD84\uB958 4\uAC1C\uBD80\uD130 \uBD84\uB958\uB2F9 \uD53C\uD574 +3%, \uCD5C\uB300 +30%.",
      effects: [{ key: "tagDamage", value: 0.03, op: "add" }],
      rarity: "rare",
      price: 28,
      maxStack: 1
    },
    {
      id: "081",
      name: "\uCD5C\uD6C4\uC758 \uAC00\uBC1C",
      description: "\uCE58\uBA85\uC801 \uD53C\uD574 \uD55C \uD310\uB2F9 1\uD68C \uBB34\uD6A8\uD654. \uC774\uD6C4 \uBCF4\uD638\uB9C9 2 \uD68D\uB4DD.",
      effects: [{ key: "revive", value: 1, op: "add" }],
      rarity: "rare",
      price: 28,
      maxStack: 1
    },
    {
      id: "082",
      name: "\uBAA8\uADFC \uC7AC\uC0DD\uC8FC\uC0AC",
      description: "\uBCF4\uC2A4 \uCC98\uCE58 \uC2DC \uCCB4\uB825 3 \uD68C\uBCF5. \uCD08\uACFC \uD68C\uBCF5\uC740 \uBCF4\uD638\uB9C9 \uCD5C\uB300 1.",
      effects: [{ key: "bossHeal", value: 3, op: "add" }],
      rarity: "rare",
      price: 28,
      maxStack: 1
    },
    {
      id: "083",
      name: "\uC644\uBCBD\uD55C \uAC00\uC6B4\uB370 \uAC00\uB974\uB9C8",
      description: "\uC815\uBA74 \uACF5\uACA9\uACFC \uB3D9\uC2DC\uC5D0 \uC88C\uC6B0 90\uB3C4 \uBC29\uD5A5 \uD53C\uD574 35% \uD0C4\uD658 \uBC1C\uC0AC.",
      effects: [{ key: "side", value: 0.35, op: "add" }],
      rarity: "rare",
      price: 28,
      maxStack: 1
    },
    {
      id: "084",
      name: "\uCD08\uD0C4 \uAC10\uBCC4\uACBD",
      description: "\uCCB4\uB825\uC774 \uAC00\uB4DD \uCC2C \uC801\uC5D0\uAC8C \uCCAB \uC9C1\uACA9 \uD53C\uD574 +65% \xB7 \uACF5\uACA9\uC18D\uB3C4 -10%.",
      effects: [
        { key: "execution", value: 0.65, op: "add" },
        { key: "rate", value: 0.9, op: "multiply" }
      ],
      rarity: "rare",
      price: 28,
      maxStack: 1
    },
    {
      id: "085",
      name: "\uB450\uD53C \uBC18\uC0AC\uACBD",
      description: "\uC801 \uD0C4\uD658\uC774 \uB9E4\uC6B0 \uAC00\uAE4C\uC774 \uC624\uBA74 12% \uD655\uB960 \uC790\uB3D9 \uBC18\uC0AC. 0.3\uCD08 \uB0B4\uBD80 \uC7AC\uC0AC\uC6A9 \uB300\uAE30\uC2DC\uAC04.",
      effects: [{ key: "autoReflect", value: 0.12, op: "add" }],
      rarity: "rare",
      price: 28,
      maxStack: 1
    },
    {
      id: "086",
      name: "\uCC9C \uAC1C\uC758 \uBA38\uB9AC\uB048",
      description: "\uD50C\uB808\uC774\uC5B4\uB97C \uACF5\uC804\uD558\uB294 4\uAC1C\uC758 \uBC29\uC5B4\uCCB4. \uAC01\uAC01 \uC77C\uC815 \uC7AC\uC0AC\uC6A9 \uB300\uAE30\uC2DC\uAC04 \uD6C4 \uC801\uD0C4 1\uAC1C \uC81C\uAC70.",
      effects: [{ key: "blockOrbit", value: 4, op: "add" }],
      rarity: "exotic",
      price: 40,
      maxStack: 1
    },
    {
      id: "087",
      name: "\uBE14\uB799\uD640 \uC544\uD504\uB85C",
      description: "\uD0C4\uD658 \uD06C\uAE30 +70%, \uD53C\uD574 +40%, \uACF5\uACA9 \uC18D\uB3C4 -25%. \uD070 \uD0C4\uD658\uC774 \uC791\uC740 \uC801 \uD0C4\uD658 \uC77C\uBD80\uB97C \uD761\uC218\uD55C\uB2E4.",
      effects: [
        { key: "size", value: 1.7, op: "multiply" },
        { key: "damage", value: 1.4, op: "multiply" },
        { key: "rate", value: 0.75, op: "multiply" },
        { key: "absorb", value: 1, op: "add" }
      ],
      rarity: "exotic",
      price: 40,
      maxStack: 1
    },
    {
      id: "088",
      name: "\uC790\uB3D9 \uBBF8\uC6A9\uC2E4 \uC778\uACF5\uC9C0\uB2A5",
      description: "\uAC00\uC7A5 \uC704\uD5D8\uB3C4\uAC00 \uB192\uC740 \uC801\uC744 \uC6B0\uC120 \uACF5\uACA9\uD558\uB294 \uD3EC\uD0D1 \uB3D9\uB8CC \uC0DD\uC131.",
      effects: [{ key: "turret", value: 1, op: "add" }],
      rarity: "exotic",
      price: 40,
      maxStack: 1
    },
    {
      id: "089",
      name: "\uBAA8\uBC1C\uBCF5\uC81C\uAE30",
      description: "\uACF5\uACA9 \uC2DC 25% \uD655\uB960\uB85C \uB3D9\uC77C \uD0C4\uD658\uC744 0.1\uCD08 \uB4A4 70% \uD53C\uD574\uB85C \uBCF5\uC81C.",
      effects: [{ key: "duplicate", value: 0.25, op: "add" }],
      rarity: "exotic",
      price: 40,
      maxStack: 1
    },
    {
      id: "090",
      name: "\uD5E4\uC5B4\uB77C\uC778 \uC7AC\uC124\uACC4",
      description: "\uCD5C\uB300 \uCCB4\uB825 2\uB97C \uC783\uACE0 \uD53C\uD574 +35%, \uACF5\uACA9 \uC18D\uB3C4 +15%. \uCCB4\uB825\uC774 2 \uC774\uD558\uB77C\uBA74 \uB4F1\uC7A5\uD558\uC9C0 \uC54A\uB294\uB2E4.",
      effects: [
        { key: "maxHp", value: -2, op: "add" },
        { key: "damage", value: 1.35, op: "multiply" },
        { key: "rate", value: 1.15, op: "multiply" }
      ],
      rarity: "exotic",
      price: 40,
      maxStack: 1
    },
    {
      id: "091",
      name: "\uB450\uD53C \uC2DC\uAC04\uC815\uC9C0 \uC2A4\uD504\uB808\uC774",
      description: "\uC0AC\uC6A9 \uD6A8\uACFC. \uBC29\uC758 \uC801\uACFC \uC801 \uD0C4\uD658\uC744 2.5\uCD08 \uC815\uC9C0. \uBCF4\uC2A4\uB294 60% \uB454\uD654.",
      effects: [{ key: "activeFreeze", value: 1, op: "add" }],
      rarity: "exotic",
      price: 40,
      maxStack: 1
    },
    {
      id: "092",
      name: "\uBB34\uD55C\uC5F0\uC7A5 \uAC00\uBC1C",
      description: "\uC0AC\uAC70\uB9AC \xD71.8. \uC0AC\uAC70\uB9AC \uB05D\uC5D0\uC11C 50% \uD53C\uD574\uB85C \uB418\uB3CC\uC544\uC628\uB2E4.",
      effects: [
        { key: "range", value: 1.8, op: "multiply" },
        { key: "return", value: 1, op: "add" }
      ],
      rarity: "exotic",
      price: 40,
      maxStack: 1
    },
    {
      id: "093",
      name: "\uB9CC\uB2A5\uC0F4\uD478 \uC77C\uACF1 \uAC00\uC9C0 \uAE30\uB2A5",
      description: "\uACF5\uACA9 \uC2DC \uD654\uC0C1/\uC911\uB3C5/\uB454\uD654/\uAC10\uC804/\uCD9C\uD608 \uC911 \uD558\uB098\uB97C 30% \uD655\uB960\uB85C \uC801\uC6A9. \uC11C\uB85C \uB2E4\uB978 3 \uC0C1\uD0DC\uC774\uC0C1\uAC00 \uC788\uC73C\uBA74 \uCD94\uAC00 \uD3ED\uBC1C.",
      effects: [{ key: "randomStatus", value: 0.3, op: "add" }],
      rarity: "exotic",
      price: 40,
      maxStack: 1
    },
    {
      id: "094",
      name: "\uB450\uD53C \uBC1C\uC804\uC18C",
      description: "\uD53C\uACA9 \uC2DC 8\uCD08\uAC04 \uC804\uAE30 \uCDA9\uC804. \uACF5\uACA9\uB9C8\uB2E4 35% \uC5F0\uC1C4 \uAC10\uC804 \uCD94\uAC00.",
      effects: [{ key: "chargeLightning", value: 0.35, op: "add" }],
      rarity: "exotic",
      price: 40,
      maxStack: 1
    },
    {
      id: "095",
      name: "\uBAA8\uB0AD \uC99D\uC2DD \uBC30\uC591\uAE30",
      description: "\uC801 \uCC98\uCE58 \uC2DC 10% \uD655\uB960\uB85C 10\uCD08 \uB3D9\uC548 \uC544\uAD70 \uBAA8\uADFC \uB3D9\uB8CC \uC0DD\uC131. \uCD5C\uB300 5\uAE30.",
      effects: [{ key: "sprout", value: 0.1, op: "add" }],
      rarity: "exotic",
      price: 40,
      maxStack: 1
    },
    {
      id: "096",
      name: "\uC30D\uB465\uC774 \uBAA8\uB0AD",
      description: "\uD604\uC7AC \uBCF4\uC720 \uBE44-\uAE30\uC774 \uC544\uC774\uD15C \uD558\uB098\uC758 \uD575\uC2EC \uD6A8\uACFC\uB97C \uBB34\uC791\uC704\uB85C \uC120\uD0DD\uD574 65% \uD6A8\uC728\uB85C \uBCF5\uC81C.",
      effects: [{ key: "cloneEffect", value: 0.65, op: "add" }],
      rarity: "anomaly",
      price: 55,
      maxStack: 1
    },
    {
      id: "097",
      name: "\uD0C8\uBAA8 \uC774\uC804\uC73C\uB85C",
      description: "\uBC29 \uD074\uB9AC\uC5B4 \uC2DC \uD574\uB2F9 \uBC29\uC5D0\uC11C \uCD5C\uADFC 3\uCD08 \uB3D9\uC548 \uC783\uC740 \uCCB4\uB825\uC758 50%\uB97C \uBCF5\uAD6C. \uBCF4\uC2A4\uB294 \uB2E8\uACC4\uB2F9 1\uD68C \uC81C\uD55C.",
      effects: [{ key: "rewind", value: 0.5, op: "add" }],
      rarity: "anomaly",
      price: 55,
      maxStack: 1
    },
    {
      id: "098",
      name: "\uC601\uC6D0\uD788 \uC790\uB77C\uB294 \uBA38\uB9AC",
      description: "\uBCF4\uC2A4 \uCC98\uCE58\uB9C8\uB2E4 \uD53C\uD574 +8%, \uACF5\uACA9 \uC18D\uB3C4 +7%, \uC774\uB3D9 \uC18D\uB3C4 +5%, \uCE58\uBA85\uD0C0 \uD655\uB960 +4%, \uCD5C\uB300 \uCCB4\uB825 +1 \uC911 \uD558\uB098 \uBB34\uC791\uC704 \uC601\uAD6C \uD68D\uB4DD.",
      effects: [{ key: "growth", value: 1, op: "add" }],
      rarity: "anomaly",
      price: 55,
      maxStack: 1
    },
    {
      id: "099",
      name: "\uC624\uB298\uC758 \uD5E4\uC5B4\uC2A4\uD0C0\uC77C",
      description: "\uBC29 \uC785\uC7A5 \uC2DC \uC720\uB3C4/\uBC18\uC0AC/\uAD00\uD1B5/\uBD84\uC5F4/\uD3ED\uBC1C/\uACF5\uC804 \uC911 \uD558\uB098\uB97C \uBB34\uC791\uC704 \uD68D\uB4DD. \uBC29\uB9C8\uB2E4 \uBCC0\uACBD.",
      effects: [{ key: "randomRoom", value: 1, op: "add" }],
      rarity: "anomaly",
      price: 55,
      maxStack: 1
    },
    {
      id: "100",
      name: "\uB9C8\uC9C0\uB9C9 \uD55C \uC62C",
      description: "\uBAA8\uB4E0 \uBD84\uB958 \uAE30\uBC18 \uC2DC\uB108\uC9C0\uC758 \uC694\uAD6C \uBD84\uB958 \uC218\uB97C 1 \uAC10\uC18C. \uCCB4\uB825 1\uC5D0\uC11C \uC2DC\uB108\uC9C0 \uD6A8\uACFC \uD6A8\uC728 +20%. \uC124\uBA85: `\uC544\uC9C1 \uB0A8\uC544 \uC788\uB2E4.`",
      effects: [{ key: "synergyDiscount", value: 1, op: "add" }],
      rarity: "anomaly",
      price: 55,
      maxStack: 1
    },
    {
      id: "101",
      name: "\uBD88\uC528 \uBA38\uB9AC\uD540",
      description: "\uD654\uC0C1 \uD655\uB960 +15% \xB7 \uC0C1\uD0DC \uC9C0\uC18D\uC2DC\uAC04 +10%",
      effects: [
        { key: "burn", value: 0.15, op: "add" },
        { key: "duration", value: 1.1, op: "multiply" }
      ],
      rarity: "uncommon",
      price: 18,
      maxStack: 1
    },
    {
      id: "102",
      name: "\uAC08\uB77C\uC9C4 \uC2EC\uC9C0",
      description: "\uBA85\uC911 \uC2DC \uD53C\uD574 22% \uD30C\uD3B8 \uB450 \uAC1C \uC0DD\uC131",
      effects: [
        { key: "split", value: 1, op: "add" },
        { key: "splitDamage", value: 0.22, op: "override" }
      ],
      rarity: "uncommon",
      price: 18,
      maxStack: 1
    },
    {
      id: "103",
      name: "\uAD6C\uB9AC \uBD09\uD569\uCE68",
      description: "\uAD00\uD1B5 +1 \xB7 \uD0C4\uC18D +8%",
      effects: [
        { key: "pierce", value: 1, op: "add" },
        { key: "bulletSpeed", value: 1.08, op: "multiply" }
      ],
      rarity: "uncommon",
      price: 18,
      maxStack: 1
    },
    {
      id: "104",
      name: "\uC815\uC804\uAE30 \uAD6C\uC2AC",
      description: "\uC5F0\uC1C4 \uAC10\uC804 \uD655\uB960 +12% \xB7 \uD53C\uD574 +4%",
      effects: [
        { key: "lightning", value: 0.12, op: "add" },
        { key: "damage", value: 1.04, op: "multiply" }
      ],
      rarity: "uncommon",
      price: 18,
      maxStack: 1
    },
    {
      id: "105",
      name: "\uBC18\uC0AC \uC720\uB9AC\uBE57",
      description: "\uBCBD \uBC18\uC0AC +1 \xB7 \uC0AC\uAC70\uB9AC +10%",
      effects: [
        { key: "bounce", value: 1, op: "add" },
        { key: "range", value: 1.1, op: "multiply" }
      ],
      rarity: "uncommon",
      price: 18,
      maxStack: 1
    },
    {
      id: "106",
      name: "\uC790\uC11D \uBA38\uB9AC\uB760",
      description: "\uC720\uB3C4 \uAC15\uB3C4 +15% \xB7 \uD0C4\uD658 \uD06C\uAE30 +10%",
      effects: [
        { key: "homing", value: 0.15, op: "add" },
        { key: "size", value: 1.1, op: "multiply" }
      ],
      rarity: "uncommon",
      price: 18,
      maxStack: 1
    },
    {
      id: "107",
      name: "\uC11C\uB9AC \uC0F4\uD478",
      description: "\uB454\uD654 \uD655\uB960 +25%",
      effects: [{ key: "slow", value: 0.25, op: "add" }],
      rarity: "uncommon",
      price: 18,
      maxStack: 1
    },
    {
      id: "108",
      name: "\uB0C9\uAC01 \uC9D1\uAC8C",
      description: "\uB454\uD654 \uC138 \uBC88 \uC911\uCCA9 \uC2DC \uBE59\uACB0 \xB7 \uBCF4\uC2A4\uB294 \uAC10\uC18D",
      effects: [{ key: "freezeStacks", value: 3, op: "override" }],
      rarity: "uncommon",
      price: 18,
      maxStack: 1
    },
    {
      id: "109",
      name: "\uC794\uD5A5 \uAC00\uBC1C",
      description: "\uBC1C\uC0AC \uD6C4 \uD53C\uD574 18%\uC758 \uBA54\uC544\uB9AC \uD0C4\uD658 \uC0DD\uC131",
      effects: [{ key: "echo", value: 0.18, op: "add" }],
      rarity: "uncommon",
      price: 18,
      maxStack: 1
    },
    {
      id: "110",
      name: "\uC30D\uAC08\uB798 \uB9AC\uBCF8",
      description: "\uB098\uB780\uD55C \uD0C4\uD658 \uB450 \uAC1C \xB7 \uAC01 \uD53C\uD574 55%",
      effects: [{ key: "double", value: 1, op: "add" }],
      rarity: "uncommon",
      price: 18,
      maxStack: 1
    },
    {
      id: "111",
      name: "\uD68C\uC218\uBC18 \uBC30\uC9C0",
      description: "\uBCF4\uAE09\uD488\uC744 \uC790\uB3D9 \uD68C\uC218\uD558\uB294 \uB3D9\uB8CC \xB7 \uD68C\uC218 \uBC18\uACBD +20%",
      effects: [
        { key: "drone", value: 1, op: "add" },
        { key: "pickup", value: 1.2, op: "multiply" }
      ],
      rarity: "uncommon",
      price: 18,
      maxStack: 1
    },
    {
      id: "112",
      name: "\uD638\uC704 \uBA38\uB9AC\uB048",
      description: "\uACF5\uC804 \uB3D9\uB8CC \uD558\uB098 \xB7 \uCD08\uB2F9 \uC811\uCD09 \uD53C\uD574 35%",
      effects: [
        { key: "orbitCount", value: 1, op: "add" },
        { key: "orbitDamage", value: 0.35, op: "add" }
      ],
      rarity: "uncommon",
      price: 18,
      maxStack: 1
    },
    {
      id: "113",
      name: "\uD68C\uADC0 \uC808\uB2E8\uB0A0",
      description: "\uD0C4\uD658\uC774 \uB418\uB3CC\uC544\uC640 \uC7AC\uBA85\uC911 \xB7 \uAD00\uD1B5 +1 \xB7 \uAC01 \uD53C\uD574 65%",
      rarity: "uncommon",
      price: 20,
      maxStack: 1,
      effects: [
        { key: "boomerang", value: 1, op: "add" },
        { key: "pierce", value: 1, op: "add" },
        { key: "damage", value: 0.65, op: "multiply" }
      ]
    },
    {
      id: "114",
      name: "\uD761\uCC29 \uB1CC\uAD00",
      description: "\uBA85\uC911 \uBD80\uC704\uC5D0 \uD3ED\uC57D \uBD80\uCC29 \xB7 0.7\uCD08 \uB4A4 \uD53C\uD574 70% \uBC94\uC704 \uD3ED\uBC1C",
      rarity: "uncommon",
      price: 20,
      maxStack: 1,
      effects: [
        { key: "adhesive", value: 0.7, op: "add" },
        { key: "damage", value: 0.8, op: "multiply" }
      ]
    },
    {
      id: "115",
      name: "\uCD95\uC804 \uCD1D\uC5F4",
      description: "\uC0AC\uACA9\uC744 \uB20C\uB7EC \uCDA9\uC804\uD558\uACE0 \uB5BC\uC5B4 \uBC1C\uC0AC \xB7 \uC644\uCDA9 \uD53C\uD574 3.4\uBC30 \xB7 \uAD00\uD1B5 +2",
      rarity: "uncommon",
      price: 20,
      maxStack: 1,
      effects: [{ key: "charged", value: 1, op: "add" }]
    },
    {
      id: "116",
      name: "\uC544\uD06C \uC5F0\uACB0\uAE30",
      description: "\uC11C\uB85C \uB2E4\uB978 \uB450 \uC801\uC744 \uB9DE\uD788\uBA74 \uC804\uAE30 \uC5F0\uACB0\uC120 \uC0DD\uC131",
      rarity: "uncommon",
      price: 20,
      maxStack: 1,
      effects: [{ key: "tether", value: 0.3, op: "add" }]
    },
    {
      id: "117",
      name: "\uCD94\uC801 \uD30C\uD3B8\uC2E4",
      description: "\uD56D\uC0C1 \uBD84\uC5F4 \xB7 \uC720\uB3C4 \uD30C\uD3B8 \uB450 \uAC1C \xB7 \uD30C\uD3B8 \uD53C\uD574 22%",
      rarity: "uncommon",
      price: 20,
      maxStack: 1,
      effects: [
        { key: "split", value: 1, op: "add" },
        { key: "splitDamage", value: 0.22, op: "override" },
        { key: "seekingShards", value: 0.35, op: "add" }
      ]
    },
    {
      id: "118",
      name: "\uACF5\uBA85 \uAE30\uD3ED\uAE30",
      description: "\uC791\uC740 \uBA85\uC911 \uD3ED\uBC1C \xB7 \uBD80\uCC29 \uD3ED\uC57D\uC774 \uAC00\uAE4C\uC6B4 \uD3ED\uC57D\uC744 \uC5F0\uC1C4 \uAE30\uD3ED",
      rarity: "uncommon",
      price: 20,
      maxStack: 1,
      effects: [
        { key: "explosion", value: 0.18, op: "add" },
        { key: "chainFuse", value: 1, op: "add" }
      ]
    },
    {
      id: "119",
      name: "\uBCBD\uBA74 \uC804\uADF9",
      description: "\uBC18\uC0AC +1 \xB7 \uBCBD\uC5D0 \uB9DE\uD78C \uB450 \uC9C0\uC810 \uC0AC\uC774 \uC804\uAE30 \uC5F0\uACB0\uC120",
      rarity: "uncommon",
      price: 20,
      maxStack: 1,
      effects: [
        { key: "bounce", value: 1, op: "add" },
        { key: "wallLink", value: 0.25, op: "add" }
      ]
    },
    {
      id: "120",
      name: "\uAD00\uC131 \uD68C\uC218 \uCF54\uC77C",
      description: "\uC0AC\uAC70\uB9AC +20% \xB7 \uADC0\uD658\uD0C4\uC744 \uD68C\uC218\uD558\uBA74 \uC720\uB3C4 \uD30C\uD3B8 \uC138 \uAC1C",
      rarity: "uncommon",
      price: 20,
      maxStack: 1,
      effects: [
        { key: "range", value: 1.2, op: "multiply" },
        { key: "returnNova", value: 1, op: "add" }
      ]
    },
    {
      id: "121",
      name: "\uAD11\uC120 \uAC01\uC778\uAE30",
      description: "\uC0AC\uACA9\uC744 \uC989\uBC1C \uAD00\uD1B5 \uAD11\uC120\uC73C\uB85C \uAD50\uCCB4 \xB7 \uBC1C\uC0AC \uC18D\uB3C4 -25% \xB7 \uBD84\uC5F4\uC740 \uAC00\uC9C0 \uAD11\uC120\uC73C\uB85C \uBCC0\uD658",
      rarity: "rare",
      price: 22,
      maxStack: 1,
      effects: [
        { key: "beam", value: 1, op: "add" },
        { key: "rate", value: 0.75, op: "multiply" }
      ]
    },
    {
      id: "122",
      name: "\uD658\uD615 \uCD08\uC810\uAE30",
      description: "\uC774\uB3D9\uD558\uB294 \uB808\uC774\uC800 \uACE0\uB9AC \xB7 \uC911\uC2EC\uC740 \uBE57\uB098\uAC10 \xB7 \uAC01 \uD0C0\uACA9 \uD53C\uD574 28% \xB7 \uBC1C\uC0AC \uC18D\uB3C4 -20%",
      rarity: "rare",
      price: 22,
      maxStack: 1,
      effects: [
        { key: "ringShot", value: 1, op: "add" },
        { key: "rate", value: 0.8, op: "multiply" }
      ]
    },
    {
      id: "123",
      name: "\uACE1\uC0AC \uD0C4\uB450",
      description: "\uACE1\uC0AC \uCC29\uD0C4 \uD53C\uD574 2.8\uBC30 \xB7 \uBC1C\uC0AC \uC18D\uB3C4 -40% \xB7 \uAD11\uC120\xB7\uACE0\uB9AC\xB7\uCE7C\uB0A0\uC744 \uCC29\uD0C4 \uB54C \uBC29\uCD9C",
      rarity: "exotic",
      price: 26,
      maxStack: 1,
      effects: [
        { key: "lobShot", value: 1, op: "add" },
        { key: "rate", value: 0.6, op: "multiply" }
      ]
    },
    {
      id: "124",
      name: "\uBD84\uC1C4 \uC9C4\uB3D9\uAC80",
      description: "\uC0AC\uACA9\uC744 \uC9E7\uC740 \uADFC\uC811 \uBCA0\uAE30\uB85C \uAD50\uCCB4 \xB7 \uD53C\uD574 1.5\uBC30 \xB7 \uCDA9\uC804 \uC2DC \uD68C\uC804 \uBCA0\uAE30",
      rarity: "rare",
      price: 22,
      maxStack: 1,
      effects: [
        { key: "meleeShot", value: 1, op: "add" },
        { key: "range", value: 0.7, op: "multiply" }
      ]
    },
    {
      id: "125",
      name: "\uC6D0\uACA9 \uBAA8\uB0AD\uD575",
      description: "\uC870\uC900\uC810\uC73C\uB85C \uC6C0\uC9C1\uC774\uB294 \uACF5\uACA9 \uD575 \xB7 \uC0AC\uACA9 \uC911 \uC811\uCD09 \uACF5\uACA9 \xB7 \uAD11\uC120\xB7\uCE7C\uB0A0\uC744 \uD575\uC5D0 \uC7A5\uCC29",
      rarity: "exotic",
      price: 26,
      maxStack: 1,
      effects: [
        { key: "remoteOrb", value: 1, op: "add" },
        { key: "damage", value: 0.75, op: "multiply" }
      ]
    },
    {
      id: "126",
      name: "\uC0AC\uC911 \uBD84\uBC30\uAE30",
      description: "\uBC1C\uC0AC\uCCB4 +3\uAC1C \xB7 \uAC01 \uD53C\uD574 48% \xB7 \uBC1C\uC0AC \uC18D\uB3C4 -20% \xB7 \uBC18\uBCF5 \uACF5\uACA9\uACFC \uACF1\uC73C\uB85C \uACB0\uD569",
      rarity: "uncommon",
      price: 22,
      maxStack: 1,
      effects: [
        { key: "extraProjectiles", value: 3, op: "add" },
        { key: "damage", value: 0.48, op: "multiply" },
        { key: "rate", value: 0.8, op: "multiply" }
      ]
    },
    {
      id: "127",
      name: "\uC7AC\uACA9\uBC1C \uCEA0",
      description: "\uD55C \uBC88\uC758 \uACF5\uACA9 \uC804\uCCB4\uB97C \uD55C \uCC28\uB840 \uB354 \uBC1C\uC0AC \xB7 \uD53C\uD574 -10% \xB7 \uBC1C\uC0AC \uC18D\uB3C4 -35%",
      rarity: "uncommon",
      price: 22,
      maxStack: 1,
      effects: [
        { key: "repeatShots", value: 1, op: "add" },
        { key: "damage", value: 0.9, op: "multiply" },
        { key: "rate", value: 0.65, op: "multiply" }
      ]
    },
    {
      id: "128",
      name: "\uC0BC\uAC08\uB798 \uBD84\uAE30\uD310",
      description: "\uBC1C\uC0AC\uCCB4 +3\uAC1C \xB7 \uAC01 \uD53C\uD574 50% \xB7 \uC0AC\uAC70\uB9AC -15% \xB7 \uBC1C\uC0AC \uAC1C\uC218\uB07C\uB9AC\uB294 \uD569\uC0B0",
      rarity: "uncommon",
      price: 22,
      maxStack: 1,
      effects: [
        { key: "extraProjectiles", value: 3, op: "add" },
        { key: "damage", value: 0.5, op: "multiply" },
        { key: "range", value: 0.85, op: "multiply" }
      ]
    },
    {
      id: "129",
      name: "\uBB34\uC911\uB825 \uC644\uCDA9\uC2E4",
      description: "\uC0AC\uACA9\uC744 \uB204\uB974\uBA74 \uACF5\uACA9\uC744 \uACF5\uC911\uC5D0 \uCD5C\uB300 12\uAC1C \uC800\uC7A5 \xB7 \uB5BC\uBA74 \uC77C\uC81C \uBC1C\uC0AC \xB7 \uBC1C\uC0AC \uC18D\uB3C4 -15%",
      rarity: "rare",
      price: 22,
      maxStack: 1,
      effects: [
        { key: "stasis", value: 1, op: "add" },
        { key: "rate", value: 0.85, op: "multiply" }
      ]
    },
    {
      id: "130",
      name: "\uD3EC\uC2DD\uC131 \uC751\uC9D1\uD575",
      description: "\uD0C4\uD658\uC774 \uAC10\uC18D\uD558\uBA70 \uB2E4\uB978 \uD0C4\uC744 \uD761\uC218 \xB7 \uB124 \uBC88 \uD761\uC218\uD558\uAC70\uB098 \uC2DC\uAC04\uC774 \uC9C0\uB098\uBA74 \uBD84\uC5F4 \xB7 \uD53C\uD574 -15%",
      rarity: "rare",
      price: 22,
      maxStack: 1,
      effects: [
        { key: "fusion", value: 1, op: "add" },
        { key: "damage", value: 0.85, op: "multiply" }
      ]
    },
    {
      id: "131",
      name: "\uC790\uB3D9 \uCD95\uC804\uAE30",
      description: "\uB204\uB974\uACE0 \uC788\uC73C\uBA74 \uC790\uB3D9 \uCDA9\uC804\xB7\uBC1C\uC0AC \xB7 \uCDA9\uC804 \uC2DC\uAC04\uC740 \uACF5\uACA9 \uC18D\uB3C4\uC5D0 \uBC18\uBE44\uB840 \xB7 \uBC1C\uC0AC \uC18D\uB3C4 -15%",
      rarity: "uncommon",
      price: 22,
      maxStack: 1,
      effects: [
        { key: "autoCharge", value: 1, op: "add" },
        { key: "charged", value: 1, op: "add" },
        { key: "rate", value: 0.85, op: "multiply" }
      ]
    },
    {
      id: "132",
      name: "\uCC28\uC6D0 \uC811\uC18D\uC790",
      description: "\uBCBD\uC744 \uB118\uC740 \uACF5\uACA9\uC774 \uBC18\uB300\uD3B8\uC5D0\uC11C \uD55C \uBC88 \uB354 \uB4F1\uC7A5 \xB7 \uC0AC\uAC70\uB9AC -20% \xB7 \uB0B4\uBD80 \uAD6C\uC870\uBB3C\uC740 \uB9C9\uC74C",
      rarity: "exotic",
      price: 26,
      maxStack: 1,
      effects: [
        { key: "wrap", value: 1, op: "add" },
        { key: "range", value: 0.8, op: "multiply" }
      ]
    },
    {
      id: "133",
      name: "\uC2EC\uBD80 \uD3ED\uC57D",
      description: "\uB290\uB9B0 \uD3ED\uD0C4 \uC0AC\uACA9 \xB7 \uD3ED\uBC1C \uD53C\uD574 2.8\uBC30 \xB7 \uADFC\uC811 \uD3ED\uBC1C\uC740 \uC790\uD574 \xB7 \uBC1C\uC0AC \uC18D\uB3C4 -40%",
      rarity: "rare",
      price: 22,
      maxStack: 1,
      effects: [
        { key: "bombShot", value: 1, op: "add" },
        { key: "rate", value: 0.6, op: "multiply" },
        { key: "bulletSpeed", value: 0.6, op: "multiply" }
      ]
    },
    {
      id: "134",
      name: "\uADFC\uAC70\uB9AC \uC9D1\uC18D\uB80C\uC988",
      description: "\uADFC\uAC70\uB9AC \uD53C\uD574 \uCD5C\uB300 2\uBC30, \uC0AC\uAC70\uB9AC \uB05D\uC5D0\uC11C\uB294 35% \xB7 \uC0AC\uAC70\uB9AC -20% \xB7 \uC800\uC7A5\uD0C4\uC740 \uAC70\uB9AC \uC190\uC2E4 \uC5C6\uC74C",
      rarity: "uncommon",
      price: 22,
      maxStack: 1,
      effects: [
        { key: "rangePower", value: 1, op: "add" },
        { key: "range", value: 0.8, op: "multiply" }
      ]
    },
    {
      id: "135",
      name: "\uACA9\uC790 \uBC29\uC804\uAE30",
      description: "\uD0C4\uD658\xB7\uC800\uC7A5 \uB178\uB4DC\xB7\uACF5\uACA9 \uD575 \uC0AC\uC774 \uC804\uAE30\uB9DD \xB7 \uD53C\uD574 -15% \xB7 \uBC1C\uC0AC \uC18D\uB3C4 -15%",
      rarity: "rare",
      price: 22,
      maxStack: 1,
      effects: [
        { key: "conduit", value: 1, op: "add" },
        { key: "damage", value: 0.85, op: "multiply" },
        { key: "rate", value: 0.85, op: "multiply" }
      ]
    },
    {
      id: "136",
      name: "\uC808\uC0AD \uBC29\uBCBD \uCF54\uD305",
      description: "\uACF5\uACA9 \uADA4\uB3C4\uC5D0\uC11C \uC801 \uD0C4\uD658 \uC81C\uAC70 \xB7 \uC9C1\uC811 \uD53C\uD574 -25% \xB7 \uAD00\uD1B5\xB7\uAD11\uC120\xB7\uACE0\uB9AC\uC5D0 \uC801\uC6A9",
      rarity: "rare",
      price: 22,
      maxStack: 1,
      effects: [
        { key: "shieldShot", value: 1, op: "add" },
        { key: "damage", value: 0.75, op: "multiply" }
      ]
    },
    ...EXPANSION_ITEMS,
    ...POWER_ITEMS,
    ...BUILD_ITEMS
  ].map((item) => ({
    rarity: "common",
    maxStack: 99,
    ...item,
    description: summarizeItem(item.effects)
  }))
);
var definitionsById = new Map(ITEMS.map((row) => [row.id, row]));
if (definitionsById.size !== ITEMS.length)
  throw new Error("Duplicate items ID");

// src/multiplayer/dungeonItems.ts
var rules = {};
function group(keys, value) {
  for (const key2 of keys.split(" ")) rules[key2] = value;
}
group("double triple extraProjectiles parallelShot convergeShot helix", {
  extra: 1,
  damage: -0.06
});
group("scatterShot petalShot crossShot ringShot", { weapon: "shotgun" });
group("beam charged singleCore autoCharge chargeLightning chargedArc", {
  weapon: "rail"
});
group("bombShot lobShot explosion chainFuse", { weapon: "rocket" });
group("repeatShots echo trainShot burstEvery delayedShot", { weapon: "burst" });
group("boomerang return returnNova bounceHoming", { bounce: 1, damage: -0.04 });
group("homing arcHoming stickyHoming seekingShards retarget", {
  homing: 0.42,
  damage: -0.08
});
group("waveShot zigzag", { wave: 0.045 });
group("swerve spiralShot sweepShot alternatingShot", {
  curve: 0.014,
  damage: 0.06
});
group("accelerator pierceSpeed", { bulletSpeed: 0.12 });
group("brakeShot stasis", { bulletSpeed: -0.14, size: 0.2 });
group("pulseSize growth movingGrowth healthySize", { size: 0.22 });
group("burn poison bleed sticky adhesive", { wound: 2, damage: -0.07 });
group("slow freezeStacks frozenZone activeFreeze auraSlow", { slow: 0.13 });
group("execution shatter thermalShock conduction statusBonus burnBonus", {
  execution: 0.15
});
group("movingRate", { movingRate: 0.14 });
group("lowHpRate", { lowHpRate: 0.18 });
group("standDamage", { standDamage: 0.18 });
group("entryArmor healthyArmor standResist shieldArmor resist", {
  armor: 0.07
});
group("leech absorb betterHeal", { leech: 1.2 });
var weaponText = {
  rifle: "\uC18C\uCD1D \uC0AC\uACA9",
  shotgun: "\uADFC\uAC70\uB9AC \uC0B0\uD0C4",
  rail: "\uC608\uACE0 \uCDA9\uC804\uD0C4",
  rocket: "\uB290\uB9B0 \uD3ED\uBC1C\uD0C4",
  burst: "\uC138 \uBC1C \uC810\uC0AC",
  bounce: "\uB3C4\uD0C4 \uC0AC\uACA9"
};
var labels = {
  damage: "\uACF5\uACA9\uB825",
  rate: "\uACF5\uACA9\uC18D\uB3C4",
  speed: "\uC774\uB3D9\uC18D\uB3C4",
  health: "\uCD5C\uB300 \uC0DD\uBA85\uB825",
  armor: "\uD53C\uD574 \uAC10\uC18C",
  bulletSpeed: "\uD0C4\uC18D",
  size: "\uD0C4\uD658 \uD06C\uAE30",
  range: "\uC0AC\uAC70\uB9AC"
};
function describe(i) {
  const text = [];
  if (i.weapon) text.push(weaponText[i.weapon]);
  for (const [key2, label] of Object.entries(labels)) {
    const n = i[key2];
    if (typeof n === "number" && n !== 0)
      text.push(label + (n > 0 ? "\u2191" : "\u2193"));
  }
  if (i.extra) text.push("\uB2E8\uBC1C \uBB34\uAE30 \uB450 \uAC08\uB798 \xB7 \uC704\uB825 \uBD84\uC0B0");
  if (i.pierce) text.push("\uD55C \uBA85 \uAD00\uD1B5 \xB7 \uAD00\uD1B5 \uD6C4 \uC704\uB825\u2193");
  if (i.bounce) text.push("\uD55C \uBC88 \uB3C4\uD0C4 \xB7 \uB3C4\uD0C4 \uD6C4 \uC704\uB825\u2193");
  if (i.homing) text.push("\uC57D\uD55C \uC720\uB3C4 \xB7 \uC5C4\uD3D0 \uB4A4 \uCD94\uC801 \uBD88\uAC00");
  if (i.wave) text.push("\uBB3C\uACB0 \uD0C4\uB3C4");
  if (i.curve) text.push("\uD718\uC5B4\uC9C0\uB294 \uD0C4\uB3C4");
  if (i.wound) text.push("\uC9E7\uC740 \uC9C0\uC18D \uC0C1\uCC98 \xB7 \uC911\uCCA9 \uBD88\uAC00");
  if (i.slow) text.push("\uC9E7\uC740 \uB454\uD654");
  if (i.leech) text.push("\uBA85\uC911 \uC2DC \uC18C\uB7C9 \uD761\uD608");
  if (i.execution) text.push("\uBE48\uC0AC\xB7\uC0C1\uCC98\xB7\uB454\uD654 \uB300\uC0C1 \uC704\uB825\u2191");
  if (i.movingRate) text.push("\uC774\uB3D9 \uC911 \uACF5\uACA9\uC18D\uB3C4\u2191");
  if (i.lowHpRate) text.push("\uC704\uAE30\uC5D0\uC11C \uACF5\uACA9\uC18D\uB3C4\u2191");
  if (i.standDamage) text.push("\uBA48\uCD94\uBA74 \uACF5\uACA9\uB825\u2191");
  return text.join(" \xB7 ");
}
var clamp = (n, low, high) => Math.max(low, Math.min(high, n));
function adaptDungeonItem(source) {
  const item = {
    id: `dungeon-${source.id}`,
    sourceId: source.id,
    name: source.name,
    icon: source.id,
    description: "",
    tier: { common: 1, uncommon: 2, rare: 3, exotic: 4, anomaly: 4 }[source.rarity]
  };
  let meaningful = false;
  for (const fx2 of source.effects) {
    const delta = fx2.op === "multiply" ? fx2.value - 1 : fx2.value;
    const stat = {
      damage: "damage",
      rate: "rate",
      speed: "speed",
      bulletSpeed: "bulletSpeed",
      range: "range",
      size: "size"
    }[fx2.key];
    if (stat) {
      const amount = clamp(delta * 0.45, -0.18, 0.2);
      item[stat] = clamp((item[stat] ?? 0) + amount, -0.22, 0.24);
      meaningful ||= amount > 0;
    } else if (fx2.key === "maxHp") {
      item.health = clamp(delta * 12, -24, 24);
      meaningful ||= delta > 0;
    } else if (fx2.key === "pierce" || fx2.key === "bounce") {
      item[fx2.key] = 1;
      meaningful = true;
    } else if (rules[fx2.key]) {
      const payload = rules[fx2.key];
      for (const [key2, value] of Object.entries(payload)) {
        Object.assign(item, { [key2]: value });
      }
      meaningful = true;
    }
  }
  if (!meaningful) return void 0;
  item.description = describe(item);
  return item;
}
var DUNGEON_ARENA_ITEMS = ITEMS.flatMap((source) => {
  const item = adaptDungeonItem(source);
  return item ? [item] : [];
});

// src/multiplayer/content.ts
var ARENA = {
  width: 1600,
  height: 1e3,
  radius: 18,
  tickRate: 30,
  duration: 240,
  capacity: 8
};
var ARENA_ITEMS = [
  {
    id: "scatter",
    name: "\uC0B0\uD0C4 \uBAA8\uB4C8",
    description: "\uADFC\uAC70\uB9AC \uC0B0\uD0C4 \xB7 \uBA40\uB9AC\uC11C\uB294 \uC704\uB825\u2193",
    icon: "010",
    tier: 1,
    weapon: "shotgun"
  },
  {
    id: "burst",
    name: "\uC810\uC0AC \uD68C\uB85C",
    description: "\uC138 \uBC1C \uC810\uC0AC \xB7 \uC0AC\uACA9 \uC0AC\uC774 \uBE48\uD2C8",
    icon: "011",
    tier: 1,
    weapon: "burst"
  },
  {
    id: "rifle",
    name: "\uC815\uBC00 \uC18C\uCD1D",
    description: "\uAE30\uBCF8 \uC0AC\uACA9 \uBCF5\uC6D0 \xB7 \uC548\uC815\uC801\uC778 \uD0C4\uB3C4",
    icon: "012",
    tier: 1,
    weapon: "rifle"
  },
  {
    id: "cooler",
    name: "\uB0C9\uAC01 \uD0C4\uCC3D",
    description: "\uACF5\uACA9\uC18D\uB3C4\u2191 \xB7 \uACF5\uACA9\uB825\u2193",
    icon: "054",
    tier: 1,
    rate: 0.13,
    damage: -0.06
  },
  {
    id: "grip",
    name: "\uC99D\uD3ED \uC190\uC7A1\uC774",
    description: "\uACF5\uACA9\uB825\u2191 \xB7 \uACF5\uACA9\uC18D\uB3C4\u2193",
    icon: "015",
    tier: 1,
    damage: 0.14,
    rate: -0.06
  },
  {
    id: "boots",
    name: "\uAE30\uB3D9 \uBCF4\uC870\uAE30",
    description: "\uC774\uB3D9\uC18D\uB3C4\u2191",
    icon: "016",
    tier: 1,
    speed: 0.1
  },
  {
    id: "mag",
    name: "\uD655\uC7A5 \uD0C4\uCC3D",
    description: "\uD0C4\uCC3D\u2191 \xB7 \uC7AC\uC7A5\uC804\uC740 \uAE38\uAC8C",
    icon: "017",
    tier: 1,
    magazine: 0.3,
    reload: 0.1
  },
  {
    id: "loader",
    name: "\uAE09\uC18D \uC7A5\uC804\uAE30",
    description: "\uC7AC\uC7A5\uC804 \uC2DC\uAC04\u2193",
    icon: "018",
    tier: 1,
    reload: -0.22
  },
  {
    id: "rail",
    name: "\uCDA9\uC804 \uAC00\uC18D\uD3EC",
    description: "\uC870\uC900\uC120 \uC608\uACE0 \uD6C4 \uACE0\uC18D\uD0C4 \xB7 \uCDA9\uC804 \uC911 \uC774\uB3D9\u2193",
    icon: "019",
    tier: 2,
    weapon: "rail"
  },
  {
    id: "bounce",
    name: "\uBC18\uC0AC \uC720\uB9AC\uBE57",
    description: "\uBCBD\uC5D0\uC11C \uD55C \uBC88 \uB3C4\uD0C4 \xB7 \uD295\uAE34 \uB4A4 \uC704\uB825\u2193",
    icon: "120",
    tier: 2,
    weapon: "bounce"
  },
  {
    id: "rocket",
    name: "\uACE1\uC0AC \uD0C4\uB450",
    description: "\uB290\uB9B0 \uD3ED\uBC1C\uD0C4 \xB7 \uC5C4\uD3D0 \uB4A4\uC5D0\uB294 \uD3ED\uBC1C \uCC28\uB2E8",
    icon: "123",
    tier: 2,
    weapon: "rocket"
  },
  {
    id: "shell",
    name: "\uD569\uAE08 \uB450\uD53C",
    description: "\uD53C\uD574 \uAC10\uC18C \xB7 \uC774\uB3D9\uC18D\uB3C4\u2193",
    icon: "020",
    tier: 2,
    armor: 0.14,
    speed: -0.08
  },
  {
    id: "heart",
    name: "\uBCF4\uC870 \uC2EC\uC7A5",
    description: "\uCD5C\uB300 \uC0DD\uBA85\uB825\u2191 \xB7 \uC5BB\uC744 \uB54C \uD68C\uBCF5",
    icon: "021",
    tier: 2,
    health: 18
  },
  {
    id: "scope",
    name: "\uC7A5\uAC70\uB9AC \uB80C\uC988",
    description: "\uC0AC\uAC70\uB9AC\u2191 \xB7 \uD0C4\uCC3D\u2193",
    icon: "022",
    tier: 2,
    range: 0.2,
    magazine: -0.1
  },
  {
    id: "ice",
    name: "\uBE59\uACB0 \uC9D1\uAC8C",
    description: "\uBA85\uC911 \uC2DC \uC9E7\uC740 \uB454\uD654 \xB7 \uC644\uC804 \uBE59\uACB0 \uC5C6\uC74C",
    icon: "121",
    tier: 2,
    slow: 0.13
  },
  {
    id: "blood",
    name: "\uD608\uC561 \uACFC\uAE09\uAE30",
    description: "\uACF5\uACA9\uB825\u2191\u2191 \xB7 \uCD5C\uB300 \uC0DD\uBA85\uB825\u2193",
    icon: "023",
    tier: 3,
    damage: 0.25,
    health: -20
  },
  {
    id: "pulse",
    name: "\uACE0\uCD9C\uB825 \uD384\uC2A4",
    description: "\uACF5\uACA9\uB825\u2191 \xB7 \uACF5\uACA9\uC18D\uB3C4\u2191",
    icon: "024",
    tier: 3,
    damage: 0.12,
    rate: 0.1
  },
  {
    id: "leech",
    name: "\uD68C\uC218\uC6A9 \uBC14\uB298",
    description: "\uBA85\uC911 \uC2DC \uC18C\uB7C9 \uD68C\uBCF5 \xB7 \uC5F0\uC18D \uD68C\uBCF5 \uC81C\uD55C",
    icon: "025",
    tier: 3,
    leech: 2
  },
  {
    id: "runner",
    name: "\uC704\uC0C1 \uC6B4\uB3D9\uD654",
    description: "\uC774\uB3D9\uC18D\uB3C4\u2191\u2191 \xB7 \uCD5C\uB300 \uC0DD\uBA85\uB825\u2193",
    icon: "026",
    tier: 3,
    speed: 0.19,
    health: -10
  },
  {
    id: "fortress",
    name: "\uC774\uC911 \uC7A5\uAC11",
    description: "\uD53C\uD574 \uAC10\uC18C\u2191 \xB7 \uC7AC\uC7A5\uC804 \uC2DC\uAC04\u2191",
    icon: "027",
    tier: 3,
    armor: 0.2,
    reload: 0.15
  },
  {
    id: "reactor",
    name: "\uD669\uAE08 \uBC18\uC751\uB85C",
    description: "\uACF5\uACA9\uB825\u2191\u2191 \xB7 \uD0C4\uCC3D\u2191 \xB7 \uC774\uB3D9\uC18D\uB3C4\u2193",
    icon: "028",
    tier: 4,
    damage: 0.25,
    magazine: 0.3,
    speed: -0.08
  },
  {
    id: "core",
    name: "\uC601\uAD6C \uB0C9\uAC01\uD575",
    description: "\uACF5\uACA9\uC18D\uB3C4\u2191\u2191 \xB7 \uC7AC\uC7A5\uC804 \uC2DC\uAC04\u2193",
    icon: "029",
    tier: 4,
    rate: 0.22,
    reload: -0.2
  },
  {
    id: "spine",
    name: "\uAC15\uD654 \uCC99\uCD94",
    description: "\uC0DD\uBA85\uB825\u2191\u2191 \xB7 \uC774\uB3D9\uC18D\uB3C4\u2191",
    icon: "030",
    tier: 4,
    health: 28,
    speed: 0.08
  },
  {
    id: "prism",
    name: "\uD504\uB9AC\uC998 \uC99D\uD3ED\uAE30",
    description: "\uACF5\uACA9\uB825\u2191 \xB7 \uC0AC\uAC70\uB9AC\u2191 \xB7 \uC9E7\uC740 \uB454\uD654",
    icon: "031",
    tier: 4,
    damage: 0.16,
    range: 0.15,
    slow: 0.1
  }
];
ARENA_ITEMS.push(...DUNGEON_ARENA_ITEMS);
var arenaItemMap = new Map(ARENA_ITEMS.map((item) => [item.id, item]));
var itemById = (id) => arenaItemMap.get(id);
var WEAPONS = {
  rifle: {
    name: "\uC18C\uCD1D",
    damage: 15,
    interval: 0.23,
    speed: 600,
    range: 640,
    mag: 12,
    reload: 1.15,
    pellets: 1,
    spread: 0,
    charge: 0
  },
  shotgun: {
    name: "\uC0B0\uD0C4",
    damage: 8,
    interval: 0.72,
    speed: 530,
    range: 330,
    mag: 5,
    reload: 1.5,
    pellets: 5,
    spread: 0.32,
    charge: 0
  },
  rail: {
    name: "\uAC00\uC18D\uD3EC",
    damage: 43,
    interval: 1.1,
    speed: 1050,
    range: 720,
    mag: 4,
    reload: 1.7,
    pellets: 1,
    spread: 0,
    charge: 0.55
  },
  rocket: {
    name: "\uD3ED\uBC1C\uD0C4",
    damage: 32,
    interval: 0.95,
    speed: 360,
    range: 530,
    mag: 4,
    reload: 1.7,
    pellets: 1,
    spread: 0,
    charge: 0
  },
  burst: {
    name: "\uC810\uC0AC",
    damage: 11,
    interval: 0.62,
    speed: 640,
    range: 580,
    mag: 15,
    reload: 1.25,
    pellets: 1,
    spread: 0,
    charge: 0
  },
  bounce: {
    name: "\uB3C4\uD0C4",
    damage: 16,
    interval: 0.32,
    speed: 550,
    range: 700,
    mag: 9,
    reload: 1.25,
    pellets: 1,
    spread: 0,
    charge: 0
  }
};
var coverFor = (round) => {
  const variant = round % 3;
  const boxes = [
    { x: 360, y: 200, w: 90, h: 180 },
    { x: 1150, y: 620, w: 90, h: 180 },
    { x: 360, y: 620, w: 90, h: 180 },
    { x: 1150, y: 200, w: 90, h: 180 },
    { x: 650, y: 200, w: 300, h: 70 },
    { x: 650, y: 730, w: 300, h: 70 },
    { x: 650, y: 390, w: 70, h: 220 },
    { x: 880, y: 390, w: 70, h: 220 }
  ];
  if (variant === 1)
    return boxes.map((b) => ({ ...b, y: 1e3 - b.y - b.h })).concat([
      { x: 240, y: 470, w: 100, h: 60 },
      { x: 1260, y: 470, w: 100, h: 60 }
    ]);
  if (variant === 2)
    return boxes.filter((_, i) => i < 6).concat([
      { x: 730, y: 400, w: 140, h: 200 },
      { x: 160, y: 470, w: 140, h: 60 },
      { x: 1300, y: 470, w: 140, h: 60 }
    ]);
  return boxes;
};
var SPAWNS = [
  { x: 130, y: 140 },
  { x: 1470, y: 860 },
  { x: 1470, y: 140 },
  { x: 130, y: 860 },
  { x: 800, y: 110 },
  { x: 800, y: 890 },
  { x: 130, y: 500 },
  { x: 1470, y: 500 }
];
var ITEM_NODES = [
  { x: 250, y: 180 },
  { x: 1350, y: 820 },
  { x: 250, y: 820 },
  { x: 1350, y: 180 },
  { x: 550, y: 480 },
  { x: 1050, y: 520 },
  { x: 800, y: 320 },
  { x: 800, y: 680 },
  { x: 500, y: 120 },
  { x: 1100, y: 880 },
  { x: 1100, y: 120 },
  { x: 500, y: 880 },
  { x: 150, y: 330 },
  { x: 1450, y: 670 },
  { x: 150, y: 670 },
  { x: 1450, y: 330 }
];

// src/multiplayer/SurvivalArena.ts
var idleInput = () => ({
  x: 0,
  y: 0,
  angle: 0,
  fire: false,
  dash: false,
  reload: false,
  seq: 0
});
function createArena(now, seed) {
  return {
    version: 1,
    round: 1,
    seed: seed >>> 0,
    tick: 0,
    phase: "waiting",
    start: 0,
    end: 0,
    next: 0,
    updated: now,
    players: [],
    bullets: [],
    drops: [],
    events: [],
    serial: 0,
    dropAt: 0,
    recordedRound: 0
  };
}
var clamp2 = (v, a, b) => Math.max(a, Math.min(b, v));
var distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
function sanitizeInput(value) {
  const v = value && typeof value === "object" ? value : {};
  const finite = (n) => typeof n === "number" && Number.isFinite(n) ? n : 0;
  let x = clamp2(finite(v.x), -1, 1), y = clamp2(finite(v.y), -1, 1);
  const length = Math.hypot(x, y);
  if (length > 1) {
    x /= length;
    y /= length;
  }
  return {
    x,
    y,
    angle: clamp2(finite(v.angle), -Math.PI, Math.PI),
    fire: v.fire === true,
    dash: v.dash === true,
    reload: v.reload === true,
    seq: Math.floor(clamp2(finite(v.seq), 0, 1e12))
  };
}
function stats2(p) {
  let weapon = "rifle", damage = 1, rate = 1, speed = 1, health = 100, armor = 0, reload = 1, magazine = 1, range = 1, slow = 0, leech = 0;
  let bulletSpeed = 1, size = 1, pierce = 0, homing = 0, extra = 0, bounce = 0, wave = 0, curve = 0, wound = 0, execution = 0, movingRate = 0, lowHpRate = 0, standDamage = 0;
  for (const id of p.items) {
    const i = itemById(id);
    if (!i) continue;
    weapon = i.weapon ?? weapon;
    damage += i.damage ?? 0;
    rate += i.rate ?? 0;
    speed += i.speed ?? 0;
    health += i.health ?? 0;
    armor += i.armor ?? 0;
    reload += i.reload ?? 0;
    magazine += i.magazine ?? 0;
    range += i.range ?? 0;
    slow = Math.max(slow, i.slow ?? 0);
    leech = Math.max(leech, i.leech ?? 0);
    bulletSpeed += i.bulletSpeed ?? 0;
    size += i.size ?? 0;
    pierce = Math.max(pierce, i.pierce ?? 0);
    homing = Math.max(homing, i.homing ?? 0);
    extra = Math.max(extra, i.extra ?? 0);
    bounce = Math.max(bounce, i.bounce ?? 0);
    wave = Math.max(wave, i.wave ?? 0);
    curve = Math.max(curve, i.curve ?? 0);
    wound = Math.max(wound, i.wound ?? 0);
    execution = Math.max(execution, i.execution ?? 0);
    movingRate = Math.max(movingRate, i.movingRate ?? 0);
    lowHpRate = Math.max(lowHpRate, i.lowHpRate ?? 0);
    standDamage = Math.max(standDamage, i.standDamage ?? 0);
  }
  return {
    weapon,
    bulletSpeed: clamp2(bulletSpeed, 0.75, 1.2),
    size: clamp2(size, 0.8, 1.6),
    pierce: Math.min(1, pierce),
    homing: Math.min(0.42, homing),
    extra: Math.min(1, extra),
    bounce: Math.min(1, bounce),
    wave,
    curve,
    wound: Math.min(2, wound),
    execution: Math.min(0.15, execution),
    movingRate,
    lowHpRate,
    standDamage,
    damage: clamp2(damage, 0.65, 1.65),
    rate: clamp2(rate, 0.65, 1.6),
    speed: clamp2(speed, 0.7, 1.35),
    health: clamp2(health, 60, 160),
    armor: clamp2(armor, 0, 0.3),
    reload: clamp2(reload, 0.55, 1.6),
    magazine: Math.max(
      2,
      Math.round(WEAPONS[weapon].mag * clamp2(magazine, 0.6, 1.8))
    ),
    range: clamp2(range, 0.7, 1.25),
    slow,
    leech
  };
}
function event(s, kind, p, who, target, amount) {
  s.events.push({ id: ++s.serial, kind, x: p.x, y: p.y, who, target, amount });
  if (s.events.length > 70) s.events.shift();
}
function grantArenaItem(s, p, id) {
  if (!itemById(id)) return;
  const before = stats2(p);
  p.items.push(id);
  if (p.items.length > 5) p.items.shift();
  const after = stats2(p);
  p.maxHp = after.health;
  p.hp = clamp2(
    p.hp + Math.max(0, after.health - before.health),
    1,
    after.health
  );
  if (before.weapon !== after.weapon) {
    p.ammo = Math.min(p.ammo, after.magazine);
    p.chargeAt = 0;
    p.burst = 0;
    p.shotAt = Math.max(p.shotAt, s.tick + 9);
  }
  p.weapon = after.weapon;
  p.ammo = Math.min(p.ammo, after.magazine);
  event(s, "pickup", p, p.id, id);
}
function addFighter(s, owner, id, name, now) {
  const existing = s.players.find((p2) => p2.owner === owner);
  if (existing) {
    existing.seen = now;
    existing.online = true;
    return existing;
  }
  if (s.players.length >= ARENA.capacity) throw Error("\uBC29\uC774 \uAC00\uB4DD \uCC3C\uC2B5\uB2C8\uB2E4.");
  const spawn = SPAWNS[s.players.length];
  const p = {
    id,
    owner,
    name,
    ...spawn,
    hp: 100,
    maxHp: 100,
    angle: 0,
    kills: 0,
    deaths: 0,
    assists: 0,
    damage: 0,
    items: [],
    weapon: "rifle",
    ammo: 12,
    reloadAt: 0,
    shotAt: 0,
    chargeAt: 0,
    burst: 0,
    burstAt: 0,
    dashAt: 0,
    dashEnd: 0,
    woundUntil: 0,
    woundAt: 0,
    woundPower: 0,
    woundOwner: "",
    slowUntil: 0,
    immuneUntil: 0,
    deadUntil: 0,
    leechAt: 0,
    lastHit: "",
    lastHitAt: 0,
    hitBy: {},
    input: idleInput(),
    inputAt: now,
    seen: now,
    ready: false,
    online: true
  };
  s.players.push(p);
  if (s.phase === "live") {
    p.hp = 0;
    p.deadUntil = s.tick + 90;
  }
  return p;
}
function startArena(s, now) {
  s.phase = "countdown";
  s.start = now + 3e3;
  s.end = s.start + ARENA.duration * 1e3;
  s.next = s.end + 12e3;
  s.tick = 0;
  s.updated = now;
  s.bullets = [];
  s.drops = [];
  s.events = [];
  s.dropAt = 0;
  s.players.forEach((p, i) => {
    Object.assign(p, SPAWNS[i % SPAWNS.length], {
      hp: 100,
      maxHp: 100,
      kills: 0,
      deaths: 0,
      assists: 0,
      damage: 0,
      items: [],
      weapon: "rifle",
      ammo: 12,
      reloadAt: 0,
      shotAt: 0,
      chargeAt: 0,
      burst: 0,
      burstAt: 0,
      dashAt: 0,
      dashEnd: 0,
      woundUntil: 0,
      woundAt: 0,
      woundPower: 0,
      woundOwner: "",
      slowUntil: 0,
      immuneUntil: 90,
      deadUntil: 0,
      leechAt: 0,
      lastHit: "",
      lastHitAt: 0,
      hitBy: {},
      input: idleInput(),
      ready: false
    });
  });
  for (let i = 0; i < 12; i++) spawnDrop(s);
}
function spawnDrop(s) {
  const rng = new DeterministicRNG(String(s.seed)).fork(
    `pvp-drop:${s.round}:${s.tick}:${s.serial}`
  );
  const nodes = ITEM_NODES.filter(
    (n) => !s.drops.some((d) => distance(n, d) < 40)
  );
  if (!nodes.length) return;
  const minute = Math.floor(s.tick / (30 * 60));
  const weights = minute >= 3 ? [0, 1, 4, 6] : minute === 2 ? [1, 4, 5, 1] : minute === 1 ? [3, 5, 2, 0] : [8, 2, 0, 0];
  const tierBag = [1, 2, 3, 4].flatMap(
    (tier2) => Array.from({ length: weights[tier2 - 1] }, () => tier2)
  );
  const tier = tierBag[Math.floor(rng.next() * tierBag.length)];
  const tierPool = ARENA_ITEMS.filter((item2) => item2.tier === tier);
  const occupied = /* @__PURE__ */ new Set([
    ...s.drops.map((d) => d.item),
    ...s.players.flatMap((p) => p.items)
  ]);
  const recent = new Set(s.recentDrops ?? []);
  const fresh = tierPool.filter(
    (item2) => !occupied.has(item2.id) && !recent.has(item2.id)
  );
  const unoccupied = tierPool.filter((item2) => !occupied.has(item2.id));
  const pool = fresh.length ? fresh : unoccupied.length ? unoccupied : tierPool;
  const item = pool[Math.floor(rng.next() * pool.length)], node = nodes[Math.floor(rng.next() * nodes.length)];
  s.recentDrops = [...s.recentDrops ?? [], item.id].slice(-48);
  s.drops.push({ id: ++s.serial, ...node, item: item.id, born: s.tick });
}
function solid(x, y, r, boxes) {
  return x < r + 40 || y < r + 40 || x > ARENA.width - r - 40 || y > ARENA.height - r - 40 || boxes.some((b) => {
    const dx = x - clamp2(x, b.x, b.x + b.w), dy = y - clamp2(y, b.y, b.y + b.h);
    return dx * dx + dy * dy < r * r;
  });
}
function moveFighter(p, dx, dy, boxes) {
  const steps = Math.max(1, Math.ceil(Math.hypot(dx, dy) / 8));
  for (let i = 0; i < steps; i++) {
    if (!solid(p.x + dx / steps, p.y, ARENA.radius, boxes)) p.x += dx / steps;
    if (!solid(p.x, p.y + dy / steps, ARENA.radius, boxes)) p.y += dy / steps;
  }
}
function lineClear(a, b, boxes) {
  const n = Math.ceil(distance(a, b) / 10);
  for (let i = 1; i < n; i++)
    if (solid(a.x + (b.x - a.x) * i / n, a.y + (b.y - a.y) * i / n, 1, boxes))
      return false;
  return true;
}
function die(s, p, attacker) {
  if (p.hp <= 0 && p.deadUntil > s.tick) return;
  p.hp = 0;
  p.deaths++;
  p.deadUntil = s.tick + 90;
  p.burst = 0;
  p.chargeAt = 0;
  if (attacker && attacker.id !== p.id) attacker.kills++;
  for (const [id, tick] of Object.entries(p.hitBy)) {
    if (id !== attacker?.id && s.tick - tick < 150) {
      const helper = s.players.find((q) => q.id === id);
      if (helper) helper.assists++;
    }
  }
  event(s, "death", p, attacker?.id ?? "", p.id);
  p.hitBy = {};
}
function hit(s, p, b, amount) {
  if (p.hp <= 0 || p.immuneUntil > s.tick || p.dashEnd > s.tick) return;
  const attacker = s.players.find((q) => q.id === b.owner);
  const vulnerable = p.hp < p.maxHp * 0.35 || (p.woundUntil ?? 0) > s.tick || p.slowUntil > s.tick;
  const actual = Math.min(
    p.hp,
    amount * (vulnerable ? 1 + (b.execution ?? 0) : 1) * (1 - stats2(p).armor)
  );
  p.hp -= actual;
  p.lastHit = b.owner;
  p.lastHitAt = s.tick;
  p.hitBy[b.owner] = s.tick;
  if (attacker) {
    attacker.damage += actual;
    if (b.leech && attacker.hp > 0 && attacker.leechAt <= s.tick) {
      attacker.hp = Math.min(attacker.maxHp, attacker.hp + b.leech);
      attacker.leechAt = s.tick + 12;
    }
  }
  if (b.wound && (p.woundUntil ?? 0) <= s.tick) {
    p.woundUntil = s.tick + 45;
    p.woundAt = s.tick + 15;
    p.woundPower = b.wound;
    p.woundOwner = b.owner;
  }
  if (b.slow) p.slowUntil = s.tick + 15;
  event(s, "hit", p, b.owner, p.id, Math.round(actual));
  if (p.hp <= 0) die(s, p, attacker);
}
function explode(s, b, boxes) {
  for (const p of s.players) {
    const d = distance(p, b);
    if (p.id !== b.owner && p.online && d < 88 && lineClear(b, p, boxes))
      hit(s, p, b, b.damage * (1 - d / 110));
  }
  event(s, "wall", b, b.owner);
}
function shoot(s, p) {
  const st = stats2(p), w = WEAPONS[st.weapon];
  if (p.ammo <= 0) return;
  p.ammo--;
  p.immuneUntil = 0;
  const copies = w.pellets === 1 && st.extra && st.weapon !== "rocket" ? 2 : 1;
  const pellets = w.pellets * copies;
  const moving = Math.hypot(p.input.x, p.input.y) > 0.1;
  for (let i = 0; i < pellets; i++) {
    const angle = p.angle + (pellets === 1 ? 0 : (i / (pellets - 1) - 0.5) * (copies === 2 ? 0.09 : w.spread)), dx = Math.cos(angle), dy = Math.sin(angle);
    const start = { x: p.x + dx * 23, y: p.y + dy * 23 };
    if (solid(start.x, start.y, 5, coverFor(s.round))) continue;
    s.bullets.push({
      id: ++s.serial,
      owner: p.id,
      ...start,
      vx: dx * w.speed * st.bulletSpeed,
      vy: dy * w.speed * st.bulletSpeed,
      life: w.range * st.range / (w.speed * st.bulletSpeed),
      damage: w.damage * Math.min(1.65, st.damage * (moving ? 1 : 1 + st.standDamage)) / (copies === 2 ? 1.85 : 1),
      radius: (st.weapon === "rocket" ? 7 : 4) * st.size,
      weapon: st.weapon,
      bounces: st.weapon === "bounce" ? 1 : st.bounce,
      pierce: st.weapon === "rocket" ? 0 : st.pierce,
      hitIds: [],
      homing: st.homing,
      wave: st.wave,
      curve: st.curve,
      age: 0,
      wound: st.wound,
      execution: st.execution,
      slow: st.slow,
      leech: st.leech
    });
  }
  event(s, "shot", p, p.id);
  if (s.bullets.length > 200) s.bullets.splice(0, s.bullets.length - 200);
}
function respawn(s, p) {
  const choices = [...SPAWNS].sort((a, b) => {
    const safe = (n) => Math.min(
      ...s.players.filter((q) => q.id !== p.id && q.hp > 0 && q.online).map((q) => distance(n, q)),
      2e3
    );
    return safe(b) - safe(a);
  });
  const st = stats2(p);
  Object.assign(p, choices[0], {
    hp: st.health,
    maxHp: st.health,
    weapon: st.weapon,
    ammo: st.magazine,
    reloadAt: 0,
    shotAt: s.tick + 6,
    chargeAt: 0,
    burst: 0,
    woundUntil: 0,
    woundAt: 0,
    woundPower: 0,
    woundOwner: "",
    slowUntil: 0,
    immuneUntil: s.tick + 60,
    dashAt: s.tick,
    deadUntil: 0,
    hitBy: {}
  });
  event(s, "spawn", p, p.id);
}
function arenaStep(s, now) {
  if (s.phase !== "live") return;
  s.tick++;
  const boxes = coverFor(s.round);
  if (s.tick >= s.dropAt) {
    s.drops = s.drops.filter((d) => s.tick - d.born < 1350);
    s.dropAt = s.tick + 120;
    spawnDrop(s);
  }
  for (const p of s.players) {
    if (!p.online) continue;
    if (p.hp <= 0) {
      if (s.tick >= p.deadUntil) respawn(s, p);
      continue;
    }
    if ((p.woundUntil ?? 0) >= s.tick && (p.woundAt ?? 0) > 0 && p.woundAt <= s.tick) {
      p.woundAt = s.tick + 15;
      hit(
        s,
        p,
        { owner: p.woundOwner ?? "", slow: 0, leech: 0 },
        p.woundPower ?? 0
      );
      if (p.hp <= 0) continue;
    }
    const input = now - p.inputAt > 350 ? idleInput() : p.input, st = stats2(p), w = WEAPONS[st.weapon];
    st.rate = Math.min(
      1.6,
      st.rate * (Math.hypot(input.x, input.y) > 0.1 ? 1 + st.movingRate : 1) * (p.hp < p.maxHp * 0.35 ? 1 + st.lowHpRate : 1)
    );
    p.angle = input.angle;
    if (input.dash && s.tick >= p.dashAt) {
      const length = Math.hypot(input.x, input.y);
      p.dashX = length > 0.1 ? input.x / length : Math.cos(input.angle);
      p.dashY = length > 0.1 ? input.y / length : Math.sin(input.angle);
      p.dashAt = s.tick + 45;
      p.dashEnd = s.tick + 5;
      p.immuneUntil = 0;
    }
    const dashing = p.dashEnd > s.tick;
    const speed = dashing ? 630 : 225 * st.speed * (p.slowUntil > s.tick ? 0.82 : 1) * (p.chargeAt > 0 ? 0.72 : 1);
    moveFighter(
      p,
      (dashing ? p.dashX ?? input.x : input.x) * speed / 30,
      (dashing ? p.dashY ?? input.y : input.y) * speed / 30,
      boxes
    );
    for (const other of s.players) {
      if (other.id === p.id || other.hp <= 0 || !other.online) continue;
      const d = distance(p, other);
      if (d < 36 && d > 0.01)
        moveFighter(
          p,
          (p.x - other.x) / d * (36 - d) * 0.5,
          (p.y - other.y) / d * (36 - d) * 0.5,
          boxes
        );
    }
    if (p.reloadAt && s.tick >= p.reloadAt) {
      p.ammo = st.magazine;
      p.reloadAt = 0;
    }
    if ((input.reload || p.ammo === 0) && !p.reloadAt && p.ammo < st.magazine) {
      p.reloadAt = s.tick + Math.ceil(w.reload * st.reload * 30);
      p.chargeAt = 0;
      p.burst = 0;
    }
    if (!p.reloadAt) {
      if (p.burst > 0 && s.tick >= p.burstAt && p.ammo > 0) {
        shoot(s, p);
        p.burst--;
        p.burstAt = s.tick + 3;
      }
      if (p.chargeAt && s.tick >= p.chargeAt) {
        shoot(s, p);
        p.chargeAt = 0;
        p.shotAt = s.tick + Math.ceil(w.interval * 30 / st.rate);
      }
      if (input.fire && p.ammo > 0 && s.tick >= p.shotAt && !p.chargeAt && !p.burst) {
        if (w.charge) {
          p.chargeAt = s.tick + Math.ceil(w.charge * 30);
          p.immuneUntil = 0;
        } else {
          shoot(s, p);
          p.shotAt = s.tick + Math.ceil(w.interval * 30 / st.rate);
          if (st.weapon === "burst") {
            p.burst = 2;
            p.burstAt = s.tick + 3;
          }
        }
      }
    }
    const index = s.drops.findIndex((d) => distance(p, d) < 35);
    if (index >= 0) {
      const [drop] = s.drops.splice(index, 1);
      grantArenaItem(s, p, drop.item);
    }
  }
  const kept = [];
  for (const b of s.bullets) {
    b.age = (b.age ?? 0) + 1;
    let turn = (b.curve ?? 0) + (b.wave ?? 0) * Math.cos(b.age * 0.45);
    if (b.homing) {
      const heading = Math.atan2(b.vy, b.vx);
      const candidates = s.players.filter(
        (p) => p.online && p.hp > 0 && p.id !== b.owner && !(b.hitIds ?? []).includes(p.id) && distance(p, b) < 300 && lineClear(b, p, boxes)
      ).map((p) => ({
        p,
        delta: Math.atan2(
          Math.sin(Math.atan2(p.y - b.y, p.x - b.x) - heading),
          Math.cos(Math.atan2(p.y - b.y, p.x - b.x) - heading)
        )
      })).filter((t) => Math.abs(t.delta) < 0.65).sort((a, z2) => distance(a.p, b) - distance(z2.p, b));
      if (candidates[0])
        turn += clamp2(candidates[0].delta, -b.homing / 30, b.homing / 30);
    }
    if (turn) {
      const vx = b.vx;
      b.vx = vx * Math.cos(turn) - b.vy * Math.sin(turn);
      b.vy = vx * Math.sin(turn) + b.vy * Math.cos(turn);
    }
    b.life -= 1 / 30;
    let dead = b.life <= 0;
    const steps = Math.ceil(Math.hypot(b.vx, b.vy) / 30 / 7);
    for (let i = 0; i < steps && !dead; i++) {
      const dx = b.vx / 30 / steps, dy = b.vy / 30 / steps, nx = b.x + dx, ny = b.y + dy;
      if (solid(nx, ny, b.radius, boxes)) {
        if (b.bounces > 0) {
          if (solid(nx, b.y, b.radius, boxes)) b.vx = -b.vx;
          if (solid(b.x, ny, b.radius, boxes)) b.vy = -b.vy;
          b.bounces--;
          b.damage *= 0.75;
        } else dead = true;
        break;
      }
      b.x = nx;
      b.y = ny;
      const target = s.players.find(
        (p) => p.id !== b.owner && !(b.hitIds ?? []).includes(p.id) && p.online && p.hp > 0 && distance(p, b) < ARENA.radius + b.radius
      );
      if (target) {
        if (b.weapon !== "rocket") hit(s, target, b, b.damage);
        b.hitIds = [...b.hitIds ?? [], target.id];
        if ((b.pierce ?? 0) > 0) {
          b.pierce--;
          b.damage *= 0.65;
        } else dead = true;
      }
    }
    if (dead) {
      if (b.weapon === "rocket") explode(s, b, boxes);
      else event(s, "wall", b, b.owner);
    } else kept.push(b);
  }
  s.bullets = kept;
}
function advanceArena(s, now) {
  for (const p of s.players)
    if (p.online && now - p.seen > 12e3) {
      p.online = false;
      if (s.phase === "live" && p.hp > 0)
        die(
          s,
          p,
          s.players.find(
            (q) => q.id === p.lastHit && s.tick - p.lastHitAt < 150
          )
        );
    }
  if (s.phase === "waiting") {
    s.updated = now;
    return;
  }
  if (s.phase === "countdown" && now >= s.start) {
    s.phase = "live";
    s.updated = s.start;
  }
  if (s.phase === "live") {
    const target = Math.min(
      ARENA.duration * 30,
      Math.floor((now - s.start) * 30 / 1e3)
    );
    while (s.tick < target) arenaStep(s, s.start + (s.tick + 1) * 1e3 / 30);
    if (now >= s.end) {
      s.phase = "results";
      s.bullets = [];
    }
  }
  s.updated = now;
}
function leaveArena(s, p) {
  if (s.phase === "live" && p.hp > 0)
    die(
      s,
      p,
      s.players.find((q) => q.id === p.lastHit && s.tick - p.lastHitAt < 150)
    );
  p.online = false;
  p.seen = 0;
  p.input = idleInput();
}

// tests/multiplayer.test.ts
function game() {
  const s = createArena(0, 123);
  addFighter(s, "a", "a", "\uCCAB\uC9F8", 0);
  addFighter(s, "b", "b", "\uB458\uC9F8", 0);
  startArena(s, 0);
  advanceArena(s, 3e3);
  return s;
}
it("eight distinct spawns and item nodes avoid cover on every arena variant", () => {
  for (let r = 1; r <= 3; r++) {
    const boxes = coverFor(r);
    for (const p of [...SPAWNS, ...ITEM_NODES])
      expect(solid(p.x, p.y, 18, boxes)).toBe(false);
  }
  const s = createArena(0, 1);
  for (let i = 0; i < 8; i++) addFighter(s, String(i), String(i), String(i), 0);
  expect(() => addFighter(s, "9", "9", "9", 0)).toThrow();
  expect(new Set(s.players.map((p) => p.x + ":" + p.y)).size).toBe(8);
});
it("sixth item removes oldest; weapon changes and combinations stay bounded", () => {
  const s = game(), p = s.players[0];
  for (const id of ["scatter", "grip", "boots", "mag", "heart", "rail"])
    grantArenaItem(s, p, id);
  expect(p.items).toEqual(["grip", "boots", "mag", "heart", "rail"]);
  expect(p.weapon).toBe("rail");
  for (const i of ARENA_ITEMS)
    for (let j = 0; j < 6; j++) grantArenaItem(s, p, i.id);
  expect(p.items).toHaveLength(5);
  expect(stats2(p).damage).toBeLessThanOrEqual(1.65);
  expect(stats2(p).armor).toBeLessThanOrEqual(0.3);
  expect(p.hp).toBeLessThanOrEqual(p.maxHp);
});
it("touching a drop removes its altar and acquires it once", () => {
  const s = game(), p = s.players[0];
  s.drops = [{ id: 999, x: p.x, y: p.y, item: "grip", born: 0 }];
  s.dropAt = 999;
  arenaStep(s, 3034);
  expect(s.drops).toHaveLength(0);
  expect(p.items).toEqual(["grip"]);
  arenaStep(s, 3068);
  expect(p.items).toHaveLength(1);
});
it("projectile kills count once and victim respawns after three seconds with equipment", () => {
  const s = game(), a = s.players[0], b = s.players[1];
  a.x = 470;
  a.y = 500;
  b.x = 580;
  b.y = 500;
  b.hp = 1;
  b.immuneUntil = 0;
  grantArenaItem(s, b, "boots");
  a.input = { ...idleInput(), fire: true, angle: 0 };
  a.inputAt = 3e3;
  for (let i = 0; i < 15; i++) arenaStep(s, 3e3 + i * 33);
  expect(a.kills).toBe(1);
  expect(b.deaths).toBe(1);
  expect(b.hp).toBe(0);
  const respawnAt = b.deadUntil;
  while (s.tick < respawnAt - 1) arenaStep(s, 3e3 + s.tick * 33);
  expect(b.hp).toBe(0);
  arenaStep(s, 3e3 + s.tick * 33);
  expect(b.hp).toBe(b.maxHp);
  expect(b.items).toEqual(["boots"]);
  expect(b.immuneUntil).toBeGreaterThan(s.tick);
  expect(a.kills).toBe(1);
});
it("exact four minute match ends with immutable combat stats", () => {
  const s = game();
  advanceArena(s, 242999);
  expect(s.phase).toBe("live");
  advanceArena(s, 243e3);
  expect(s.phase).toBe("results");
  const score = JSON.stringify(s.players.map((p) => [p.kills, p.deaths]));
  advanceArena(s, 249e3);
  expect(JSON.stringify(s.players.map((p) => [p.kills, p.deaths]))).toBe(score);
});
it("later supply tiers improve and old altars expire", () => {
  const averages = [];
  for (const minute of [0, 3]) {
    let total = 0;
    for (let seed = 1; seed <= 100; seed++) {
      const s = game();
      s.seed = seed;
      s.tick = minute * 1800;
      s.drops = [];
      s.dropAt = 0;
      arenaStep(s, 3e3);
      total += ARENA_ITEMS.find((i) => i.id === s.drops[0].item).tier;
    }
    averages.push(total / 100);
  }
  expect(averages[1]).toBeGreaterThan(averages[0] + 1);
});
it("controls cannot send position, damage, impossible speed or non-finite aim", () => {
  const i = sanitizeInput({
    x: 999,
    y: 999,
    angle: NaN,
    fire: "yes",
    seq: Infinity,
    kills: 99
  });
  expect(Math.hypot(i.x, i.y)).toBeCloseTo(1);
  expect(i.angle).toBe(0);
  expect(i.fire).toBe(false);
  expect(i).not.toHaveProperty("kills");
});
it("JSON state restoration reproduces simulation for mixed eight-player inputs", () => {
  const a = game();
  for (let i = 2; i < 8; i++)
    addFighter(a, String(i), String(i), String(i), 3e3);
  const b = JSON.parse(JSON.stringify(a));
  for (let t = 0; t < 120; t++) {
    for (const s of [a, b]) {
      s.players.forEach((p, i) => {
        p.input = {
          ...idleInput(),
          x: Math.cos(t + i),
          y: Math.sin(t + i),
          angle: i * 0.4,
          fire: true
        };
        p.inputAt = 3e3 + t * 34;
      });
      arenaStep(s, 3e3 + t * 34);
    }
  }
  expect(b).toEqual(a);
});
it("leaving after taking damage cannot evade a death or the attacker's kill", () => {
  const s = game(), a = s.players[0], b = s.players[1];
  b.lastHit = a.id;
  b.lastHitAt = s.tick;
  leaveArena(s, b);
  expect(b.deaths).toBe(1);
  expect(a.kills).toBe(1);
  leaveArena(s, b);
  expect(b.deaths).toBe(1);
});
it("full four-minute eight-player combat stays bounded with consistent kill totals", () => {
  const s = game();
  for (let i = 2; i < 8; i++)
    addFighter(s, String(i), String(i), String(i), 3e3);
  for (let t = 0; t < 7200; t++) {
    for (const [i, p] of s.players.entries()) {
      const now = 3e3 + t * 1e3 / 30;
      p.seen = now;
      p.inputAt = now;
      p.input = {
        ...idleInput(),
        x: Math.cos(t * 7e-3 + i),
        y: Math.sin(t * 9e-3 + i),
        angle: t * 0.019 + i,
        fire: true,
        dash: t % 120 === 0
      };
    }
    arenaStep(s, 3e3 + t * 1e3 / 30);
  }
  expect(s.bullets.length).toBeLessThanOrEqual(200);
  expect(s.drops.length).toBeLessThanOrEqual(16);
  expect(s.events.length).toBeLessThanOrEqual(70);
  expect(
    s.players.every(
      (p) => p.items.length <= 5 && Number.isFinite(p.hp) && p.hp <= p.maxHp
    )
  ).toBe(true);
  expect(s.players.reduce((n, p) => n + p.kills, 0)).toBe(
    s.players.reduce((n, p) => n + p.deaths, 0)
  );
  expect(JSON.stringify(s).length).toBeLessThan(1e5);
});
it("dash locks direction for 105 units and enforces exactly 1.5 seconds cooldown", () => {
  const s = game(), p = s.players[0];
  p.x = 500;
  p.y = 90;
  p.input = { ...idleInput(), x: 0.2, dash: true };
  p.inputAt = 3e3;
  arenaStep(s, 3e3);
  const readyAt = p.dashAt;
  expect(readyAt - s.tick).toBe(45);
  p.input = { ...idleInput(), y: 1, dash: true };
  for (let i = 0; i < 4; i++) arenaStep(s, 3e3);
  expect(p.x).toBeCloseTo(605);
  expect(p.y).toBeCloseTo(90);
  p.input = { ...idleInput(), dash: true };
  while (s.tick < readyAt - 1) arenaStep(s, 3e3);
  expect(p.dashAt).toBe(readyAt);
  arenaStep(s, 3e3);
  expect(p.dashAt).toBe(readyAt + 45);
});
it("stationary dash follows aim and cannot cross arena walls", () => {
  const s = game(), p = s.players[0];
  p.x = 500;
  p.y = 90;
  p.input = { ...idleInput(), angle: Math.PI, dash: true };
  p.inputAt = 3e3;
  for (let i = 0; i < 5; i++) arenaStep(s, 3e3);
  expect(p.x).toBeCloseTo(395);
  expect(p.y).toBeCloseTo(90);
  p.x = 60;
  p.dashAt = 0;
  for (let i = 0; i < 5; i++) arenaStep(s, 3e3);
  expect(p.x).toBeGreaterThanOrEqual(18);
  expect(solid(p.x, p.y, 18, coverFor(s.round))).toBe(false);
});

// tests/multiplayer-items.test.ts
import { expect as expect2, it as it2 } from "vitest";
function arena() {
  const s = createArena(0, 51);
  const a = addFighter(s, "a", "a", "\uCCAB\uC9F8", 0), b = addFighter(s, "b", "b", "\uB458\uC9F8", 0);
  startArena(s, 0);
  advanceArena(s, 3e3);
  a.x = 500;
  a.y = 90;
  b.x = 620;
  b.y = 90;
  a.immuneUntil = b.immuneUntil = 0;
  s.drops = [];
  s.dropAt = 99999;
  return { s, a, b };
}
function step(s, n = 1) {
  for (let i = 0; i < n; i++) {
    for (const p of s.players) p.inputAt = 3e3 + s.tick * 1e3 / 30;
    arenaStep(s, 3e3 + s.tick * 1e3 / 30);
  }
}
it2("182 dungeon adaptations keep original identity/art and truthful PvP payloads", () => {
  expect2(ARENA_ITEMS).toHaveLength(206);
  expect2(new Set(ARENA_ITEMS.map((i) => i.id)).size).toBe(206);
  for (const i of ARENA_ITEMS.filter((i2) => i2.sourceId)) {
    const source = ITEMS.find((s) => s.id === i.sourceId);
    expect2(i.name).toBe(source.name);
    expect2(i.icon).toBe(source.id);
    expect2(i.description.length).toBeGreaterThan(0);
  }
});
it2("every adapted item executes and leaves bounded finite stats when replaced FIFO", () => {
  for (const item of ARENA_ITEMS) {
    const { s, a } = arena();
    for (let i = 0; i < 5; i++) grantArenaItem(s, a, item.id);
    a.input = { ...idleInput(), fire: true };
    step(s, 60);
    expect2(Number.isFinite(a.hp)).toBe(true);
    for (const b of s.bullets) {
      expect2(Number.isFinite(b.x + b.y + b.damage)).toBe(true);
      expect2(b.radius).toBeLessThanOrEqual(11.2);
    }
    expect2(stats2(a).damage).toBeLessThanOrEqual(1.65);
    expect2(stats2(a).rate).toBeLessThanOrEqual(1.6);
    expect2(s.bullets.length).toBeLessThanOrEqual(200);
    for (let i = 0; i < 5; i++) grantArenaItem(s, a, "rifle");
    expect2(stats2(a).homing).toBe(0);
    expect2(stats2(a).wound).toBe(0);
    expect2(stats2(a).extra).toBe(0);
  }
});
it2("split carriers share damage instead of doubling damage, and combine with homing", () => {
  const { s, a, b } = arena();
  b.x = 850;
  a.items = [
    ARENA_ITEMS.find((i) => i.extra).id,
    ARENA_ITEMS.find((i) => i.homing).id
  ];
  a.input = { ...idleInput(), fire: true };
  step(s);
  expect2(s.bullets).toHaveLength(2);
  expect2(s.bullets.every((b2) => b2.homing === 0.42)).toBe(true);
  expect2(s.bullets.reduce((n, b2) => n + b2.damage, 0)).toBeLessThan(18);
});
it2("pierce hits each fighter once and loses damage after passing through", () => {
  const { s, a, b } = arena();
  const c = addFighter(s, "c", "c", "\uC14B\uC9F8", 3e3);
  c.hp = 100;
  c.deadUntil = 0;
  c.x = 685;
  c.y = 90;
  c.immuneUntil = 0;
  a.items = [ARENA_ITEMS.find((i) => i.pierce).id];
  a.input = { ...idleInput(), fire: true };
  step(s);
  a.input = idleInput();
  step(s, 12);
  expect2(b.hp).toBeCloseTo(85);
  expect2(c.hp).toBeCloseTo(90.25);
});
it2("persistent wounds cannot stack, expire, and credit their attacker", () => {
  const { s, a, b } = arena();
  a.items = [ARENA_ITEMS.find((i) => i.wound).id];
  a.input = { ...idleInput(), fire: true };
  step(s);
  a.input = idleInput();
  step(s, 8);
  const afterHit = b.hp, credited = a.damage;
  expect2(b.woundPower).toBe(2);
  step(s, 45);
  expect2(afterHit - b.hp).toBeCloseTo(6);
  expect2(a.damage - credited).toBeCloseTo(6);
  const expired = b.hp;
  step(s, 60);
  expect2(b.hp).toBe(expired);
});
it2("weak guidance steers only toward a forward visible target", () => {
  const { s, a, b } = arena();
  b.x = 720;
  b.y = 125;
  a.items = [ARENA_ITEMS.find((i) => i.homing).id];
  a.input = { ...idleInput(), fire: true };
  step(s);
  a.input = idleInput();
  step(s, 2);
  expect2(s.bullets[0].vy).toBeGreaterThan(0);
  expect2(s.bullets[0].vy).toBeLessThan(40);
});
it2("all 206 definitions can drop and the opening rarity mix is not diluted by catalogue size", () => {
  const seen = /* @__PURE__ */ new Set();
  let high = 0;
  for (let seed = 0; seed < 1600; seed++) {
    const { s } = arena();
    s.seed = seed;
    s.players = [];
    s.recentDrops = [];
    for (const minute of [0, 1, 2, 3]) {
      s.tick = minute * 1800;
      s.drops = [];
      s.dropAt = 0;
      step(s);
      const id = s.drops[0].item;
      seen.add(id);
      if (minute === 0 && itemById(id).tier === 2) high++;
    }
  }
  expect2(seen.size).toBe(206);
  expect2(high / 1600).toBeGreaterThan(0.15);
  expect2(high / 1600).toBeLessThan(0.25);
});

// tests/multiplayer-wire.test.ts
import { expect as expect3, it as it3 } from "vitest";

// src/multiplayer/wire.ts
var precision = (n) => Math.round(n * 100) / 100;
function compactState(state, afterEvent) {
  return {
    state: {
      ...state,
      bullets: [],
      events: state.events.filter((e) => e.id > afterEvent)
    },
    projectiles: state.bullets.map((b) => [
      b.id,
      b.owner,
      precision(b.x),
      precision(b.y),
      precision(b.vx),
      precision(b.vy),
      b.radius,
      b.weapon,
      b.wound ?? 0,
      b.slow
    ])
  };
}
function expandState(snapshot) {
  if (!snapshot.projectiles) return snapshot;
  return {
    ...snapshot,
    state: {
      ...snapshot.state,
      bullets: snapshot.projectiles.map((p) => ({
        id: p[0],
        owner: p[1],
        x: p[2],
        y: p[3],
        vx: p[4],
        vy: p[5],
        radius: p[6],
        weapon: p[7],
        wound: p[8],
        slow: p[9],
        life: 0,
        damage: 0,
        bounces: 0,
        leech: 0
      }))
    }
  };
}

// tests/multiplayer-wire.test.ts
it3("compact projectiles retain render data without changing authoritative bullets", () => {
  const s = createArena(0, 1);
  s.bullets = Array.from({ length: 200 }, (_, i) => ({
    id: i,
    owner: "player01",
    x: 321.456789,
    y: 482.123456,
    vx: 600.12345,
    vy: 15.6789,
    life: 0.9,
    damage: 25,
    radius: 6,
    weapon: "rifle",
    bounces: 1,
    pierce: 1,
    hitIds: ["player02"],
    homing: 0.42,
    wave: 0.045,
    curve: 0.014,
    age: 14,
    wound: 2,
    execution: 0.15,
    slow: 0.13,
    leech: 1.2
  }));
  s.events = Array.from({ length: 70 }, (_, i) => ({
    id: 300 + i,
    kind: "wall",
    x: 123,
    y: 456,
    who: "player01"
  }));
  const original = JSON.stringify(s), packet = compactState(s, 365), decoded = expandState(packet);
  expect3(JSON.stringify(s)).toBe(original);
  expect3(packet.state.events.map((e) => e.id)).toEqual([366, 367, 368, 369]);
  expect3(decoded.state.bullets).toHaveLength(200);
  const first = decoded.state.bullets[0];
  expect3(first.owner).toBe("player01");
  expect3(first.radius).toBe(6);
  expect3(first.wound).toBe(2);
  expect3(Math.abs(first.x - s.bullets[0].x)).toBeLessThan(5e-3);
  const ratio = JSON.stringify(packet).length / original.length;
  expect3(ratio).toBeLessThan(0.4);
  console.log(
    `200-projectile snapshot: ${original.length} -> ${JSON.stringify(packet).length} bytes (${Math.round((1 - ratio) * 100)}% smaller)`
  );
});
it3("old full snapshots still decode and zero new events is supported", () => {
  const state = createArena(0, 2);
  const full = { state };
  expect3(expandState(full)).toBe(full);
  expect3(expandState(compactState(state, 0)).state.events).toEqual([]);
});

// tests/realtime-auth.test.ts
import { expect as expect4, it as it4 } from "vitest";

// cloudflare/auth.ts
var encode = (bytes) => btoa(String.fromCharCode(...bytes)).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
var decode = (text) => Uint8Array.from(
  atob(text.replaceAll("-", "+").replaceAll("_", "/")),
  (c) => c.charCodeAt(0)
);
var key = (secret) => crypto.subtle.importKey(
  "raw",
  new TextEncoder().encode(secret),
  { name: "HMAC", hash: "SHA-256" },
  false,
  ["sign", "verify"]
);
async function signTicket(ticket, secret) {
  const body = encode(new TextEncoder().encode(JSON.stringify(ticket)));
  const signature = await crypto.subtle.sign(
    "HMAC",
    await key(secret),
    new TextEncoder().encode(body)
  );
  return body + "." + encode(new Uint8Array(signature));
}
async function verifyTicket(token, secret, now = Date.now()) {
  try {
    if (token.length > 1500) return null;
    const [body, signature] = token.split(".");
    if (!body || !signature) return null;
    if (!await crypto.subtle.verify(
      "HMAC",
      await key(secret),
      decode(signature),
      new TextEncoder().encode(body)
    ))
      return null;
    const ticket = JSON.parse(new TextDecoder().decode(decode(body)));
    return typeof ticket.owner === "string" && /^[A-F0-9]{8}$/.test(ticket.room) && Number.isFinite(ticket.expires) && ticket.expires > now && ticket.expires <= now + 36e5 ? ticket : null;
  } catch {
    return null;
  }
}

// tests/realtime-auth.test.ts
it4("binds socket access to its signed room and owner", async () => {
  const ticket = { room: "AABBCCDD", owner: "owner-one", expires: 2e3 };
  const token = await signTicket(ticket, "test-secret");
  expect4(await verifyTicket(token, "test-secret", 1e3)).toEqual(ticket);
  expect4(await verifyTicket(token, "wrong-secret", 1e3)).toBeNull();
  expect4(await verifyTicket(token, "test-secret", 2e3)).toBeNull();
  expect4(
    await verifyTicket("forged." + token.split(".")[1], "test-secret", 1e3)
  ).toBeNull();
});
it4("rejects malformed and unbounded socket tickets", async () => {
  for (const token2 of ["", ".", "x".repeat(1501)])
    expect4(await verifyTicket(token2, "secret")).toBeNull();
  const token = await signTicket(
    { room: "../room", owner: "x", expires: 2e3 },
    "secret"
  );
  expect4(await verifyTicket(token, "secret", 1e3)).toBeNull();
});
