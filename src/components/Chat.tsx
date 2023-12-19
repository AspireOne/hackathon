import React, { useState, useEffect, useRef } from 'react';

const username = `User${Math.floor(Math.random() * 1000000)}`;

// Extended interface to include sentiment and id
interface ChatMessage {
  id: string; // Now required as it will be assigned by the server
  sender: string;
  message: string;
  timestamp: string; // Use string to be consistent and allow Date conversion as needed
  sentiment?: string; // Include the sentiment as optional
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
    <div className="chat-container">
      <ul className="messages-list">
        {messages.map((msg) => (
          <li key={msg.id} className="message-item">
            <strong>{msg.sender}</strong>
            <span> ({new Date(msg.timestamp).toLocaleTimeString()}): </span>
            <p>{msg.message}</p>
            {msg.sentiment && <p className="sentiment">Sentiment: {msg.sentiment}</p>}
          </li>
        ))}
      </ul>
      <div className="message-input-container">
        <input
          type="text"
          value={input}
          placeholder="Type a message..."
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              sendMessage();
            }
          }}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default Chat;
