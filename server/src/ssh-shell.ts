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
