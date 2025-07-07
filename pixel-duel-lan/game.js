// game.js
// Main game logic and render loop

let ws = null;
let isHost = false;
let gameMode = 'menu'; // 'menu', 'multiplayer', 'bot'
let player1, player2, bot;
let bullets = [];
let platforms = [];
let gameEvents = {};

// Simple event system
window.gameEvents = {
  listeners: {},
  emit: function(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data));
    }
  },
  on: function(event, callback) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(callback);
  }
};

// Initialize game
function initGame() {
  const canvas = document.getElementById('game-canvas');
  const ctx = canvas.getContext('2d');
  
  // Create platforms for better gameplay
  platforms = [
    { x: 0, y: 450, width: 800, height: 30 }, // Ground
    { x: 50, y: 380, width: 150, height: 20 }, // Left platform
    { x: 600, y: 380, width: 150, height: 20 }, // Right platform
    { x: 200, y: 320, width: 120, height: 20 }, // Middle left
    { x: 480, y: 320, width: 120, height: 20 }, // Middle right
    { x: 325, y: 260, width: 150, height: 20 }, // Top platform
    { x: 100, y: 200, width: 100, height: 20 }, // High left
    { x: 600, y: 200, width: 100, height: 20 }, // High right
  ];
  
  // Create players - position them above the ground platform
  player1 = new Player(50, 402, '#00f', 'player1'); // Start above ground (450 - 48 = 402)
  player2 = new Player(700, 402, '#f00', 'player2'); // Start above ground (450 - 48 = 402)
  
  // Make players accessible globally
  window.player1 = player1;
  window.player2 = player2;
  
  // Set up bullet event listener
  gameEvents.on('bulletFired', (bullet) => {
    bullets.push(bullet);
  });
  
  // Make platforms accessible to bot
  window.platforms = platforms;
}

function connectWebSocket(ip) {
  ws = new WebSocket(`ws://${ip}:3000`);
  ws.onopen = () => {
    console.log('Connected to server');
    gameMode = 'multiplayer';
    initGame();
  };
  ws.onmessage = (msg) => {
    const data = JSON.parse(msg.data);
    if (data.type === 'welcome') {
      console.log(data.msg);
    }
    // TODO: Handle game state sync
  };
  ws.onclose = () => console.log('Disconnected from server');
}

function startBotGame() {
  gameMode = 'bot';
  player1 = new Player(50, 402, '#00f', 'player1'); // Start above ground
  bot = new Bot(700, 402, '#f00', 'player2'); // Start bot above ground
  bot.setTarget(player1);
  
  // Make players accessible globally
  window.player1 = player1;
  window.bot = bot;
  
  // Create platforms for better gameplay
  platforms = [
    { x: 0, y: 450, width: 800, height: 30 }, // Ground
    { x: 50, y: 380, width: 150, height: 20 }, // Left platform
    { x: 600, y: 380, width: 150, height: 20 }, // Right platform
    { x: 200, y: 320, width: 120, height: 20 }, // Middle left
    { x: 480, y: 320, width: 120, height: 20 }, // Middle right
    { x: 325, y: 260, width: 150, height: 20 }, // Top platform
    { x: 100, y: 200, width: 100, height: 20 }, // High left
    { x: 600, y: 200, width: 100, height: 20 }, // High right
  ];
  
  // Set up bullet event listener
  gameEvents.on('bulletFired', (bullet) => {
    bullets.push(bullet);
  });
  
  // Make platforms accessible to bot
  window.platforms = platforms;
  
  // Debug: log platform info
  console.log('Platforms created:', platforms.length);
  platforms.forEach((platform, index) => {
    console.log(`Platform ${index}: x=${platform.x}, y=${platform.y}, w=${platform.width}, h=${platform.height}`);
  });
  
  initGame();
}

// Event listeners
document.getElementById('host-btn').onclick = () => {
  isHost = true;
  connectWebSocket('localhost');
};

document.getElementById('join-btn').onclick = () => {
  const ip = document.getElementById('ip-input').value;
  if (ip) connectWebSocket(ip);
};

document.getElementById('bot-btn').onclick = () => {
  console.log('Bot button clicked!');
  startBotGame();
};

document.getElementById('test-btn').onclick = () => {
  console.log('Test button clicked!');
  alert('Test button works!');
};

document.getElementById('fullscreen-btn').onclick = () => {
  document.getElementById('game-canvas').requestFullscreen();
};

document.getElementById('mute-btn').onclick = () => {
  if (window.audioManager) {
    window.audioManager.toggleMute();
    const btn = document.getElementById('mute-btn');
    btn.textContent = window.audioManager.isMuted ? 'Unmute (M)' : 'Mute (M)';
  }
};

// Input handling
const keys = {};
document.addEventListener('keydown', (e) => {
  keys[e.key] = true;
  
  if (e.key === 'f' || e.key === 'F') {
    document.getElementById('game-canvas').requestFullscreen();
  }
  
  if (e.key === 'r' || e.key === 'R') {
    if (player1) player1.reload();
  }
  
  if (e.key === ' ') {
    e.preventDefault();
    if (player1 && player1.canShoot()) {
      player1.shoot();
      console.log('Player1 shoot() called');
    } else {
      console.log('Player1 cannot shoot:', player1 ? `ammo=${player1.ammo}, reloading=${player1.isReloading}` : 'player1 is null');
    }
  }
  
  if (e.key === 'm' || e.key === 'M') {
    if (window.audioManager) {
      window.audioManager.toggleMute();
      const btn = document.getElementById('mute-btn');
      btn.textContent = window.audioManager.isMuted ? 'Unmute (M)' : 'Mute (M)';
    }
  }
});

document.addEventListener('keyup', (e) => {
  keys[e.key] = false;
});

// Game loop
function gameLoop() {
  const canvas = document.getElementById('game-canvas');
  const ctx = canvas.getContext('2d');
  
  // Clear canvas
  ctx.fillStyle = '#444';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Draw a test rectangle to make sure rendering works
  if (gameMode === 'menu') {
    ctx.fillStyle = '#fff';
    ctx.font = '24px monospace';
    ctx.fillText('PIXEL DUEL LAN', 250, 200);
    ctx.font = '16px monospace';
    ctx.fillText('Click "Play vs Bot" to start!', 250, 240);
    ctx.fillText('Or try "Host Game" for multiplayer', 250, 260);
    
    // Draw some debug info
    ctx.fillStyle = '#888';
    ctx.font = '12px monospace';
    ctx.fillText(`Game Mode: ${gameMode}`, 10, 20);
    ctx.fillText(`Platforms: ${platforms.length}`, 10, 35);
    ctx.fillText(`Players: ${player1 ? 'P1' : 'None'} ${bot ? 'Bot' : ''} ${player2 ? 'P2' : ''}`, 10, 50);
    ctx.fillText(`Bullets: ${bullets.length}`, 10, 65);
    if (player1) ctx.fillText(`P1 Health: ${player1.health}`, 10, 80);
    if (bot) ctx.fillText(`Bot Health: ${bot.health}`, 10, 95);
    if (player1) ctx.fillText(`P1 Pos: (${Math.round(player1.x)}, ${Math.round(player1.y)})`, 10, 110);
    if (bot) ctx.fillText(`Bot Pos: (${Math.round(bot.x)}, ${Math.round(bot.y)})`, 10, 125);
    if (player1) ctx.fillText(`P1 Ammo: ${player1.ammo}/${player1.maxAmmo}`, 10, 140);
    if (bot) ctx.fillText(`Bot Ammo: ${bot.ammo}/${bot.maxAmmo}`, 10, 155);
    ctx.fillText(`Controls: Arrow Keys = Move, Space = Shoot, R = Reload`, 10, 170);
  }
  
  // Update and render platforms (only if game is active)
  if (gameMode !== 'menu' && platforms.length > 0) {
    platforms.forEach(platform => {
      // Draw platform (fallback to simple rectangle if sprites fail)
      try {
        if (typeof drawSprite === 'function' && Sprites && Sprites.platform) {
          for (let x = platform.x; x < platform.x + platform.width; x += 16) {
            for (let y = platform.y; y < platform.y + platform.height; y += 8) {
              drawSprite(ctx, Sprites.platform, x, y, 1, '#666');
            }
          }
        } else {
          // Fallback to simple rectangle
          ctx.fillStyle = '#666';
          ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
        }
      } catch (e) {
        // Fallback to simple rectangle
        ctx.fillStyle = '#666';
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
      }
    });
  }
  
  // Update and render players
  if (gameMode === 'bot') {
    if (player1) {
      updatePlayer(player1);
      player1.render(ctx);
    }
    if (bot) {
      bot.update(16);
      bot.render(ctx);
    }
  } else if (gameMode === 'multiplayer') {
    if (player1) {
      updatePlayer(player1);
      player1.render(ctx);
    }
    if (player2) {
      player2.render(ctx);
    }
  }
  
  // Test bullet creation (temporary)
  if (bullets.length === 0 && gameMode === 'bot') {
    const testBullet = {
      x: 400,
      y: 240,
      vx: 2,
      vy: 0,
      damage: 25,
      fromBot: false
    };
    bullets.push(testBullet);
    console.log('Created test bullet');
  }
  
  // Update and render bullets
  bullets = bullets.filter(bullet => {
    bullet.x += bullet.vx;
    bullet.y += bullet.vy;
    
    // Debug: log bullet position occasionally
    if (Math.random() < 0.01) {
      console.log(`Bullet: x=${bullet.x}, y=${bullet.y}, vx=${bullet.vx}, vy=${bullet.vy}, fromBot=${bullet.fromBot}`);
    }
    
    // Remove bullets that are off screen
    if (bullet.x < 0 || bullet.x > 800 || bullet.y < 0 || bullet.y > 480) {
      return false;
    }
    
    // Check collision with players (only damage opponent)
    if (player1 && bullet.fromBot && checkCollision(bullet, player1)) {
      console.log(`HIT! Bot bullet hit player1 at (${bullet.x}, ${bullet.y}), player1 at (${player1.x}, ${player1.y})`);
      player1.health -= bullet.damage;
      // Play damage sound
      if (window.audioManager) {
        window.audioManager.play('damage');
      }
      return false;
    }
    if (bot && !bullet.fromBot && checkCollision(bullet, bot)) {
      console.log(`HIT! Player bullet hit bot at (${bullet.x}, ${bullet.y}), bot at (${bot.x}, ${bot.y})`);
      bot.health -= bullet.damage;
      // Play damage sound
      if (window.audioManager) {
        window.audioManager.play('damage');
      }
      return false;
    }
    if (player2 && !bullet.fromBot && checkCollision(bullet, player2)) {
      console.log(`HIT! Player1 bullet hit player2 at (${bullet.x}, ${bullet.y}), player2 at (${player2.x}, ${player2.y})`);
      player2.health -= bullet.damage;
      // Play damage sound
      if (window.audioManager) {
        window.audioManager.play('damage');
      }
      return false;
    }
    
    // Render bullet (fallback to simple circle if sprites fail)
    const bulletColor = '#ffff00'; // Yellow bullets for better visibility
    
    // Debug: log bullet rendering
    if (Math.random() < 0.05) {
      console.log(`Rendering bullet: x=${bullet.x}, y=${bullet.y}, color=${bulletColor}`);
    }
    
    try {
      if (typeof drawSprite === 'function' && Sprites && Sprites.bullet) {
        drawSprite(ctx, Sprites.bullet, bullet.x - 2, bullet.y - 2, 1, bulletColor);
      } else {
        // Fallback to simple circle - make it bigger and more visible
        ctx.fillStyle = bulletColor;
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, 8, 0, 2 * Math.PI);
        ctx.fill();
        
        // Add a bright glow effect
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, 12, 0, 2 * Math.PI);
        ctx.stroke();
        
        // Add inner glow
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, 6, 0, 2 * Math.PI);
        ctx.stroke();
      }
    } catch (e) {
      // Fallback to simple circle - make it bigger and more visible
      ctx.fillStyle = bulletColor;
      ctx.beginPath();
      ctx.arc(bullet.x, bullet.y, 5, 0, 2 * Math.PI);
      ctx.fill();
      
      // Add a glow effect
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(bullet.x, bullet.y, 7, 0, 2 * Math.PI);
      ctx.stroke();
    }
    
    return true;
  });
  
  // Update UI
  updateUI();
  
  requestAnimationFrame(gameLoop);
}

function updatePlayer(player) {
  // Movement
  if (keys['ArrowLeft']) player.x -= 3;
  if (keys['ArrowRight']) player.x += 3;
  
  // Apply gravity first
  player.vy += 0.5;
  player.y += player.vy;
  
  // Then check platform collision
  let onGround = false;
  platforms.forEach(platform => {
    if (player.x + player.width > platform.x && 
        player.x < platform.x + platform.width &&
        player.y + player.height >= platform.y &&
        player.y + player.height <= platform.y + platform.height + 5) {
      player.y = platform.y - player.height;
      player.vy = 0;
      onGround = true;
    }
  });
  
  // Jumping
  if (keys['ArrowUp'] && onGround) {
    player.vy = -12;
    // Play jump sound
    if (window.audioManager) {
      window.audioManager.play('jump');
    }
  }
  
  // Keep player on screen
  if (player.x < 0) player.x = 0;
  if (player.x > 768) player.x = 768;
}

function checkCollision(bullet, player) {
  const collision = bullet.x > player.x && 
         bullet.x < player.x + player.width &&
         bullet.y > player.y && 
         bullet.y < player.y + player.height;
  
  // Debug collision detection
  if (Math.random() < 0.1) {
    console.log(`Collision check: bullet(${bullet.x}, ${bullet.y}) vs player(${player.x}, ${player.y}, ${player.width}x${player.height}) = ${collision}`);
  }
  
  return collision;
}

function updateUI() {
  if (player1) {
    document.getElementById('health-bar-left').textContent = Math.max(0, player1.health);
  }
  
  if (bot) {
    document.getElementById('health-bar-right').textContent = Math.max(0, bot.health);
  } else if (player2) {
    document.getElementById('health-bar-right').textContent = Math.max(0, player2.health);
  }
  
  // Update reload indicator
  if (player1 && player1.isReloading) {
    document.getElementById('reload-indicator').textContent = 'Reloading...';
  } else {
    document.getElementById('reload-indicator').textContent = 'Ready';
  }
}

// Start the game loop
console.log('Starting game loop...');
console.log('Sprites available:', typeof Sprites !== 'undefined');
console.log('Audio manager available:', typeof audioManager !== 'undefined');

// Debug UI elements
console.log('Bot button:', document.getElementById('bot-btn'));
console.log('Canvas:', document.getElementById('game-canvas'));
console.log('UI container:', document.getElementById('ui'));

gameLoop(); 