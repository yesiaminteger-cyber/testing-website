// ═══════════════════════════════════════════════
//  CHARACTER: Gravity
// ═══════════════════════════════════════════════

// ── MOVESET DEFINITION ──
PREMADE_MOVESETS.push({
  name: 'Gravity',
  icon: '🪐',
  theme: 'Gravitational Control',
  desc: 'Manipulate gravity to attract and control enemies and objects.',
  skills: [
    {
      id: 'gravity_point', name: 'Gravity Point', icon: '<img src="assets/gravity_point_icon.png" style="width:24px;height:24px;vertical-align:middle;border-radius:50%;">',
      damage: 20, cooldown: 10, range: 400, color: '#000000',
      type: 'gravity', character: 'gravity',
      charIcon: '🪐',
      hint: 'Summon black vortex that damages. Alt: Move. Shift: Pull self.',
    },
    {
      id: 'gravity_point_v2', name: 'Gravity Point V2', icon: '⚪',
      damage: 20, cooldown: 12, range: 400, color: '#ffffff',
      type: 'gravity_v2', character: 'gravity',
      charIcon: '🪐',
      hint: 'Summon white point that repels. Alt: Move. Shift: Launch it.',
    },
    {
      id: 'trap_push', name: 'Trap Push', icon: '⭕',
      damage: 30, cooldown: 15, range: 300, color: '#000000',
      type: 'trap_push', character: 'gravity',
      charIcon: '🪐',
      hint: 'Create black ring centered on you. Shift: White push wave.',
    }
  ]
});

// Add to skill pool
const gravityMoveset = PREMADE_MOVESETS[PREMADE_MOVESETS.length - 1];
gravityMoveset.skills.forEach(function(sk) { SKILL_POOL.push(sk); });

function useGravityPoint(sk, shiftKey, ctrlKey) {
  const range = sk.range;
  const dist = Math.hypot(mouse.x - player.x, mouse.y - player.y);
  
  let targetX = mouse.x;
  let targetY = mouse.y;
  
  if (dist > range) {
    const ang = Math.atan2(mouse.y - player.y, mouse.x - player.x);
    targetX = player.x + Math.cos(ang) * range;
    targetY = player.y + Math.sin(ang) * range;
  }
  
  // Spawn vortex
  if (!state.vortices) state.vortices = [];
  
  // Limit to 1 vortex for now to avoid chaos
  state.vortices = [{
    x: targetX,
    y: targetY,
    r: 30,
    life: 5.0, // Lasts 5 seconds
    color: '#000000',
    range: range, // Store range for movement limit!
    id: Date.now() + Math.random()
  }];
  
  spawnTeleportFx(targetX, targetY, '#000000');
}

function useGravityPointV2(sk, shiftKey, ctrlKey) {
  const range = sk.range;
  const dist = Math.hypot(mouse.x - player.x, mouse.y - player.y);
  
  let targetX = mouse.x;
  let targetY = mouse.y;
  
  if (dist > range) {
    const ang = Math.atan2(mouse.y - player.y, mouse.x - player.x);
    targetX = player.x + Math.cos(ang) * range;
    targetY = player.y + Math.sin(ang) * range;
  }
  
  if (!state.repellers) state.repellers = [];
  
  if (shiftKey) {
    const ang = Math.atan2(mouse.y - player.y, mouse.x - player.x);
    state.repellers.push({
      x: player.x, y: player.y,
      vx: Math.cos(ang) * 10, vy: Math.sin(ang) * 10,
      r: 20, life: 5.0, color: '#ffffff', isProjectile: true,
      id: Date.now() + Math.random()
    });
  } else {
    state.repellers = [{
      x: targetX, y: targetY, vx: 0, vy: 0,
      r: 25, life: 5.0, color: '#ffffff', range: range,
      id: Date.now() + Math.random()
    }];
  }
  spawnTeleportFx(targetX, targetY, '#ffffff');
}

function useTrapPush(sk, shiftKey, ctrlKey) {
  if (shiftKey) {
    if (!state.pushWaves) state.pushWaves = [];
    state.pushWaves.push({
      x: player.x, y: player.y, r: 10, maxR: 200, speed: 300, color: '#ffffff',
      id: Date.now() + Math.random()
    });
  } else {
    if (!state.trapRings) state.trapRings = [];
    state.trapRings = [{
      x: player.x, y: player.y, r1: 100, r2: 150, life: 5.0, color: '#000000',
      id: Date.now() + Math.random()
    }];
    player.isLockedByGravity = true;
    player.gravityLockTimer = 5.0;
  }
}
