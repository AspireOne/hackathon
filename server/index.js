import { WebSocketServer } from "ws";
import express from 'express';
import http from 'http';
import OpenAI from 'openai';
import { v4 as uuidv4 } from 'uuid';
import 'dotenv/config'

// Make sure to set your OpenAI API key in an environment variable for security
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const openRouterAi = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
})

const aiNick = "@pometlussy";

const messages = [];

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

wss.on('connection', function connection(ws) {
  console.log('A new client connected!');

  const last20Messages = messages.slice(-20);
  console.log("sending", last20Messages);
  ws.send(JSON.stringify(last20Messages));

  ws.on('message', async function incoming(data) {
    const message = JSON.parse(data);
    console.log('received: %s', message);
    messages.push(message);

    // Assign an ID to each message
    const messageId = uuidv4();
    message.id = messageId;
    // Broadcast the message to everyone else.
    broadcastMessage(message);

    // Perform sentiment analysis
    let sentiment;
    try {
      sentiment = await getSentiment(message.message);
      console.log("sentiment: ", sentiment);
    } catch (error) {
      console.error('Error performing sentiment analysis:', error);
    }

    const sentimentMessage = { id: messageId, sentiment: sentiment.trim() };
    broadcastMessage(sentimentMessage);

    if (message.message.includes(aiNick)) {
      const aiMessage = await generateAiMessage();
      broadcastAiMessage(aiMessage);
    }
  });
});

async function getSentiment(message) {
  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: 'system',
        content: 'You are an expert in categorizing sentiment of a message. ' +
          'You only return either "positive", "negative", "profane", or "neutral"'
      },
      {
        role: 'user',
        content: 'Categorize the sentiment of the following message (return output only one word): ' + message
      }
    ],
    temperature: 0.3,
  });

  return response.choices[0].message.content;
}

async function generateAiMessage() {
  const last8messages = messages.slice(-8);
  const formattedMessages = last8messages.map((message) => {
    return `${message.sender}: ${message.message}`;
  }).join('\n');

  const response = await openRouterAi.chat.completions.create({
    model: 'gryphe/mythomist-7b',
    messages: [
      {
        role: 'system',
        content: `You are user in a group chat. Your nick is "${aiNick}". ` +
          'Have a conversation with others, reply to their messages, and comment on the chat\'s situation. ' +
          'Be direct, funny, and toxic. Use profanity. Your message must be 4 sentences max.',
      },
      {
        role: 'user',
        content: formattedMessages + "\n" + aiNick + ":"
      }
    ],
    temperature: 0.9,
    max_tokens: 300,
  });

  console.log("open router response: ", response);

  return response.choices[0].message.content;
}

function broadcastAiMessage(content) {
  const message = {
    id: uuidv4(),
    sender: aiNick,
    message: content,
    timestamp: new Date().toISOString(),
  };

  messages.push(message);
  broadcastMessage(message);
}

function broadcastMessage(message) {
  wss.clients.forEach(function each(client) {
    client.send(JSON.stringify(message));
  });
}

// Serve any static files
// app.use(express.static('path-to-your-react-app-build'));

const port = process.env.PORT || 3001; //  Railway provides port as .env variable.
server.listen(port, function listening() {
  console.log(`Listening on ${port}`);
});
