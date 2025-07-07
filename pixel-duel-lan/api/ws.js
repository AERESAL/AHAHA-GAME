// api/ws.js
// WebSocket endpoint for Vercel
const WebSocket = require('ws');

// Store active connections
let connections = new Set();

module.exports = (req, res) => {
  // Handle WebSocket upgrade
  if (req.headers.upgrade && req.headers.upgrade.toLowerCase() === 'websocket') {
    const wss = new WebSocket.Server({ noServer: true });
    
    wss.on('connection', function connection(ws) {
      connections.add(ws);
      console.log('Client connected, total connections:', connections.size);
      
      // Send welcome message
      ws.send(JSON.stringify({ 
        type: 'welcome', 
        msg: 'Connected to Pixel Duel LAN on Vercel!',
        playerId: connections.size
      }));

      ws.on('message', function incoming(message) {
        try {
          const data = JSON.parse(message);
          console.log('Received message:', data.type);
          
          // Broadcast to all other clients
          connections.forEach(function each(client) {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
              client.send(message);
            }
          });
        } catch (error) {
          console.error('Error parsing message:', error);
        }
      });

      ws.on('close', function close() {
        connections.delete(ws);
        console.log('Client disconnected, total connections:', connections.size);
      });

      ws.on('error', function error(err) {
        console.error('WebSocket error:', err);
        connections.delete(ws);
      });
    });

    // Handle the upgrade
    const { socket, head } = req;
    wss.handleUpgrade(req, socket, head, function done(ws) {
      wss.emit('connection', ws, req);
    });
  } else {
    // Return info about WebSocket endpoint
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      message: 'WebSocket endpoint for Pixel Duel LAN',
      connections: connections.size,
      usage: 'Connect via WebSocket to this endpoint for multiplayer'
    }));
  }
}; 