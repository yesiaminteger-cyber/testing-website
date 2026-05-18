// Mobile Controls Logic

const deviceToggle = document.getElementById('device-toggle');
const mobileControls = document.getElementById('mobile-controls');

if (deviceToggle && mobileControls) {
  deviceToggle.addEventListener('click', () => {
    mobileControls.classList.toggle('active');
    state.isMobile = mobileControls.classList.contains('active');
    
    // Disable normal touch on canvas if mobile controls active
    const canvas = document.getElementById('gameCanvas');
    if (canvas) {
      if (state.isMobile) {
        canvas.style.pointerEvents = 'none'; // Only allow interaction via UI
      } else {
        canvas.style.pointerEvents = 'auto';
      }
    }
  });
}

// Helper to setup joystick
function setupJoystick(containerId, onMove) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const handle = container.querySelector('.joystick-handle');
  
  let active = false;
  let startX, startY;
  
  container.addEventListener('touchstart', (e) => {
    active = true;
    const touch = e.touches[0];
    const rect = container.getBoundingClientRect();
    startX = rect.left + rect.width / 2;
    startY = rect.top + rect.height / 2;
    handleTouch(touch);
  });
  
  window.addEventListener('touchmove', (e) => {
    if (!active) return;
    // Find the touch associated with this container
    for (let i = 0; i < e.touches.length; i++) {
      const t = e.touches[i];
      const rect = container.getBoundingClientRect();
      // Check if touch is on the left or right side based on container
      if (containerId === 'joy-move' && t.clientX < window.innerWidth / 2) {
        handleTouch(t);
        break;
      } else if (containerId === 'joy-aim' && t.clientX >= window.innerWidth / 2) {
        handleTouch(t);
        break;
      }
    }
  });
  
  window.addEventListener('touchend', (e) => {
    // If no touches on the respective side, deactivate
    let stillTouching = false;
    for (let i = 0; i < e.touches.length; i++) {
      const t = e.touches[i];
      if (containerId === 'joy-move' && t.clientX < window.innerWidth / 2) stillTouching = true;
      if (containerId === 'joy-aim' && t.clientX >= window.innerWidth / 2) stillTouching = true;
    }
    
    if (!stillTouching) {
      active = false;
      handle.style.transform = 'translate(-50%, -50%)';
      onMove(0, 0);
    }
  });
  
  function handleTouch(touch) {
    const dx = touch.clientX - startX;
    const dy = touch.clientY - startY;
    const dist = Math.hypot(dx, dy);
    const maxDist = 50; // Max radius
    
    const angle = Math.atan2(dy, dx);
    const clampedDist = Math.min(dist, maxDist);
    
    const moveX = Math.cos(angle) * clampedDist;
    const moveY = Math.sin(angle) * clampedDist;
    
    handle.style.transform = `translate(calc(-50% + ${moveX}px), calc(-50% + ${moveY}px))`;
    
    onMove(moveX / maxDist, moveY / maxDist);
  }
}

// Setup Movement Joystick
setupJoystick('joy-move', (x, y) => {
  // Simulate keys
  keys['w'] = y < -0.3;
  keys['s'] = y > 0.3;
  keys['a'] = x < -0.3;
  keys['d'] = x > 0.3;
  
  keys['arrowup'] = keys['w'];
  keys['arrowdown'] = keys['s'];
  keys['arrowleft'] = keys['a'];
  keys['arrowright'] = keys['d'];
});

// Setup Aim Joystick
setupJoystick('joy-aim', (x, y) => {
  if (x === 0 && y === 0) return; // Keep last aim direction
  
  // Set mouse position at a distance from player
  const dist = 150; // Aim distance
  mouse.x = player.x + x * dist;
  mouse.y = player.y + y * dist;
});

// Setup Buttons
function setupButton(id, onDown, onUp) {
  const btn = document.getElementById(id);
  if (!btn) return;
  
  btn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    onDown();
    btn.style.background = '#1d4ed8';
  });
  
  btn.addEventListener('touchend', (e) => {
    e.preventDefault();
    onUp();
    btn.style.background = '#2563eb';
  });
}

setupButton('btn-shift', () => keys['shift'] = true, () => keys['shift'] = false);
setupButton('btn-alt', () => keys['alt'] = true, () => keys['alt'] = false);

setupButton('btn-left-click', () => {
  leftMouseDown = true;
}, () => leftMouseDown = false);

setupButton('btn-right-click', () => {
  rightMouseDown = true;
}, () => rightMouseDown = false);

// Setup Scroll Bar
const scrollBar = document.getElementById('mobile-scroll');
if (scrollBar) {
  let startX;
  scrollBar.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
  });
  
  scrollBar.addEventListener('touchmove', (e) => {
    const x = e.touches[0].clientX;
    const diff = x - startX;
    if (Math.abs(diff) > 40) {
      if (state.moveset && state.moveset.length > 0) {
        if (diff > 0) {
          state.selectedSkill = (state.selectedSkill + 1) % state.moveset.length;
        } else {
          state.selectedSkill = (state.selectedSkill - 1 + state.moveset.length) % state.moveset.length;
        }
      }
      startX = x; // Reset start
    }
  });
}
