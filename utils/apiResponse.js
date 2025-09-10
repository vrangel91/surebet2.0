/**
 * 🚀 Utilitário para Padronização de Respostas da API
 * 
 * Este módulo garante que todas as respostas da API sigam o mesmo padrão,
 * facilitando a comunicação entre frontend e backend.
 */

/**
 * Estrutura padrão para respostas de sucesso
 * @param {Object} data - Dados a serem retornados
 * @param {string} message - Mensagem opcional
 * @param {Object} meta - Metadados opcionais (pagination, etc.)
 * @returns {Object} Resposta padronizada
 */
const successResponse = (data, message = null, meta = {}) => {
  const response = {
    success: true,
    data,
    timestamp: new Date().toISOString()
  };

  if (message) {
    response.message = message;
  }

  if (Object.keys(meta).length > 0) {
    response.meta = meta;
  }

  return response;
};

/**
 * Estrutura padrão para respostas de erro
 * @param {string} error - Código do erro
 * @param {string} message - Mensagem descritiva do erro
 * @param {number} statusCode - Código HTTP do erro
 * @param {Object} details - Detalhes adicionais do erro
 * @returns {Object} Resposta de erro padronizada
 */
const errorResponse = (error, message, statusCode = 500, details = {}) => {
  const response = {
    success: false,
    error,
    message,
    timestamp: new Date().toISOString()
  };

  if (Object.keys(details).length > 0) {
    response.details = details;
  }

  return { response, statusCode };
};

/**
 * Resposta para dados não encontrados (404)
 * @param {string} resource - Nome do recurso não encontrado
 * @returns {Object} Resposta 404 padronizada
 */
const notFoundResponse = (resource = 'Recurso') => {
  return errorResponse(
    'NOT_FOUND',
    `${resource} não encontrado`,
    404
  );
};

/**
 * Resposta para dados inválidos (400)
 * @param {string} message - Mensagem de validação
 * @param {Object} validationErrors - Erros de validação específicos
 * @returns {Object} Resposta 400 padronizada
 */
const validationErrorResponse = (message, validationErrors = {}) => {
  return errorResponse(
    'VALIDATION_ERROR',
    message,
    400,
    { validation: validationErrors }
  );
};

/**
 * Resposta para acesso negado (403)
 * @param {string} message - Mensagem de acesso negado
 * @returns {Object} Resposta 403 padronizada
 */
const forbiddenResponse = (message = 'Acesso negado') => {
  return errorResponse(
    'FORBIDDEN',
    message,
    403
  );
};

/**
 * Resposta para erro interno do servidor (500)
 * @param {string} message - Mensagem de erro
 * @param {Object} details - Detalhes do erro (apenas em desenvolvimento)
 * @returns {Object} Resposta 500 padronizada
 */
const serverErrorResponse = (message = 'Erro interno do servidor', details = {}) => {
  return errorResponse(
    'INTERNAL_SERVER_ERROR',
    message,
    500,
    process.env.NODE_ENV === 'development' ? details : {}
  );
};

/**
 * Resposta para operação bem-sucedida com paginação
 * @param {Array} items - Lista de itens
 * @param {Object} pagination - Informações de paginação
 * @param {string} message - Mensagem opcional
 * @returns {Object} Resposta com paginação
 */
const paginatedResponse = (items, pagination, message = null) => {
  return successResponse(
    { items, pagination },
    message
  );
};

/**
 * Middleware para padronizar respostas de erro não tratadas
 * @param {Error} err - Erro capturado
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next function
 */
const errorHandler = (err, req, res, next) => {
  console.error('❌ Erro não tratado:', err);

  const { response, statusCode } = serverErrorResponse(
    'Erro interno do servidor',
    {
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
      path: req.path,
      method: req.method
    }
  );

  res.status(statusCode).json(response);
};

/**
 * Wrapper para funções async que captura erros automaticamente
 * @param {Function} fn - Função async a ser executada
 * @returns {Function} Função wrapper
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  successResponse,
  errorResponse,
  notFoundResponse,
  validationErrorResponse,
  forbiddenResponse,
  serverErrorResponse,
  paginatedResponse,
  errorHandler,
  asyncHandler
};
