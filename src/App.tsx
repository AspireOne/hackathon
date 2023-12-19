import React from 'react';
import Chat from "./components/Chat";
import Guess from './components/Guess';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="w-full py-5 bg-indigo-600 text-white text-center">
        <h1 className="text-4xl font-bold">WebSocket Chat</h1>
      </header>
      <main className="flex justify-center p-10">
        <div className="w-4/6 bg-white shadow-lg rounded-lg overflow-hidden mr-4">
          <Chat />
        </div>
        <div className="w-1/6">
          <div className="bg-white shadow-lg rounded-lg overflow-hidden sticky top-10 p-6 h-96 overflow-y-auto">
            <Guess />
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;