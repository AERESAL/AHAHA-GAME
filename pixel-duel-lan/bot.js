// bot.js
// Bot AI for Pixel Duel LAN

class Bot extends Player {
  constructor(x, y, color) {
    // Always use player2.png for the bot
    super(x, y, color, 'player2');
    this.isBot = true;
    this.targetPlayer = null;
    this.lastDecision = 0;
    this.decisionInterval = 100; // ms
    this.aimAccuracy = 0.8; // 80% accuracy
    this.reactionTime = 200; // ms
    this.lastReaction = 0;
  }

  setTarget(player) {
    this.targetPlayer = player;
  }

  update(deltaTime) {
    if (!this.targetPlayer) return;

    const now = Date.now();
    // Make decisions periodically
    if (now - this.lastDecision > this.decisionInterval) {
      this.makeDecision();
      this.lastDecision = now;
    }
    // React to player actions
    if (now - this.lastReaction > this.reactionTime) {
      this.reactToPlayer();
      this.lastReaction = now;
    }

    // Movement (random AI behavior)
    if (Math.random() < 0.3) {
      if (Math.random() < 0.5) {
        this.x -= 2; // Move left
      } else {
        this.x += 2; // Move right
      }
    }

    // Apply gravity first
    this.vy += 0.5;
    this.y += this.vy;

    // Then check platform collision (same as player)
    let onGround = false;
    if (window.platforms) {
      window.platforms.forEach(platform => {
        // Check if bot is on or above the platform
        if (this.x + this.width > platform.x && 
            this.x < platform.x + platform.width &&
            this.y + this.height >= platform.y &&
            this.y + this.height <= platform.y + platform.height + 10) {
          // Snap to platform top
          this.y = platform.y - this.height;
          this.vy = 0;
          onGround = true;
        }
      });
    }
    
    // Fallback: if not on any platform, check if we're falling off the world
    if (!onGround && this.y > 450) {
      this.y = 402; // Reset to ground level
      this.vy = 0;
      onGround = true;
    }

    // Random jumping
    if (onGround && Math.random() < 0.1) {
      this.vy = -12;
    }

    // Keep bot on screen
    if (this.x < 0) this.x = 0;
    if (this.x > 768) this.x = 768;
    
    // Debug: log bot position occasionally
    if (Math.random() < 0.01) {
      console.log(`Bot position: x=${Math.round(this.x)}, y=${Math.round(this.y)}, vy=${this.vy.toFixed(2)}, onGround=${onGround}`);
    }
  }

  makeDecision() {
    if (!this.targetPlayer) return;

    const distance = Math.abs(this.x - this.targetPlayer.x);
    
    // Movement AI
    if (distance > 100) {
      // Move towards player
      if (this.x < this.targetPlayer.x) {
        this.x += 2;
      } else {
        this.x -= 2;
      }
    } else if (distance < 50) {
      // Back away if too close
      if (this.x < this.targetPlayer.x) {
        this.x -= 2;
      } else {
        this.x += 2;
      }
    }

    // Jumping AI - check if on ground first
    let onGround = false;
    if (window.platforms) {
      window.platforms.forEach(platform => {
        if (this.x + this.width > platform.x && 
            this.x < platform.x + platform.width &&
            this.y + this.height >= platform.y &&
            this.y + this.height <= platform.y + platform.height + 5) {
          onGround = true;
        }
      });
    }
    
    // Jump randomly or to reach higher platforms
    if (Math.random() < 0.05 && onGround) {
      this.vy = -12;
    }
    
    // Jump to reach player if they're on a higher platform
    if (onGround && this.targetPlayer && this.targetPlayer.y < this.y - 50) {
      this.vy = -12;
    }

    // Shooting AI - shoot more frequently
    if (this.canShoot() && Math.random() < 0.3) {
      console.log('Bot shooting!');
      this.shoot();
    }
  }

  reactToPlayer() {
    if (!this.targetPlayer) return;

    // Dodge if player is shooting
    if (this.targetPlayer.isShooting && Math.random() < 0.3) {
      this.vy = -8;
    }

    // Reload if out of ammo
    if (this.ammo <= 0 && !this.isReloading) {
      this.reload();
    }
  }

  canShoot() {
    return !this.isReloading && 
           this.ammo > 0 && 
           Date.now() - this.lastShot > this.shootCooldown;
  }

  shoot() {
    if (!this.canShoot()) return;
    
    this.lastShot = Date.now();
    this.ammo--;
    
    // Play shooting sound
    if (window.audioManager) {
      window.audioManager.play('shoot');
    }
    
    // Calculate shot trajectory towards player
    if (this.targetPlayer) {
      const dx = this.targetPlayer.x - this.x;
      const dy = this.targetPlayer.y - this.y;
      
      // Add some randomness for realism
      const accuracy = this.aimAccuracy;
      const randomX = (Math.random() - 0.5) * (1 - accuracy) * 50;
      const randomY = (Math.random() - 0.5) * (1 - accuracy) * 50;
      
      // Create bullet with better velocity
      const bullet = {
        x: this.x + this.width / 2,
        y: this.y + this.height / 2,
        vx: (dx + randomX) * 0.15,
        vy: (dy + randomY) * 0.15,
        damage: 25,
        fromBot: true
      };
      
      // Emit bullet event
      if (window.gameEvents) {
        console.log(`Bot fired bullet: (${bullet.x}, ${bullet.y}) with velocity (${bullet.vx}, ${bullet.vy})`);
        window.gameEvents.emit('bulletFired', bullet);
      }
    }
  }

  render(ctx) {
    try {
      if (typeof drawSprite === 'function' && Sprites && Sprites.player) {
        // Draw bot body using 8-bit sprite
        drawSprite(ctx, Sprites.player.body, this.x, this.y, 2, this.color);
        
        // Draw bot head
        drawSprite(ctx, Sprites.player.head, this.x, this.y - 16, 2, this.color);
        
        // Draw gun
        drawSprite(ctx, Sprites.player.gun, this.x + this.width - 8, this.y + 20, 1, '#333');
      } else {
        // Fallback to simple rectangle
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Draw head
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x + 8, this.y - 16, 16, 16);
        
        // Draw gun
        ctx.fillStyle = '#333';
        ctx.fillRect(this.x + this.width - 8, this.y + 20, 12, 4);
      }
    } catch (e) {
      // Fallback to simple rectangle
      ctx.fillStyle = this.color;
      ctx.fillRect(this.x, this.y, this.width, this.height);
      
      // Draw head
      ctx.fillStyle = this.color;
      ctx.fillRect(this.x + 8, this.y - 16, 16, 16);
      
      // Draw gun
      ctx.fillStyle = '#333';
      ctx.fillRect(this.x + this.width - 8, this.y + 20, 12, 4);
    }
    
    // Draw bot indicator
    ctx.fillStyle = '#ff0';
    ctx.font = '12px monospace';
    ctx.fillText('BOT', this.x, this.y - 25);
    
    // Draw health indicator
    const healthPercent = this.health / 100;
    const healthBarWidth = this.width;
    const healthBarHeight = 4;
    
    // Health bar background
    ctx.fillStyle = '#333';
    ctx.fillRect(this.x, this.y - 8, healthBarWidth, healthBarHeight);
    
    // Health bar fill
    ctx.fillStyle = healthPercent > 0.5 ? '#0f0' : healthPercent > 0.25 ? '#ff0' : '#f00';
    ctx.fillRect(this.x, this.y - 8, healthBarWidth * healthPercent, healthBarHeight);
  }
}

// Export for use in game.js
window.Bot = Bot; 