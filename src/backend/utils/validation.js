const { z } = require('zod');

const tracaoSchema = z.object({
  vao: z.number().positive("O vão deve ser positivo"),
  pesoCabo: z.number().positive("O peso do cabo deve ser positivo"),
  tracaoInicial: z.number().positive("A tração inicial deve ser positiva")
});

const tensaoSchema = z.object({
  tensaoNominal: z.number().positive(),
  corrente: z.number().min(0, "A corrente não pode ser negativa"),
  comprimento: z.number().positive("O comprimento deve ser positivo"),
  resistenciaKm: z.number().nonnegative()
});

const validate = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (error) {
    return res.status(400).json({
      sucesso: false,
      error: "Erro de validação",
      detalhes: error.errors
    });
  }
};

module.exports = { tracaoSchema, tensaoSchema, validate };
