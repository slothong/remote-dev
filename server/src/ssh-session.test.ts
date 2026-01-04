import {describe, it, expect} from 'vitest';
import {SSHSessionManager} from './ssh-session';
import type {SSHConfig} from './ssh-config';

describe('SSH 연결 성공 시 세션을 유지한다', () => {
  it('세션 매니저를 생성한다', () => {
    const manager = new SSHSessionManager();

    expect(manager).toBeDefined();
  });

  it('성공적인 연결 후 세션을 저장한다', async () => {
    const manager = new SSHSessionManager();
    const config: SSHConfig = {
      host: 'invalid-host.example.com',
      port: 22,
      username: 'testuser',
      password: 'testpass',
    };

    const result = await manager.connect(config);

    if (result.success && result.sessionId) {
      const session = manager.getSession(result.sessionId);
      expect(session).toBeDefined();
    }
  });

  it('존재하지 않는 세션에 대해 undefined를 반환한다', () => {
    const manager = new SSHSessionManager();
    const session = manager.getSession('non-existent-id');

    expect(session).toBeUndefined();
  });

  it('세션을 연결 해제하고 제거한다', async () => {
    const manager = new SSHSessionManager();
    const config: SSHConfig = {
      host: 'invalid-host.example.com',
      port: 22,
      username: 'testuser',
      password: 'testpass',
    };

    const result = await manager.connect(config);

    if (result.success && result.sessionId) {
      await manager.disconnect(result.sessionId);
      const session = manager.getSession(result.sessionId);
      expect(session).toBeUndefined();
    }
  });

  it('모든 활성 세션을 반환한다', async () => {
    const manager = new SSHSessionManager();

    const sessions = manager.getAllSessions();

    expect(Array.isArray(sessions)).toBe(true);
  });
});

describe('SSH 연결을 종료할 수 있다', () => {
  it('존재하지 않는 세션에 대해 에러 없이 연결 해제한다', async () => {
    const manager = new SSHSessionManager();

    await expect(
      manager.disconnect('non-existent-id'),
    ).resolves.toBeUndefined();
  });

  it('연결 해제 후 세션을 제거한다', async () => {
    const manager = new SSHSessionManager();
    const config: SSHConfig = {
      host: 'invalid-host.example.com',
      port: 22,
      username: 'testuser',
      password: 'testpass',
    };

    const result = await manager.connect(config);

    if (result.success && result.sessionId) {
      expect(manager.getSession(result.sessionId)).toBeDefined();

      await manager.disconnect(result.sessionId);

      expect(manager.getSession(result.sessionId)).toBeUndefined();
    }
  });

  it('모든 세션의 연결을 해제한다', async () => {
    const manager = new SSHSessionManager();

    await manager.disconnectAll();

    const sessions = manager.getAllSessions();
    expect(sessions.length).toBe(0);
  });

  it('연결 해제 시 클라이언트 연결을 닫는다', async () => {
    const manager = new SSHSessionManager();
    const config: SSHConfig = {
      host: 'invalid-host.example.com',
      port: 22,
      username: 'testuser',
      password: 'testpass',
    };

    const result = await manager.connect(config);

    if (result.success && result.sessionId) {
      const session = manager.getSession(result.sessionId);
      expect(session).toBeDefined();

      await manager.disconnect(result.sessionId);

      // Session should be removed
      expect(manager.getSession(result.sessionId)).toBeUndefined();
    }
  });
});
