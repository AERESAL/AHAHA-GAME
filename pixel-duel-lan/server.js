// server.js
// Vercel-compatible Node.js WebSocket server for LAN multiplayer
const WebSocket = require('ws');

let wss = null;

// Initialize WebSocket server if not already created
function initWebSocketServer() {
  if (!wss) {
    // For Vercel, we'll use a different approach
    // This will be handled by the /api/ws endpoint
    console.log('WebSocket server ready for Vercel deployment');
  }
}

// HTTP endpoint for Vercel
module.exports = (req, res) => {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Serve the game
  if (req.url === '/' || req.url === '/index.html') {
    res.setHeader('Content-Type', 'text/html');
    res.end(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Pixel Duel LAN</title>
          <link rel="stylesheet" href="/style.css">
        </head>
        <body>
          <div id="gameContainer">
            <canvas id="gameCanvas" width="800" height="600"></canvas>
            <div id="ui">
              <div id="healthBars">
                <div class="health-bar">
                  <span>Player 1</span>
                  <div class="health-fill" id="player1Health"></div>
                </div>
                <div class="health-bar">
                  <span>Player 2</span>
                  <div class="health-fill" id="player2Health"></div>
                </div>
              </div>
              <div id="controls">
                <button id="fullscreenBtn">Fullscreen</button>
                <button id="resetBtn">Reset Game</button>
              </div>
            </div>
          </div>
          <script src="/player.js"></script>
          <script src="/bot.js"></script>
          <script src="/game.js"></script>
        </body>
      </html>
    `);
    return;
  }

  // API endpoint for game status
  if (req.url === '/api/status') {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ 
      status: 'running', 
      message: 'Pixel Duel LAN Server is running on Vercel!' 
    }));
    return;
  }

  // Default response
  res.setHeader('Content-Type', 'text/plain');
  res.end('Pixel Duel LAN Server - Use /api/status for server info');
};

// Initialize when module loads
initWebSocketServer(); 