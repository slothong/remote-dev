import {describe, it, expect, afterEach} from 'vitest';
import {WebSocketBridge} from './websocket-server';
import {WebSocket} from 'ws';

describe('WebSocket 서버를 시작할 수 있다', () => {
  let server: WebSocketBridge | null = null;

  afterEach(async () => {
    if (server) {
      await server.close();
      server = null;
    }
  });

  it('WebSocket 서버를 생성한다', () => {
    server = new WebSocketBridge(3001);

    expect(server).toBeDefined();
  });

  it('지정된 포트에서 수신을 시작한다', async () => {
    server = new WebSocketBridge(3002);

    await server.start();

    expect(server.isListening()).toBe(true);
  });

  it('서버를 종료한다', async () => {
    server = new WebSocketBridge(3003);

    await server.start();
    expect(server.isListening()).toBe(true);

    await server.close();
    expect(server.isListening()).toBe(false);
  });

  it('포트 번호를 반환한다', () => {
    server = new WebSocketBridge(3004);

    expect(server.getPort()).toBe(3004);
  });
});

describe('WebSocket 클라이언트 연결을 수락할 수 있다', () => {
  let server: WebSocketBridge | null = null;
  let client: WebSocket | null = null;

  afterEach(async () => {
    if (client) {
      client.close();
      client = null;
    }
    if (server) {
      await server.close();
      server = null;
    }
  });

  it('클라이언트 연결을 수락한다', async () => {
    server = new WebSocketBridge(3005);
    await server.start();

    return new Promise<void>((resolve, reject) => {
      server!.onConnection(() => {
        resolve();
      });

      client = new WebSocket('ws://localhost:3005');

      client.on('error', (err: Error) => {
        reject(err);
      });

      setTimeout(() => {
        reject(new Error('Connection timeout'));
      }, 1000);
    });
  });

  it('연결된 클라이언트 수를 추적한다', async () => {
    server = new WebSocketBridge(3006);
    await server.start();

    return new Promise<void>((resolve, reject) => {
      server!.onConnection(() => {
        expect(server!.getClientCount()).toBe(1);
        resolve();
      });

      client = new WebSocket('ws://localhost:3006');

      client.on('error', (err: Error) => {
        reject(err);
      });

      setTimeout(() => {
        reject(new Error('Connection timeout'));
      }, 1000);
    });
  });

  it('클라이언트 연결 해제를 처리한다', async () => {
    server = new WebSocketBridge(3007);
    await server.start();

    return new Promise<void>((resolve, reject) => {
      let connected = false;

      server!.onConnection(() => {
        connected = true;
        expect(server!.getClientCount()).toBe(1);
      });

      server!.onDisconnection(() => {
        if (connected) {
          expect(server!.getClientCount()).toBe(0);
          resolve();
        }
      });

      client = new WebSocket('ws://localhost:3007');

      client.on('open', () => {
        setTimeout(() => {
          client!.close();
        }, 100);
      });

      client.on('error', (err: Error) => {
        reject(err);
      });

      setTimeout(() => {
        reject(new Error('Disconnection timeout'));
      }, 2000);
    });
  });
});

describe('WebSocket으로 메시지를 수신할 수 있다', () => {
  let server: WebSocketBridge | null = null;
  let client: WebSocket | null = null;

  afterEach(async () => {
    if (client) {
      client.close();
      client = null;
    }
    if (server) {
      await server.close();
      server = null;
    }
  });

  it('클라이언트로부터 메시지를 수신한다', async () => {
    server = new WebSocketBridge(3008);
    await server.start();

    return new Promise<void>((resolve, reject) => {
      server!.onMessage((message: string) => {
        expect(message).toBe('Hello Server');
        resolve();
      });

      client = new WebSocket('ws://localhost:3008');

      client.on('open', () => {
        client!.send('Hello Server');
      });

      client.on('error', (err: Error) => {
        reject(err);
      });

      setTimeout(() => {
        reject(new Error('Message timeout'));
      }, 1000);
    });
  });

  it('클라이언트로부터 JSON 메시지를 수신한다', async () => {
    server = new WebSocketBridge(3009);
    await server.start();

    return new Promise<void>((resolve, reject) => {
      server!.onMessage((message: string) => {
        const data = JSON.parse(message);
        expect(data.type).toBe('test');
        expect(data.payload).toBe('hello');
        resolve();
      });

      client = new WebSocket('ws://localhost:3009');

      client.on('open', () => {
        client!.send(JSON.stringify({type: 'test', payload: 'hello'}));
      });

      client.on('error', (err: Error) => {
        reject(err);
      });

      setTimeout(() => {
        reject(new Error('Message timeout'));
      }, 1000);
    });
  });

  it('여러 메시지를 처리한다', async () => {
    server = new WebSocketBridge(3010);
    await server.start();

    return new Promise<void>((resolve, reject) => {
      const messages: string[] = [];

      server!.onMessage((message: string) => {
        messages.push(message);
        if (messages.length === 3) {
          expect(messages).toEqual(['msg1', 'msg2', 'msg3']);
          resolve();
        }
      });

      client = new WebSocket('ws://localhost:3010');

      client.on('open', () => {
        client!.send('msg1');
        client!.send('msg2');
        client!.send('msg3');
      });

      client.on('error', (err: Error) => {
        reject(err);
      });

      setTimeout(() => {
        reject(new Error('Messages timeout'));
      }, 1000);
    });
  });
});

describe('WebSocket으로 메시지를 전송할 수 있다', () => {
  let server: WebSocketBridge | null = null;
  let client: WebSocket | null = null;

  afterEach(async () => {
    if (client) {
      client.close();
      client = null;
    }
    if (server) {
      await server.close();
      server = null;
    }
  });

  it('클라이언트에게 메시지를 전송한다', async () => {
    server = new WebSocketBridge(3011);
    await server.start();

    return new Promise<void>((resolve, reject) => {
      client = new WebSocket('ws://localhost:3011');

      client.on('open', () => {
        server!.send('Hello Client');
      });

      client.on('message', (data: Buffer) => {
        expect(data.toString()).toBe('Hello Client');
        resolve();
      });

      client.on('error', (err: Error) => {
        reject(err);
      });

      setTimeout(() => {
        reject(new Error('Send timeout'));
      }, 1000);
    });
  });

  it('모든 클라이언트에게 메시지를 브로드캐스트한다', async () => {
    server = new WebSocketBridge(3012);
    await server.start();

    const client1 = new WebSocket('ws://localhost:3012');
    const client2 = new WebSocket('ws://localhost:3012');

    return new Promise<void>((resolve, reject) => {
      let receivedCount = 0;

      const checkDone = () => {
        receivedCount++;
        if (receivedCount === 2) {
          client1.close();
          client2.close();
          resolve();
        }
      };

      client1.on('open', () => {
        client2.on('open', () => {
          setTimeout(() => {
            server!.broadcast('Broadcast message');
          }, 50);
        });
      });

      client1.on('message', (data: Buffer) => {
        expect(data.toString()).toBe('Broadcast message');
        checkDone();
      });

      client2.on('message', (data: Buffer) => {
        expect(data.toString()).toBe('Broadcast message');
        checkDone();
      });

      client1.on('error', (err: Error) => {
        client1.close();
        client2.close();
        reject(err);
      });

      client2.on('error', (err: Error) => {
        client1.close();
        client2.close();
        reject(err);
      });

      setTimeout(() => {
        client1.close();
        client2.close();
        reject(new Error('Broadcast timeout'));
      }, 2000);
    });
  });

  it('JSON 메시지를 전송한다', async () => {
    server = new WebSocketBridge(3013);
    await server.start();

    return new Promise<void>((resolve, reject) => {
      client = new WebSocket('ws://localhost:3013');

      client.on('open', () => {
        server!.send(JSON.stringify({type: 'test', data: 'hello'}));
      });

      client.on('message', (data: Buffer) => {
        const message = JSON.parse(data.toString());
        expect(message.type).toBe('test');
        expect(message.data).toBe('hello');
        resolve();
      });

      client.on('error', (err: Error) => {
        reject(err);
      });

      setTimeout(() => {
        reject(new Error('Send timeout'));
      }, 1000);
    });
  });
});
