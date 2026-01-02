export interface SSHConfig {
  host: string;
  port: number;
  username: string;
  password?: string;
  privateKey?: string;
}

export function createSSHConfig(config: SSHConfig): SSHConfig {
  return config;
}
