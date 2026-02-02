import toast from 'react-hot-toast';

/**
 * Converte erros estruturados do Zod em mensagens amigáveis.
 * @param {Object} error - Erro retornado do backend (estruturado pelo Zod)
 */
export const handleValidationError = (error) => {
  if (!error || !error.detalhes) {
    toast.error(error?.error || 'Erro ao processar requisição');
    return;
  }

  // Mapear mensagens técnicas para linguagem amigável
  const friendlyMessages = {
    'Expected number, received string': 'Por favor, insira apenas números',
    'Number must be greater than 0': 'O valor deve ser maior que zero',
    'Number must be positive': 'O valor deve ser positivo',
    'Expected number, received nan': 'Valor inválido. Digite um número válido',
  };

  // Pegar o primeiro erro (mais relevante)
  const firstError = error.detalhes[0];
  const technicalMsg = firstError?.message || '';
  const fieldPath = firstError?.path?.join('.') || '';

  // Tentar encontrar mensagem amigável
  let friendlyMsg = friendlyMessages[technicalMsg] || technicalMsg;

  // Adicionar nome do campo se disponível
  const fieldNames = {
    vao: 'Vão do Poste',
    pesoCabo: 'Peso do Cabo',
    tracaoInicial: 'Tração Inicial',
    tensaoNominal: 'Tensão Nominal',
    corrente: 'Corrente',
    comprimento: 'Distância',
    resistenciaKm: 'Resistência do Cabo'
  };

  const friendlyFieldName = fieldNames[fieldPath] || fieldPath;

  if (friendlyFieldName) {
    toast.error(`${friendlyFieldName}: ${friendlyMsg}`);
  } else {
    toast.error(friendlyMsg);
  }
};

/**
 * Wrapper para chamadas de API que trata erros automaticamente
 * @param {Function} apiCall - Função async que faz a chamada API
 * @param {Object} options - Opções de mensagens de sucesso/erro
 */
export const withToast = async (apiCall, options = {}) => {
  const { successMsg, errorMsg } = options;

  try {
    const data = await apiCall();

    if (data.sucesso) {
      if (successMsg) toast.success(successMsg);
      return data;
    } else {
      // Se backend retornar erro estruturado Zod
      if (data.detalhes) {
        handleValidationError(data);
      } else {
        toast.error(data.error || errorMsg || 'Erro ao processar');
      }
      return null;
    }
  } catch (error) {
    toast.error(errorMsg || 'Erro de comunicação com o servidor');
    console.error(error);
    return null;
  }
};
