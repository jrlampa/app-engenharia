import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const ModuloTensao = () => {
  const [tensaoData, setTensaoData] = useState({ nominal: 220, corrente: 10, dist: 50, caboR: 1.83 });
  const [res, setRes] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cabos, setCabos] = useState([]);
  const [loadingCabos, setLoadingCabos] = useState(true);
  const [projects, setProjects] = useState([]);
  const [projectId, setProjectId] = useState('');

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/history/projects');
        const data = await response.json();
        if (data.sucesso) setProjects(data.projects);
      } catch (e) {
        console.error('Error fetching projects', e);
      }
    };
    fetchProjects();

    const fetchCabos = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/tensao/cabos');
        const data = await response.json();
        if (data.sucesso) {
          setCabos(data.cabos);
          if (data.cabos.length > 0) {
            setTensaoData(prev => ({ ...prev, caboR: data.cabos[0].r }));
          }
        }
      } catch (error) {
        console.error("Erro ao buscar cabos:", error);
        toast.error("Erro ao carregar tabela de cabos");
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
      const payload = {
        tensaoNominal: Number(tensaoData.nominal),
        corrente: Number(tensaoData.corrente),
        comprimento: Number(tensaoData.dist),
        resistenciaKm: Number(tensaoData.caboR),
        projectId
      };

      if (window.electronAPI) {
        data = await window.electronAPI.calcularTensao(payload);
      } else {
        const queryParam = projectId ? `?projectId=${projectId}` : '';
        const response = await fetch(`http://localhost:5000/api/tensao/calcular${queryParam}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
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
    <div>
      <h1 style={{ color: '#2c3e50', marginBottom: '30px', fontWeight: '300', fontSize: '2em' }}>
        ⚡ Cálculo de Queda de Tensão
      </h1>

      <div className="glass-card" style={{ padding: '40px', maxWidth: '800px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <h3 style={{ margin: 0, color: '#2c3e50' }}>Parâmetros</h3>
          <select
            className="glass-input"
            style={{ padding: '4px 8px', fontSize: '12px', width: 'auto', minWidth: '150px' }}
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
          >
            <option value="">Cálculo Avulso</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: '#7f8c8d' }}>
              Tensão Nominal (V)
            </label>
            <input
              type="number"
              className="glass-input"
              style={{ width: '100%' }}
              value={tensaoData.nominal}
              onChange={e => setTensaoData({ ...tensaoData, nominal: e.target.value })}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: '#7f8c8d' }}>
              Corrente (A)
            </label>
            <input
              type="number"
              className="glass-input"
              style={{ width: '100%' }}
              value={tensaoData.corrente}
              onChange={e => setTensaoData({ ...tensaoData, corrente: e.target.value })}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: '#7f8c8d' }}>
              Distância (m)
            </label>
            <input
              type="number"
              className="glass-input"
              style={{ width: '100%' }}
              value={tensaoData.dist}
              onChange={e => setTensaoData({ ...tensaoData, dist: e.target.value })}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: '#7f8c8d' }}>
              Cabo
            </label>
            <select
              value={tensaoData.caboR}
              onChange={e => setTensaoData({ ...tensaoData, caboR: e.target.value })}
              disabled={loadingCabos}
              className="glass-input"
              style={{ width: '100%', cursor: loadingCabos ? 'not-allowed' : 'pointer' }}
            >
              {loadingCabos && <option>Carregando...</option>}
              {cabos.map(c => <option key={c.nome} value={c.r}>{c.nome}</option>)}
            </select>
          </div>
        </div>

        <button
          onClick={calcularTensao}
          disabled={loading || loadingCabos}
          className="glass-button glass-button-primary"
          style={{ width: '100%', marginTop: '30px' }}
        >
          {loading ? 'Calculando...' : 'Calcular Queda de Tensão'}
        </button>

        {loading ? (
          <div style={{ marginTop: '30px' }}>
            <div className="skeleton skeleton-text" style={{ width: '70%' }}></div>
            <div className="skeleton skeleton-text" style={{ width: '50%', marginTop: '10px' }}></div>
          </div>
        ) : res && (
          <div style={{
            marginTop: '30px',
            padding: '20px',
            background: res.status === "CRÍTICO"
              ? 'rgba(231, 76, 60, 0.1)'
              : 'rgba(39, 174, 96, 0.1)',
            borderRadius: '12px',
            borderLeft: `4px solid ${res.status === "CRÍTICO" ? '#e74c3c' : '#27ae60'}`
          }}>
            <div style={{
              color: res.status === "CRÍTICO" ? '#e74c3c' : '#27ae60',
              fontWeight: 'bold',
              fontSize: '18px',
              marginBottom: '10px'
            }}>
              {res.status === "CRÍTICO" ? '⚠️ Queda Crítica' : '✅ Dentro do Limite'}
            </div>
            <p style={{ color: '#2c3e50', margin: '5px 0' }}>
              <strong>Queda:</strong> {res.quedaPercentual}% ({res.quedaVolts}V)
            </p>
            <p style={{ color: '#7f8c8d', fontSize: '14px', marginTop: '10px' }}>
              Limite NBR 5410: 5%
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModuloTensao;
