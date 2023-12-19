import React from 'react';
import Chat from "./components/Chat";
import Guess from './components/Guess';

const App: React.FC = () => {
  const [nick, setNick] = React.useState<string>();

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="w-full py-5 bg-indigo-600 text-white text-center">
        <h1 className="text-4xl font-bold">WebSocket Chat</h1>
      </header>
      <main className="flex justify-center p-10">
        <div className="w-4/6 bg-white shadow-lg rounded-lg overflow-hidden mr-4">
          {
            nick ? <Chat nick={nick} /> : <ChooseNickModal onNickSet={setNick}/>
          }
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

const ChooseNickModal = (props: {onNickSet: (nick: string) => void}) => {
  const [nick, setNick] = React.useState<string>("");

  const onSubmit = () => {
    if (nick && nick.length > 3) {
      props.onNickSet(nick);
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-10">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-4">Choose a nickname</h1>
        <input
          type="text"
          value={nick}
          onChange={(e) => setNick(e.target.value)}
          className="border rounded p-2"
        />
        <button
          onClick={onSubmit}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4"
        >
          Join
        </button>
      </div>
    </div>
  );
}

export default App;