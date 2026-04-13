/************************************************************
 * 0) GLOBALS + GAME STATE
 ************************************************************/
const SCENES = {
  START: "start",
  INSTRUCTIONS: "instructions",
  CUTSCENE: "cutscene",
  GAME: "game",
  END: "end",
};

let scene = SCENES.START;
let previousScene = null;

let damageText = "";
let endMessage = "";
let damageTextTimer = 0;
let endSoundType = "";

let lastMonsterSoundTime = -9999;
let monsterSoundTimeout = null;
const MONSTER_SOUND_TIMEOUT_MS = 4000;

// World settings
let VIEW_W;
let VIEW_H;
const WORLD_W = 1600;
const WORLD_H = 1000;

// Levels
let currentLevel = 1;
const TOTAL_LEVELS = 3;

// Sprites
let sprites = {};

// Images
let startBg;
let gameBg;
let gameBgLvl2;
let gameBgLvl3;
let pipeImg;
let monsterSheet;
let cutsceneGif;
let doorImg;
let gasGif;
let keySheet;
let burstPipeSheet;
let pipeBurstImg;
let maskSheet;
let winBg;
let looseBg;

// Level-specific images
let pipeImgLvl2;
let pipeImgLvl3;
let pipeBurstImgLvl2;
let pipeBurstImgLvl3;
let monsterSheetLvl2;
let monsterSheetLvl3;

const PIPE_BURST_FRAME_W = 8;
const PIPE_BURST_FRAME_H = 21;
const PIPE_BURST_FRAMES = 12;
const PIPE_BURST_FRAME_DELAY = 16;

// Mask settings
let masks = [];
let masksBuiltForLevel = -1;
const MASK_MIN_PER_LEVEL = 1;
const MASK_MAX_PER_LEVEL = 3;
const MASK_IMMUNITY_MS = 10000;
const MASK_FRAME_COUNT = 4;
const MASK_FRAME_DELAY = 10;

// Sounds
let sndBackground;
let sndBubbling;
let sndCoin;
let sndDamage;
let sndFallingManhole;
let sndFootsteps;
let sndGameOver;
let sndGutterWater;
let sndIntroduction;
let sndMonsterSound;
let sndStartSound;
let sndSteam;
let sndVictory;
let sndWaterDrip;

// New level / ending sounds
let sndLevel1Music;
let sndLevel2Music;
let sndLevel3Music;
let sndGameOverNew;
let sndVictoryNew;

// Audio state
let currentGameplayTrack = null;
let lastAudioLevel = -1;

// Cutscene settings
let cutsceneDuration = 6200;
let cutsceneStartTime = 0;

// Monster animation settings
const MONSTER_SCALE = 3;
let monsterFrameIndex = 0;
let monsterFrameCounter = 0;
let monsterFrameDelay = 10;

// Key animation settings
const KEY_COLS = 4;
const KEY_ROWS = 2;
const KEY_FRAMES = 8;
const KEY_FRAME_DELAY = 8;

// Player
let player = {
  x: 120,
  y: 120,
  r: 14,
  speed: 5,

  w: 18,
  h: 29,
  scale: 3,

  direction: "down",
  moving: false,

  frameIndex: 0,
  frameDelay: 10,
  frameCounter: 0,
  currentAnimName: "down_idle",
};

// Immunity
let immuneUntil = 0;

// Camera
let cam = { x: 0, y: 0 };

// Maze walls
let walls = [];
let wallVents = [];

// Goal zone
let goal = { x: 1450, y: 850, w: 80, h: 80 };

// Enemies
let enemies = [];

// Old gas hazards kept empty / unused now
let gasHazards = [];
const GAS_DAMAGE = 1;
const GAS_BLOCKS_PLAYER = false;

// Wall vent settings
const VENT_DAMAGE = 1;
const VENT_COUNT_BY_LEVEL = {
  1: 3,
  2: 4,
  3: 5,
};

const VENT_NOZZLE_W = 40;
const VENT_NOZZLE_H = 30;
const VENT_THICKNESS = 50;
const VENT_MAX_LENGTH = 150;
const VENT_GROW_SPEED = 10;
const VENT_ACTIVE_MIN = 36;
const VENT_ACTIVE_MAX = 60;
const VENT_INACTIVE_MIN = 80;
const VENT_INACTIVE_MAX = 160;

// Health
let health = 3;
let maxHealth = 3;
let damageCooldown = 0;

let fullHeartImg;
let emptyHeartImg;

// Damage tuning
let wallDamage = 1;

// Timer
let gameStartTime = 0;
let currentTime = 0;
let finalTime = 0;
let gameEnded = false;

// High score
let bestTime = null;
if (bestTime === null || finalTime < bestTime) {
  bestTime = finalTime;
}

// Freeze / blur status effect
let freezeEffect = {
  active: false,
  cycleTimer: 0,
  triggerAfter: 60 * 12,
  activeTimer: 0,
  activeDuration: 60 * 3,
  blurAmount: 2,
};

// Per-level settings
const LEVEL_SETTINGS = {
  1: {
    enemyCount: 5,
    gasActiveDuration: 120,
    gasInactiveMin: 140,
    gasInactiveMax: 240,
    gasDamageInterval: 40,
  },
  2: {
    enemyCount: 7,
    gasActiveDuration: 140,
    gasInactiveMin: 80,
    gasInactiveMax: 150,
    gasDamageInterval: 28,
  },
  3: {
    enemyCount: 9,
    gasActiveDuration: 160,
    gasInactiveMin: 45,
    gasInactiveMax: 100,
    gasDamageInterval: 18,
  },
};

function getPipeImageForCurrentLevel() {
  if (currentLevel === 2 && pipeImgLvl2) return pipeImgLvl2;
  if (currentLevel === 3 && pipeImgLvl3) return pipeImgLvl3;
  return pipeImg;
}

function getPipeBurstImageForCurrentLevel() {
  if (currentLevel === 2 && pipeBurstImgLvl2) return pipeBurstImgLvl2;
  if (currentLevel === 3 && pipeBurstImgLvl3) return pipeBurstImgLvl3;
  return pipeBurstImg;
}

function getMonsterSheetForCurrentLevel() {
  if (currentLevel === 2 && monsterSheetLvl2) return monsterSheetLvl2;
  if (currentLevel === 3 && monsterSheetLvl3) return monsterSheetLvl3;
  return monsterSheet;
}

function getBackgroundImageForCurrentLevel() {
  if (currentLevel === 2 && gameBgLvl2) return gameBgLvl2;
  if (currentLevel === 3 && gameBgLvl3) return gameBgLvl3;
  return gameBg;
}

function getMonsterAnimSettings() {
  if (currentLevel === 2) {
    return {
      frameW: 32,
      frameH: 28,
      frames: 6,
    };
  }

  if (currentLevel === 3) {
    return {
      frameW: 22,
      frameH: 37,
      frames: 4,
    };
  }

  return {
    frameW: 29,
    frameH: 29,
    frames: 6,
  };
}

function isPlayerImmune() {
  return millis() < immuneUntil;
}

function getImmuneTimeLeftSeconds() {
  return max(0, (immuneUntil - millis()) / 1000);
}

function activateMaskImmunity() {
  immuneUntil = millis() + MASK_IMMUNITY_MS;
  damageText = "You are immune for 10 seconds!";
  damageTextTimer = 90;
}
