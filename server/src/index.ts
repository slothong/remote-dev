import {createAPIServer} from './api-server';
import {WebSocketBridge} from './websocket-server';

const API_PORT = 3000;
const WS_PORT = 3001;

async function main() {
  console.log('Starting server...');

  try {
    const wsServer = new WebSocketBridge(WS_PORT);
    await wsServer.start();
    console.log(`WebSocket server listening on ws://localhost:${WS_PORT}`);

    await createAPIServer(API_PORT, wsServer);
    console.log(`API server listening on http://localhost:${API_PORT}`);
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

void main();
