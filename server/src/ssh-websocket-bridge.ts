import type {SSHSessionManager} from './ssh-session';
import type {WebSocketBridge} from './websocket-server';

export class SSHWebSocketBridge {
  private sshManager: SSHSessionManager;
  private wsServer: WebSocketBridge;
  private connected: boolean = false;
  private sessionId: string | null = null;
  private disconnectHandlers: Array<() => void> = [];

  constructor(sshManager: SSHSessionManager, wsServer: WebSocketBridge) {
    this.sshManager = sshManager;
    this.wsServer = wsServer;

    this.wsServer.onDisconnection(() => {
      this.handleDisconnection();
    });
  }

  async connect(sessionId: string): Promise<void> {
    this.sessionId = sessionId;
    this.connected = true;
  }

  async disconnect(): Promise<void> {
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
    this.disconnectHandlers.forEach(handler => handler());
  }
}
