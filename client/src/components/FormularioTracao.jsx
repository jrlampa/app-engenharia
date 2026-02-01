import React, { useState, useEffect } from 'react';
import './FormularioTracao.css';

function FormularioTracao() {
  const [formData, setFormData] = useState({ vao: 0, tracao: 0, pesoCabo: 1 }); // pesoCabo default
  const [erros, setErros] = useState({});
  const [podeCalcular, setPodeCalcular] = useState(false);
  const [resultado, setResultado] = useState(null);

  // Validação em tempo real
  useEffect(() => {
    let errosTemp = {};
    if (formData.vao > 150) errosTemp.vao = "Vão muito grande para postes padrão.";
    if (formData.tracao < 10 && formData.tracao > 0) errosTemp.tracao = "Tração insuficiente para sustentar o cabo.";
    if (formData.vao < 0) errosTemp.vao = "Vão não pode ser negativo.";

    setErros(errosTemp);
    // Habilita se não tem erros e tem valores preenchidos básicos
    setPodeCalcular(Object.keys(errosTemp).length === 0 && formData.vao > 0 && formData.tracao > 0);
  }, [formData]);

  const calcular = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/tracao/calcular', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vão: formData.vao,
          tracaoInicial: formData.tracao,
          pesoCabo: formData.pesoCabo, // default or input
          temperatura: 25, // default
          coeficienteExp: 0.000017 // default
        })
      });
      const data = await response.json();
      if (data.success) {
        setResultado(data.dados);
      } else {
        alert(data.mensagem || "Erro ao calcular");
      }
    } catch (e) {
      alert("Erro de conexão com o servidor");
    }
  };

  return (
    <div className="formulario-container">
      <h2>Cálculo de Tração</h2>

      <div className="input-group">
        <label>Comprimento do Vão (m):</label>
        <input
          type="number"
          className={`input-field ${erros.vao ? "input-error" : ""}`}
          value={formData.vao === 0 ? '' : formData.vao}
          onChange={(e) => setFormData({ ...formData, vao: Number(e.target.value) })}
        />
        {erros.vao && <span className="error-msg">{erros.vao}</span>}
      </div>

      <div className="input-group">
        <label>Tração (daN):</label>
        <input
          type="number"
          className={`input-field ${erros.tracao ? "input-error" : ""}`}
          value={formData.tracao === 0 ? '' : formData.tracao}
          onChange={(e) => setFormData({ ...formData, tracao: Number(e.target.value) })}
        />
        {erros.tracao && <span className="error-msg">{erros.tracao}</span>}
      </div>

      <button
        onClick={calcular}
        disabled={!podeCalcular}
        className="btn-calculate"
      >
        Calcular Tração
      </button>

      {resultado && (
        <div className="result-container">
          <h3>Resultados:</h3>
          <p><strong>Flecha:</strong> {resultado.flechaMetros} m</p>
          <p><strong>Status:</strong> {resultado.status}</p>
        </div>
      )}
    </div>
  );
}

export default FormularioTracao;
