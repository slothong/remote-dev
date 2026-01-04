import {describe, it, expect} from 'vitest';
import {connectToSSH} from './ssh-client';
import type {SSHConfig} from './ssh-config';

describe('SSH 클라이언트로 원격 서버에 연결할 수 있다', () => {
  it('연결 시 연결 결과를 반환한다', async () => {
    const config: SSHConfig = {
      host: 'invalid-host-that-does-not-exist.example.com',
      port: 22,
      username: 'testuser',
      password: 'testpass',
    };

    const result = await connectToSSH(config);

    expect(result).toBeDefined();
    expect(result).toHaveProperty('success');
  });

  it('유효하지 않은 호스트에 대해 success false를 반환한다', async () => {
    const config: SSHConfig = {
      host: 'invalid-host-that-does-not-exist.example.com',
      port: 22,
      username: 'testuser',
      password: 'testpass',
    };

    const result = await connectToSSH(config);

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('연결하기 전에 설정을 검증한다', async () => {
    const config: SSHConfig = {
      host: '',
      port: 22,
      username: 'testuser',
      password: 'testpass',
    };

    const result = await connectToSSH(config);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Invalid SSH configuration');
  });
});

describe('SSH 연결 실패 시 에러를 반환한다', () => {
  it('연결이 실패할 때 에러 메시지를 반환한다', async () => {
    const config: SSHConfig = {
      host: 'invalid-host-that-does-not-exist.example.com',
      port: 22,
      username: 'testuser',
      password: 'testpass',
    };

    const result = await connectToSSH(config);

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
    if (result.error) {
      expect(typeof result.error).toBe('string');
      expect(result.error.length).toBeGreaterThan(0);
    }
  });

  it('연결이 실패할 때 클라이언트를 반환하지 않는다', async () => {
    const config: SSHConfig = {
      host: 'invalid-host-that-does-not-exist.example.com',
      port: 22,
      username: 'testuser',
      password: 'testpass',
    };

    const result = await connectToSSH(config);

    expect(result.success).toBe(false);
    expect(result.client).toBeUndefined();
  });

  it('유효하지 않은 설정에 대해 특정 에러를 반환한다', async () => {
    const config: SSHConfig = {
      host: 'localhost',
      port: 0,
      username: 'testuser',
      password: 'testpass',
    };

    const result = await connectToSSH(config);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Invalid SSH configuration');
  });
});
