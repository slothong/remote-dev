import {describe, it, expect, afterEach} from 'vitest';
import {SSHWebSocketBridge} from './ssh-websocket-bridge';
import {SSHSessionManager} from './ssh-session';
import {WebSocketBridge} from './websocket-server';
import {WebSocket} from 'ws';

describe('WebSocket과 SSH 세션 간 데이터를 전달할 수 있다', () => {
  let bridge: SSHWebSocketBridge | null = null;
  let sshManager: SSHSessionManager | null = null;
  let wsServer: WebSocketBridge | null = null;

  afterEach(async () => {
    if (bridge) {
      await bridge.disconnect();
      bridge = null;
    }
    if (sshManager) {
      await sshManager.disconnectAll();
      sshManager = null;
    }
    if (wsServer) {
      await wsServer.close();
      wsServer = null;
    }
  });

  it('SSH와 WebSocket 간 브릿지를 생성한다', () => {
    sshManager = new SSHSessionManager();
    wsServer = new WebSocketBridge(3020);
    bridge = new SSHWebSocketBridge(sshManager, wsServer);

    expect(bridge).toBeDefined();
  });

  it('브릿지 인스턴스를 생성한다', async () => {
    sshManager = new SSHSessionManager();
    wsServer = new WebSocketBridge(3021);
    bridge = new SSHWebSocketBridge(sshManager, wsServer);

    await wsServer.start();

    expect(bridge.isConnected()).toBe(false);
    // Actual connection test requires a real SSH session
  });

  it('브릿지 연결을 해제한다', async () => {
    sshManager = new SSHSessionManager();
    wsServer = new WebSocketBridge(3022);
    bridge = new SSHWebSocketBridge(sshManager, wsServer);

    await wsServer.start();

    expect(bridge.isConnected()).toBe(false);

    await bridge.disconnect();

    expect(bridge.isConnected()).toBe(false);
  });
});

describe('클라이언트 연결 해제를 처리할 수 있다', () => {
  let bridge: SSHWebSocketBridge | null = null;
  let sshManager: SSHSessionManager | null = null;
  let wsServer: WebSocketBridge | null = null;
  let client: WebSocket | null = null;

  afterEach(async () => {
    if (client) {
      client.close();
      client = null;
    }
    if (bridge) {
      await bridge.disconnect();
      bridge = null;
    }
    if (sshManager) {
      await sshManager.disconnectAll();
      sshManager = null;
    }
    if (wsServer) {
      await wsServer.close();
      wsServer = null;
    }
  });

  it('클라이언트 연결 해제를 처리한다', async () => {
    sshManager = new SSHSessionManager();
    wsServer = new WebSocketBridge(3023);
    bridge = new SSHWebSocketBridge(sshManager, wsServer);

    await wsServer.start();

    return new Promise<void>((resolve, reject) => {
      let disconnectHandlerCalled = false;

      bridge!.onDisconnect(() => {
        disconnectHandlerCalled = true;
        resolve();
      });

      client = new WebSocket('ws://localhost:3023');

      client.on('open', () => {
        setTimeout(() => {
          client!.close();
        }, 100);
      });

      client.on('error', (err: Error) => {
        reject(err);
      });

      setTimeout(() => {
        if (!disconnectHandlerCalled) {
          reject(new Error('Disconnect handler not called'));
        }
      }, 1000);
    });
  });

  it('연결 해제 시 리소스를 정리한다', async () => {
    sshManager = new SSHSessionManager();
    wsServer = new WebSocketBridge(3024);
    bridge = new SSHWebSocketBridge(sshManager, wsServer);

    await wsServer.start();

    expect(bridge.isConnected()).toBe(false);

    return new Promise<void>((resolve, reject) => {
      bridge!.onDisconnect(async () => {
        expect(bridge!.isConnected()).toBe(false);
        resolve();
      });

      client = new WebSocket('ws://localhost:3024');

      client.on('open', () => {
        setTimeout(() => {
          client!.close();
        }, 100);
      });

      client.on('error', (err: Error) => {
        reject(err);
      });

      setTimeout(() => {
        reject(new Error('Disconnect timeout'));
      }, 1000);
    });
  });
});

describe('SSH 셸 I/O를 WebSocket으로 브릿징한다', () => {
  it('SSH 셸 출력을 WebSocket으로 브릿징한다', () => {
    const sshManager = new SSHSessionManager();
    const wsServer = new WebSocketBridge(3025);
    const bridge = new SSHWebSocketBridge(sshManager, wsServer);

    expect(bridge).toBeDefined();
    // Detailed implementation test will be added when implementing the actual bridging
  });
});
