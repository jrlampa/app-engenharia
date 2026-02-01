import React, { useState } from 'react';
import { gerarRelatorioTracao } from '../utils/exportPDF';

const ModuloTracao = () => {
  const [dados, setDados] = useState({ vao: 40, pesoCabo: 0.5, tracaoInicial: 200 });
  const [resultado, setResultado] = useState(null);
  const [erro, setErro] = useState("");

  const calcular = async () => {
    setErro("");
    try {
      const response = await fetch('http://localhost:5000/api/tracao/calcular', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados)
      });
      const data = await response.json();
      if (data.sucesso) setResultado(data.resultado);
      else setErro(data.error);
    } catch (err) {
      setErro("Servidor offline. Verifique o backend.");
    }
  };

  return (
    <div style={{ padding: '30px', fontFamily: 'Segoe UI, sans-serif' }}>
      <h1 style={{ color: '#2c3e50' }}>Cálculo de Tração de Rede</h1>
      <hr />

      <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
        <div style={{ flex: 1, display: 'grid', gap: '10px' }}>
          <label>Vão do Poste (m):</label>
          <input type="number" value={dados.vao} onChange={e => setDados({ ...dados, vao: Number(e.target.value) })} />

          <label>Peso do Cabo (kg/m):</label>
          <input type="number" step="0.01" value={dados.pesoCabo} onChange={e => setDados({ ...dados, pesoCabo: Number(e.target.value) })} />

          <label>Tração Inicial (daN):</label>
          <input type="number" value={dados.tracaoInicial} onChange={e => setDados({ ...dados, tracaoInicial: Number(e.target.value) })} />

          <button onClick={calcular} style={{ padding: '10px', background: '#3498db', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '4px' }}>
            Calcular Flecha
          </button>
        </div>

        <div style={{ flex: 1, backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px', border: '1px solid #dee2e6' }}>
          <h3>Resultado:</h3>
          {resultado && (
            <div>
              <p><strong>Flecha Calculada:</strong> {resultado.flecha} {resultado.unidade}</p>
              <div style={{ height: '10px', width: '100%', background: '#eee', position: 'relative' }}>
                <div style={{ height: '2px', width: '100%', background: '#333', position: 'absolute', top: '0' }}></div>
                <div style={{ height: '15px', width: '2px', background: '#333', position: 'absolute', left: '0' }}></div>
                <div style={{ height: '15px', width: '2px', background: '#333', position: 'absolute', right: '0' }}></div>
                <div style={{
                  width: '10px', height: '10px', borderRadius: '50%', background: 'red',
                  position: 'absolute', left: '50%', top: `${Math.min(resultado.flecha * 5, 40)}px`, transform: 'translateX(-50%)'
                }}></div>
              </div>
              <p style={{ marginTop: '40px', fontSize: '0.8em', color: '#666' }}>* Representação visual da catenária</p>

              {/* Sugestão de Kit */}
              <div style={{ marginTop: '20px' }}>
                <button
                  onClick={() => gerarRelatorioTracao(dados, resultado)}
                  style={{ marginBottom: '15px', padding: '10px', background: '#27ae60', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                  📥 Baixar Relatório PDF
                </button>

                <div style={{ padding: '15px', background: '#e3f2fd', borderRadius: '5px', marginBottom: '15px' }}>
                  <h4 style={{ margin: 0 }}>📦 Estrutura: {resultado.sugestao}</h4>
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9em' }}>
                  <thead>
                    <tr style={{ background: '#2c3e50', color: 'white' }}>
                      <th style={{ padding: '10px', textAlign: 'left' }}>Código</th>
                      <th style={{ padding: '10px', textAlign: 'left' }}>Material</th>
                      <th style={{ padding: '10px', textAlign: 'center' }}>Qtd</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resultado.materiais && resultado.materiais.map((m, index) => (
                      <tr key={index} style={{ borderBottom: '1px solid #ddd' }}>
                        <td style={{ padding: '8px' }}>{m.codigo}</td>
                        <td style={{ padding: '8px' }}>{m.item}</td>
                        <td style={{ padding: '8px', textAlign: 'center' }}>{m.qtd}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {erro && <p style={{ color: 'red' }}>{erro}</p>}
        </div>
      </div>
    </div>
  );
};

export default ModuloTracao;
