import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const ModuloTensao = () => {
  const [tensaoData, setTensaoData] = useState({ nominal: 220, corrente: 10, dist: 50, caboR: 1.83 });
  const [res, setRes] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cabos, setCabos] = useState([]);
  const [loadingCabos, setLoadingCabos] = useState(true);

  // Buscar tabela de cabos do backend
  useEffect(() => {
    const fetchCabos = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/tensao/cabos');
        const data = await response.json();
        if (data.sucesso) {
          setCabos(data.cabos);
          // Define o primeiro cabo como padrão
          if (data.cabos.length > 0) {
            setTensaoData(prev => ({ ...prev, caboR: data.cabos[0].r }));
          }
        }
      } catch (error) {
        console.error("Erro ao buscar cabos:", error);
        toast.error("Erro ao carregar tabela de cabos");
        // Fallback para dados locais se API falhar
        const fallbackCabos = [
          { nome: "10mm²", r: 1.83 },
          { nome: "16mm²", r: 1.15 },
          { nome: "25mm²", r: 0.727 },
          { nome: "35mm²", r: 0.524 }
        ];
        setCabos(fallbackCabos);
      } finally {
        setLoadingCabos(false);
      }
    };

    fetchCabos();
  }, []);

  const calcularTensao = async () => {
    setLoading(true);
    try {
      let data;
      // Verifica se está rodando no Electron via IPC
      if (window.electronAPI) {
        data = await window.electronAPI.calcularTensao({
          tensaoNominal: Number(tensaoData.nominal),
          corrente: Number(tensaoData.corrente),
          comprimento: Number(tensaoData.dist),
          resistenciaKm: Number(tensaoData.caboR)
        });
      } else {
        // Fallback HTTP
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
        data = await response.json();
      }

      if (data.sucesso) {
        setRes(data.resultado);
        const status = data.resultado.status === "CRÍTICO" ? "⚠️ Atenção: Queda crítica!" : "✅ Dentro do limite";
        toast.success(status);
      }
    } catch (error) {
      console.error("Erro ao calcular tensão:", error);
      toast.error("Erro ao calcular queda de tensão");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '30px', fontFamily: 'Segoe UI, sans-serif' }}>
      <h2>⚡ Cálculo de Queda de Tensão</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
        <input type="number" placeholder="Tensão (V)" value={tensaoData.nominal} onChange={e => setTensaoData({ ...tensaoData, nominal: e.target.value })} />
        <input type="number" placeholder="Corrente (A)" value={tensaoData.corrente} onChange={e => setTensaoData({ ...tensaoData, corrente: e.target.value })} />
        <input type="number" placeholder="Distância (m)" value={tensaoData.dist} onChange={e => setTensaoData({ ...tensaoData, dist: e.target.value })} />
        <select
          value={tensaoData.caboR}
          onChange={e => setTensaoData({ ...tensaoData, caboR: e.target.value })}
          disabled={loadingCabos}
        >
          {loadingCabos && <option>Carregando...</option>}
          {cabos.map(c => <option key={c.nome} value={c.r}>{c.nome}</option>)}
        </select>
        <button
          onClick={calcularTensao}
          disabled={loading || loadingCabos}
          style={{
            padding: '10px',
            background: (loading || loadingCabos) ? '#95a5a6' : '#3498db',
            color: '#fff',
            border: 'none',
            cursor: (loading || loadingCabos) ? 'not-allowed' : 'pointer',
            borderRadius: '4px'
          }}
        >
          {loading ? 'Calculando...' : 'Calcular Queda'}
        </button>
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
