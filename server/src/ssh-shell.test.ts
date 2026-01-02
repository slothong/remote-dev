import {describe, it, expect, vi, beforeEach} from 'vitest';
import {Client, type ClientChannel} from 'ssh2';
import {startShell} from './ssh-shell';

describe('SSH 셸 세션을 시작할 수 있다', () => {
  let mockClient: Client;

  beforeEach(() => {
    mockClient = new Client();
  });

  it('should start a shell session', async () => {
    const mockStream = {
      on: vi.fn(),
      write: vi.fn(),
      end: vi.fn(),
    };

    vi.spyOn(mockClient, 'shell').mockImplementation(
      (callback: (err: Error | undefined, stream: ClientChannel) => void) => {
        callback(undefined, mockStream as unknown as ClientChannel);
        return mockClient;
      },
    );

    const result = await startShell(mockClient);

    expect(result.success).toBe(true);
    expect(result.stream).toBeDefined();
    expect(mockClient.shell).toHaveBeenCalled();
  });

  it('should return error when shell fails', async () => {
    vi.spyOn(mockClient, 'shell').mockImplementation(
      (callback: (err: Error | undefined, stream: ClientChannel) => void) => {
        callback(new Error('Shell failed'), null as unknown as ClientChannel);
        return mockClient;
      },
    );

    const result = await startShell(mockClient);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Shell failed');
  });
});
