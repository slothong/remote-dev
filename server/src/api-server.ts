import express, {type Request, type Response} from 'express';
import cors from 'cors';
import type {Server} from 'http';
import {SSHSessionManager} from './ssh-session';
import {SSHWebSocketBridge} from './ssh-websocket-bridge';
import type {WebSocketBridge} from './websocket-server';
import type {SSHConfig} from './ssh-config';

const sshManager = new SSHSessionManager();
let sshWsBridge: SSHWebSocketBridge | null = null;

export function createAPIServer(
  port: number,
  wsServer: WebSocketBridge,
): Promise<Server> {
  const app = express();

  app.use(cors());
  app.use(express.json());

  sshWsBridge = new SSHWebSocketBridge(sshManager, wsServer);

  app.post('/api/ssh/connect', async (req: Request, res: Response) => {
    try {
      const {host, port: sshPort, username, authMethod, password} = req.body;

      const config: SSHConfig = {
        host,
        port: sshPort,
        username,
        ...(authMethod === 'password' && {password}),
      };

      const result = await sshManager.connect(config);

      if (result.success) {
        res.json({
          success: true,
          sessionId: result.sessionId,
        });
      } else {
        res.json({
          success: false,
          error: result.error || 'Connection failed',
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      });
    }
  });

  app.post('/api/ssh/shell', async (req: Request, res: Response) => {
    try {
      const {sessionId} = req.body;

      if (!sessionId) {
        res.status(400).json({
          success: false,
          error: 'Session ID is required',
        });
        return;
      }

      if (!sshWsBridge) {
        res.status(500).json({
          success: false,
          error: 'WebSocket bridge not initialized',
        });
        return;
      }

      await sshWsBridge.connect(sessionId);

      res.json({
        success: true,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to start shell',
      });
    }
  });

  return new Promise(resolve => {
    const server = app.listen(port, () => {
      resolve(server);
    });
  });
}
