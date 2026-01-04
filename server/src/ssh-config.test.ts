import {describe, it, expect} from 'vitest';
import {createSSHConfig} from './ssh-config';

describe('SSH 연결 정보를 저장하는 모델을 생성할 수 있다', () => {
  it('비밀번호로 SSH 설정 모델을 생성한다', () => {
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

  it('개인키로 SSH 설정 모델을 생성한다', () => {
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
