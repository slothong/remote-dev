import {describe, it, expect} from 'vitest';
import {validateSSHConfig} from './ssh-validation';

describe('SSH 연결 정보의 유효성을 검증할 수 있다', () => {
  it('비밀번호가 있는 유효한 설정에 대해 true를 반환한다', () => {
    const result = validateSSHConfig({
      host: 'example.com',
      port: 22,
      username: 'user',
      password: 'pass',
    });

    expect(result).toBe(true);
  });

  it('개인키가 있는 유효한 설정에 대해 true를 반환한다', () => {
    const result = validateSSHConfig({
      host: 'example.com',
      port: 22,
      username: 'user',
      privateKey: 'key',
    });

    expect(result).toBe(true);
  });

  it('호스트가 비어있을 때 false를 반환한다', () => {
    const result = validateSSHConfig({
      host: '',
      port: 22,
      username: 'user',
      password: 'pass',
    });

    expect(result).toBe(false);
  });

  it('포트가 유효하지 않을 때 false를 반환한다', () => {
    const result = validateSSHConfig({
      host: 'example.com',
      port: 0,
      username: 'user',
      password: 'pass',
    });

    expect(result).toBe(false);
  });

  it('사용자 이름이 비어있을 때 false를 반환한다', () => {
    const result = validateSSHConfig({
      host: 'example.com',
      port: 22,
      username: '',
      password: 'pass',
    });

    expect(result).toBe(false);
  });

  it('비밀번호와 개인키가 모두 없을 때 false를 반환한다', () => {
    const result = validateSSHConfig({
      host: 'example.com',
      port: 22,
      username: 'user',
    });

    expect(result).toBe(false);
  });
});
