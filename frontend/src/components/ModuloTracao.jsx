import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { gerarRelatorioTracao } from '../utils/exportPDF';

const ModuloTracao = () => {
  const [dados, setDados] = useState({ vao: 40, pesoCabo: 0.5, tracaoInicial: 200 });
  const [resultado, setResultado] = useState(null);
  const [loading, setLoading] = useState(false);

  const calcular = async () => {
    setLoading(true);
    try {
      let data;
      if (window.electronAPI) {
        console.log("Usando IPC Electron...");
        data = await window.electronAPI.calcularTracao(dados);
      } else {
        console.log("Usando HTTP Fetch...");
        const response = await fetch('http://localhost:5000/api/tracao/calcular', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dados)
        });
        data = await response.json();
      }

      if (data.sucesso) {
        setResultado(data.resultado);
        toast.success('Cálculo realizado com sucesso!');
      } else {
        toast.error(data.error || 'Erro ao processar cálculo');
      }
    } catch (err) {
      toast.error("Erro de comunicação com o servidor");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 style={{ color: '#2c3e50', marginBottom: '30px', fontWeight: '300', fontSize: '2em' }}>
        Cálculo de Tração de Rede
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
        {/* Form Card */}
        <div className="glass-card" style={{ padding: '30px' }}>
          <h3 style={{ marginBottom: '20px', color: '#2c3e50' }}>Parâmetros</h3>

          <div style={{ display: 'grid', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: '#7f8c8d' }}>
                Vão do Poste (m)
              </label>
              <input
                type="number"
                className="glass-input"
                style={{ width: '100%' }}
                value={dados.vao}
                onChange={e => setDados({ ...dados, vao: Number(e.target.value) })}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: '#7f8c8d' }}>
                Peso do Cabo (kg/m)
              </label>
              <input
                type="number"
                className="glass-input"
                style={{ width: '100%' }}
                step="0.01"
                value={dados.pesoCabo}
                onChange={e => setDados({ ...dados, pesoCabo: Number(e.target.value) })}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: '#7f8c8d' }}>
                Tração Inicial (daN)
              </label>
              <input
                type="number"
                className="glass-input"
                style={{ width: '100%' }}
                value={dados.tracaoInicial}
                onChange={e => setDados({ ...dados, tracaoInicial: Number(e.target.value) })}
              />
            </div>

            <button
              onClick={calcular}
              disabled={loading}
              className="glass-button glass-button-primary"
              style={{ width: '100%', marginTop: '10px' }}
            >
              {loading ? 'Calculando...' : 'Calcular Flecha'}
            </button>
          </div>
        </div>

        {/* Results Card */}
        <div className="glass-card" style={{ padding: '30px' }}>
          <h3 style={{ marginBottom: '20px', color: '#2c3e50' }}>Resultado</h3>

          {loading ? (
            <div>
              <div className="skeleton skeleton-text" style={{ width: '60%' }}></div>
              <div className="skeleton skeleton-text" style={{ width: '80%', marginTop: '16px' }}></div>
              <div className="skeleton" style={{ height: '60px', marginTop: '20px' }}></div>
            </div>
          ) : resultado ? (
            <div>
              <p style={{ fontSize: '16px', color: '#2c3e50', marginBottom: '10px' }}>
                <strong>Flecha Calculada:</strong> {resultado.flecha} m
              </p>

              <div style={{
                background: 'rgba(52, 152, 219, 0.1)',
                padding: '15px',
                borderRadius: '8px',
                marginTop: '20px'
              }}>
                <h4 style={{ margin: 0, color: '#2c3e50' }}>📦 Estrutura: {resultado.sugestao}</h4>
              </div>

              <button
                onClick={() => gerarRelatorioTracao(dados, resultado)}
                className="glass-button"
                style={{ marginTop: '20px', width: '100%' }}>
                📥 Baixar Relatório PDF
              </button>

              {/* Materials Table */}
              {resultado.materiais && resultado.materiais.length > 0 && (
                <div style={{ marginTop: '30px' }}>
                  <h4 style={{ marginBottom: '15px', color: '#2c3e50' }}>Materiais Necessários</h4>
                  <table className="glass-table">
                    <thead>
                      <tr>
                        <th>Código</th>
                        <th>Material</th>
                        <th style={{ textAlign: 'center' }}>Qtd</th>
                      </tr>
                    </thead>
                    <tbody>
                      {resultado.materiais.map((m, index) => (
                        <tr key={index}>
                          <td>{m.codigo}</td>
                          <td>{m.item}</td>
                          <td style={{ textAlign: 'center' }}>{m.qtd}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            <p style={{ color: '#7f8c8d', textAlign: 'center', paddingTop: '40px' }}>
              Preencha os parâmetros e clique em "Calcular Flecha"
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModuloTracao;
