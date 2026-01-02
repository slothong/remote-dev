import {describe, it, expect} from 'vitest';
import {createSSHConfig} from './ssh-config';

describe('SSH 연결 정보를 저장하는 모델을 생성할 수 있다', () => {
  it('should create SSH config model with password', () => {
    const config = createSSHConfig({
      host: 'example.com',
      port: 22,
      username: 'testuser',
      password: 'testpass',
    });

    expect(config.host).toBe('example.com');
    expect(config.port).toBe(22);
    expect(config.username).toBe('testuser');
    expect(config.password).toBe('testpass');
  });

  it('should create SSH config model with privateKey', () => {
    const config = createSSHConfig({
      host: 'example.com',
      port: 22,
      username: 'testuser',
      privateKey: 'key-content',
    });

    expect(config.host).toBe('example.com');
    expect(config.port).toBe(22);
    expect(config.username).toBe('testuser');
    expect(config.privateKey).toBe('key-content');
  });
});
