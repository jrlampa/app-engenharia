import React, { useState } from 'react';
import { Activity, Zap } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import ModuloTracao from './components/ModuloTracao';
import ModuloTensao from './components/ModuloTensao';
import './App.css';

function App() {
  const [abaAtiva, setAbaAtiva] = useState('tracao');

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Toaster position="top-right" />

      {/* Sidebar with Glassmorphism */}
      <div className="glass-sidebar" style={{
        width: '240px',
        display: 'flex',
        flexDirection: 'column',
        padding: '20px 0'
      }}>
        <h2 style={{
          textAlign: 'center',
          marginBottom: '40px',
          fontSize: '1.4em',
          color: 'white',
          fontWeight: '300',
          letterSpacing: '1px'
        }}>
          ⚡ sisEngenharia
        </h2>

        <button
          onClick={() => setAbaAtiva('tracao')}
          className={`glass-sidebar-button ${abaAtiva === 'tracao' ? 'active' : ''}`}
        >
          <Activity size={20} />
          Tração
        </button>

        <button
          onClick={() => setAbaAtiva('tensao')}
          className={`glass-sidebar-button ${abaAtiva === 'tensao' ? 'active' : ''}`}
        >
          <Zap size={20} />
          Queda de Tensão
        </button>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
        {abaAtiva === 'tracao' && <ModuloTracao />}
        {abaAtiva === 'tensao' && <ModuloTensao />}
      </div>
    </div>
  );
}

export default App;
