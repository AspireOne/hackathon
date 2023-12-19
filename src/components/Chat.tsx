import React, { useState, useEffect, useRef } from 'react';

// Ensure you have this interface definition before the component
interface ChatMessage {
  sender: string;
  message: string;
  timestamp: Date;
}

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    ws.current = new WebSocket('ws://localhost:3001');
    ws.current.addEventListener('open', () => {
      console.log('WebSocket opened');
      // You can authenticate the user here if needed
    });
    ws.current.addEventListener('message', (e) => {
      const data: ChatMessage = JSON.parse(e.data);
      setMessages((prevMessages) => [...prevMessages, data]);
      console.log("tady sem")
      console.log(data)
      console.log(messages)
    });
    ws.current.addEventListener('close', () => console.log('WebSocket closed'));

    return () => {
      ws.current?.close();
    };
  }, []);

  const sendMessage = () => {
    if (input.trim() !== '' && ws.current) {
      const newMessage: ChatMessage = {
        sender: 'Username', // Replace this with the actual username
        message: input,
        timestamp: new Date(),
      };
      ws.current.send(JSON.stringify(newMessage));
  
      // Add the new message to local state so it appears in the chat.
      setMessages((prevMessages) => [...prevMessages, newMessage]);
      setInput('');
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <ul className="overflow-y-auto p-4">
        {messages.map((msg, index) => (
          <li key={index} className="mb-2 break-words">
            <strong className="font-bold">{msg.sender}</strong>
            <span className="text-xs text-gray-500"> ({msg.timestamp.toLocaleTimeString()}):</span>
            <p className="text-gray-700 mt-1">{msg.message}</p>
          </li>
        ))}
      </ul>
      <div className="p-4 bg-gray-100 border-t">
        <div className="flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                sendMessage();
              }
            }}
            placeholder="Enter your message..."
            className="flex-1 border rounded p-2 mr-2 outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={sendMessage}
            className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;