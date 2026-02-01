# API Reference - Backend Endpoints

## Base URL

`http://localhost:5000/api`

## Endpoints

### 1. Cálculo de Tração

**POST** `/api/tracao/calcular`

**Request Body**:

```json
{
  "vao": 40,              // Vão em metros (número positivo)
  "pesoCabo": 0.5,        // Peso do cabo em kg/m (número positivo)
  "tracaoInicial": 200    // Tração inicial em daN (número positivo)
}
```

**Response**:

```json
{
  "sucesso": true,
  "resultado": {
    "flecha": 0.5,
    "sugestao": "CE2 BRAÇO J",
    "materiais": [
      {
        "codigo": "CODE001",
        "item": "Poste 11m",
        "qtd": "1"
      }
    ]
  }
}
```

**Validação**: Todos os campos devem ser números positivos (Zod)

---

### 2. Cálculo de Queda de Tensão

**POST** `/api/tensao/calcular`

**Request Body**:

```json
{
  "tensaoNominal": 220,      // Tensão em V (número positivo)
  "corrente": 10,            // Corrente em A (não negativa)
  "comprimento": 50,         // Comprimento em m (número positivo)
  "resistenciaKm": 1.83      // Resistência do cabo em Ω/km (não negativa)
}
```

**Response**:

```json
{
  "sucesso": true,
  "resultado": {
    "quedaVolts": "1.83",
    "quedaPercentual": "0.83",
    "status": "DENTRO DO LIMITE"
  }
}
```

**Validação**: Campos devem ser não negativos, comprimento e tensão positivos (Zod)

---

### 3. Tabela de Cabos

**GET** `/api/tensao/cabos`

**Response**:

```json
{
  "sucesso": true,
  "cabos": [
    { "nome": "10mm²", "r": 1.83 },
    { "nome": "16mm²", "r": 1.15 },
    { "nome": "25mm²", "r": 0.727 },
    { "nome": "35mm²", "r": 0.524 }
  ]
}
```

**Uso**: Frontend consome este endpoint para popular dropdown de cabos

---

## Error Responses

**Validação (400)**:

```json
{
  "sucesso": false,
  "error": "Erro de validação",
  "detalhes": [
    {
      "message": "O vão deve ser positivo",
      "path": ["vao"]
    }
  ]
}
```

**CSV Error (500)**:

```json
{
  "sucesso": false,
  "error": "Kit \"XYZ\" não encontrado no banco de dados. Verifique o nome do kit."
}
```

## Logging

Todas as requisições são registradas em `logs/combined.log` com Winston.
