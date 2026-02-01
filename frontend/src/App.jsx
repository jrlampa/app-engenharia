import React, { useState } from 'react';
import { Activity, Zap } from 'lucide-react';
import ModuloTracao from './components/ModuloTracao';
import ModuloTensao from './components/ModuloTensao';

function App() {
  const [abaAtiva, setAbaAtiva] = useState('tracao');

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f4f7f6' }}>
      {/* Sidebar de Navegação */}
      <div style={{ width: '200px', backgroundColor: '#2c3e50', color: '#fff', padding: '20px' }}>
        <h2 style={{ fontSize: '1.2em', marginBottom: '30px' }}>Engenharia Pro</h2>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button
            onClick={() => setAbaAtiva('tracao')}
            style={styleAba(abaAtiva === 'tracao')}>
            <Activity size={18} /> Tração de Rede
          </button>

          <button
            onClick={() => setAbaAtiva('tensao')}
            style={styleAba(abaAtiva === 'tensao')}>
            <Zap size={18} /> Queda de Tensão
          </button>
        </nav>
      </div>

      {/* Área de Conteúdo */}
      <div style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
        {abaAtiva === 'tracao' && <ModuloTracao />}
        {abaAtiva === 'tensao' && <ModuloTensao />}
      </div>
    </div>
  );
}

// Estilo auxiliar para as abas
const styleAba = (ativa) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  padding: '12px',
  backgroundColor: ativa ? '#34495e' : 'transparent',
  border: 'none',
  color: '#fff',
  textAlign: 'left',
  cursor: 'pointer',
  borderRadius: '4px',
  transition: '0.3s'
});

export default App;
