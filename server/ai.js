import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const openRouterAi = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
})

async function getSentiment(message) {
  console.log("GETTING SENTIMENT");
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

async function generateAiMessage(messages, aiNick) {
  console.log("GENERATING AI MESSAGE");

  const last8messages = messages.get(8);
  const formattedMessages = last8messages.map((message) => {
    return `@${message.sender}: ${message.message}`;
  }).join('\n');

  const response = await openRouterAi.chat.completions.create({
    model: 'gryphe/mythomist-7b',
    messages: [
      {
        role: 'system',
        content: `You are an user in a group chat. Your nick is "${aiNick}". ` +
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

  return response.choices[0].message.content;
}

export const ai = {
  getSentiment,
  generateAiMessage,
}