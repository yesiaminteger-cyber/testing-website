// ═══════════════════════════════════════════════
//  CHARACTER: Teleport
// ═══════════════════════════════════════════════

// ── MOVESET DEFINITION ──
PREMADE_MOVESETS.push({
  name: 'Teleport',
  icon: '🌀',
  theme: 'Positional Mastery',
  desc: 'A trickster who bends space. Blink across the arena, swap positions with enemies, and manipulate your target at will.',
  skills: [
    {
      id: 'teleport', name: 'Teleport', icon: '🌀',
      damage: 0, cooldown: 0.8, range: 9999, color: '#8b5cf6',
      type: 'teleport',
      hint: 'RClick: Blink to cursor  |  Shift+RClick: Send SET TARGET to cursor',
    },
    {
      id: 'swap', name: 'Swap', icon: '🔄',
      damage: 0, cooldown: 1.2, range: 9999, color: '#6366f1',
      type: 'swap',
      hint: 'RClick: Swap with nearest  |  Shift+RClick: Set target  |  Ctrl+RClick: Swap targets',
    },
    {
      id: 'boulder', name: 'Boulder', icon: '⛰️',
      damage: 50, cooldown: 5, range: 9999, color: '#78716c',
      type: 'boulder',
      hint: 'RClick: Drop boulder at cursor',
    },
    {
      id: 'warp_gate', name: 'Warp Gate', icon: '🌌',
      damage: 0, cooldown: 2, range: 9999, color: '#a855f7',
      type: 'warp_gate',
      hint: 'RClick: Place gate | Shift+RClick+Scroll: Change color | Alt+RClick: Remove gates',
    },
  ],
});

// ── SKILL LOGIC ──

function useTeleport(sk, shiftKey, ctrlKey) {
  const canvas = document.getElementById('game-canvas');
  if (shiftKey && state.setTarget) {
    // Shift+Q: teleport set target to cursor
    spawnTeleportFx(state.setTarget.x, state.setTarget.y, sk.color);
    
    const newX = Math.max(state.setTarget.r, Math.min(canvas.width  - state.setTarget.r, mouse.x));
    const newY = Math.max(state.setTarget.r, Math.min(canvas.height - state.setTarget.r, mouse.y));
    
    state.setTarget.x = newX;
    state.setTarget.y = newY;
    
    spawnTeleportFx(state.setTarget.x, state.setTarget.y, sk.color);
    
    if (state.mode === 'pvp' && state.setTarget === state.remotePlayer) {
      state.pvpChannel.postMessage({
        type: 'teleport',
        x: newX,
        y: newY
      });
    }
  } else {
    // Q: teleport player to cursor
    spawnTeleportFx(player.x, player.y, sk.color);
    player.x = Math.max(player.r, Math.min(canvas.width  - player.r, mouse.x));
    player.y = Math.max(player.r, Math.min(canvas.height - player.r, mouse.y));
    spawnTeleportFx(player.x, player.y, sk.color);
    
    // Enemies lose track and take time to find new location
    enemies.forEach(e => {
      const d = Math.hypot(e.x - player.x, e.y - player.y);
      e.forgetTimer = d / 400; // Closer enemies find faster
      e.wanderAngle = Math.random() * Math.PI * 2;
    });
  }
}

function useSwap(sk, shiftKey, altKey) {
  const canvas = document.getElementById('game-canvas');
  if (shiftKey && !altKey) {
    // Shift+W: set target = nearest targetable to cursor (free, no cooldown)
    const nearest = nearestTargetableTo(mouse.x, mouse.y, null);
    state.setTarget = nearest;
    if (nearest) spawnTeleportFx(nearest.x, nearest.y, '#a855f7');
    console.log('Set target:', nearest);

  } else if (altKey && state.setTarget) {
    // Ctrl+W: swap set-target with nearest targetable to cursor
    const nearest = nearestTargetableTo(mouse.x, mouse.y, state.setTarget);
    if (nearest) {
      spawnTeleportFx(state.setTarget.x, state.setTarget.y, '#a855f7');
      spawnTeleportFx(nearest.x, nearest.y, '#a855f7');
      const tx = state.setTarget.x, ty = state.setTarget.y;
      state.setTarget.x = nearest.x; state.setTarget.y = nearest.y;
      nearest.x = tx; nearest.y = ty;
      spawnTeleportFx(state.setTarget.x, state.setTarget.y, '#a855f7');
      spawnTeleportFx(nearest.x, nearest.y, '#a855f7');
    }

  } else {
    // W: swap player with nearest targetable to cursor
    const nearest = nearestTargetableTo(mouse.x, mouse.y, null);
    if (nearest) {
      spawnTeleportFx(player.x, player.y, sk.color);
      spawnTeleportFx(nearest.x, nearest.y, sk.color);
      const px = player.x, py = player.y;
      player.x = nearest.x; player.y = nearest.y;
      nearest.x = px; nearest.y = py;
      spawnTeleportFx(player.x, player.y, sk.color);
      spawnTeleportFx(nearest.x, nearest.y, sk.color);
      
      if (state.mode === 'pvp' && nearest === state.remotePlayer) {
        state.pvpChannel.postMessage({
          type: 'teleport',
          x: px,
          y: py
        });
      } else {
        nearest.confusedTimer = 1.5;
      }
    }
  }
}

function useBoulder(sk) {
  const canvas = document.getElementById('game-canvas');
  const x = mouse.x;
  const y = mouse.y;
  
  // Random size: 12 to 25
  const baseR = 12 + Math.random() * 13;
  const isPushable = baseR < 18;
  
  // Generate random vertices for irregular shape
  const vertices = [];
  const vertexCount = 5 + Math.floor(Math.random() * 4); // 5 to 8 vertices
  for (let i = 0; i < vertexCount; i++) {
    const ang = (i / vertexCount) * Math.PI * 2;
    const r = baseR * (0.7 + Math.random() * 0.6); // Random radius
    vertices.push({x: Math.cos(ang) * r, y: Math.sin(ang) * r});
  }
  
  // Generate random cracks
  const cracks = [];
  for (let i = 0; i < 5; i++) {
    cracks.push({
      x1: (Math.random() - 0.5) * baseR,
      y1: (Math.random() - 0.5) * baseR,
      x2: (Math.random() - 0.5) * baseR,
      y2: (Math.random() - 0.5) * baseR
    });
  }

  const boulder = {
    x, y, r: baseR, hp: 100, maxHp: 100, speed: 0, baseSpeed: 0, color: '#78716c', flash: 0,
    isBoulder: true,
    isPushable,
    z: 100, // Starts high up
    vertices,
    cracks,
    damage: sk.damage
  };

  enemies.push(boulder);

  if (state.mode === 'pvp' && state.pvpChannel) {
    state.pvpChannel.postMessage({
      type: 'spawn_boulder',
      x, y, baseR, vertices, cracks, isPushable
    });
  }
}

function useWarpGate(sk, shiftKey, altKey) {
  const canvas = document.getElementById('game-canvas');
  const x = mouse.x;
  const y = mouse.y;
  
  if (!state.warpGates) state.warpGates = [];
  if (!state.currentGateColor) state.currentGateColor = 'purple';
  
  const color = state.currentGateColor;
  
  if (altKey) {
    // Remove gates of current color!
    const initialLen = state.warpGates.length;
    state.warpGates = state.warpGates.filter(g => g.color !== color);
    if (state.warpGates.length < initialLen) {
      showMessage(`Removed ${color.toUpperCase()} gates`);
      if (state.mode === 'pvp' && state.pvpChannel) {
        state.pvpChannel.postMessage({ type: 'remove_gates', color });
      }
    }
    return;
  }
  
  // Count gates of current color
  const count = state.warpGates.filter(g => g.color === color).length;
  if (count >= 2) {
    showMessage("Change the color");
    return;
  }
  
  // Spawn gate!
  const gate = {
    x, y, color, r: 20,
    id: Math.random().toString(36).substr(2, 9)
  };
  
  state.warpGates.push(gate);
  showMessage(`Placed ${color.toUpperCase()} gate (${count + 1}/2)`);
  
  if (state.mode === 'pvp' && state.pvpChannel) {
    state.pvpChannel.postMessage({
      type: 'spawn_gate',
      x, y, color, id: gate.id
    });
  }
}

// ── ADD TO SKILL POOL ──
SKILL_POOL.push({
  id: 'teleport', name: 'Teleport', icon: '🌀',
  damage: 0, cooldown: 0.8, range: 9999, color: '#8b5cf6',
  type: 'teleport', character: 'teleport',
  charIcon: '🌀',
  hint: 'RClick: Blink to cursor  |  Shift+RClick: Send SET TARGET to cursor',
});
SKILL_POOL.push({
  id: 'swap', name: 'Swap', icon: '🔄',
  damage: 0, cooldown: 1.2, range: 9999, color: '#6366f1',
  type: 'swap', character: 'teleport',
  charIcon: '🌀',
  hint: 'RClick: Swap with nearest  |  Shift+RClick: Set target  |  Ctrl+RClick: Swap targets',
});
SKILL_POOL.push({
  id: 'boulder', name: 'Boulder', icon: '⛰️',
  damage: 50, cooldown: 5, range: 9999, color: '#78716c',
  type: 'boulder', character: 'teleport',
  charIcon: '🌀',
  hint: 'RClick: Drop boulder at cursor',
});
SKILL_POOL.push({
  id: 'warp_gate', name: 'Warp Gate', icon: '🌌',
  damage: 0, cooldown: 2, range: 9999, color: '#a855f7',
  type: 'warp_gate', character: 'teleport',
  charIcon: '🌀',
  hint: 'RClick: Place gate | Shift+RClick+Scroll: Change color | Alt+RClick: Remove gates',
});
