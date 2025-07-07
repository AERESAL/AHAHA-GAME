// player.js
// Player class for Pixel Duel LAN

class Player {
  constructor(x, y, color, playerType = 'player1') {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.width = 32;
    this.height = 48;
    this.color = color;
    this.playerType = playerType;
    this.health = 100;
    this.isReloading = false;
    this.ammo = 6;
    this.maxAmmo = 6;
    this.reloadTime = 1000; // ms
    this.lastShot = 0;
    this.shootCooldown = 400; // ms
    
    // Load player image
    this.image = new Image();
    this.image.src = `${playerType}.png`;
    this.image.onload = () => {
      this.imageLoaded = true;
    };
    this.image.onerror = () => {
      this.imageLoaded = false;
      console.log(`Failed to load ${playerType}.png, using fallback rendering`);
    };
  }

  move(dx, dy) {
    this.x += dx;
    this.y += dy;
  }

  shoot() {
    if (!this.canShoot()) return;
    
    this.lastShot = Date.now();
    this.ammo--;
    this.isShooting = true;
    
    // Play shooting sound
    if (window.audioManager) {
      window.audioManager.play('shoot');
    }
    
    // Determine shooting direction based on player position and target
    let vx = 8; // Default right direction
    let vy = 0;
    
    // If there's a target (bot or player2), aim towards them
    if (window.bot && this !== window.bot) {
      const target = window.bot;
      const dx = target.x - this.x;
      const dy = target.y - this.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance > 0) {
        vx = (dx / distance) * 8;
        vy = (dy / distance) * 8;
      }
    } else if (window.player2 && this !== window.player2) {
      const target = window.player2;
      const dx = target.x - this.x;
      const dy = target.y - this.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance > 0) {
        vx = (dx / distance) * 8;
        vy = (dy / distance) * 8;
      }
    }
    
    // Create bullet
    const bullet = {
      x: this.x + this.width / 2,
      y: this.y + this.height / 2,
      vx: vx,
      vy: vy,
      damage: 25,
      fromBot: false
    };
    
    console.log(`Player shot: bullet at (${bullet.x}, ${bullet.y}) with velocity (${bullet.vx}, ${bullet.vy})`);
    
    // Emit bullet event
    if (window.gameEvents) {
      window.gameEvents.emit('bulletFired', bullet);
    }
    
    // Reset shooting flag after a short delay
    setTimeout(() => {
      this.isShooting = false;
    }, 100);
  }

  reload() {
    if (this.isReloading || this.ammo === this.maxAmmo) return;
    
    this.isReloading = true;
    
    // Play reload sound
    if (window.audioManager) {
      window.audioManager.play('reload');
    }
    
    setTimeout(() => {
      this.ammo = this.maxAmmo;
      this.isReloading = false;
    }, this.reloadTime);
  }

  canShoot() {
    return !this.isReloading && 
           this.ammo > 0 && 
           Date.now() - this.lastShot > this.shootCooldown;
  }

  render(ctx) {
    // Try to use image first, then fallback to sprites, then simple shapes
    if (this.imageLoaded && this.image.complete) {
      // Draw player image
      ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    } else {
      try {
        if (typeof drawSprite === 'function' && Sprites && Sprites.player) {
          // Draw player body using 8-bit sprite
          drawSprite(ctx, Sprites.player.body, this.x, this.y, 2, this.color);
          
          // Draw player head
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
    }
    
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
window.Player = Player; 