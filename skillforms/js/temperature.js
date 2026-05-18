// ═══════════════════════════════════════════════
//  CHARACTER: Temperature
// ═══════════════════════════════════════════════

// ── MOVESET DEFINITION ──
PREMADE_MOVESETS.push({
  name: 'Temperature',
  icon: '🌡️',
  theme: 'Thermal Control',
  desc: 'Manipulate temperature to repel enemies with heat or freeze them with cold.',
  skills: [
    {
      id: 'temperature', name: 'Temperature', icon: '🌡️',
      damage: 0, cooldown: 0, range: 200, color: '#ff4500',
      type: 'temperature', character: 'temperature',
      charIcon: '🌡️',
      hint: 'Hold: Heat up | Shift+Hold: Cool down | Ctrl: Reset to 0',
    },
    {
      id: 'thermal_burst', name: 'Thermal Burst', icon: '💥',
      damage: 100, cooldown: 10, range: 300, color: '#ff0055',
      type: 'thermal_burst', character: 'temperature',
      charIcon: '🌡️',
      hint: 'Consume temp for massive burst (Hot: Damage/Push | Cold: Freeze screen)',
    },
    {
      id: 'thermal_trail', name: 'Thermal Trail', icon: '👣',
      damage: 10, cooldown: 8, range: 0, color: '#ffaa00',
      type: 'thermal_trail', character: 'temperature',
      charIcon: '🌡️',
      hint: 'Leave fire/ice trail as you move',
    },
    {
      id: 'convection_beam', name: 'Convection Beam', icon: '☄️',
      damage: 40, cooldown: 3, range: 500, color: '#00ffff',
      type: 'convection_beam', character: 'temperature',
      charIcon: '🌡️',
      hint: 'Shoot beam (Hot: Laser | Cold: Freeze ray)',
    },
  ],
});

// ── ADD TO SKILL POOL ──
PREMADE_MOVESETS[PREMADE_MOVESETS.length - 1].skills.forEach(sk => SKILL_POOL.push(sk));

// ── SKILL LOGIC ──

function useThermalBurst(sk, shiftKey) {
  let isHot = player.temperature > 0;
  let isCold = player.temperature < 0;
  let absTemp = Math.abs(player.temperature);
  
  if (player.temperature === 0) {
    if (shiftKey) isCold = true;
    else isHot = true;
    absTemp = 50; // Default to 50% strength if temp is 0
  }
  
  const radius = 300;
  
  // Drain enemy projectiles in radius
  projectiles.forEach(p => {
    if (!p.fromPlayer) {
      const d = Math.hypot(p.x - player.x, p.y - player.y);
      if (d < radius) {
        p.energy = (p.energy || 50) - 100 * (absTemp / 100);
        spawnHitParticles(p.x, p.y, isHot ? '#ff4500' : '#00bfff', 3);
      }
    }
  });
  
  if (isHot) {
    // Hot Burst: Damage and push
    spawnTeleportFx(player.x, player.y, '#ff4500'); // Reusing fx for now
    enemies.forEach(e => {
      const d = Math.hypot(e.x - player.x, e.y - player.y);
      if (d < radius) {
        e.hp -= sk.damage * (absTemp / 100);
        e.flash = 0.5;
        // Push back
        const ang = Math.atan2(e.y - player.y, e.x - player.x);
        e.x += Math.cos(ang) * 100 * (absTemp / 100);
        e.y += Math.sin(ang) * 100 * (absTemp / 100);
      }
    });
  } else if (isCold) {
    // Cold Burst: Freeze screen
    spawnTeleportFx(player.x, player.y, '#00bfff');
    enemies.forEach(e => {
      const d = Math.hypot(e.x - player.x, e.y - player.y);
      if (d < radius) {
        e.frozenTimer = 4 * (absTemp / 100); // Up to 4s
      }
    });
  }
  
  player.temperature = 0; // Reset
}

function useThermalTrail(sk, shiftKey) {
  let isHot = !shiftKey;
  let isCold = shiftKey;
  
  player.trailTimer = 5; // Active for 5s
  player.trailType = isHot ? 'hot' : 'cold';
}

function useConvectionBeam(sk, shiftKey) {
  const angle = Math.atan2(mouse.y - player.y, mouse.x - player.x);
  const length = sk.range;
  
  let isHot = player.temperature > 0;
  let isCold = player.temperature < 0;
  
  if (player.temperature === 0) {
    if (shiftKey) isCold = true;
    else isHot = true;
  }
  
  if (isHot) {
    // Laser
    spawnBeam(player.x, player.y, angle, length, '#ff4500', sk.damage);
  } else if (isCold) {
    // Freeze ray
    spawnBeam(player.x, player.y, angle, length, '#00bfff', 0, true); // true for freeze
  }
}

// Helper for beam
function spawnBeam(x, y, angle, length, color, damage, freeze = false) {
  const endX = x + Math.cos(angle) * length;
  const endY = y + Math.sin(angle) * length;
  
  let beamDamage = damage || 20; // Use 20 as base energy for clashing if damage is 0
  let currentLength = length;
  let finalEndX = endX;
  let finalEndY = endY;
  
  // Find projectiles intersecting the beam
  const intersectingProjectiles = [];
  projectiles.forEach(p => {
    if (!p.fromPlayer) { // Only collide with enemy projectiles!
      const d = distToSegment({x: p.x, y: p.y}, {x, y}, {x: endX, y: endY});
      if (d < p.r + 15) {
        const distToP = Math.hypot(p.x - x, p.y - y);
        intersectingProjectiles.push({p, distToP});
      }
    }
  });
  
  // Sort by distance
  intersectingProjectiles.sort((a, b) => a.distToP - b.distToP);
  
  // Clash!
  for (const item of intersectingProjectiles) {
    const p = item.p;
    const pEnergy = p.energy || 50;
    
    if (beamDamage > pEnergy) {
      beamDamage -= pEnergy;
      p.energy = 0;
      spawnHitParticles(p.x, p.y, p.color, 5);
    } else {
      p.energy -= beamDamage;
      beamDamage = 0;
      currentLength = item.distToP;
      finalEndX = x + Math.cos(angle) * currentLength;
      finalEndY = y + Math.sin(angle) * currentLength;
      spawnHitParticles(p.x, p.y, p.color, 5);
      break; // Beam stops here!
    }
  }

  // Add a particle for the beam (using final coordinates)
  particles_fx.push({
    type: 'beam',
    x, y, endX: finalEndX, endY: finalEndY,
    color,
    life: 1.0,
  });
  
  enemies.forEach(e => {
    const d = distToSegment({x: e.x, y: e.y}, {x, y}, {x: finalEndX, y: finalEndY});
    if (d < e.r + 15) {
      if (damage > 0) {
        e.hp -= damage;
        e.flash = 0.3;
      }
      if (freeze) {
        e.frozenTimer = 2;
      }
    }
  });

  if (state.mode === 'pvp' && state.remotePlayer) {
    const rp = state.remotePlayer;
    const d = distToSegment({x: rp.x, y: rp.y}, {x, y}, {x: finalEndX, y: finalEndY});
    if (d < rp.r + 15) {
      if (damage > 0) {
        state.pvpChannel.postMessage({type: 'hit', damage: damage});
      }
      if (freeze) {
        state.pvpChannel.postMessage({type: 'freeze', duration: 2});
      }
    }
  }
}

// Distance from point p to line segment v-w
function distToSegment(p, v, w) {
  const l2 = (v.x - w.x)**2 + (v.y - w.y)**2;
  if (l2 === 0) return Math.hypot(p.x - v.x, p.y - v.y);
  let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(p.x - (v.x + t * (w.x - v.x)), p.y - (v.y + t * (w.y - v.y)));
}
