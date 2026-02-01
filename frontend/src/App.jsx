import React, { useState } from 'react';
import { Activity, Zap } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import ModuloTracao from './components/ModuloTracao';
import ModuloTensao from './components/ModuloTensao';

function App() {
  const [abaAtiva, setAbaAtiva] = useState('tracao');

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f4f7f6' }}>
      <Toaster position="top-right" />

      {/* Sidebar */}
      <div style={{
        width: '220px',
        background: 'linear-gradient(180deg, #2c3e50 0%, #34495e 100%)',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        padding: '20px 0',
        boxShadow: '2px 0 10px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ textAlign: 'center', marginBottom: '30px', fontSize: '1.3em' }}>⚡ sisEngenharia</h2>

        <button
          onClick={() => setAbaAtiva('tracao')}
          style={{
            background: abaAtiva === 'tracao' ? '#3498db' : 'transparent',
            border: 'none',
            color: 'white',
            padding: '15px 20px',
            cursor: 'pointer',
            textAlign: 'left',
            fontSize: '1em',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            transition: 'all 0.2s'
          }}
        >
          <Activity size={20} />
          Tração
        </button>

        <button
          onClick={() => setAbaAtiva('tensao')}
          style={{
            background: abaAtiva === 'tensao' ? '#3498db' : 'transparent',
            border: 'none',
            color: 'white',
            padding: '15px 20px',
            cursor: 'pointer',
            textAlign: 'left',
            fontSize: '1em',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            transition: 'all 0.2s'
          }}
        >
          <Zap size={20} />
          Queda de Tensão
        </button>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {abaAtiva === 'tracao' && <ModuloTracao />}
        {abaAtiva === 'tensao' && <ModuloTensao />}
      </div>
    </div>
  );
}

export default App;
