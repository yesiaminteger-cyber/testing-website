// ═══════════════════════════════════════════════
//  SKILL FORMS — PvP LAN Mode
// ═══════════════════════════════════════════════

function initPvP() {
  state.remotePlayer = {
    x: state.isPvpHost ? canvas.width - 100 : 100,
    y: canvas.height / 2,
    hp: 100,
    maxHp: 100,
    r: player.r,
    color: '#ef4444',
  };
  
  // Send state updates to opponent
  setInterval(() => {
    if (state.pvpChannel && state.running) {
      state.pvpChannel.postMessage({
        type: 'state',
        x: player.x,
        y: player.y,
        hp: player.hp,
        temperature: player.temperature,
        movesetType: state.movesetType,
      });
    }
  }, 50);
  
  // Handle messages from opponent
  state.pvpChannel.onmessage = (e) => {
    if (e.data.type === 'state') {
      state.remotePlayer.x = e.data.x;
      state.remotePlayer.y = e.data.y;
      state.remotePlayer.hp = e.data.hp;
      state.remotePlayer.temperature = e.data.temperature;
      state.remotePlayer.movesetType = e.data.movesetType;
    } else if (e.data.type === 'hit') {
      player.hp -= e.data.damage;
      spawnHitParticles(player.x, player.y, '#ef4444', 4);
      
      // Check for death!
      if (player.hp <= 0) {
        state.running = false;
        state.pvpResult = 'loose';
        state.pvpChannel.postMessage({type: 'gameover', result: 'win'});
      }
    } else if (e.data.type === 'freeze') {
      player.frozenTimer = e.data.duration;
      spawnHitParticles(player.x, player.y, '#00bfff', 8);
    } else if (e.data.type === 'teleport') {
      spawnTeleportFx(player.x, player.y, '#a855f7');
      player.x = e.data.x;
      player.y = e.data.y;
      spawnTeleportFx(player.x, player.y, '#a855f7');
    } else if (e.data.type === 'shoot') {
      projectiles.push({
        ...e.data.projectile,
        fromPlayer: false,
        isEnemy: true // Can hit the local player!
      });
    } else if (e.data.type === 'punch') {
      const count = 5 + Math.floor(e.data.chargePct * 5);
      for (let i = 0; i < count; i++) {
        const ang = e.data.angle + (Math.random() - 0.5) * Math.PI / 4;
        particles_fx.push({
          type: 'dot', x: state.remotePlayer.x, y: state.remotePlayer.y,
          vx: Math.cos(ang) * 4, vy: Math.sin(ang) * 4,
          color: '#ffffff', life: 0.5, size: 4
        });
      }
    } else if (e.data.type === 'spawn_boulder') {
      enemies.push({
        x: e.data.x, y: e.data.y, r: e.data.baseR, hp: 100, maxHp: 100, speed: 0, baseSpeed: 0, color: '#78716c', flash: 0,
        isBoulder: true,
        isPushable: e.data.isPushable,
        z: 100, // Starts high up
        vertices: e.data.vertices,
        cracks: e.data.cracks,
        damage: 50
      });
    } else if (e.data.type === 'spawn_gate') {
      if (!state.warpGates) state.warpGates = [];
      state.warpGates.push({
        x: e.data.x, y: e.data.y, color: e.data.color, r: 20, id: e.data.id
      });
    } else if (e.data.type === 'remove_gates') {
      if (state.warpGates) {
        state.warpGates = state.warpGates.filter(g => g.color !== e.data.color);
      }
    } else if (e.data.type === 'rotate_gate') {
      if (state.warpGates) {
        const gate = state.warpGates.find(g => g.id === e.data.id);
        if (gate) gate.angle = e.data.angle;
      }
    } else if (e.data.type === 'gameover') {
      state.running = false;
      state.pvpResult = e.data.result;
    }
  };
}
