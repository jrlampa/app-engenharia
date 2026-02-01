import React, { useState } from 'react';

const TABELA_CABOS = [
  { nome: "10mm²", r: 1.83 },
  { nome: "16mm²", r: 1.15 },
  { nome: "25mm²", r: 0.727 },
  { nome: "35mm²", r: 0.524 }
];

const ModuloTensao = () => {
  const [tensaoData, setTensaoData] = useState({ nominal: 220, corrente: 10, dist: 50, caboR: 1.83 });
  const [res, setRes] = useState(null);

  const calcularTensao = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/tensao/calcular', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tensaoNominal: Number(tensaoData.nominal),
          corrente: Number(tensaoData.corrente),
          comprimento: Number(tensaoData.dist),
          resistenciaKm: Number(tensaoData.caboR)
        })
      });
      const data = await response.json();
      if (data.sucesso) setRes(data.resultado);
    } catch (error) {
      console.error("Erro ao calcular tensão:", error);
    }
  };

  return (
    <div style={{ padding: '30px', fontFamily: 'Segoe UI, sans-serif' }}>
      <h2>⚡ Cálculo de Queda de Tensão</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
        <input type="number" placeholder="Tensão (V)" value={tensaoData.nominal} onChange={e => setTensaoData({ ...tensaoData, nominal: e.target.value })} />
        <input type="number" placeholder="Corrente (A)" value={tensaoData.corrente} onChange={e => setTensaoData({ ...tensaoData, corrente: e.target.value })} />
        <input type="number" placeholder="Distância (m)" value={tensaoData.dist} onChange={e => setTensaoData({ ...tensaoData, dist: e.target.value })} />
        <select value={tensaoData.caboR} onChange={e => setTensaoData({ ...tensaoData, caboR: e.target.value })}>
          {TABELA_CABOS.map(c => <option key={c.nome} value={c.r}>{c.nome}</option>)}
        </select>
        <button onClick={calcularTensao} style={{ padding: '10px', background: '#3498db', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '4px' }}>Calcular Queda</button>
      </div>

      {res && (
        <div style={{ color: res.status === "CRÍTICO" ? "red" : "green", fontWeight: 'bold', marginTop: '10px' }}>
          Queda: {res.quedaPercentual}% ({res.quedaVolts}V) - {res.status}
        </div>
      )}
    </div>
  );
};

export default ModuloTensao;
