import { WebSocketServer } from "ws";
import express from 'express';
import http from 'http';

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

wss.on('connection', function connection(ws) {
  console.log('A new client connected!');

  ws.on('message', function incoming(message) {
    console.log('received: %s', message);

    // Broadcast to everyone else.
    wss.clients.forEach(function each(client) {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

// Serve any static files
app.use(express.static('path-to-your-react-app-build'));

server.listen(3001, function listening() {
  console.log('Listening on %d', server.address().port);
});
