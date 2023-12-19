import { WebSocketServer } from "ws";
import express from 'express';
import http from 'http';
import { v4 as uuidv4 } from 'uuid';
import 'dotenv/config'
import {Messages} from "./Messages.js";
import {RateLimiter} from "./RateLimiter.js";
import { ai } from "./ai.js";


const aiNick = "@pometlussy";
const messages = new Messages({max: 50});

// 5 messages / 5 seconds for each user.
const rateLimiter = new RateLimiter(5, 5 * 1000);

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

setInterval(async () => {
  const sendAiMessage = messages.getLast()?.sender && messages.getLast()?.sender !== aiNick;
  if (sendAiMessage) {
    const aiMsg = await ai.generateAiMessage(messages, aiNick);
    broadcastAiMessage(aiMsg);
  }
}, 20_000);

wss.on('connection', function connection(ws) {
  console.log('A new client connected!');

  const last20Messages = messages.get(20);
  ws.send(JSON.stringify(last20Messages));

  ws.on('message', async function incoming(data) {
    const rateLimitResult = rateLimiter.attempt(data.sender);

    if (!rateLimitResult.allowed) {
      console.warn(`${data.sender} has been rate limited.`);
      return;
    }

    let message;
    try {
      message = JSON.parse(data);
    } catch (error) {
      console.error('Error parsing message:', error);
      return
    }

    console.log('received: %s', message);

    // Assign an ID to each message
    const messageId = uuidv4();
    message.id = messageId;
    // Broadcast the message to everyone else.
    messages.add(message);
    broadcastMessage(message);

    // Perform sentiment analysis
    let sentiment;
    try {
      sentiment = await ai.getSentiment(message.message);
      console.log("Got sentiment: ", sentiment);
    } catch (error) {
      console.error('Error generating sentiment:', error);
      return;
    }

    const sentimentMessage = { id: messageId, sentiment: sentiment.trim() };
    broadcastMessage(sentimentMessage);

    if (message.message.includes(aiNick)) {
      try {
        const aiMessage = await ai.generateAiMessage(messages, aiNick);
        broadcastAiMessage(aiMessage);
      } catch (error) {
        console.error('Error generating AI message:', error);
      }
    }
  });
});

function broadcastAiMessage(content) {
  const message = {
    id: uuidv4(),
    sender: aiNick,
    message: content,
    timestamp: new Date().toISOString(),
  };

  messages.add(message);
  broadcastMessage(message);
}

function broadcastMessage(message) {
  wss.clients.forEach(function each(client) {
    client.send(JSON.stringify(message));
  });
}

const port = process.env.PORT || 3001; //  Railway provides port as .env variable.
server.listen(port, function listening() {
  console.log(`Listening on ${port}`);
});
