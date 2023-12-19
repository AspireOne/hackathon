import React, { useState, useEffect, useRef } from 'react';

const username = `User${Math.floor(Math.random() * 1000000)}`;

type Sentiment = "positive" | "negative" | "profane" | "neutral";

// Extended interface to include sentiment and id
interface ChatMessage {
  id: string; // Now required as it will be assigned by the server
  sender: string;
  message: string;
  timestamp: string; // Use string to be consistent and allow Date conversion as needed
  sentiment?: Sentiment; // Include the sentiment as optional
}

const getSentimentStyle = (sentiment?: Sentiment) => {
  switch (sentiment) {
    case 'positive':
      return 'bg-green-200';
    case 'negative':
      return 'bg-gray-400';
    case 'profane':
      return 'bg-red-400';
    default:
      return 'bg-gray-200';
  }
}

// Component for Chat
const Chat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const ws = useRef<WebSocket | null>(null);

  // Establish WebSocket connection
  useEffect(() => {
    ws.current = new WebSocket('ws://localhost:3001');
    ws.current.onopen = () => console.log('WebSocket opened');

    ws.current.onmessage = (e) => {
      const data = JSON.parse(e.data);

      // Check if incoming data has an id and sentiment (this is a sentiment analysis result)
      if ('id' in data && 'sentiment' in data) {
        // Update the message in state with its sentiment
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.id === data.id ? { ...msg, sentiment: data.sentiment } : msg
          )
        );
      } else {
        // This is a regular message
        setMessages((prevMessages) => [...prevMessages, data]);
        if (data.message.startsWith("/")) {
          // if correct:
          /*ws.current!.send(JSON.stringify({
            type: "correct-guess", // or wrong-guess
            ...data
          }));*/
        }
      }
    };

    ws.current.onclose = () => console.log('WebSocket closed');

    return () => {
      ws.current?.close();
    };
  }, []);

  // Send a message to the server
  const sendMessage = () => {
    if (input.trim() !== '' && ws.current) {
      const messageToSend: Omit<ChatMessage, 'id'> = {
        sender: username,
        message: input,
        timestamp: new Date().toISOString(),
      };
      ws.current.send(JSON.stringify(messageToSend));
      setInput('');
    }
  };

  // Render the chat UI
  return (
    <div className="chat-container flex flex-col justify-between border h-[70vh]">
      <ul className="messages-list overflow-auto flex-grow">
        {messages.map((msg) => (
          <li key={msg.id} className={"message-item rounded m-5 p-3 " + getSentimentStyle(msg.sentiment)}>
            <strong>{msg.sender}</strong>
            <span> ({new Date(msg.timestamp).toLocaleTimeString()}): </span>
            <i className={"ml-auto"}>{msg.sentiment}</i>
            <p>{msg.message}</p>
          </li>
        ))}
      </ul>
      <div className="message-input-container border-t p-2 flex items-center bg-white sticky bottom-0">
        <input
          type="text"
          value={input}
          placeholder="Type a message..."
          className="flex-grow p-2 border rounded mr-2"
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              sendMessage();
            }
          }}
        />
        <button
          onClick={sendMessage}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;
