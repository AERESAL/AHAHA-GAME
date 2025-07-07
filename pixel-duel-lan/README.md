# Pixel Duel LAN - 2D Multiplayer Shooter

A retro 8-bit style 2D multiplayer shooter game that works over LAN with bot support.

## Features

- 🎮 **1v1 Multiplayer** over LAN using WebSockets
- 🤖 **Bot Mode** - Play against an AI opponent
- 🎨 **8-bit Pixel Art** graphics and retro styling
- 🔊 **8-bit Sound Effects** and background music
- ⚡ **Real-time Combat** with health, ammo, and reloading
- 🎯 **Smart AI** with realistic aiming and movement

## Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Server (for multiplayer)
```bash
npm start
```

### 3. Open the Game
- Open `index.html` in your browser
- Or use a local server: `python -m http.server 8000` then visit `http://localhost:8000`

## How to Play

### Game Modes
- **Host Game**: Start a multiplayer server (runs on localhost:3000)
- **Join Game**: Connect to a host using their IP address
- **Play vs Bot**: Single-player mode against AI

### Controls
- **Arrow Keys**: Move and jump
- **Spacebar**: Shoot
- **R**: Reload weapon
- **F**: Toggle fullscreen
- **M**: Toggle mute

### Gameplay
- **Health**: 100 HP, take 25 damage per hit
- **Ammo**: 6 shots per magazine
- **Reload**: Press R to reload (1 second)
- **Platforms**: Jump between platforms for tactical advantage

## LAN Setup

1. **Host Player**:
   - Click "Host Game"
   - Note your local IP address (use `ipconfig` on Windows or `ifconfig` on Mac/Linux)

2. **Join Player**:
   - Enter the host's IP address in the input field
   - Click "Join Game"

3. **Requirements**:
   - Both players must be on the same Wi-Fi network
   - Firewall may need to allow connections on port 3000

## Technical Details

- **Frontend**: HTML5 Canvas, JavaScript, CSS3
- **Backend**: Node.js with WebSocket server
- **Graphics**: Custom 8-bit pixel art sprites
- **Audio**: Web Audio API for 8-bit sound effects
- **Networking**: WebSocket for real-time multiplayer

## File Structure

```
pixel-duel-lan/
├── server.js              # WebSocket server
├── index.html             # Main HTML file
├── game.js                # Game logic and render loop
├── player.js              # Player class
├── bot.js                 # Bot AI class
├── assets/
│   ├── sprites.js         # 8-bit sprite definitions
│   └── audio.js           # Audio manager
├── style.css              # Retro styling
└── package.json           # Dependencies
```

## Development

To modify the game:
- Edit `game.js` for game mechanics
- Edit `player.js` or `bot.js` for player/bot behavior
- Edit `assets/sprites.js` for graphics
- Edit `assets/audio.js` for sound effects

## License

MIT License - feel free to modify and distribute! 