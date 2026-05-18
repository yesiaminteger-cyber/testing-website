// ═══════════════════════════════════════════════
//  SKILL FORMS — Game Logic
// ═══════════════════════════════════════════════

// (Data and State moved to globals.js)

// ── SCREEN HELPER ──
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => {
    s.classList.remove('active');
    s.style.display = 'none';
  });
  const el = document.getElementById('screen-' + id);
  el.style.display = 'flex';
  requestAnimationFrame(() => el.classList.add('active'));
  state.screen = id;
}

// ── PARTICLE BACKGROUND ──
(function spawnParticles() {
  const wrap = document.getElementById('menu-particles');
  if (!wrap) return;
  for (let i = 0; i < 28; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const size = 6 + Math.random() * 40;
    p.style.cssText = `
      width:${size}px; height:${size}px;
      left:${Math.random()*100}%;
      animation-duration:${8+Math.random()*14}s;
      animation-delay:${-Math.random()*14}s;
    `;
    wrap.appendChild(p);
  }
})();

// ═══════════════════════════════════════════════
//  MENU SCREEN
// ═══════════════════════════════════════════════
document.getElementById('btn-endless').addEventListener('click', () => {
  state.mode = 'endless';
  document.getElementById('mode-badge').textContent = 'ENDLESS';
  document.getElementById('mode-badge').className = 'mode-badge';
  showScreen('moveset');
});

document.getElementById('btn-test').addEventListener('click', () => {
  state.mode = 'test';
  document.getElementById('mode-badge').textContent = 'TEST';
  document.getElementById('mode-badge').className = 'mode-badge test';
  showScreen('moveset');
});

document.getElementById('btn-pvp').addEventListener('click', () => {
  state.mode = 'pvp';
  document.getElementById('mode-badge').textContent = 'PVP';
  document.getElementById('mode-badge').className = 'mode-badge pvp';
  showScreen('moveset');
});

document.getElementById('btn-pvai').addEventListener('click', () => {
  state.mode = 'pvai';
  document.getElementById('mode-badge').textContent = 'PvAI';
  document.getElementById('mode-badge').className = 'mode-badge pvai';
  showScreen('moveset');
});

document.getElementById('btn-back-pvp').addEventListener('click', () => showScreen('moveset'));

document.getElementById('btn-lan').addEventListener('click', () => {
  const isHost = confirm('Do you want to HOST the game? (Cancel to JOIN)');
  state.pvpChannel = new BroadcastChannel('skillforms_pvp');
  
  if (isHost) {
    state.pvpCode = Math.floor(1000 + Math.random() * 9000).toString();
    alert('Your Game Code is: ' + state.pvpCode + '\nGive this to the other player.');
    state.isPvpHost = true;
    
    state.pvpChannel.onmessage = (e) => {
      if (e.data.type === 'join' && e.data.code === state.pvpCode) {
        state.hostIsWhite = Math.random() < 0.5;
        state.pvpChannel.postMessage({type: 'connected', hostIsWhite: state.hostIsWhite});
        alert('Player Connected! Starting game...');
        startPvpGame();
      }
    };
  } else {
    const code = prompt('Enter 4-digit Game Code:');
    if (!code) return;
    state.isPvpHost = false;
    state.pvpChannel.postMessage({type: 'join', code: code});
    
    state.pvpChannel.onmessage = (e) => {
      if (e.data.type === 'connected') {
        state.hostIsWhite = e.data.hostIsWhite;
        alert('Connected to Host! Starting game...');
        startPvpGame();
      }
    };
  }
});

document.getElementById('btn-bluetooth').addEventListener('click', () => {
  alert('Bluetooth Mode: Searching for devices...');
});

document.getElementById('btn-online').addEventListener('click', () => {
  alert('Online Mode is currently Work In Progress!');
});

document.getElementById('btn-back-pvai').addEventListener('click', () => showScreen('moveset'));

document.getElementById('btn-enemy-settings').addEventListener('click', () => {
  const menu = document.getElementById('enemy-settings-menu');
  menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
});

function updateEnemyCardStats() {
  const hasSword = document.getElementById('chk-sword').checked;
  const hasArmor = document.getElementById('chk-armor').checked;
  const hasBow = document.getElementById('chk-bow').checked;
  const isEmitter = document.getElementById('chk-emitter').checked;
  
  let hp = 100;
  let dmg = 10;
  let type = "Melee";
  
  if (hasArmor) hp += 50;
  if (hasSword) dmg += 10;
  if (isEmitter) { hp += 100; type = "Emitter"; }
  else if (hasBow) type = "Ranged";
  
  document.getElementById('enemy-card-stats').textContent = `HP: ${hp} | Speed: 120 | Damage: ${dmg} | Type: ${type}`;
}

document.getElementById('chk-sword').addEventListener('change', updateEnemyCardStats);
document.getElementById('chk-armor').addEventListener('change', updateEnemyCardStats);
document.getElementById('chk-bow').addEventListener('change', updateEnemyCardStats);
document.getElementById('chk-emitter').addEventListener('change', updateEnemyCardStats);

document.getElementById('btn-start-pvai').addEventListener('click', () => {
  const countInput = document.getElementById('enemy-count');
  const count = parseInt(countInput.value) || 1;
  
  const maxSafe = state.pvaiMaxSafe || (navigator.hardwareConcurrency || 4) * 10;
  
  if (count > maxSafe) {
    const proceed = confirm(`⚠️ Warning: Spawning ${count} enemies may cause lag or crashes on your device (Recommended max: ${maxSafe}). Do you still want to continue?`);
    if (!proceed) return;
  }
  
  state.pvaiEnemyCount = count;
  state.pvaiEnemySettings = {
    hasSword: document.getElementById('chk-sword').checked,
    hasArmor: document.getElementById('chk-armor').checked,
    hasBow: document.getElementById('chk-bow').checked,
    isEmitter: document.getElementById('chk-emitter').checked
  };
  startGame();
});

document.getElementById('btn-scan-perf').addEventListener('click', () => {
  const btn = document.getElementById('btn-scan-perf');
  const resultsDiv = document.getElementById('scan-results');
  
  btn.textContent = 'Scanning...';
  btn.disabled = true;
  
  setTimeout(() => {
    const start = performance.now();
    let ops = 0;
    const duration = 200;
    
    while (performance.now() - start < duration) {
      for (let i = 0; i < 1000; i++) {
        Math.hypot(Math.random() * 1000, Math.random() * 1000);
      }
      ops += 1000;
    }
    
    const opsPerMs = ops / duration;
    const base = Math.sqrt(opsPerMs) * 1.5;
    
    const fpsDrop = Math.floor(base * 2);
    const laggy = Math.floor(base * 4);
    const unplayable = Math.floor(base * 8);
    const crash = Math.floor(base * 16);
    
    document.getElementById('res-fps').textContent = fpsDrop;
    document.getElementById('res-lag').textContent = laggy;
    document.getElementById('res-unplayable').textContent = unplayable;
    document.getElementById('res-crash').textContent = crash;
    
    resultsDiv.style.display = 'block';
    btn.textContent = '🔍 Scan Device Performance';
    btn.disabled = false;
    
    state.pvaiMaxSafe = laggy;
    const hintEl = document.getElementById('max-enemy-hint');
    if (hintEl) hintEl.textContent = `Max recommended for your device: ${laggy}`;
  }, 50);
});

// ═══════════════════════════════════════════════
//  MOVESET SELECTION
// ═══════════════════════════════════════════════
document.getElementById('btn-back-moveset').addEventListener('click', () => showScreen('menu'));

document.getElementById('btn-premade').addEventListener('click', () => {
  buildPremadeScreen();
  showScreen('premade');
});

document.getElementById('btn-create').addEventListener('click', () => {
  buildCreateScreen();
  showScreen('create');
});

// ═══════════════════════════════════════════════
//  PRE-MADE SCREEN
// ═══════════════════════════════════════════════
let selectedPremade = null;

function buildPremadeScreen() {
  selectedPremade = null;
  document.getElementById('btn-start-premade').disabled = true;
  const grid = document.getElementById('premade-grid');
  const detail = document.getElementById('premade-detail');
  grid.innerHTML = '';
  detail.innerHTML = '<p class="premade-hint">← Select a moveset to see details</p>';

  if (PREMADE_MOVESETS.length === 0) {
    grid.innerHTML = '<p style="color:var(--sub);padding:8px;">No movesets added yet.</p>';
    return;
  }

  PREMADE_MOVESETS.forEach((ms, i) => {
    const card = document.createElement('div');
    card.className = 'premade-card';
    card.dataset.theme = ms.theme;
    card.innerHTML = `
      <div class="premade-card-icon">${ms.icon}</div>
      <div class="premade-card-name">${ms.name}</div>
      <div class="premade-card-theme">${ms.theme}</div>`;
    card.addEventListener('click', () => {
      document.querySelectorAll('.premade-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      selectedPremade = ms;
      document.getElementById('btn-start-premade').disabled = false;
      showPremadeDetail(ms);
    });
    grid.appendChild(card);
  });
}

function showPremadeDetail(ms) {
  const detail = document.getElementById('premade-detail');
  const skillsHtml = ms.skills.map(sk => `
    <div class="skill-detail-card" style="border-color:${sk.color}">
      <div class="sk-icon">${sk.icon}</div>
      <div class="sk-name">${sk.name}</div>
      <div class="sk-stats">DMG ${sk.damage} · CD ${sk.cooldown}s</div>
    </div>`).join('');
  detail.innerHTML = `
    <div class="premade-detail-inner">
      <div class="premade-detail-header">
        <h2>${ms.icon} ${ms.name}</h2>
        <p>${ms.desc}</p>
      </div>
      <div class="premade-skills-grid">${skillsHtml}</div>
    </div>`;
}

document.getElementById('btn-back-premade').addEventListener('click', () => showScreen('moveset'));
document.getElementById('btn-start-premade').addEventListener('click', () => {
  if (!selectedPremade) return;
  state.moveset = selectedPremade.skills;
  state.movesetType = selectedPremade.name;
  if (state.mode === 'pvp') {
    showScreen('pvp-connection');
  } else if (state.mode === 'pvai') {
    const maxSafe = (navigator.hardwareConcurrency || 4) * 10;
    const hintEl = document.getElementById('max-enemy-hint');
    if (hintEl) hintEl.textContent = `Max recommended for your device: ${maxSafe}`;
    showScreen('pvai-config');
  } else {
    startGame();
  }
});

// ═══════════════════════════════════════════════
//  CREATE MOVESET SCREEN
// ═══════════════════════════════════════════════
let customSlots = [null, null, null, null];

function buildCreateScreen() {
  customSlots = [null, null, null, null];
  renderPool();
  renderSlots();
}

function renderPool() {
  const pool = document.getElementById('skill-pool');
  pool.innerHTML = '';
  if (SKILL_POOL.length === 0) {
    pool.innerHTML = '<p style="color:var(--sub);">No skills added yet.</p>';
    return;
  }
  SKILL_POOL.forEach(sk => {
    const inUse = customSlots.some(s => s && s.id === sk.id);
    const charLocked = sk.character && customSlots.some(s => s && s.character === sk.character && s.id !== sk.id);
    
    const card = document.createElement('div');
    card.className = 'pool-skill-card' + (inUse ? ' in-use' : '') + (charLocked ? ' locked' : '');
    card.dataset.type = sk.type;
    card.style.borderColor = inUse ? sk.color : 'transparent';
    card.innerHTML = `
      <div class="pool-icon">${sk.icon}</div>
      <div class="pool-name">${sk.name} <span style="opacity:0.6;font-size:0.8rem;">${sk.charIcon || ''}</span></div>
      <div class="pool-stats">DMG ${sk.damage} · CD ${sk.cooldown}s · Range ${sk.range}</div>
      ${charLocked ? '<div style="font-size:0.7rem;color:var(--red);margin-top:auto;">Limit: 1 per character</div>' : ''}`;
      
    if (!inUse && !charLocked) {
      card.addEventListener('click', () => addSkillToSlot(sk));
    }
    pool.appendChild(card);
  });
}

function addSkillToSlot(sk) {
  const idx = customSlots.findIndex(s => s === null);
  if (idx === -1) return;
  
  // Check if a skill from the same character is already selected
  if (sk.character) {
    const alreadyHasCharSkill = customSlots.some(s => s && s.character === sk.character);
    if (alreadyHasCharSkill) {
      alert("You can only select one skill from the " + sk.character + " character!");
      return;
    }
  }
  
  customSlots[idx] = sk;
  renderPool();
  renderSlots();
}

function removeSkillFromSlot(idx) {
  customSlots[idx] = null;
  renderPool();
  renderSlots();
}

function renderSlots() {
  const keys = ['Move Slot 1', 'Move Slot 2', 'Move Slot 3', 'Move Slot 4'];
  const count = customSlots.filter(Boolean).length;
  document.getElementById('create-count').textContent = count + ' / 4';
  document.getElementById('btn-start-create').disabled = count === 0;
  customSlots.forEach((sk, i) => {
    const slot = document.querySelector(`.skill-slot[data-slot="${i}"]`);
    if (sk) {
      slot.className = 'skill-slot';
      slot.style.borderColor = sk.color;
      slot.innerHTML = `
        <span>${keys[i]}</span>
        <div class="slot-icon">${sk.icon}</div>
        <div class="slot-name">${sk.name}</div>
        <button class="slot-remove" data-idx="${i}">✕</button>`;
      slot.querySelector('.slot-remove').addEventListener('click', (e) => {
        e.stopPropagation();
        removeSkillFromSlot(i);
      });
    } else {
      slot.className = 'skill-slot empty';
      slot.style.borderColor = '';
      slot.innerHTML = `<span>${keys[i]}</span>`;
    }
  });
}

document.getElementById('btn-back-create').addEventListener('click', () => showScreen('moveset'));
document.getElementById('btn-start-create').addEventListener('click', () => {
  const selectedSkills = customSlots.filter(Boolean);
  if (selectedSkills.length === 0) return;
  state.moveset = selectedSkills;
  state.movesetType = 'Custom';
  if (state.mode === 'pvp') {
    showScreen('pvp-connection');
  } else if (state.mode === 'pvai') {
    const maxSafe = (navigator.hardwareConcurrency || 4) * 10;
    const hintEl = document.getElementById('max-enemy-hint');
    if (hintEl) hintEl.textContent = `Max recommended for your device: ${maxSafe}`;
    showScreen('pvai-config');
  } else {
    startGame();
  }
});

// ═══════════════════════════════════════════════
//  GAME ENGINE
// ═══════════════════════════════════════════════
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// ── MOUSE / AIM ──
let rightMouseDown = false;
let leftMouseDown = false;
let chargeTimer = 0;

window.addEventListener('mousedown', e => { 
  if (e.button === 2) rightMouseDown = true; 
  if (e.button === 0) { leftMouseDown = true; chargeTimer = 0; }
});
window.addEventListener('mouseup',   e => { 
  if (e.button === 2) rightMouseDown = false; 
  if (e.button === 0) { 
    leftMouseDown = false; 
    if (state.combatMode === 'ranged') {
      shootEnergyBall();
    } else {
      releasePunch(); 
    }
  }
});

function releasePunch() {
  if (player.meleeCooldown > 0) return;
  
  const isShift = keys['shift'];
  const isAlt = keys['alt'];
  
  if (isAlt) {
    // Barrage Punches!
    player.barrageTicks = 5;
    player.barrageTimer = 0;
    player.meleeCooldown = 2.0;
    chargeTimer = 0;
    return;
  }
  
  const chargePct = Math.min(1, chargeTimer / 1); // Max 1 second charge
  let damage = 10 + chargePct * 30; // 10 to 40 damage
  let range = player.r + 30;
  let knockback = 10 + chargePct * 20;
  
  if (isShift) {
    // Knockback Punch!
    damage = 15 + chargePct * 35; // 15 to 50 damage
    knockback = 30 + chargePct * 60; // Massive knockback!
    range = player.r + 40; // Slightly more range
  }
  
  const angle = Math.atan2(mouse.y - player.y, mouse.x - player.x);
  
  enemies.forEach(e => {
    const dist = Math.hypot(e.x - player.x, e.y - player.y);
    if (dist < range + e.r) {
      const angToEnemy = Math.atan2(e.y - player.y, e.x - player.x);
      let angleDiff = Math.abs(angle - angToEnemy);
      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
      angleDiff = Math.abs(angleDiff);
      
      if (angleDiff < Math.PI / 4) { // 45 degrees cone
        e.hp -= damage;
        spawnHitParticles(e.x, e.y, isShift ? '#ff4500' : '#ffffff', 5);
        e.x += Math.cos(angle) * knockback;
        e.y += Math.sin(angle) * knockback;
      }
    }
  });
  
  if (state.mode === 'pvp' && state.pvpChannel) {
    state.pvpChannel.postMessage({
      type: 'punch',
      x: player.x, y: player.y,
      angle: angle,
      chargePct: chargePct,
      isShift: isShift
    });
  }
  
  player.meleeCooldown = 0.2;
  chargeTimer = 0;
}

function shootEnergyBall() {
  if (player.meleeCooldown > 0) return;
  
  const isShift = keys['shift'];
  const isAlt = keys['alt'];
  
  const chargePct = Math.min(1, chargeTimer / 1); // Max 1 second charge
  const baseSize = 6 + chargePct * 24; // Size 6 to 30! (Much bigger)
  const baseDamage = 15 + chargePct * 35; // Damage 15 to 50
  
  const angle = Math.atan2(mouse.y - player.y, mouse.x - player.x);
  
  let type = 'piercing';
  let color = '#ffffff';
  if (isShift) { type = 'bouncing'; color = '#ffff00'; }
  if (isAlt) { type = 'homing'; color = '#0000ff'; }
  
  let target = null;
  if (type === 'homing') {
    target = nearestEnemyTo(mouse.x, mouse.y, null);
  }

  const p = {
    x: player.x, y: player.y,
    vx: Math.cos(angle) * (type === 'homing' ? 6 : 8),
    vy: Math.sin(angle) * (type === 'homing' ? 6 : 8),
    r: baseSize, baseR: baseSize,
    color: color,
    damage: baseDamage, baseDamage: baseDamage,
    range: 1000,
    dist: 0, fromPlayer: true,
    isEnergyBall: true,
    energyBallType: type,
    energy: 100,
    target: target
  };
  
  projectiles.push(p);
  
  if (state.mode === 'pvp' && state.pvpChannel) {
    state.pvpChannel.postMessage({
      type: 'shoot',
      projectile: {
        x: p.x, y: p.y,
        vx: p.vx, vy: p.vy,
        r: p.r, color: p.color,
        isEnergyBall: p.isEnergyBall,
        energyBallType: p.energyBallType,
        baseR: p.baseR,
        energy: p.energy
      }
    });
  }
  
  player.meleeCooldown = 0.3;
  chargeTimer = 0;
}

window.addEventListener('mousemove', e => {
  const rect = canvas.getBoundingClientRect();
  mouse.x = e.clientX - rect.left;
  mouse.y = e.clientY - rect.top;
});

// ── INPUT: KEYBOARD (movement only) ──
window.addEventListener('keydown', e => { 
  keys[e.key.toLowerCase()] = true; 
  
  // Prevent Alt from focusing browser menu bar
  if (e.key === 'Alt') {
    e.preventDefault();
  }
  
  if (e.altKey && ['w', 'a', 's', 'd'].includes(e.key.toLowerCase())) {
    e.preventDefault();
  }
});
window.addEventListener('keyup',   e => { keys[e.key.toLowerCase()] = false; });

// ── INPUT: RIGHT-CLICK = use selected skill ──
window.addEventListener('contextmenu', e => {
  if (state.screen !== 'game') return;
  e.preventDefault();
  handleSkillUse(e.shiftKey, e.altKey);
});

// ── INPUT: SCROLL = cycle selected skill ──
window.addEventListener('wheel', e => {
  // Prevent browser zoom or history navigation on modified scroll
  if (e.altKey || e.shiftKey || e.ctrlKey) {
    e.preventDefault();
  }
  
  if (state.screen !== 'game' || state.moveset.length === 0) return;
  
  // Also prevent default for normal scrolls in game to stop page movement
  if (!e.altKey && !e.shiftKey && !e.ctrlKey) {
    e.preventDefault();
  }
  
  const sk = state.moveset[state.selectedSkill];
  if (e.shiftKey && rightMouseDown && sk && sk.id === 'warp_gate') {
    const dir = e.deltaY > 0 ? 1 : -1;
    const colors = ['purple', 'red', 'blue', 'green', 'yellow', 'orange', 'cyan'];
    let idx = colors.indexOf(state.currentGateColor || 'purple');
    idx = (idx + dir + colors.length) % colors.length;
    state.currentGateColor = colors[idx];
    
    // Show message
    showMessage(`Gate Color: ${state.currentGateColor.toUpperCase()}`);
    return;
  }
  
  if (e.altKey && sk && sk.id === 'warp_gate' && state.warpGates) {
    const dir = e.deltaY > 0 ? 1 : -1;
    let nearest = null, nearDist = Infinity;
    state.warpGates.forEach(g => {
      const d = Math.hypot(mouse.x - g.x, mouse.y - g.y);
      if (d < nearDist) { nearDist = d; nearest = g; }
    });
    
    if (nearest && nearDist < 100) {
      nearest.angle = (nearest.angle || 0) + dir * 0.2;
      
      if (state.mode === 'pvp' && state.pvpChannel) {
        state.pvpChannel.postMessage({
          type: 'rotate_gate',
          id: nearest.id,
          angle: nearest.angle
        });
      }
    }
    return;
  }
  
  if (e.shiftKey) {
    state.combatMode = state.combatMode === 'ranged' ? 'melee' : 'ranged';
    const label = document.getElementById('hud-combat-mode');
    if (label) {
      label.textContent = state.combatMode.toUpperCase();
      label.style.background = state.combatMode === 'ranged' ? 'var(--purple)' : 'var(--blue)';
    }
    return;
  }
  
  const dir = e.deltaY > 0 ? 1 : -1;
  state.selectedSkill = (state.selectedSkill + dir + state.moveset.length) % state.moveset.length;
}, { passive: false });

function startGame() {
  state.score = 0; state.wave = 1; state.kills = 0;
  state.setTarget = null; state.selectedSkill = 0;
  enemies = []; projectiles = []; particles_fx = [];
  player.hp = player.maxHp; player.cooldowns = [0,0,0,0]; player.invincible = 0;
  
  if (state.mode === 'pvp') {
    player.x = state.isPvpHost ? 100 : canvas.width - 100;
    player.y = canvas.height / 2;
  } else {
    player.x = canvas.width / 2;
    player.y = canvas.height / 2;
  }
  
  waveTimer = 0; waveDelay = 4000;
  
  if (state.mode === 'pvai') {
    const count = state.pvaiEnemyCount || 1;
    for (let i = 0; i < count; i++) {
      const edge = Math.floor(Math.random() * 3) + 1; // 1, 2, or 3 (sides and bottom)
      let x, y;
      if (edge === 1) { x = canvas.width + 30; y = 70 + Math.random() * (canvas.height - 70); }
      else if (edge === 2) { x = Math.random() * canvas.width; y = canvas.height + 30; }
      else { x = -30; y = 70 + Math.random() * (canvas.height - 70); }
      const hasSword = state.pvaiEnemySettings ? state.pvaiEnemySettings.hasSword : false;
      const hasArmor = state.pvaiEnemySettings ? state.pvaiEnemySettings.hasArmor : false;
      const hasBow = state.pvaiEnemySettings ? state.pvaiEnemySettings.hasBow : false;
      const isEmitter = state.pvaiEnemySettings ? state.pvaiEnemySettings.isEmitter : false;
      
      let hp = 100;
      let dmg = 10;
      if (hasArmor) hp += 50;
      if (hasSword) dmg += 10;
      if (isEmitter) hp += 100;

      const arrowTypes = ['normal', 'fire', 'freeze', 'poison', 'slowness', 'heal'];
      const arrowType = hasBow ? arrowTypes[Math.floor(Math.random() * arrowTypes.length)] : null;

      enemies.push({ 
        x, y, r: 16, hp: hp, maxHp: hp, speed: 1.5, baseSpeed: 1.5, color: '#ef4444', flash: 0, 
        confusedTimer: 0, forgetTimer: 0, wanderAngle: 0,
        hotTimer: 0, coldTimer: 0, fleeTimer: 0, frozenTimer: 0,
        hasSword, hasArmor, hasBow, isEmitter, arrowType, damage: dmg,
        shootTimer: 0
      });
    }
  }

  buildHUD();
  showScreen('game');
  document.body.classList.add('in-game');
  if (state.animId) cancelAnimationFrame(state.animId);
  state.running = true;
  lastTime = performance.now();
  state.animId = requestAnimationFrame(gameLoop);
}

function startPvpGame() {
  state.mode = 'pvp';
  startGame();
  
  initPvP();
}

// ── HUD BUILD ──
function buildHUD() {
  // Removed mode badge update as it was removed from HUD

  const bar = document.getElementById('skill-bar');
  bar.innerHTML = '';
  if (state.moveset.length === 0) return;
  state.moveset.forEach((sk, i) => {
    const container = document.createElement('div');
    container.className = 'skill-container';
    container.innerHTML = `
      <div class="skill-name">${sk.name}</div>
      <div class="skill-btn" id="skbtn-${i}">
        <div class="sb-icon">${sk.icon}</div>
        <div class="sb-key sb-scroll-hint">${i + 1}</div>
        <div class="cd-overlay" id="cd-overlay-${i}" style="height:0%"></div>
        <div class="sb-cd" id="sb-cd-${i}"></div>
      </div>`;
    
    container.querySelector('.skill-btn').addEventListener('click', () => { state.selectedSkill = i; });
    bar.appendChild(container);
  });
}

function updateHUD() {
  const pct = Math.max(0, player.hp / player.maxHp * 100);
  document.getElementById('hud-health-fill').style.width = pct + '%';
  document.getElementById('hud-health-fill').style.background =
    pct > 50 ? '#22c55e' : pct > 25 ? '#f59e0b' : '#ef4444';
  document.getElementById('hud-hp-text').textContent = Math.ceil(player.hp);
  // Wave and score removed from HUD

  const now = performance.now();
  state.moveset.forEach((sk, i) => {
    const rem = Math.max(0, player.cooldowns[i] - now);
    const overlay = document.getElementById('cd-overlay-' + i);
    const cdText  = document.getElementById('sb-cd-' + i);
    const btn     = document.getElementById('skbtn-' + i);
    if (!overlay) return;
    
    // Selected skill highlight
    btn.classList.toggle('skill-selected', i === state.selectedSkill);

    // Temperature display
    const nameLabel = btn.parentElement.querySelector('.skill-name');
    if (sk.type === 'temperature') {
      const p = Math.round(player.temperature);
      if (p > 0) {
        nameLabel.innerHTML = `${sk.name} <span class="temp-hot">+${p}%</span>`;
      } else if (p < 0) {
        nameLabel.innerHTML = `${sk.name} <span class="temp-cold">${p}%</span>`;
      } else {
        nameLabel.innerHTML = `${sk.name}`;
      }
    }
    
    if (sk.id === 'warp_gate') {
      const color = state.currentGateColor || 'purple';
      nameLabel.style.color = color;
      btn.querySelector('.sb-icon').style.color = color;
    }
    
    if (rem > 0) {
      const pctCd = rem / (sk.cooldown * 1000);
      overlay.style.height = (pctCd * 100) + '%';
      cdText.textContent = (rem / 1000).toFixed(1);
      btn.classList.add('on-cooldown');
    } else {
      overlay.style.height = '0%';
      cdText.textContent = '';
      btn.classList.remove('on-cooldown');
    }
  });
}

// ── QUIT ──
document.getElementById('btn-quit').addEventListener('click', endGame);

function endGame() {
  state.running = false;
  cancelAnimationFrame(state.animId);
  document.body.classList.remove('in-game');
  showScreen('menu');
}

// ── GAME OVER SCREEN ──
function triggerGameOver() {
  state.running = false;
  cancelAnimationFrame(state.animId);
  document.body.classList.remove('in-game');
  document.getElementById('go-score').textContent = state.score;
  document.getElementById('go-wave').textContent = state.wave;
  document.getElementById('go-kills').textContent = state.kills;
  showScreen('gameover');
}

document.getElementById('btn-retry').addEventListener('click', () => startGame());
document.getElementById('btn-main-menu').addEventListener('click', () => showScreen('menu'));

// ═══════════════════════════════════════════════
//  SKILLS / PROJECTILES
// ═══════════════════════════════════════════════
function handleSkillUse(shiftKey, ctrlKey) {
  const idx = state.selectedSkill;
  const sk = state.moveset[idx];
  if (!sk) return;
  
  if (sk.type === 'temperature' && ctrlKey) {
    player.temperature = 0;
    return;
  }
  
  const now = performance.now();

  // Shift+Swap (set target) is free — no cooldown consumed
  const isFreeAction = sk.type === 'swap' && shiftKey && !ctrlKey;
  if (!isFreeAction) {
    if (player.cooldowns[idx] > now) return;
    
    // For temperature skill, we don't set cooldown on use, but on release!
    if (sk.type !== 'temperature') {
      player.cooldowns[idx] = now + sk.cooldown * 1000;
    }
  }

  fireSkill(sk, shiftKey, ctrlKey);
}

// ── FIND NEAREST ENEMY TO A POINT ──
function nearestEnemyTo(x, y, exclude) {
  let nearest = null, nearDist = Infinity;
  enemies.forEach(e => {
    if (e === exclude || e.hp <= 0) return;
    const d = Math.hypot(e.x - x, e.y - y);
    if (d < nearDist) { nearDist = d; nearest = e; }
  });
  
  if (state.mode === 'pvp' && state.remotePlayer && state.remotePlayer !== exclude) {
    const d = Math.hypot(state.remotePlayer.x - x, state.remotePlayer.y - y);
    if (d < nearDist) { nearDist = d; nearest = state.remotePlayer; }
  }
  return nearest;
}

// ── UNIVERSAL TELEPORTATION FOR WARP GATES ──
function teleportEntity(entity, dt) {
  if (!state.warpGates) return;
  
  if (entity.gateCooldown > 0) {
    entity.gateCooldown -= dt;
    return;
  }
  
  for (let i = 0; i < state.warpGates.length; i++) {
    const g = state.warpGates[i];
    const dist = Math.hypot(entity.x - g.x, entity.y - g.y);
    if (dist < (entity.r || 15) + g.r) {
      const linked = state.warpGates.find(other => other !== g && other.color === g.color);
      if (linked) {
        spawnTeleportFx(entity.x, entity.y, g.color);
        
        const ang = g.angle || 0;
        const wx = g.x - Math.cos(ang) * (g.r - 5);
        const wy = g.y - Math.sin(ang) * (g.r - 5);
        const bx = g.x + Math.cos(ang) * (g.r - 5);
        const by = g.y + Math.sin(ang) * (g.r - 5);
        
        const distWhite = Math.hypot(entity.x - wx, entity.y - wy);
        const distBlack = Math.hypot(entity.x - bx, entity.y - by);
        
        const linkedAng = linked.angle || 0;
        
        // Offset exit position so entity doesn't immediately touch the gate again
        const offset = (entity.r || 15) + g.r + 5;
        
        // Check if it's a projectile to redirect it
        const isProjectile = entity.isEnergyBall || entity.arrowType || entity.fromPlayer !== undefined;
        const speed = isProjectile ? Math.hypot(entity.vx, entity.vy) : 0;
        
        if (distWhite < distBlack) {
          // Entered white side -> Come out of white side of linked gate
          entity.x = linked.x - Math.cos(linkedAng) * offset;
          entity.y = linked.y - Math.sin(linkedAng) * offset;
          
          if (isProjectile) {
            const newAng = linkedAng + Math.PI; // White side is at angle + PI
            entity.vx = Math.cos(newAng) * speed;
            entity.vy = Math.sin(newAng) * speed;
          }
        } else {
          // Entered black side -> Come out of black side of linked gate
          entity.x = linked.x + Math.cos(linkedAng) * offset;
          entity.y = linked.y + Math.sin(linkedAng) * offset;
          
          if (isProjectile) {
            const newAng = linkedAng; // Black side is at angle
            entity.vx = Math.cos(newAng) * speed;
            entity.vy = Math.sin(newAng) * speed;
          }
        }
        
        spawnTeleportFx(entity.x, entity.y, g.color);
        entity.gateCooldown = 1.0; // Prevent instant return
        break; // Stop loop after teleporting
      }
    }
  }
}

// ── FIND NEAREST TARGETABLE TO A POINT ──
function nearestTargetableTo(x, y, exclude) {
  let nearest = null, nearDist = Infinity;
  
  // Check enemies (including boulders)
  enemies.forEach(e => {
    if (e === exclude || e.hp <= 0) return;
    const d = Math.hypot(e.x - x, e.y - y);
    if (d < nearDist) { nearDist = d; nearest = e; }
  });
  
  // Check projectiles (arrows and energy balls)
  projectiles.forEach(p => {
    if (p === exclude) return;
    const d = Math.hypot(p.x - x, p.y - y);
    if (d < nearDist) { nearDist = d; nearest = p; }
  });
  
  // Check remote player in PvP
  if (state.mode === 'pvp' && state.remotePlayer && state.remotePlayer !== exclude) {
    const d = Math.hypot(state.remotePlayer.x - x, state.remotePlayer.y - y);
    if (d < nearDist) { nearDist = d; nearest = state.remotePlayer; }
  }
  
  return nearest;
}

function fireSkill(sk, shiftKey, ctrlKey) {
  if (sk.type === 'teleport') {
    useTeleport(sk, shiftKey, ctrlKey);
  } else if (sk.type === 'swap') {
    useSwap(sk, shiftKey, ctrlKey);
  } else if (sk.type === 'boulder') {
    useBoulder(sk);
  } else if (sk.type === 'warp_gate') {
    useWarpGate(sk, shiftKey, ctrlKey);
  } else if (sk.type === 'gravity') {
    useGravityPoint(sk, shiftKey, ctrlKey);
  } else if (sk.type === 'gravity_v2') {
    useGravityPointV2(sk, shiftKey, ctrlKey);
  } else if (sk.type === 'trap_push') {
    useTrapPush(sk, shiftKey, ctrlKey);
  } else if (sk.type === 'thermal_burst') {
    useThermalBurst(sk, shiftKey);
  } else if (sk.type === 'thermal_trail') {
    useThermalTrail(sk, shiftKey);
  } else if (sk.type === 'convection_beam') {
    useConvectionBeam(sk, shiftKey);
  } else if (sk.type === 'projectile') {
    // Aim toward nearest enemy; fall back to mouse direction
    let tx = mouse.x, ty = mouse.y;
    const near = nearestEnemyTo(mouse.x, mouse.y, null);
    if (near) { tx = near.x; ty = near.y; }
    const angle = Math.atan2(ty - player.y, tx - player.x);
    projectiles.push({
      x: player.x, y: player.y,
      vx: Math.cos(angle) * (sk.projSpeed || 8),
      vy: Math.sin(angle) * (sk.projSpeed || 8),
      r: sk.projRadius || 8, color: sk.color,
      damage: sk.damage, range: sk.range,
      dist: 0, fromPlayer: true,
    });
  } else if (sk.type === 'aoe') {
    enemies.forEach(e => {
      const d = Math.hypot(e.x - player.x, e.y - player.y);
      if (d <= sk.range) { e.hp -= sk.damage; spawnHitParticles(e.x, e.y, sk.color, 6); }
    });
    spawnAoeRing(player.x, player.y, sk.range, sk.color);
  } else if (sk.type === 'heal') {
    player.hp = Math.min(player.maxHp, player.hp + sk.healAmount);
    spawnHitParticles(player.x, player.y, '#22c55e', 8);
  }
}

// ── TELEPORT FX ──
function spawnTeleportFx(x, y, color) {
  particles_fx.push({ type: 'ring', x, y, radius: 0, maxR: 55, color, life: 1 });
  spawnHitParticles(x, y, color, 10);
}

function spawnEnemyProjectile(x, y, angle, arrowType = 'normal', shooter = null) {
  let color = '#ff4500';
  if (arrowType === 'fire') color = '#ef4444';
  if (arrowType === 'freeze') color = '#00bfff';
  if (arrowType === 'poison') color = '#22c55e';
  if (arrowType === 'slowness') color = '#a855f7';
  if (arrowType === 'heal') color = '#ffff00';

  projectiles.push({
    x, y, vx: Math.cos(angle) * 3, vy: Math.sin(angle) * 3,
    r: 4, color: color, isEnemy: true,
    range: 500, dist: 0, damage: 15, fromPlayer: false,
    arrowType: arrowType, shooter: shooter,
    energy: 50
  });
}

// ── PROJECTILES ──
function updateProjectiles(dt) {
  for (let i = projectiles.length - 1; i >= 0; i--) {
    const p = projectiles[i];
    
    if (p.energy !== undefined && p.energy <= 0) {
      projectiles.splice(i, 1);
      continue;
    }

    // ── Warp Gate Teleportation ──
    teleportEntity(p, dt);

    // Gravity Attraction
    if (state.vortices && state.vortices.length > 0) {
      const v = state.vortices[0];
      const dist = Math.hypot(p.x - v.x, p.y - v.y);
      if (dist < 300) {
        const ang = Math.atan2(v.y - p.y, v.x - p.x);
        const force = (1 - dist / 300) * 5; // Attraction force
        p.vx += Math.cos(ang) * force;
        p.vy += Math.sin(ang) * force;
      }
    }

    // Repeller Repulsion (Gravity V2)
    if (state.repellers && state.repellers.length > 0) {
      state.repellers.forEach(v => {
        const dist = Math.hypot(p.x - v.x, p.y - v.y);
        if (dist < 300) {
          const ang = Math.atan2(p.y - v.y, p.x - v.x); // From v to p (Repel)
          const force = (1 - dist / 300) * 5; // Repel force
          p.vx += Math.cos(ang) * force;
          p.vy += Math.sin(ang) * force;
        }
      });
    }

    // Cap speed so they don't go too fast!
    const speed = Math.hypot(p.vx, p.vy);
    const maxSpeed = 10;
    if (speed > maxSpeed) {
      p.vx = (p.vx / speed) * maxSpeed;
      p.vy = (p.vy / speed) * maxSpeed;
    }

    if (p.isEnergyBall) {
      p.energy = p.energy || 100;
      p.energy -= 20 * dt;
      p.r = p.baseR * (p.energy / 100);
      p.damage = p.baseDamage * (p.energy / 100);
      
      if (p.energy <= 0 || p.r < 2) {
        projectiles.splice(i, 1); continue;
      }
      
      if (p.energyBallType === 'homing' && p.target && p.target.hp > 0) {
        const ang = Math.atan2(p.target.y - p.y, p.target.x - p.x);
        let steerX = Math.cos(ang);
        let steerY = Math.sin(ang);
        
        // Obstacle avoidance!
        enemies.forEach(e => {
          if (e === p.target || e.hp <= 0) return;
          const dist = Math.hypot(e.x - p.x, e.y - p.y);
          if (dist < 100) { // If close to an obstacle enemy
            const awayAng = Math.atan2(p.y - e.y, p.x - e.x);
            const force = (100 - dist) / 100;
            steerX += Math.cos(awayAng) * force * 2;
            steerY += Math.sin(awayAng) * force * 2;
          }
        });
        
        p.vx += steerX * 0.5;
        p.vy += steerY * 0.5;
        const speed = Math.hypot(p.vx, p.vy);
        p.vx = (p.vx / speed) * 6;
        p.vy = (p.vy / speed) * 6;
      } else if (p.energyBallType === 'bouncing') {
        if (p.x < 0 || p.x > canvas.width) p.vx = -p.vx;
        if (p.y < 0 || p.y > canvas.height) p.vy = -p.vy;
      }
      
      p.x += p.vx; p.y += p.vy;
      
      // Spawn trail particles based on energy!
      if (Math.random() < 0.4) {
        particles_fx.push({
          type: 'dot', x: p.x, y: p.y,
          vx: -p.vx * 0.2 + (Math.random() - 0.5) * 2,
          vy: -p.vy * 0.2 + (Math.random() - 0.5) * 2,
          color: p.color, life: 0.3, size: p.r * 0.6
        });
      }
    } else {
      p.x += p.vx; p.y += p.vy;
      p.dist += Math.hypot(p.vx, p.vy);
      if (p.dist > p.range || p.x < 0 || p.x > canvas.width || p.y < 0 || p.y > canvas.height) {
        projectiles.splice(i, 1); continue;
      }
    }

    // ── Projectile vs Projectile Collision ──
    for (let j = i - 1; j >= 0; j--) {
      const p2 = projectiles[j];
      if (p.fromPlayer !== p2.fromPlayer) { // Only collide opposing projectiles!
        const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
        if (dist < p.r + p2.r) {
          const e1 = p.energy || 50;
          const e2 = p2.energy || 50;
          
          if (e1 > e2) {
            p.energy = e1 - e2;
            p2.energy = 0;
            spawnHitParticles(p2.x, p2.y, p2.color, 5);
          } else if (e2 > e1) {
            p2.energy = e2 - e1;
            p.energy = 0;
            spawnHitParticles(p.x, p.y, p.color, 5);
          } else {
            p.energy = 0;
            p2.energy = 0;
            spawnHitParticles(p.x, p.y, p.color, 5);
            spawnHitParticles(p2.x, p2.y, p2.color, 5);
          }
          
          // Update sizes/damage if they are energy balls
          if (p.isEnergyBall) {
            p.r = p.baseR * (p.energy / 100);
            p.damage = p.baseDamage * (p.energy / 100);
          }
          if (p2.isEnergyBall) {
            p2.r = p2.baseR * (p2.energy / 100);
            p2.damage = p2.baseDamage * (p2.energy / 100);
          }
        }
      }
    }

    // ── Enemy Projectile vs Boulder ──
    if (p.isEnemy) {
      enemies.forEach(e => {
        if (e.isBoulder && e.z === 0) {
          const dist = Math.hypot(p.x - e.x, p.y - e.y);
          if (dist < p.r + e.r) {
            p.energy = 0; // Destroy projectile!
            e.hp -= p.damage || 10;
            e.flash = 0.3;
            spawnHitParticles(p.x, p.y, p.color, 3);
          }
        }
      });
    }

    // ── Temperature Aura Draining ──
    if (!p.fromPlayer) { // Only drain enemy projectiles!
      const distToPlayer = Math.hypot(p.x - player.x, p.y - player.y);
      if (player.temperature > 0) {
        const hotRadius = 200 - (player.temperature / 100) * 100;
        if (distToPlayer < hotRadius) {
          p.energy = (p.energy || 50) - 50 * dt; // Drain faster in hot zone!
          if (Math.random() < 0.2) spawnHitParticles(p.x, p.y, '#ff4500', 1);
        }
      } else if (player.temperature < 0) {
        const coldRadius = 150;
        if (distToPlayer < coldRadius) {
          p.energy = (p.energy || 50) - 30 * dt; // Drain in cold zone!
          if (Math.random() < 0.2) spawnHitParticles(p.x, p.y, '#00bfff', 1);
        }
      }
    }
    
    if (state.mode === 'pvp' && state.remotePlayer && p.fromPlayer) {
      const rp = state.remotePlayer;
      const distToRp = Math.hypot(p.x - rp.x, p.y - rp.y);
      if (rp.temperature > 0) {
        const hotRadius = 200 - (rp.temperature / 100) * 100;
        if (distToRp < hotRadius) {
          p.energy = (p.energy || 50) - 50 * dt;
          if (Math.random() < 0.2) spawnHitParticles(p.x, p.y, '#ff4500', 1);
        }
      } else if (rp.temperature < 0) {
        const coldRadius = 150;
        if (distToRp < coldRadius) {
          p.energy = (p.energy || 50) - 30 * dt;
          if (Math.random() < 0.2) spawnHitParticles(p.x, p.y, '#00bfff', 1);
        }
      }
    }

    // Hit enemies
    let hit = false;
    if (p.fromPlayer) {
      if (state.mode === 'pvp' && state.remotePlayer) {
        const rp = state.remotePlayer;
        if (Math.hypot(p.x - rp.x, p.y - rp.y) < p.r + rp.r) {
          state.pvpChannel.postMessage({type: 'hit', damage: p.damage});
          spawnHitParticles(rp.x, rp.y, p.color, 5);
          projectiles.splice(i, 1); hit = true;
        }
      }
      
      if (!hit) {
        if (p.isEnergyBall) {
          if (p.energyBallType === 'homing') {
            if (p.target && p.target.hp > 0 && Math.hypot(p.x - p.target.x, p.y - p.target.y) < p.r + p.target.r) {
              p.target.hp -= p.damage;
              spawnHitParticles(p.target.x, p.target.y, p.color, 5);
              projectiles.splice(i, 1); hit = true;
            }
          } else {
            for (let j = enemies.length - 1; j >= 0; j--) {
              const e = enemies[j];
              if (e.hp <= 0) continue;
              if (Math.hypot(p.x - e.x, p.y - e.y) < p.r + e.r) {
                if (p.energyBallType === 'piercing') {
                  if (p.damage >= e.hp) {
                    e.hp = 0;
                    spawnHitParticles(e.x, e.y, p.color, 5);
                    p.energy -= 25;
                  } else {
                    e.hp -= p.damage;
                    spawnHitParticles(e.x, e.y, p.color, 5);
                    projectiles.splice(i, 1); hit = true; break;
                  }
                } else if (p.energyBallType === 'bouncing') {
                  e.hp -= p.damage;
                  spawnHitParticles(e.x, e.y, p.color, 5);
                  const ang = Math.atan2(p.y - e.y, p.x - e.x);
                  p.vx = Math.cos(ang) * 8;
                  p.vy = Math.sin(ang) * 8;
                  p.energy -= 10;
                  break;
                }
              }
            }
          }
        }
      } else {
        for (let j = enemies.length - 1; j >= 0; j--) {
          const e = enemies[j];
          if (e.hp <= 0) continue;
          if (Math.hypot(p.x - e.x, p.y - e.y) < p.r + e.r) {
            e.hp -= p.damage;
            spawnHitParticles(e.x, e.y, p.color, 5);
            projectiles.splice(i, 1); hit = true; break;
          }
        }
      }
    } else {
      // Enemy hits player!
      if (Math.hypot(p.x - player.x, p.y - player.y) < p.r + player.r && player.invincible <= 0) {
        if (p.arrowType === 'heal') continue; // Heal arrow doesn't hurt player
        
        player.hp -= p.damage;
        player.invincible = 0.8;
        spawnHitParticles(player.x, player.y, p.color, 4);
        
        if (p.arrowType === 'freeze') player.frozenTimer = 1.5;
        if (p.arrowType === 'poison') { player.poisonTimer = 3; player.poisonDmg = 5; }
        if (p.arrowType === 'slowness') { player.slowTimer = 3; }
        
        projectiles.splice(i, 1);
        if (player.hp <= 0) { triggerGameOver(); return; }
        continue;
      }
      
      // Heal arrow hits comrades
      if (p.isEnemy && p.arrowType === 'heal') {
        for (let j = enemies.length - 1; j >= 0; j--) {
          const e = enemies[j];
          if (e.hp <= 0 || e === p.shooter) continue;
          if (Math.hypot(p.x - e.x, p.y - e.y) < p.r + e.r) {
            e.hp = Math.min(e.maxHp, e.hp + 20);
            spawnHitParticles(e.x, e.y, '#ffff00', 5);
            projectiles.splice(i, 1); break;
          }
        }
      }
    }
  }
}

// ── AOE RING FX ──
function spawnAoeRing(x, y, radius, color) {
  particles_fx.push({ type: 'ring', x, y, radius: 0, maxR: radius, color, life: 1 });
}

// ── HIT PARTICLES ──
function spawnHitParticles(x, y, color, count) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 1 + Math.random() * 3;
    particles_fx.push({
      type: 'dot', x, y,
      vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
      color, life: 1, size: 3 + Math.random() * 4,
    });
  }
}

// ── FX UPDATE ──
function updateFx(dt) {
  for (let i = particles_fx.length - 1; i >= 0; i--) {
    const p = particles_fx[i];
    p.life -= dt * 2;
    if (p.life <= 0) { particles_fx.splice(i, 1); continue; }
    
    if (p.type === 'puddle') {
      enemies.forEach(e => {
        const d = Math.hypot(e.x - p.x, e.y - p.y);
        if (d < e.r + p.size) {
          if (p.trailType === 'hot') {
            e.hp -= 20 * dt;
            e.flash = 0.2;
          } else if (p.trailType === 'cold') {
            e.frozenTimer = 5; // Freeze for 5s!
          }
        }
      });
    }
    
    if (p.type === 'ring') {
      p.radius += (p.maxR - p.radius) * dt * 5;
    } else {
      p.x += p.vx; p.y += p.vy;
      p.vx *= 0.92; p.vy *= 0.92;
    }
  }
}

// ═══════════════════════════════════════════════
//  ENEMY SYSTEM
// ═══════════════════════════════════════════════
function spawnWave(waveNum) {
  const count = 3 + waveNum * 2;
  const hp    = 30 + waveNum * 15;
  const speed = 0.8 + waveNum * 0.15;
  for (let i = 0; i < count; i++) {
    const edge = Math.floor(Math.random() * 3) + 1; // 1, 2, or 3 (sides and bottom)
    let x, y;
    if (edge === 1) { x = canvas.width + 30; y = 70 + Math.random() * (canvas.height - 70); }
    else if (edge === 2) { x = Math.random() * canvas.width; y = canvas.height + 30; }
    else { x = -30; y = 70 + Math.random() * (canvas.height - 70); }
    const hasSword = Math.random() < (waveNum * 0.05);
    const hasArmor = Math.random() < (waveNum * 0.05);
    const hasBow = Math.random() < (waveNum * 0.03);
    const isEmitter = Math.random() < (waveNum * 0.04);
    
    const arrowTypes = ['normal', 'fire', 'freeze', 'poison', 'slowness', 'heal'];
    const arrowType = hasBow ? arrowTypes[Math.floor(Math.random() * arrowTypes.length)] : null;
    
    let curHp = hp;
    let curDmg = 10;
    if (hasArmor) curHp += 50;
    if (hasSword) curDmg += 10;
    if (isEmitter) curHp += 100; // Emitters are tougher!

    enemies.push({ 
      x, y, r: 16, hp: curHp, maxHp: curHp, speed, baseSpeed: speed, color: '#ef4444', flash: 0, 
      confusedTimer: 0, forgetTimer: 0, wanderAngle: 0,
      hotTimer: 0, coldTimer: 0, fleeTimer: 0, frozenTimer: 0,
      hasSword, hasArmor, hasBow, isEmitter, arrowType, damage: curDmg,
      shootTimer: 0
    });
  }
}

// ═══════════════════════════════════════════════
//  ENEMY SYSTEM
// ═══════════════════════════════════════════════
function spawnWave(waveNum) {
  const count = 3 + waveNum * 2;
  const hp    = 30 + waveNum * 15;
  const speed = 0.8 + waveNum * 0.15;
  for (let i = 0; i < count; i++) {
    const edge = Math.floor(Math.random() * 3) + 1; // 1, 2, or 3 (sides and bottom)
    let x, y;
    if (edge === 1) { x = canvas.width + 30; y = 70 + Math.random() * (canvas.height - 70); }
    else if (edge === 2) { x = Math.random() * canvas.width; y = canvas.height + 30; }
    else { x = -30; y = 70 + Math.random() * (canvas.height - 70); }
    const hasSword = Math.random() < (waveNum * 0.05);
    const hasArmor = Math.random() < (waveNum * 0.05);
    const hasBow = Math.random() < (waveNum * 0.03);
    
    let curHp = hp;
    let curDmg = 10;
    if (hasArmor) curHp += 50;
    if (hasSword) curDmg += 10;

    enemies.push({ 
      x, y, r: 16, hp: curHp, maxHp: curHp, speed, baseSpeed: speed, color: '#ef4444', flash: 0, 
      confusedTimer: 0, forgetTimer: 0, wanderAngle: 0,
      hotTimer: 0, coldTimer: 0, fleeTimer: 0, frozenTimer: 0,
      hasSword, hasArmor, hasBow, damage: curDmg
    });
  }
}

function triggerGameOver() {
  if (state.mode === 'pvp') {
    if (state.pvpChannel) {
      state.pvpChannel.postMessage({type: 'gameover', result: 'win'});
    }
    state.pvpResult = 'loose';
    state.running = false;
  } else {
    state.running = false;
    alert('Game Over! Your Score: ' + state.score);
    showScreen('menu');
  }
}

function updateEnemies(dt) {
  if (state.mode !== 'endless' && state.mode !== 'pvai') return;
  
  // Wave management (only in endless mode)
  if (state.mode === 'endless') {
    waveTimer += dt * 1000;
    const allDead = enemies.length === 0 || enemies.every(e => e.hp <= 0);
    if (allDead && waveTimer >= waveDelay) {
      // clear dead
      enemies = enemies.filter(e => e.hp > 0);
      spawnWave(state.wave);
      state.wave++;
      waveTimer = 0;
      waveDelay = Math.max(1500, waveDelay - 100);
    }
  }

  const now = performance.now();
  for (let i = enemies.length - 1; i >= 0; i--) {
    const e = enemies[i];
    
    if (e.hp <= 0) {
      if (e.isBoulder) {
        spawnHitParticles(e.x, e.y, '#78716c', 10); // Stone particles!
      } else {
        spawnHitParticles(e.x, e.y, '#ef4444', 8);
        state.score += 10 + state.wave * 5;
        state.kills++;
      }
      enemies.splice(i, 1);
      continue;
    }

    // ── Warp Gate Teleportation ──
    if (!e.isBoulder || e.z === 0) {
      teleportEntity(e, dt);
    }

    // Gravity Attraction
    if (state.vortices && state.vortices.length > 0) {
      const v = state.vortices[0];
      const dist = Math.hypot(e.x - v.x, e.y - v.y);
      if (dist < 300) {
        const ang = Math.atan2(v.y - e.y, v.x - e.x);
        const force = (1 - dist / 300) * 7; // Attraction force
        e.x += Math.cos(ang) * force;
        e.y += Math.sin(ang) * force;
        
        // Damage enemies near center
        if (dist < 60) {
          e.hp -= 40 * dt; // Deal 40 DPS!
          e.flash = 0.2;
          if (Math.random() < 0.3) spawnHitParticles(e.x, e.y, '#000000', 1);
        }
      }
    }

    // Repeller Repulsion (Gravity V2)
    if (state.repellers && state.repellers.length > 0) {
      state.repellers.forEach(v => {
        const dist = Math.hypot(e.x - v.x, e.y - v.y);
        if (dist < 300) {
          const ang = Math.atan2(e.y - v.y, e.x - v.x); // From v to e (Repel)
          const force = (1 - dist / 300) * 8; // Repel force
          e.x += Math.cos(ang) * force;
          e.y += Math.sin(ang) * force;
          
          if (dist < 60) {
            e.hp -= 40 * dt; // Deal 40 DPS!
            e.flash = 0.2;
            if (Math.random() < 0.3) spawnHitParticles(e.x, e.y, '#ffffff', 1);
          }
        }
      });
    }

    // Trap Ring Attraction
    if (state.trapRings && state.trapRings.length > 0) {
      state.trapRings.forEach(v => {
        const dist = Math.hypot(e.x - v.x, e.y - v.y);
        if (dist < v.r2 + 150) { // Attraction range
          const ang = Math.atan2(v.y - e.y, v.x - e.x); // Toward center
          let force = 0;
          
          if (dist < v.r1) {
            // Inside inner radius -> Push OUTWARD to ring
            force = - (1 - dist / v.r1) * 6; // Negative force means away from center
          } else if (dist > v.r2) {
            // Outside outer radius -> Pull INWARD to ring
            force = (1 - (dist - v.r2) / 150) * 6;
          } else {
            // Inside the ring! Trap them!
            force = 0;
            e.x += (Math.random() - 0.5) * 4; // Shake
            e.y += (Math.random() - 0.5) * 4;
          }
          
          e.x += Math.cos(ang) * force;
          e.y += Math.sin(ang) * force;
        }
      });
    }

    if (e.isBoulder) {
      if (e.z > 0) {
        e.z -= dt * 200; // Fall speed
        if (e.z <= 0) {
          e.z = 0;
          // Crush!
          enemies.forEach(en => {
            if (en !== e && en.hp > 0 && !en.isBoulder) {
              const d = Math.hypot(en.x - e.x, en.y - e.y);
              if (d < e.r + en.r) {
                en.hp -= e.damage;
                spawnHitParticles(en.x, en.y, '#ff4500', 5);
              }
            }
          });
        }
      }
      continue; // Skip normal AI for boulders!
    }
    if (e.flash > 0) e.flash -= dt * 5;

    // Handle timers
    if (e.confusedTimer > 0) e.confusedTimer -= dt;
    if (e.forgetTimer > 0) e.forgetTimer -= dt;
    if (e.fleeTimer > 0) e.fleeTimer -= dt;
    if (e.frozenTimer > 0) e.frozenTimer -= dt;

    // Temperature effects
    const distToPlayer = Math.hypot(e.x - player.x, e.y - player.y);
    e.speed = e.baseSpeed; // Reset speed

    if (player.temperature > 0) {
      const hotRadius = 200 - (player.temperature / 100) * 100;
      const hotThreshold = 2 - (player.temperature / 100) * 1.5; // 2s to 0.5s
      
      if (distToPlayer < hotRadius) {
        e.hotTimer += dt;
        if (e.hotTimer > hotThreshold) {
          e.hp -= 30 * dt;
          
          // Sacrifice logic: if can't survive escape, charge player!
          const escapeTime = (hotRadius - distToPlayer) / (e.baseSpeed * 1.5);
          const damageToTake = 30 * escapeTime;
          
          if (e.hp < damageToTake) {
            e.fleeTimer = 0;
            e.isSacrificing = true;
          } else {
            e.fleeTimer = 1.5;
            e.isSacrificing = false;
          }
          
          spawnHitParticles(e.x, e.y, '#ff4500', 1);
        }
      } else {
        e.hotTimer = Math.max(0, e.hotTimer - dt);
        e.isSacrificing = false;
      }
    } else if (player.temperature < 0) {
      const coldRadius = 150;
      const absTemp = Math.abs(player.temperature);
      const coldThreshold = 3 - (absTemp / 100) * 2.5; // 3s to 0.5s
      
      if (distToPlayer < coldRadius) {
        e.speed = e.baseSpeed * 0.4;
        e.coldTimer += dt;
        if (e.coldTimer > coldThreshold) {
          e.frozenTimer = 2;
          e.coldTimer = 0;
        }
      } else {
        e.coldTimer = Math.max(0, e.coldTimer - dt);
      }
    } else {
      e.hotTimer = Math.max(0, e.hotTimer - dt);
      e.coldTimer = Math.max(0, e.coldTimer - dt);
    }

    // Determine target
    let targetX = player.x;
    let targetY = player.y;

    const decoy = enemies.find(en => en.confusedTimer > 0);
    if (decoy && decoy !== e) {
      targetX = decoy.x;
      targetY = decoy.y;
    } else if (e.forgetTimer > 0) {
      // Wander if lost track after teleport
      if (Math.random() < 0.05) e.wanderAngle = Math.random() * Math.PI * 2;
      targetX = e.x + Math.cos(e.wanderAngle) * 100;
      targetY = e.y + Math.sin(e.wanderAngle) * 100;
    }

    const ang = Math.atan2(targetY - e.y, targetX - e.x);
    const prevX = e.x;
    const prevY = e.y;
    
    // Move
    let currentSpeed = (e.forgetTimer > 0 && !decoy) ? e.speed * 0.5 : e.speed;
    
    e.color = e.isSacrificing ? '#ff0055' : '#ef4444'; // Angry color if sacrificing
    
    if (e.frozenTimer > 0) {
      currentSpeed = 0;
    } else if (e.isSacrificing) {
      currentSpeed = e.baseSpeed * 1.8; // Charge faster!
      const angToPlayer = Math.atan2(player.y - e.y, player.x - e.x);
      e.x += Math.cos(angToPlayer) * currentSpeed;
      e.y += Math.sin(angToPlayer) * currentSpeed;
    } else if (e.fleeTimer > 0) {
      currentSpeed = e.baseSpeed * 1.5;
      const fleeAng = Math.atan2(e.y - player.y, e.x - player.x);
      e.x += Math.cos(fleeAng) * currentSpeed;
      e.y += Math.sin(fleeAng) * currentSpeed;
    } else if (targetX !== e.x || targetY !== e.y) {
      const distToTarget = Math.hypot(e.x - targetX, e.y - targetY);
      
      if (e.hasBow) {
        if (distToTarget < 100 && e.hasSword) {
          // Switch to Melee: Chase and attack!
          e.x += Math.cos(ang) * currentSpeed;
          e.y += Math.sin(ang) * currentSpeed;
        } else {
          // Ranged mode: Maintain distance and shoot!
          if (distToTarget > 250) {
            // Too far, move closer
            e.x += Math.cos(ang) * currentSpeed;
            e.y += Math.sin(ang) * currentSpeed;
          } else if (distToTarget < 150) {
            // Too close, move away!
            e.x -= Math.cos(ang) * currentSpeed;
            e.y -= Math.sin(ang) * currentSpeed;
          }
          
          // Shoot logic
          e.shootTimer = (e.shootTimer || 0) + dt;
          if (e.shootTimer > 2) { // Every 2 seconds
            e.shootTimer = 0;
            
            if (e.arrowType === 'heal') {
              // Find a damaged comrade!
              const comrade = enemies.find(en => en !== e && en.hp < en.maxHp);
              if (comrade) {
                const angToComrade = Math.atan2(comrade.y - e.y, comrade.x - e.x);
                spawnEnemyProjectile(e.x, e.y, angToComrade, 'heal', e);
              } else {
                spawnEnemyProjectile(e.x, e.y, ang, e.arrowType, e);
              }
            } else {
              spawnEnemyProjectile(e.x, e.y, ang, e.arrowType, e);
            }
          }
        }
      } else if (e.isEmitter) {
        // Emitter AI!
        if (distToTarget > 200) {
          // Ranged: Shoot energy ball!
          e.shootTimer = (e.shootTimer || 0) + dt;
          if (e.shootTimer > 1.5) {
            e.shootTimer = 0;
            projectiles.push({
              x: e.x, y: e.y, vx: Math.cos(ang) * 6, vy: Math.sin(ang) * 6,
              r: 10, baseR: 10, color: '#ff00ff', damage: 20, baseDamage: 20, fromPlayer: false, isEnemy: true,
              isEnergyBall: true, energyBallType: 'piercing', energy: 100
            });
          }
          // Move closer if too far
          if (distToTarget > 400) {
            e.x += Math.cos(ang) * currentSpeed;
            e.y += Math.sin(ang) * currentSpeed;
          }
        } else {
          // Melee: Chase and use combos!
          e.x += Math.cos(ang) * currentSpeed;
          e.y += Math.sin(ang) * currentSpeed;
          
          e.shootTimer = (e.shootTimer || 0) + dt;
          if (e.shootTimer > 1.0) {
            e.shootTimer = 0;
            const r = Math.random();
            if (r < 0.3) {
              // Punch!
              player.hp -= 10;
              spawnHitParticles(player.x, player.y, '#ffffff', 3);
            } else if (r < 0.6) {
              // Knockback!
              player.hp -= 15;
              const pushAng = Math.atan2(player.y - e.y, player.x - e.x);
              player.x += Math.cos(pushAng) * 30;
              player.y += Math.sin(pushAng) * 30;
              spawnHitParticles(player.x, player.y, '#ff4500', 5);
            } else {
              // Barrage!
              player.hp -= 20;
              spawnHitParticles(player.x, player.y, '#ffd700', 6);
            }
            if (player.hp <= 0) { triggerGameOver(); return; }
          }
        }
      } else {
        // Normal melee enemy
        e.x += Math.cos(ang) * currentSpeed;
        e.y += Math.sin(ang) * currentSpeed;
      }
    }
    e.y = Math.max(70 + e.r, e.y); // Keep enemies completely below HUD

    // Movement trail
    if (Math.random() < 0.3) {
      particles_fx.push({
        type: 'dot', x: prevX, y: prevY,
        vx: 0, vy: 0,
        color: 'rgba(239,68,68,0.3)', life: 0.3, size: e.r * 0.6
      });
    }

    // Resolve collision with player or decoy
    const dist = Math.hypot(e.x - targetX, e.y - targetY);
    const minDist = (decoy && decoy !== e) ? e.r + decoy.r : e.r + player.r;
    
    if (dist < minDist && (targetX !== e.x || targetY !== e.y)) {
      const overlap = minDist - dist;
      e.x -= Math.cos(ang) * overlap;
      e.y -= Math.sin(ang) * overlap;
      
      // Damage
      if (decoy && decoy !== e) {
        decoy.hp -= 50 * dt; // Deal damage to the decoy enemy
        spawnHitParticles(decoy.x, decoy.y, '#ef4444', 1);
      } else if (!decoy && e.forgetTimer <= 0 && player.invincible <= 0) {
        player.hp -= 8;
        player.invincible = 0.8;
        spawnHitParticles(player.x, player.y, '#ef4444', 4);
        if (player.hp <= 0) { triggerGameOver(); return; }
      }
    }

    // ── Resolve collision with boulders ──
    enemies.forEach(other => {
      if (other !== e && other.isBoulder && other.z === 0) {
        const distB = Math.hypot(e.x - other.x, e.y - other.y);
        if (distB < e.r + other.r) {
          const angB = Math.atan2(e.y - other.y, e.x - other.x);
          if (other.isPushable) {
            // Push boulder!
            other.x += Math.cos(angB) * 1; // Enemies push slower
            other.y += Math.sin(angB) * 1;
            e.x = other.x + Math.cos(angB) * (e.r + other.r);
            e.y = other.y + Math.sin(angB) * (e.r + other.r);
          } else {
            // Solid: Block enemy
            e.x = other.x + Math.cos(angB) * (e.r + other.r);
            e.y = other.y + Math.sin(angB) * (e.r + other.r);
            
            // If blocked and trying to move, attack the boulder!
            e.boulderAttackTimer = (e.boulderAttackTimer || 0) + dt;
            if (e.boulderAttackTimer > 1.0) {
              e.boulderAttackTimer = 0;
              other.hp -= 20; // Attack boulder!
              other.flash = 0.3;
              spawnHitParticles(other.x, other.y, other.color, 3);
            }
          }
        }
      }
    });
  }

  // Resolve collision between enemies (so they don't stack like soldiers)
  for (let i = 0; i < enemies.length; i++) {
    for (let j = i + 1; j < enemies.length; j++) {
      const e1 = enemies[i];
      const e2 = enemies[j];
      const d = Math.hypot(e1.x - e2.x, e1.y - e2.y);
      const minDist = e1.r + e2.r;
      if (d < minDist) {
        const overlap = minDist - d;
        const ang = Math.atan2(e2.y - e1.y, e2.x - e1.x);
        e1.x -= Math.cos(ang) * overlap * 0.5;
        e1.y -= Math.sin(ang) * overlap * 0.5;
        e2.x += Math.cos(ang) * overlap * 0.5;
        e2.y += Math.sin(ang) * overlap * 0.5;
      }
    }
  }

  if (player.invincible > 0) player.invincible -= dt;
}

// ═══════════════════════════════════════════════
//  PLAYER MOVEMENT
// ═══════════════════════════════════════════════
function updatePlayer(dt) {
  if (player.frozenTimer > 0) {
    player.frozenTimer -= dt;
    return; // Skip movement and actions when frozen
  }

  if (leftMouseDown) {
    chargeTimer += dt;
  }
  player.meleeCooldown = Math.max(0, player.meleeCooldown - dt);

  // Barrage Punches Update
  if (player.barrageTicks > 0) {
    player.barrageTimer += dt;
    if (player.barrageTimer > 0.1) {
      player.barrageTimer = 0;
      player.barrageTicks--;
      
      const angle = Math.atan2(mouse.y - player.y, mouse.x - player.x);
      const range = player.r + 30;
      enemies.forEach(e => {
        const dist = Math.hypot(e.x - player.x, e.y - player.y);
        if (dist < range + e.r) {
          const angToEnemy = Math.atan2(e.y - player.y, e.x - player.x);
          let angleDiff = Math.abs(angle - angToEnemy);
          while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
          angleDiff = Math.abs(angleDiff);
          
          if (angleDiff < Math.PI / 4) {
            e.hp -= 8;
            spawnHitParticles(e.x, e.y, '#ffd700', 2);
            e.x += Math.cos(angle) * 5;
            e.y += Math.sin(angle) * 5;
          }
        }
      });
    }
  }

  // Handle held skills (like Temperature)
  const sk = state.moveset[state.selectedSkill];
  if (sk && sk.type === 'temperature') {
    const now = performance.now();
    
    if (player.tempHoldTimer === undefined) player.tempHoldTimer = 0;
    
    if (rightMouseDown && player.cooldowns[state.selectedSkill] <= now) {
      player.isHoldingTemperature = true;
      if (keys['shift']) {
        player.temperature = Math.max(-100, player.temperature - dt * 50);
      } else if (!keys['control']) {
        player.temperature = Math.min(100, player.temperature + dt * 50);
      }
      
      // Check for Max!
      if (player.temperature >= 100 || player.temperature <= -100) {
        player.isHoldingTemperature = false;
        player.cooldowns[state.selectedSkill] = now + 10000; // 10s cooldown!
        player.tempHoldTimer = 3.0; // Stay at max for 3s!
      }
    } else if (player.isHoldingTemperature) {
      // Just released!
      player.isHoldingTemperature = false;
      player.cooldowns[state.selectedSkill] = now + 10000; // 10s cooldown!
      player.tempHoldTimer = 0; // Decay immediately on manual release
    }
  } else {
    // If we switched away from temperature, stop holding it!
    player.isHoldingTemperature = false;
  }

  // Handle Temperature Decay (even if not selected)
  if (!player.isHoldingTemperature) {
    if (player.tempHoldTimer > 0) {
      player.tempHoldTimer -= dt;
    } else {
      if (player.temperature > 0) {
        player.temperature = Math.max(0, player.temperature - dt * 20); // Fade to 0
      } else if (player.temperature < 0) {
        player.temperature = Math.min(0, player.temperature + dt * 20); // Fade to 0
      }
    }
  }

  // Handle Gravity Vortex Movement & Decay
  if (state.vortices) {
    for (let i = state.vortices.length - 1; i >= 0; i--) {
      const v = state.vortices[i];
      v.life -= dt;
      if (v.life <= 0) {
        state.vortices.splice(i, 1);
      }
    }
  }

  // Handle Repellers (Gravity V2)
  if (state.repellers) {
    for (let i = state.repellers.length - 1; i >= 0; i--) {
      const v = state.repellers[i];
      v.life -= dt;
      if (v.isProjectile) {
        v.x += v.vx;
        v.y += v.vy;
      }
      if (v.life <= 0) {
        state.repellers.splice(i, 1);
      }
    }
  }

  // Handle Trap Rings
  if (state.trapRings) {
    for (let i = state.trapRings.length - 1; i >= 0; i--) {
      const v = state.trapRings[i];
      v.life -= dt;
      if (v.life <= 0) {
        state.trapRings.splice(i, 1);
        player.isLockedByGravity = false;
      }
    }
  }

  // Handle Push Waves
  if (state.pushWaves) {
    for (let i = state.pushWaves.length - 1; i >= 0; i--) {
      const v = state.pushWaves[i];
      v.r += v.speed * dt;
      if (v.r > v.maxR) {
        state.pushWaves.splice(i, 1);
      } else {
        // Push and damage enemies!
        enemies.forEach(e => {
          if (e.hp <= 0) return;
          const dist = Math.hypot(e.x - v.x, e.y - v.y);
          // Check if enemy is on the wave front
          if (Math.abs(dist - v.r) < 30) {
            const ang = Math.atan2(e.y - v.y, e.x - v.x); // Away from player
            e.x += Math.cos(ang) * 12; // Strong knockback
            e.y += Math.sin(ang) * 12;
            e.hp -= 300 * dt; // Deal high DPS while in contact
            e.flash = 0.2;
            if (Math.random() < 0.3) spawnHitParticles(e.x, e.y, '#ffffff', 1);
          }
        });
      }
    }
  }

  if (sk && sk.type === 'gravity') {
    if (keys['alt'] && state.vortices && state.vortices.length > 0) {
      const v = state.vortices[0]; // Assume 1 vortex
      const dist = Math.hypot(mouse.x - player.x, mouse.y - player.y);
      if (dist <= v.range) {
        v.x = mouse.x;
        v.y = mouse.y;
      } else {
        const ang = Math.atan2(mouse.y - player.y, mouse.x - player.x);
        v.x = player.x + Math.cos(ang) * v.range;
        v.y = player.y + Math.sin(ang) * v.range;
      }
    }
  } else if (sk && sk.type === 'gravity_v2') {
    if (keys['alt'] && state.repellers) {
      state.repellers.forEach(v => {
        if (!v.isProjectile) {
          const dist = Math.hypot(mouse.x - player.x, mouse.y - player.y);
          if (dist <= v.range) {
            v.x = mouse.x;
            v.y = mouse.y;
          } else {
            const ang = Math.atan2(mouse.y - player.y, mouse.x - player.x);
            v.x = player.x + Math.cos(ang) * v.range;
            v.y = player.y + Math.sin(ang) * v.range;
          }
        } else {
          // Projectile: Steer towards mouse
          const ang = Math.atan2(mouse.y - v.y, mouse.x - v.x);
          const currentAng = Math.atan2(v.vy, v.vx);
          const speed = Math.hypot(v.vx, v.vy);
          let diff = ang - currentAng;
          diff = Math.atan2(Math.sin(diff), Math.cos(diff)); // Normalize to -PI to PI
          const newAng = currentAng + diff * 0.05; // Turn speed
          v.vx = Math.cos(newAng) * speed;
          v.vy = Math.sin(newAng) * speed;
        }
      });
    }
  }

  // PvP Zone Check
  if (state.mode === 'pvp' && state.remotePlayer) {
    const rp = state.remotePlayer;
    const dist = Math.hypot(player.x - rp.x, player.y - rp.y);
    
    if (player.inHotZoneTimer === undefined) player.inHotZoneTimer = 0;
    if (player.inColdZoneTimer === undefined) player.inColdZoneTimer = 0;
    
    let inHot = false;
    let inCold = false;
    let coldThreshold = 3;
    
    if (rp.temperature > 0) {
      const hotRadius = 200 - (rp.temperature / 100) * 100;
      if (dist < hotRadius) {
        inHot = true;
        player.inHotZoneTimer += dt;
        state.pvpWarning = "🔥 HOT ZONE! Burn in " + Math.max(0, 2 - player.inHotZoneTimer).toFixed(1) + "s";
        if (player.inHotZoneTimer > 2) {
          player.hp -= 40 * dt; // Continuous burn damage
          spawnHitParticles(player.x, player.y, '#ff4500', 1);
        }
      }
    }
    
    if (rp.temperature < 0) {
      const coldRadius = 150;
      if (dist < coldRadius) {
        inCold = true;
        player.inColdZoneTimer += dt;
        coldThreshold = 3 - (Math.abs(rp.temperature) / 100) * 2.5; // 3s to 0.5s
        state.pvpWarning = "❄️ COLD ZONE! Freeze in " + Math.max(0, coldThreshold - player.inColdZoneTimer).toFixed(1) + "s";
        
        if (player.inColdZoneTimer > coldThreshold) {
          player.frozenTimer = 2; // Freeze for 2s
          player.inColdZoneTimer = 0; // Reset
        }
      }
    }
    
    if (!inHot) player.inHotZoneTimer = Math.max(0, player.inHotZoneTimer - dt);
    if (!inCold) player.inColdZoneTimer = Math.max(0, player.inColdZoneTimer - dt);
    
    if (!inHot && !inCold) state.pvpWarning = "";
  } else {
    state.pvpWarning = "";
  }

  // Handle trail
  if (player.trailTimer > 0) {
    player.trailTimer -= dt;
    // Trail spawning moved below to check movement
  }

  let dx = 0, dy = 0;
  if (keys['w'] || keys['arrowup'])    dy -= 1;
  if (keys['s'] || keys['arrowdown'])  dy += 1;
  if (keys['a'] || keys['arrowleft'])  dx -= 1;
  if (keys['d'] || keys['arrowright']) dx += 1;
  if (dx !== 0 && dy !== 0) { dx *= 0.707; dy *= 0.707; }
  
  // Player Lock for Trap Push
  if (player.isLockedByGravity) {
    dx = 0; dy = 0;
  }
  
  // Apply Gravity Attraction to Player (Shift + Gravity Skill Selected)
  if (keys['shift'] && sk && sk.type === 'gravity' && state.vortices && state.vortices.length > 0) {
    const v = state.vortices[0];
    const dist = Math.hypot(player.x - v.x, player.y - v.y);
    if (dist > 20) {
      const ang = Math.atan2(v.y - player.y, v.x - player.x);
      dx += Math.cos(ang) * 2.5; // Increased pulling force!
      dy += Math.sin(ang) * 2.5;
    }
  }
  
  // Apply Gravity Repulsion to Player (Shift + Gravity V2 Selected)
  if (keys['shift'] && sk && sk.type === 'gravity_v2' && state.repellers) {
    state.repellers.forEach(v => {
      const dist = Math.hypot(player.x - v.x, player.y - v.y);
      if (dist < 300) {
        const ang = Math.atan2(player.y - v.y, player.x - v.x); // From v to player (Repel)
        const force = (1 - dist / 300) * 4; // Repel force
        dx += Math.cos(ang) * force;
        dy += Math.sin(ang) * force;
      }
    });
  }
  
  const prevX = player.x;
  const prevY = player.y;
  
  let currentSpeed = player.trailTimer > 0 ? player.speed * 3.0 : player.speed;
  if (leftMouseDown) {
    currentSpeed *= 0.4; // Slow down to 40% speed while charging!
  }
  player.x = Math.max(player.r, Math.min(canvas.width  - player.r, player.x + dx * currentSpeed));
  player.y = Math.max(70 + player.r, Math.min(canvas.height - player.r, player.y + dy * currentSpeed));
  
  // Spawn trail if moving
  if (player.trailTimer > 0 && (dx !== 0 || dy !== 0)) {
    particles_fx.push({
      type: 'puddle',
      x: player.x, y: player.y,
      color: player.trailType === 'hot' ? '#ff4500' : '#00bfff',
      life: 2.0,
      size: 20,
      trailType: player.trailType,
    });
  }
  
  // ── Player vs Boulder Collision ──
  enemies.forEach(e => {
    if (e.isBoulder && e.z === 0) {
      const dist = Math.hypot(player.x - e.x, player.y - e.y);
      if (dist < player.r + e.r) {
        const ang = Math.atan2(e.y - player.y, e.x - player.x); // Angle from player to boulder
        if (e.isPushable) {
          // Push boulder!
          e.x += Math.cos(ang) * 2;
          e.y += Math.sin(ang) * 2;
          // Keep player at edge (behind boulder)
          player.x = e.x - Math.cos(ang) * (player.r + e.r);
          player.y = e.y - Math.sin(ang) * (player.r + e.r);
        } else {
          // Solid: Block player
          const angReverse = Math.atan2(player.y - e.y, player.x - e.x); // Angle from boulder to player
          player.x = e.x + Math.cos(angReverse) * (player.r + e.r);
          player.y = e.y + Math.sin(angReverse) * (player.r + e.r);
        }
      }
    }
  });
  
  // ── Warp Gate Teleportation ──
  teleportEntity(player, dt);

  // Movement trail
  if (player.x !== prevX || player.y !== prevY) {
    particles_fx.push({
      type: 'dot', x: prevX, y: prevY,
      vx: 0, vy: 0,
      color: 'rgba(59,130,246,0.5)', life: 0.4, size: player.r * 0.8
    });
  }
}

// ═══════════════════════════════════════════════
//  RENDER
// ═══════════════════════════════════════════════
function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBackground();
  drawFx();
  drawProjectiles();
  drawWarpGates();
  drawEnemies();
  drawPlayer();
  if (state.mode === 'pvp' && state.remotePlayer) {
    drawRemotePlayer();
  }
  drawAimCursor();
  
  if (state.pvpWarning) {
    ctx.fillStyle = '#ef4444';
    ctx.font = '700 24px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(state.pvpWarning, canvas.width / 2, 120);
    ctx.textAlign = 'left';
  }
  
  // PvP Game Over Screen
  if (!state.running && state.mode === 'pvp') {
    ctx.fillStyle = 'rgba(0,0,0,0.8)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.font = '700 64px Outfit, sans-serif';
    ctx.textAlign = 'center';
    
    if (state.pvpResult === 'win') {
      ctx.fillStyle = '#22c55e';
      ctx.fillText('🏆 YOU WIN! 🏆', canvas.width / 2, canvas.height / 2);
    } else if (state.pvpResult === 'loose') {
      ctx.fillStyle = '#ef4444';
      ctx.fillText('💀 YOU LOSE! 💀', canvas.width / 2, canvas.height / 2);
    }
    
    ctx.font = '400 20px Outfit, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('Refresh the page to play again!', canvas.width / 2, canvas.height / 2 + 60);
    ctx.textAlign = 'left';
  }
}

function drawBackground() {
  ctx.fillStyle = '#0d1117';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawPlayer() {
  const flash = player.invincible > 0 && Math.floor(player.invincible * 10) % 2 === 0;
  if (flash) return;

  // Temperature Aura
  if (player.temperature > 0) {
    const radius = 200 - (player.temperature / 100) * 100;
    ctx.fillStyle = `rgba(255, 69, 0, ${0.05 + (player.temperature / 100) * 0.1})`;
    ctx.strokeStyle = `rgba(255, 69, 0, ${0.2 + (player.temperature / 100) * 0.4})`;
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(player.x, player.y, radius, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  } else if (player.temperature < 0) {
    const radius = 150;
    const absTemp = Math.abs(player.temperature);
    ctx.fillStyle = `rgba(0, 191, 255, ${0.05 + (absTemp / 100) * 0.1})`;
    ctx.strokeStyle = `rgba(0, 191, 255, ${0.2 + (absTemp / 100) * 0.4})`;
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(player.x, player.y, radius, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  }

  // Glow
  const grd = ctx.createRadialGradient(player.x, player.y, 0, player.x, player.y, player.r * 2.5);
  grd.addColorStop(0, 'rgba(59,130,246,0.3)');
  grd.addColorStop(1, 'rgba(59,130,246,0)');
  ctx.fillStyle = grd;
  ctx.beginPath(); ctx.arc(player.x, player.y, player.r * 2.5, 0, Math.PI * 2); ctx.fill();

  let playerColor = '#3b82f6';
  
  if (state.movesetType === 'Teleport') {
    playerColor = '#8b5cf6';
  } else if (state.movesetType === 'Temperature') {
    const grd2 = ctx.createLinearGradient(player.x - player.r, player.y, player.x + player.r, player.y);
    grd2.addColorStop(0, '#ef4444');
    grd2.addColorStop(1, '#3b82f6');
    playerColor = grd2;
  } else if (state.movesetType === 'Gravity') {
    const grd2 = ctx.createLinearGradient(player.x - player.r, player.y, player.x + player.r, player.y);
    grd2.addColorStop(0, '#000000');
    grd2.addColorStop(1, '#ffffff');
    playerColor = grd2;
  } else if (state.movesetType === 'Custom') {
    if (state.mode === 'pvp') {
      if (state.isPvpHost) {
        playerColor = state.hostIsWhite ? '#ffffff' : '#000000';
      } else {
        playerColor = state.hostIsWhite ? '#000000' : '#ffffff';
      }
    } else {
      playerColor = '#000000';
    }
  }

  ctx.fillStyle = playerColor;
  ctx.beginPath(); ctx.arc(player.x, player.y, player.r, 0, Math.PI * 2); ctx.fill();

  ctx.fillStyle = '#93c5fd';
  ctx.beginPath(); ctx.arc(player.x - 5, player.y - 5, 5, 0, Math.PI * 2); ctx.fill();

  // Pointer to aim (Circular - inside body)
  const angle = Math.atan2(mouse.y - player.y, mouse.x - player.x);
  const ex = player.x + Math.cos(angle) * (player.r - 5);
  const ey = player.y + Math.sin(angle) * (player.r - 5);
  
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(ex, ey, 4, 0, Math.PI * 2);
  ctx.fill();

  // Draw charge progress arc around the player!
  if (leftMouseDown || chargeTimer > 0) {
    const chargePct = Math.min(1, chargeTimer / 1);
    ctx.strokeStyle = '#22c55e'; // Green for charge!
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.r + 5, -Math.PI/2, -Math.PI/2 + chargePct * Math.PI * 2);
    ctx.stroke();
  }
}

function drawRemotePlayer() {
  const rp = state.remotePlayer;
  if (!rp) return;
  
  // Draw temperature radius if active
  if (rp.temperature > 0) {
    const radius = 200 - (rp.temperature / 100) * 100;
    const absTemp = Math.abs(rp.temperature);
    ctx.fillStyle = `rgba(255, 69, 0, ${0.05 + (absTemp / 100) * 0.1})`;
    ctx.strokeStyle = `rgba(255, 69, 0, ${0.2 + (absTemp / 100) * 0.4})`;
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(rp.x, rp.y, radius, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  } else if (rp.temperature < 0) {
    const radius = 150;
    const absTemp = Math.abs(rp.temperature);
    ctx.fillStyle = `rgba(0, 191, 255, ${0.05 + (absTemp / 100) * 0.1})`;
    ctx.strokeStyle = `rgba(0, 191, 255, ${0.2 + (absTemp / 100) * 0.4})`;
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(rp.x, rp.y, radius, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  }
  
  const grd = ctx.createRadialGradient(rp.x, rp.y, 0, rp.x, rp.y, rp.r * 2.5);
  grd.addColorStop(0, 'rgba(239,68,68,0.3)');
  grd.addColorStop(1, 'rgba(239,68,68,0)');
  ctx.fillStyle = grd;
  ctx.beginPath(); ctx.arc(rp.x, rp.y, rp.r * 2.5, 0, Math.PI * 2); ctx.fill();

  let rpColor = '#ef4444';
  
  if (rp.movesetType === 'Teleport') {
    rpColor = '#8b5cf6';
  } else if (rp.movesetType === 'Temperature') {
    const grd2 = ctx.createLinearGradient(rp.x - rp.r, rp.y, rp.x + rp.r, rp.y);
    grd2.addColorStop(0, '#ef4444');
    grd2.addColorStop(1, '#3b82f6');
    rpColor = grd2;
  } else if (rp.movesetType === 'Custom') {
    if (state.isPvpHost) {
      rpColor = state.hostIsWhite ? '#000000' : '#ffffff';
    } else {
      rpColor = state.hostIsWhite ? '#ffffff' : '#000000';
    }
  }

  ctx.fillStyle = rpColor;
  ctx.beginPath(); ctx.arc(rp.x, rp.y, rp.r, 0, Math.PI * 2); ctx.fill();

  ctx.fillStyle = '#fca5a5';
  ctx.beginPath(); ctx.arc(rp.x - 5, rp.y - 5, 5, 0, Math.PI * 2); ctx.fill();
  
  const barW = 40;
  const barH = 6;
  ctx.fillStyle = '#4b5563';
  ctx.fillRect(rp.x - barW/2, rp.y - rp.r - 15, barW, barH);
  ctx.fillStyle = '#ef4444';
  ctx.fillRect(rp.x - barW/2, rp.y - rp.r - 15, barW * (rp.hp / rp.maxHp), barH);
}

function drawEnemies() {
  const now = performance.now();
  
  // Draw Gravity Vortices
  if (state.vortices) {
    state.vortices.forEach(v => {
      ctx.save();
      ctx.translate(v.x, v.y);
      const rotation = (now * 0.005) % (Math.PI * 2);
      ctx.rotate(rotation);
      
      // Shrink based on life (5 seconds total)
      const scale = Math.max(0, v.life / 5.0);
      const currentR = v.r * scale;

      // Draw spinning black hole
      ctx.fillStyle = '#000000';
      ctx.beginPath(); ctx.arc(0, 0, currentR, 0, Math.PI * 2); ctx.fill();
      
      // Draw outer ring
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(0, 0, currentR + 5, 0, Math.PI * 2); ctx.stroke();
      
      // Draw inner spirals
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.arc(0, 0, currentR * 0.5, i * Math.PI / 2, i * Math.PI / 2 + Math.PI / 4);
        ctx.stroke();
      }
      ctx.restore();
      
      // Draw range indicator if holding Alt
      const sk = state.moveset[state.selectedSkill];
      if (keys['alt'] && sk && sk.type === 'gravity') {
        ctx.strokeStyle = 'rgba(0,0,0,0.2)';
        ctx.setLineDash([5, 5]);
        ctx.beginPath(); ctx.arc(player.x, player.y, v.range, 0, Math.PI * 2); ctx.stroke();
        ctx.setLineDash([]);
      }
    });
  }

  // Draw Repellers (Gravity V2)
  if (state.repellers) {
    state.repellers.forEach(v => {
      ctx.save();
      ctx.translate(v.x, v.y);
      const scale = Math.max(0, v.life / 5.0);
      const currentR = v.r * scale;
      
      ctx.fillStyle = '#ffffff';
      ctx.beginPath(); ctx.arc(0, 0, currentR, 0, Math.PI * 2); ctx.fill();
      
      ctx.strokeStyle = '#00ffff';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(0, 0, currentR + 5, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
    });
  }

  // Draw Trap Rings
  if (state.trapRings) {
    state.trapRings.forEach(v => {
      ctx.save();
      ctx.translate(v.x, v.y);
      const alpha = Math.max(0, v.life / 5.0);
      ctx.strokeStyle = `rgba(0, 0, 0, ${0.6 * alpha})`;
      ctx.lineWidth = v.r2 - v.r1;
      ctx.beginPath(); ctx.arc(0, 0, (v.r1 + v.r2)/2, 0, Math.PI * 2); ctx.stroke();
      
      // Outer border
      ctx.strokeStyle = `rgba(0, 0, 0, ${alpha})`;
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(0, 0, v.r2, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(0, 0, v.r1, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
    });
  }

  // Draw Push Waves
  if (state.pushWaves) {
    state.pushWaves.forEach(v => {
      ctx.save();
      ctx.translate(v.x, v.y);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.lineWidth = 5;
      ctx.beginPath(); ctx.arc(0, 0, v.r, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
    });
  }

  enemies.forEach(e => {
    if (e.hp <= 0) return;
    
    if (e.isBoulder) {
      // Draw Boulder!
      const scale = 1 + (e.z / 100) * 2; // Scale based on height
      
      // Draw shadow first (if in air)
      if (e.z > 0) {
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        const firstV = e.vertices[0];
        ctx.moveTo(e.x + firstV.x, e.y + firstV.y); // Scale 1 for shadow on ground!
        for (let i = 1; i < e.vertices.length; i++) {
          const v = e.vertices[i];
          ctx.lineTo(e.x + v.x, e.y + v.y);
        }
        ctx.closePath();
        ctx.fill();
      }
      
      // Draw the boulder body
      ctx.fillStyle = e.color;
      ctx.strokeStyle = '#44403c';
      ctx.lineWidth = 2;
      
      ctx.beginPath();
      const firstV = e.vertices[0];
      ctx.moveTo(e.x + firstV.x * scale, e.y + firstV.y * scale);
      for (let i = 1; i < e.vertices.length; i++) {
        const v = e.vertices[i];
        ctx.lineTo(e.x + v.x * scale, e.y + v.y * scale);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      
      // Draw rough texture (lines inside)
      ctx.strokeStyle = 'rgba(0,0,0,0.2)';
      ctx.lineWidth = 1;
      for (let i = 0; i < e.vertices.length; i++) {
        const v = e.vertices[i];
        ctx.beginPath();
        ctx.moveTo(e.x, e.y); // Draw lines from center to vertices partially
        ctx.lineTo(e.x + v.x * scale * 0.5, e.y + v.y * scale * 0.5);
        ctx.stroke();
      }
      // Add random cross-lines for rougher texture
      for (let i = 0; i < 5; i++) {
        const v1 = e.vertices[Math.floor(Math.random() * e.vertices.length)];
        const v2 = e.vertices[Math.floor(Math.random() * e.vertices.length)];
        ctx.beginPath();
        ctx.moveTo(e.x + v1.x * scale * 0.3, e.y + v1.y * scale * 0.3);
        ctx.lineTo(e.x + v2.x * scale * 0.3, e.y + v2.y * scale * 0.3);
        ctx.stroke();
      }
      
      // Draw Cracks based on HP
      const hpPct = e.hp / e.maxHp;
      ctx.strokeStyle = '#292524';
      ctx.lineWidth = 1.5;
      
      const cracksToShow = Math.floor((1 - hpPct) * 5); // 0 to 5 cracks
      for (let i = 0; i < cracksToShow; i++) {
        const crack = e.cracks[i];
        if (crack) {
          ctx.beginPath();
          ctx.moveTo(e.x + crack.x1 * scale, e.y + crack.y1 * scale);
          ctx.lineTo(e.x + crack.x2 * scale, e.y + crack.y2 * scale);
          ctx.stroke();
        }
      }
      
      // Draw target indicator using vertices if targeted!
      if (e === state.setTarget) {
        const pulse = 0.6 + 0.4 * Math.sin(now * 0.006);
        ctx.strokeStyle = `rgba(168,85,247,${pulse})`;
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        const firstV = e.vertices[0];
        const expand = 5 + 2 * Math.sin(now * 0.004);
        ctx.moveTo(e.x + firstV.x * scale + Math.sign(firstV.x)*expand, e.y + firstV.y * scale + Math.sign(firstV.y)*expand);
        for (let i = 1; i < e.vertices.length; i++) {
          const v = e.vertices[i];
          ctx.lineTo(e.x + v.x * scale + Math.sign(v.x)*expand, e.y + v.y * scale + Math.sign(v.y)*expand);
        }
        ctx.closePath();
        ctx.stroke();
        ctx.setLineDash([]);
      }
      
      return; // Skip normal drawing for boulders!
    }

    // Frozen indicator
    if (e.frozenTimer > 0) {
      ctx.fillStyle = '#00bfff';
      ctx.font = 'bold 12px Outfit';
      ctx.fillText('FROZEN', e.x - 22, e.y - e.r - 5);
    }

    // Set-target purple indicator (pulsing ring)
    if (e === state.setTarget) {
      const pulse = 0.6 + 0.4 * Math.sin(now * 0.006);
      ctx.strokeStyle = `rgba(168,85,247,${pulse})`;
      ctx.lineWidth = 3;
      ctx.setLineDash([6, 4]);
      ctx.beginPath(); ctx.arc(e.x, e.y, e.r + 10 + 4 * Math.sin(now * 0.004), 0, Math.PI * 2); ctx.stroke();
      ctx.setLineDash([]);
    }

    // Glow
    const grd = ctx.createRadialGradient(e.x, e.y, 0, e.x, e.y, e.r * 2);
    grd.addColorStop(0, 'rgba(239,68,68,0.25)');
    grd.addColorStop(1, 'rgba(239,68,68,0)');
    ctx.fillStyle = grd;
    ctx.beginPath(); ctx.arc(e.x, e.y, e.r * 2, 0, Math.PI * 2); ctx.fill();

    // Emitter Aura
    if (e.isEmitter) {
      const pulse = 0.5 + 0.5 * Math.sin(now * 0.005);
      ctx.strokeStyle = `rgba(255, 0, 255, ${pulse})`; // Purple aura
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(e.x, e.y, e.r + 5, 0, Math.PI * 2); ctx.stroke();
      
      if (Math.random() < 0.2) {
        particles_fx.push({
          type: 'dot', x: e.x + (Math.random() - 0.5) * e.r * 2, y: e.y + (Math.random() - 0.5) * e.r * 2,
          vx: (Math.random() - 0.5) * 1, vy: (Math.random() - 0.5) * 1,
          color: '#ff00ff', life: 0.5, size: 2
        });
      }
    }

    ctx.fillStyle = e.flash > 0 ? '#ffffff' : '#ef4444';
    ctx.beginPath(); ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2); ctx.fill();

    // Draw Armor (Gold border)
    if (e.hasArmor) {
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(e.x, e.y, e.r - 2, 0, Math.PI * 2); ctx.stroke();
    }

    // Draw Sword
    if (e.hasSword) {
      ctx.fillStyle = '#cbd5e1';
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.rect(e.x + e.r - 2, e.y - 15, 4, 20);
      ctx.fill(); ctx.stroke();
      // Handle
      ctx.fillStyle = '#78350f';
      ctx.fillRect(e.x + e.r - 4, e.y + 5, 8, 3);
    }

    // Draw Bow
    if (e.hasBow) {
      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(e.x - e.r, e.y, 10, -Math.PI/2, Math.PI/2);
      ctx.stroke();
      // String
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(e.x - e.r, e.y - 10);
      ctx.lineTo(e.x - e.r, e.y + 10);
      ctx.stroke();
    }

    // HP bar
    const bw = e.r * 2.5, bh = 4;
    const bx = e.x - bw / 2, by = e.y - e.r - 10;
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.fillRect(bx, by, bw, bh);
    ctx.fillStyle = e.hp / e.maxHp > 0.5 ? '#22c55e' : e.hp / e.maxHp > 0.25 ? '#f59e0b' : '#ef4444';
    ctx.fillRect(bx, by, bw * (e.hp / e.maxHp), bh);
  });
}

function drawAimCursor() {
  const x = mouse.x, y = mouse.y;
  ctx.strokeStyle = 'rgba(255,255,255,0.7)';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([4, 4]);
  const s = 10;
  ctx.beginPath(); ctx.moveTo(x - s, y); ctx.lineTo(x + s, y); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x, y - s); ctx.lineTo(x, y + s); ctx.stroke();
  ctx.beginPath(); ctx.arc(x, y, 5, 0, Math.PI * 2); ctx.stroke();
  ctx.setLineDash([]);
}

function drawProjectiles() {
  projectiles.forEach(p => {
    if (p.isEnergyBall) {
      // Glow background
      const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 2);
      grd.addColorStop(0, '#ffffff');
      grd.addColorStop(0.3, p.color);
      grd.addColorStop(1, 'rgba(0,0,0,0)');
      
      ctx.fillStyle = grd;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 2, 0, Math.PI * 2); ctx.fill();
      
      // Layer 1: Solid Core
      ctx.fillStyle = '#ffffff';
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 0.3, 0, Math.PI * 2); ctx.fill();
      
      // Layer 2: Energy Swirls (Rotating Arcs)
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      const now = performance.now();
      for (let i = 0; i < 3; i++) {
        const ang = now * 0.01 + i * (Math.PI * 2 / 3);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 0.7, ang, ang + Math.PI / 4);
        ctx.stroke();
      }
      
      // Layer 3: Sharp Outer Ring
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.stroke();
    } else if (p.isEnemy && p.arrowType) {
      // Draw Arrow!
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 2;
      const angle = Math.atan2(p.vy, p.vx);
      
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x - Math.cos(angle) * 15, p.y - Math.sin(angle) * 15);
      ctx.stroke();
      
      // Arrow head
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x - Math.cos(angle + 0.3) * 6, p.y - Math.sin(angle + 0.3) * 6);
      ctx.lineTo(p.x - Math.cos(angle - 0.3) * 6, p.y - Math.sin(angle - 0.3) * 6);
      ctx.closePath();
      ctx.fill();
    } else {
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 10;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
    }
  });
}

function drawWarpGates() {
  if (!state.warpGates) return;
  const now = performance.now();
  
  state.warpGates.forEach(g => {
    // Draw circular gate
    ctx.beginPath();
    ctx.arc(g.x, g.y, g.r, 0, Math.PI * 2);
    
    // Create gradient for shades of that color
    const grd = ctx.createRadialGradient(g.x, g.y, 0, g.x, g.y, g.r);
    grd.addColorStop(0, '#ffffff');
    grd.addColorStop(0.5, g.color);
    grd.addColorStop(1, '#000000');
    
    ctx.fillStyle = grd;
    ctx.fill();
    
    // Draw black point and white point on opposite sides
    const ang = g.angle || 0;
    const bx = g.x + Math.cos(ang) * (g.r - 5);
    const by = g.y + Math.sin(ang) * (g.r - 5);
    const wx = g.x - Math.cos(ang) * (g.r - 5);
    const wy = g.y - Math.sin(ang) * (g.r - 5);
    
    // Black side: Circle
    ctx.fillStyle = '#000000';
    ctx.beginPath(); ctx.arc(bx, by, 5, 0, Math.PI * 2); ctx.fill();
    
    // White side: Square
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(wx - 4, wy - 4, 8, 8);
    
    // Draw arc shade in between
    ctx.strokeStyle = g.color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(g.x, g.y, g.r, ang, ang + Math.PI);
    ctx.stroke();
  });
}

function drawFx() {
  particles_fx.forEach(p => {
    ctx.globalAlpha = Math.max(0, Math.min(1, p.life));
    if (p.type === 'ring') {
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2); ctx.stroke();
    } else if (p.type === 'beam') {
      // Outer glow
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 20 * p.life;
      ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.endX, p.endY); ctx.stroke();
      // Inner core (makes it look like a powerful beam)
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 4 * p.life;
      ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.endX, p.endY); ctx.stroke();
    } else if (p.type === 'puddle') {
      const r = p.size * Math.min(1, p.life);
      
      if (p.trailType === 'hot') {
        // Draw Flame (3 overlapping circles shifting up)
        ctx.fillStyle = '#ff4500';
        ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#ffaa00';
        ctx.beginPath(); ctx.arc(p.x, p.y - r*0.5, r*0.7, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#ffcc00';
        ctx.beginPath(); ctx.arc(p.x, p.y - r, r*0.4, 0, Math.PI * 2); ctx.fill();
      } else {
        // Draw Ice Crystal (Diamond shape)
        ctx.fillStyle = '#00bfff';
        ctx.beginPath();
        ctx.moveTo(p.x, p.y - r);
        ctx.lineTo(p.x + r, p.y);
        ctx.lineTo(p.x, p.y + r);
        ctx.lineTo(p.x - r, p.y);
        ctx.closePath();
        ctx.fill();
        
        // Inner white crystal
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(p.x, p.y - r*0.5);
        ctx.lineTo(p.x + r*0.5, p.y);
        ctx.lineTo(p.x, p.y + r*0.5);
        ctx.lineTo(p.x - r*0.5, p.y);
        ctx.closePath();
        ctx.fill();
      }
    } else {
      ctx.fillStyle = p.color;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
  });
}

// ═══════════════════════════════════════════════
//  GAME LOOP
// ═══════════════════════════════════════════════
function gameLoop(ts) {
  const dt = Math.min((ts - lastTime) / 1000, 0.05);
  lastTime = ts;

  if (state.running) {
    updatePlayer(dt);
    updateEnemies(dt);
    updateProjectiles(dt);
  }
  
  updateFx(dt);
  render();
  updateHUD();

  if (player.hp <= 0 && state.running) {
    player.hp = 0;
    if (state.mode === 'pvp') {
      if (state.pvpChannel) {
        state.pvpChannel.postMessage({type: 'gameover', result: 'win'});
      }
      state.pvpResult = 'loose';
      state.running = false;
    } else {
      state.running = false;
      alert('Game Over! Your Score: ' + state.score);
      showScreen('menu');
    }
  }

  state.animId = requestAnimationFrame(gameLoop);
}

// ── INIT ──
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
  document.body.classList.add('dark-theme');
  document.getElementById('btn-theme-toggle').textContent = '☀️';
}

document.getElementById('btn-theme-toggle').addEventListener('click', () => {
  document.body.classList.toggle('dark-theme');
  const isDark = document.body.classList.contains('dark-theme');
  const btn = document.getElementById('btn-theme-toggle');
  btn.textContent = isDark ? '☀️' : '🌙';
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
});
showScreen('menu');
