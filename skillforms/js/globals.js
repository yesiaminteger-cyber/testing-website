// ═══════════════════════════════════════════════
//  SKILL FORMS — Globals & State
// ═══════════════════════════════════════════════

// ── DATA ARRAYS ──
window.SKILL_POOL = [];
window.PREMADE_MOVESETS = [];

// ── GAME STATE ──
window.state = {
  screen: 'menu',  // menu | moveset | premade | create | game | gameover
  mode: null,      // 'endless' | 'test'
  moveset: [],     // skill objects
  score: 0,
  wave: 1,
  kills: 0,
  running: false,
  animId: null,
  setTarget: null,    // purple-circle targeted enemy
  selectedSkill: 0,  // index of currently active skill
  combatMode: 'melee', // 'melee' | 'ranged'
  vortices: [],
};

// ── INPUT STATE ──
window.mouse = { x: 0, y: 0 };
window.keys = {};

// ── PLAYER ──
window.player = {
  x: 0, y: 0, r: 18, speed: 4.5,
  hp: 100, maxHp: 100, color: '#3b82f6',
  cooldowns: [0,0,0,0],
  invincible: 0,
  temperature: 0, // -100 to 100
};

// ── ENTITIES & TIMERS ──
window.enemies = [];
window.projectiles = [];
window.particles_fx = [];
window.waveTimer = 0;
window.waveDelay = 3000;
window.lastTime = 0;
