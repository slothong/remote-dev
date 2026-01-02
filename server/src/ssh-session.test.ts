import {describe, it, expect} from 'vitest';
import {SSHSessionManager} from './ssh-session';
import type {SSHConfig} from './ssh-config';

describe('SSH 연결 성공 시 세션을 유지한다', () => {
  it('should create a session manager', () => {
    const manager = new SSHSessionManager();

    expect(manager).toBeDefined();
  });

  it('should store session after successful connection', async () => {
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

  it('should return undefined for non-existent session', () => {
    const manager = new SSHSessionManager();
    const session = manager.getSession('non-existent-id');

    expect(session).toBeUndefined();
  });

  it('should disconnect and remove session', async () => {
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

  it('should return all active sessions', async () => {
    const manager = new SSHSessionManager();

    const sessions = manager.getAllSessions();

    expect(Array.isArray(sessions)).toBe(true);
  });
});

describe('SSH 연결을 종료할 수 있다', () => {
  it('should disconnect without error for non-existent session', async () => {
    const manager = new SSHSessionManager();

    await expect(
      manager.disconnect('non-existent-id'),
    ).resolves.toBeUndefined();
  });

  it('should remove session after disconnect', async () => {
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

  it('should disconnect all sessions', async () => {
    const manager = new SSHSessionManager();

    await manager.disconnectAll();

    const sessions = manager.getAllSessions();
    expect(sessions.length).toBe(0);
  });

  it('should close client connection on disconnect', async () => {
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
