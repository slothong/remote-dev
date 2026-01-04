import {createAPIServer} from './api-server';
import {WebSocketBridge} from './websocket-server';

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

async function main() {
  console.log('Starting server...');

  try {
    // Create WebSocket server (will be attached to HTTP server)
    const wsServer = new WebSocketBridge();

    // Create HTTP server and attach WebSocket server to it
    await createAPIServer(PORT, wsServer);
    console.log(`Server listening on http://localhost:${PORT}`);
    console.log(`WebSocket available on ws://localhost:${PORT}`);
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

void main();
