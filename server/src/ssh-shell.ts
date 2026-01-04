import type {Client, ClientChannel} from 'ssh2';

export interface ShellResult {
  success: boolean;
  stream?: ClientChannel;
  error?: string;
}

export async function startShell(client: Client): Promise<ShellResult> {
  return new Promise(resolve => {
    client.shell(
      {
        term: 'xterm-256color',
        cols: 80,
        rows: 24,
      },
      (err, stream) => {
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
      },
    );
  });
}

export async function startTmuxSession(
  client: Client,
  cols?: number,
  rows?: number,
): Promise<ShellResult> {
  return new Promise(resolve => {
    client.shell(
      {
        term: 'xterm-256color',
        cols: cols || 80,
        rows: rows || 24,
      },
      (err, stream) => {
        if (err) {
          resolve({
            success: false,
            error: err.message,
          });
          return;
        }

        // Set UTF-8 locale for proper Unicode support
        stream.write('export LANG=en_US.UTF-8\n');
        stream.write('export LC_ALL=en_US.UTF-8\n');

        // tmux 세션 존재 여부에 따라 분기
        // 세션이 있으면: attach만 수행
        // 세션이 없으면: -c 옵션으로 remote-dev-workspace에서 새 세션 생성 및 send-keys로 claude 실행
        const tmuxCommand =
          "if tmux has-session -t remote-tdd-dev 2>/dev/null; then tmux attach-session -t remote-tdd-dev; else tmux new-session -s remote-tdd-dev -c ~/remote-dev-workspace -d && tmux send-keys -t remote-tdd-dev 'claude' C-m && tmux attach-session -t remote-tdd-dev; fi\n";
        stream.write(tmuxCommand);

        resolve({
          success: true,
          stream,
        });
      },
    );
  });
}
