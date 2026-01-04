import {describe, it, expect, beforeAll, afterAll} from 'vitest';
import {createAPIServer} from './api-server';
import {WebSocketBridge} from './websocket-server';
import type {Server} from 'http';

describe('API Server SSH Connection', () => {
  let server: Server;
  let wsServer: WebSocketBridge;
  const port = 3100;
  const wsPort = 3101;

  beforeAll(async () => {
    wsServer = new WebSocketBridge(wsPort);
    await wsServer.start();
    server = await createAPIServer(port, wsServer);
  });

  afterAll(async () => {
    if (server) {
      await new Promise(resolve => server.close(resolve));
    }
    if (wsServer) {
      await wsServer.close();
    }
  });

  it('SSH 연결 요청을 수락한다', async () => {
    const response = await fetch(`http://localhost:${port}/api/ssh/connect`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        host: 'test.example.com',
        port: 22,
        username: 'testuser',
        authMethod: 'password',
        password: 'testpass',
      }),
    });

    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data).toHaveProperty('success');
  });

  it('유효하지 않은 SSH 설정에 대해 에러를 반환한다', async () => {
    const response = await fetch(`http://localhost:${port}/api/ssh/connect`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        host: '',
        port: 22,
        username: 'testuser',
      }),
    });

    const data = (await response.json()) as {success: boolean; error?: string};
    expect(data.success).toBe(false);
    expect(data).toHaveProperty('error');
  });
});

describe('API Server Plan Management', () => {
  let server: Server;
  let wsServer: WebSocketBridge;
  const port = 3102;
  const wsPort = 3103;

  beforeAll(async () => {
    wsServer = new WebSocketBridge(wsPort);
    await wsServer.start();
    server = await createAPIServer(port, wsServer);
  });

  afterAll(async () => {
    if (server) {
      await new Promise(resolve => server.close(resolve));
    }
    if (wsServer) {
      await wsServer.close();
    }
  });

  it('GET /api/plan에서 sessionId가 누락되었을 때 에러를 반환한다', async () => {
    const response = await fetch(`http://localhost:${port}/api/plan`);

    const data = (await response.json()) as {success: boolean; error?: string};
    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Session ID is required');
  });

  it('GET /api/plan에서 세션을 찾을 수 없을 때 에러를 반환한다', async () => {
    const response = await fetch(
      `http://localhost:${port}/api/plan?sessionId=invalid-session-id`,
    );

    const data = (await response.json()) as {success: boolean; error?: string};
    expect(response.status).toBe(404);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Session not found');
  });

  it('POST /api/plan/update-check에서 sessionId가 누락되었을 때 에러를 반환한다', async () => {
    const response = await fetch(
      `http://localhost:${port}/api/plan/update-check`,
      {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          sectionTitle: 'Test Section',
          itemIndex: 0,
          checked: true,
        }),
      },
    );

    const data = (await response.json()) as {success: boolean; error?: string};
    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Session ID is required');
  });

  it('POST /api/plan/update-check에서 필수 필드가 누락되었을 때 에러를 반환한다', async () => {
    const response = await fetch(
      `http://localhost:${port}/api/plan/update-check`,
      {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          sessionId: 'test-session',
        }),
      },
    );

    const data = (await response.json()) as {success: boolean; error?: string};
    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe(
      'Section title, item index, and checked status are required',
    );
  });

  it('POST /api/plan/update-check에서 세션을 찾을 수 없을 때 에러를 반환한다', async () => {
    const response = await fetch(
      `http://localhost:${port}/api/plan/update-check`,
      {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          sessionId: 'invalid-session-id',
          sectionTitle: 'Test Section',
          itemIndex: 0,
          checked: true,
        }),
      },
    );

    const data = (await response.json()) as {success: boolean; error?: string};
    expect(response.status).toBe(404);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Session not found');
  });

  it('POST /api/plan/add-item에서 sessionId가 누락되었을 때 에러를 반환한다', async () => {
    const response = await fetch(`http://localhost:${port}/api/plan/add-item`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        sectionTitle: 'Test Section',
        itemText: 'New item',
      }),
    });

    const data = (await response.json()) as {success: boolean; error?: string};
    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Session ID is required');
  });

  it('POST /api/plan/add-item에서 필수 필드가 누락되었을 때 에러를 반환한다', async () => {
    const response = await fetch(`http://localhost:${port}/api/plan/add-item`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        sessionId: 'test-session',
      }),
    });

    const data = (await response.json()) as {success: boolean; error?: string};
    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Section title and item text are required');
  });

  it('POST /api/plan/add-item에서 세션을 찾을 수 없을 때 에러를 반환한다', async () => {
    const response = await fetch(`http://localhost:${port}/api/plan/add-item`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        sessionId: 'invalid-session-id',
        sectionTitle: 'Test Section',
        itemText: 'New item',
      }),
    });

    const data = (await response.json()) as {success: boolean; error?: string};
    expect(response.status).toBe(404);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Session not found');
  });

  it('DELETE /api/plan/delete-item에서 sessionId가 누락되었을 때 에러를 반환한다', async () => {
    const response = await fetch(
      `http://localhost:${port}/api/plan/delete-item`,
      {
        method: 'DELETE',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          sectionTitle: 'Test Section',
          itemIndex: 0,
        }),
      },
    );

    const data = (await response.json()) as {success: boolean; error?: string};
    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Session ID is required');
  });

  it('DELETE /api/plan/delete-item에서 필수 필드가 누락되었을 때 에러를 반환한다', async () => {
    const response = await fetch(
      `http://localhost:${port}/api/plan/delete-item`,
      {
        method: 'DELETE',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          sessionId: 'test-session',
        }),
      },
    );

    const data = (await response.json()) as {success: boolean; error?: string};
    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Section title and item index are required');
  });

  it('DELETE /api/plan/delete-item에서 세션을 찾을 수 없을 때 에러를 반환한다', async () => {
    const response = await fetch(
      `http://localhost:${port}/api/plan/delete-item`,
      {
        method: 'DELETE',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          sessionId: 'invalid-session-id',
          sectionTitle: 'Test Section',
          itemIndex: 0,
        }),
      },
    );

    const data = (await response.json()) as {success: boolean; error?: string};
    expect(response.status).toBe(404);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Session not found');
  });
});
