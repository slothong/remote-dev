import {useState} from 'react';
import './App.css';
import {SSHConnectionForm} from './components/ssh-connection-form';
import {Terminal} from './components/terminal';
import {Checklist} from './components/checklist';
import {connectToSSH} from './services/ssh-service';

function App() {
  const [connected, setConnected] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const handleConnect = async (data: {
    host: string;
    port: number;
    username: string;
    authMethod: 'password' | 'key';
    password?: string;
    privateKeyFile?: File;
  }) => {
    const result = await connectToSSH(data);

    if (result.success && result.sessionId) {
      setSessionId(result.sessionId);
      return {success: true};
    }

    return {
      success: false,
      error: result.error,
    };
  };

  const handleSuccess = () => {
    setConnected(true);
  };

  if (connected) {
    return (
      <div style={{height: '100vh', display: 'flex', flexDirection: 'column'}}>
        <div style={{padding: '20px'}}>
          <h1>Connected to SSH</h1>
          <p>Session ID: {sessionId}</p>
        </div>
        <div style={{display: 'flex', flex: 1, overflow: 'hidden'}}>
          <div
            style={{
              width: '400px',
              padding: '20px',
              borderRight: '1px solid #ccc',
              overflowY: 'auto',
            }}
          >
            <Checklist sessionId={sessionId || undefined} />
          </div>
          <div style={{flex: 1}}>
            <Terminal sessionId={sessionId || undefined} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <SSHConnectionForm onConnect={handleConnect} onSuccess={handleSuccess} />
    </div>
  );
}

export default App;
