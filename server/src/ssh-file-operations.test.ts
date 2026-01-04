import {describe, it, expect, vi} from 'vitest';
import type {Client, SFTPWrapper} from 'ssh2';
import {readRemoteFile, writeRemoteFile} from './ssh-file-operations';

describe('원격 파일을 읽을 수 있다', () => {
  it('원격 서버에서 파일 내용을 읽는다', async () => {
    const mockSftp = {
      readFile: vi.fn((path, encoding, callback) => {
        callback(null, Buffer.from('test content'));
      }),
    } as unknown as SFTPWrapper;

    const mockClient = {
      sftp: vi.fn(callback => {
        callback(null, mockSftp);
      }),
    } as unknown as Client;

    const result = await readRemoteFile(
      mockClient,
      'remote-dev-workspace/plan.md',
    );

    expect(result.success).toBe(true);
    expect(result.content).toBe('test content');
  });

  it('SFTP 연결 에러를 처리한다', async () => {
    const mockClient = {
      sftp: vi.fn(callback => {
        callback(new Error('SFTP connection failed'), null);
      }),
    } as unknown as Client;

    const result = await readRemoteFile(mockClient, 'test.txt');

    expect(result.success).toBe(false);
    expect(result.error).toBe('SFTP connection failed');
  });

  it('파일 읽기 에러를 처리한다', async () => {
    const mockSftp = {
      readFile: vi.fn((path, encoding, callback) => {
        callback(new Error('File not found'));
      }),
    } as unknown as SFTPWrapper;

    const mockClient = {
      sftp: vi.fn(callback => {
        callback(null, mockSftp);
      }),
    } as unknown as Client;

    const result = await readRemoteFile(mockClient, 'nonexistent.txt');

    expect(result.success).toBe(false);
    expect(result.error).toBe('File not found');
  });
});

describe('원격 파일을 쓸 수 있다', () => {
  it('원격 파일에 내용을 쓴다', async () => {
    const mockSftp = {
      writeFile: vi.fn((path, content, encoding, callback) => {
        callback(null);
      }),
    } as unknown as SFTPWrapper;

    const mockClient = {
      sftp: vi.fn(callback => {
        callback(null, mockSftp);
      }),
    } as unknown as Client;

    const result = await writeRemoteFile(
      mockClient,
      'remote-dev-workspace/plan.md',
      'new content',
    );

    expect(result.success).toBe(true);
  });

  it('SFTP 연결 에러를 처리한다', async () => {
    const mockClient = {
      sftp: vi.fn(callback => {
        callback(new Error('SFTP connection failed'), null);
      }),
    } as unknown as Client;

    const result = await writeRemoteFile(mockClient, 'test.txt', 'content');

    expect(result.success).toBe(false);
    expect(result.error).toBe('SFTP connection failed');
  });

  it('파일 쓰기 에러를 처리한다', async () => {
    const mockSftp = {
      writeFile: vi.fn((path, content, encoding, callback) => {
        callback(new Error('Permission denied'));
      }),
    } as unknown as SFTPWrapper;

    const mockClient = {
      sftp: vi.fn(callback => {
        callback(null, mockSftp);
      }),
    } as unknown as Client;

    const result = await writeRemoteFile(mockClient, 'readonly.txt', 'content');

    expect(result.success).toBe(false);
    expect(result.error).toBe('Permission denied');
  });
});
