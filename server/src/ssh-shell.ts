import type {Client, ClientChannel} from 'ssh2';

export interface ShellResult {
  success: boolean;
  stream?: ClientChannel;
  error?: string;
}

export async function startShell(client: Client): Promise<ShellResult> {
  return new Promise(resolve => {
    client.shell((err, stream) => {
      if (err) {
        resolve({
          success: false,
          error: err.message,
        });
        return;
      }

      resolve({
        success: true,
        stream,
      });
    });
  });
}

export async function startTmuxSession(client: Client): Promise<ShellResult> {
  return new Promise(resolve => {
    client.shell((err, stream) => {
      if (err) {
        resolve({
          success: false,
          error: err.message,
        });
        return;
      }

      // remote-dev-workspace로 이동
      stream.write('cd remote-dev-workspace\n');

      // tmux 세션을 시작하거나 기존 세션에 attach
      const tmuxCommand =
        'tmux has-session -t remote-tdd-dev 2>/dev/null && tmux attach-session -t remote-tdd-dev || tmux new-session -s remote-tdd-dev\n';
      stream.write(tmuxCommand);

      // claude 명령어를 실행
      stream.write('claude\n');

      resolve({
        success: true,
        stream,
      });
    });
  });
}
