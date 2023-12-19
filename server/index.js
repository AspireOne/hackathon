import express from 'express';
import http from 'http';
import { WebSocketServer } from "ws";
import { v4 as uuidv4 } from 'uuid';
import 'dotenv/config';
import { Messages } from "./Messages.js";
import { RateLimiter } from "./RateLimiter.js";
import { ai } from "./ai.js";

// The port (set to process.env.PORT for Railway deployment).
const PORT = process.env.PORT || 3001;
// max 5 messages per 5 seconds (per user).
const RATE_LIMIT = {
  MESSAGES: 5,
  PER: 5 * 1000,
}
// How often the AI should automatically send a message to the chat (if there has been a message from user since).
const AI_MESSAGE_INTERVAL = 120_000; // 2 minutes
// How many messages to send to a new client when they connect.
const HISTORY_MESSAGES_COUNT = 20;
// The nick of the AI in chat.
const AI_NICK = "@pometlussy";

// Initialize components
const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: "/ws" });
const messages = new Messages({ max: 50 });
const rateLimiter = new RateLimiter(RATE_LIMIT.MESSAGES, RATE_LIMIT.PER);

// Define WebSocket event handlers
wss.on('connection', ws => {
  console.log('A new client connected!');
  ws.on('message', incomingMessageHandler(ws));
});

// General handler for any incoming websocket message.
function incomingMessageHandler(ws) {
  return async function(data) {
    enforceRateLimit(data, ws);
    const message = parseMessage(data, ws);
    if (!message) return;

    if (message.request) handleRequestMessage(message, ws);
    else if (message.message?.startsWith("/")) handleGuessMessage(message);
    else await handleRegularChatMessage(message);
  };
}

// A regular chat message. Just broadcast it to everyone, assign sentiment, and generate AI reply if ai was tagged.
async function handleRegularChatMessage(message) {
  const messageId = uuidv4();
  message.id = messageId;
  messages.add(message);
  broadcastMessage(message);

  ai.retrieveSentiment(message.message)
    .then(sentiment => {
      const sentimentMessage = { id: messageId, sentiment: sentiment.trim() }
      broadcastMessage(sentimentMessage);
    })
    .catch(error => console.error('Error generating sentiment:', error))

  if (message.message.includes(AI_NICK)) {
    ai.generateAiMessage(messages, AI_NICK)
      .then(aiMessage => broadcastAiMessage(aiMessage))
      .catch(error => console.error('Error generating AI message:', error))
  }
}

// A message that wants something from the server. Kinda like a GET/POST request.
function handleRequestMessage(message, ws) {
  if (message.request === "history") {
    sendMessageHistory(ws);
    return true;
  }
  return false;
}

function handleGuessMessage(message) {
  // TODO: Handle guess.
}

function enforceRateLimit(data, ws) {
  const rateLimitResult = rateLimiter.attempt(data.sender);
  if (!rateLimitResult.allowed) {
    console.warn(`${data.sender} has been rate limited.`);
    // Optionally send a rate limit message to the user
    ws.send(JSON.stringify({ error: "You are sending messages too quickly. Please slow down." }));
    return false;
  }
  return true;
}

function parseMessage(data, ws) {
  try {
    return JSON.parse(data);
  } catch (error) {
    console.error('Error parsing message:', error);
    ws.send(JSON.stringify({ error: "Failed to parse message." }));
    return null;
  }
}

// Runs every x minutes and send a message from AI to the chat (if there has been a message from user since).
function setupAiMessageInterval() {
  setInterval(async () => {
    const lastSender = messages.getLast()?.sender;
    if (lastSender && lastSender !== AI_NICK) {
      try {
        const aiMessage = await ai.generateAiMessage(messages, AI_NICK);
        broadcastAiMessage(aiMessage);
      } catch (error) {
        console.error('Error generating AI message:', error);
      }
    }
  }, AI_MESSAGE_INTERVAL);
}

function sendMessageHistory(ws) {
  const lastMessages = messages.get(HISTORY_MESSAGES_COUNT);
  console.log('Sending last messages to new client:', lastMessages);
  ws.send(JSON.stringify(lastMessages));
}

function broadcastAiMessage(content) {
  const message = {
    id: uuidv4(),
    sender: AI_NICK,
    message: content,
    timestamp: new Date().toISOString(),
  };
  messages.add(message);
  broadcastMessage(message);
}

function broadcastMessage(message) {
  wss.clients.forEach(client => {
    if (client.readyState === 1) {
      client.send(JSON.stringify(message));
    }
  });
}

// Start the server
server.listen(PORT, () => {
  console.log(`Listening on ${PORT}`);
  setupAiMessageInterval();
});
