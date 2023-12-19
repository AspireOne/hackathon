export const constants = {
  serverUrl: import.meta.env.DEV ? 'http://localhost:3001' : 'https://hackathonussy.up.railway.app',
  // Websocket needs a different protocol (ws instead of localhost).
  wsServerUrl: import.meta.env.DEV ? 'ws://localhost:3001/ws' : 'wss://hackathonussy.up.railway.app',
}