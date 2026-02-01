const express = require('express');
const cors = require('cors');

// Inicializa o app Express
const app = express();
app.use(cors());
app.use(express.json());

// Importa Rotas
// Nota: Ajustando caminho relativo pois agora estamos em src/backend
const tracaoRoutes = require('../../server/routes/tracao');
app.use('/api/tracao', tracaoRoutes);

// Rota de exemplo anterior
app.post('/calcular-queda', (req, res) => {
  const { tensao, corrente, resistencia } = req.body;
  const queda = (resistencia * corrente) / tensao;
  res.json({ resultado: queda });
});

module.exports = app;
