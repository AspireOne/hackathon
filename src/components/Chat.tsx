import React, { useState, useEffect, useRef } from "react";
import { constants } from "../lib/constants.ts";
import { ChatMessage, Message } from "./Message.tsx";
import { twMerge } from "tailwind-merge";

export type Sentiment = "positive" | "negative" | "profane" | "neutral";

const ws = new WebSocket(constants.wsServerUrl);

// Component for Chat
const Chat = (props: {nick: string}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");

  // Establish WebSocket connection
  useEffect(() => {
    window.addEventListener("beforeunload", () => ws?.close());

    ws.onopen = () => console.log("WebSocket opened");
    ws.onclose = () => console.log("WebSocket closed");
    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);

      // When server sends initial messages.
      if (Array.isArray(data)) {
        setMessages(data);
        return;
      }

      // Check if incoming data has an id and sentiment (this is a sentiment analysis result)
      if ("id" in data && "sentiment" in data) {
        // Update the message in state with its sentiment
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.id === data.id ? { ...msg, sentiment: data.sentiment } : msg,
          ),
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

    /*return () => {
      ws?.close();
    };*/
  }, []);

  const sendMessage = () => {
    if (input.trim() !== "" && ws) {
      const messageToSend: Omit<ChatMessage, "id"> = {
        sender: props.nick,
        message: input,
        timestamp: new Date().toISOString(),
      };
      ws.send(JSON.stringify(messageToSend));
      setInput("");
    }
  };

  // Render the chat UI.
  return (
    <div className="chat-container flex flex-col justify-between border h-[70vh]">
      <div className="messages-list overflow-auto flex-grow">
        {messages.map((msg) => (
          <Message key={msg.id} msg={msg} />
        ))}
      </div>
      <InputTextbox
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyUp={(e) => {
          if (e.key === "Enter") sendMessage();
        }}
        onClick={sendMessage}
      />
    </div>
  );
};

function InputTextbox(props: {
  value: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  onKeyUp:  React.KeyboardEventHandler<HTMLInputElement>;
  onClick: () => void;
}) {
  return (
    <div className={twMerge(
      "message-input-container border-t p-2",
      "flex items-center bg-white sticky bottom-0"
    )}>
      <input
        type="text"
        value={props.value}
        placeholder="Type a message..."
        className="flex-grow p-2 border rounded mr-2"
        onChange={props.onChange}
        onKeyUp={props.onKeyUp}
      />
      <button
        onClick={props.onClick}
        className={twMerge(
          "bg-blue-500 hover:bg-blue-700",
          "text-white font-bold py-2 px-4 rounded"
        )}
      >
        Send
      </button>
    </div>
  );
}

export default Chat;
