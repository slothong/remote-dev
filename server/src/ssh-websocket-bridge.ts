import type {SSHSessionManager} from './ssh-session';
import type {WebSocketBridge} from './websocket-server';
import {startTmuxSession} from './ssh-shell';
import type {ClientChannel} from 'ssh2';

export class SSHWebSocketBridge {
  private sshManager: SSHSessionManager;
  private wsServer: WebSocketBridge;
  private connected: boolean = false;
  private sessionId: string | null = null;
  private disconnectHandlers: Array<() => void> = [];
  private shellStream: ClientChannel | null = null;

  constructor(sshManager: SSHSessionManager, wsServer: WebSocketBridge) {
    this.sshManager = sshManager;
    this.wsServer = wsServer;

    this.wsServer.onDisconnection(() => {
      this.handleDisconnection();
    });

    // Bridge WebSocket messages to SSH shell
    this.wsServer.onMessage((message: string) => {
      if (this.shellStream) {
        this.shellStream.write(message);
      }
    });
  }

  async connect(
    sessionId: string,
    cols?: number,
    rows?: number,
  ): Promise<void> {
    this.sessionId = sessionId;
    const session = this.sshManager.getSession(sessionId);

    if (!session) {
      throw new Error('Session not found');
    }

    // Start tmux session with claude command
    const shellResult = await startTmuxSession(session.client, cols, rows);

    if (!shellResult.success || !shellResult.stream) {
      throw new Error(shellResult.error || 'Failed to start shell');
    }

    this.shellStream = shellResult.stream;

    // Bridge SSH shell output to WebSocket
    // Send raw buffer to preserve terminal control sequences
    this.shellStream.on('data', (data: Buffer) => {
      this.wsServer.send(data.toString('utf8'));
    });

    this.shellStream.on('close', () => {
      this.handleDisconnection();
    });

    this.connected = true;
  }

  async disconnect(): Promise<void> {
    if (this.shellStream) {
      this.shellStream.end();
      this.shellStream = null;
    }
    this.connected = false;
  }

  isConnected(): boolean {
    return this.connected;
  }

  onDisconnect(handler: () => void): void {
    this.disconnectHandlers.push(handler);
  }

  private handleDisconnection(): void {
    this.connected = false;
    if (this.shellStream) {
      this.shellStream.end();
      this.shellStream = null;
    }
    this.disconnectHandlers.forEach(handler => handler());
  }
}
