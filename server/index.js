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

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

wss.on('connection', function connection(ws) {
  console.log('A new client connected!');

  ws.on('message', async function incoming(data) {
    const message = JSON.parse(data);
    console.log('received: %s', message);

    // Assign an ID to each message
    const messageId = uuidv4();
    message.id = messageId;

    // Broadcast the message to everyone else.
    wss.clients.forEach(function each(client) {
      client.send(JSON.stringify(message));
    });

    // Perform sentiment analysis
    try {
      const sentiment = await getSentiment(message.message);
      console.log("sentiment: ", sentiment);

      // Broadcast the sentiment result to all clients with the message ID
      const sentimentMessage = { id: messageId, sentiment: sentiment.trim() };
      wss.clients.forEach(function each(client) {
        client.send(JSON.stringify(sentimentMessage));
      });
    } catch (error) {
      console.error('Error performing sentiment analysis:', error);
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

// Serve any static files
// app.use(express.static('path-to-your-react-app-build'));

const port = process.env.PORT || 3001; //  Railway provides port as .env variable.
server.listen(port, function listening() {
  console.log(`Listening on ${port}`);
});
