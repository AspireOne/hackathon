import React from 'react';
import Chat from "./components/Chat";

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center">
      <header className="mb-4">
        <h1 className="text-3xl font-bold text-gray-800">WebSocket Chat</h1>
      </header>
      <main className="w-full max-w-md shadow-lg rounded-lg overflow-hidden">
        <Chat />
      </main>
    </div>
  );
};

export default App;