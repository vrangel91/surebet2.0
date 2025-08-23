const express = require('express');
const router = express.Router();
const mercadopagoService = require('../config/mercadopago');
const { Pool } = require('pg');

// Configuração do banco de dados
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'SureStake2024!',
  database: process.env.DB_NAME || 'surestake'
});

// Middleware de autenticação
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token de acesso necessário' });
  }

  // Aqui você implementaria a verificação do token JWT
  // Por enquanto, vamos apenas verificar se existe
  req.user = { id: 'user123' }; // Placeholder
  next();
};

// 1. Criar Pedido
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      userId,
      planId,
      planName,
      planDays,
      amount,
      paymentMethod,
      installments,
      customerData
    } = req.body;

    // Validações básicas
    if (!userId || !planId || !planName || !planDays || !amount) {
      return res.status(400).json({ error: 'Dados obrigatórios não fornecidos' });
    }

    // Inserir pedido no banco
    const query = `
      INSERT INTO orders (user_id, plan_id, plan_name, plan_days, amount, status, payment_method, installments, customer_data)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

    const values = [
      userId,
      planId,
      planName,
      planDays,
      amount,
      'pending',
      paymentMethod,
      installments,
      JSON.stringify(customerData)
    ];

    const result = await pool.query(query, values);
    const order = result.rows[0];

    res.status(201).json({
      success: true,
      order: {
        id: order.id,
        status: order.status,
        planName: order.plan_name,
        amount: order.amount,
        createdAt: order.created_at
      }
    });

  } catch (error) {
    console.error('Erro ao criar pedido:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// 2. Atualizar Status do Pedido
router.patch('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'approved', 'rejected', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Status inválido' });
    }

    const query = `
      UPDATE orders 
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;

    const result = await pool.query(query, [status, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }

    const order = result.rows[0];

    res.json({
      success: true,
      order: {
        id: order.id,
        status: order.status,
        updatedAt: order.updated_at
      }
    });

  } catch (error) {
    console.error('Erro ao atualizar status:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// 3. Salvar Dados do Pagamento
router.patch('/:id/payment-data', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      paymentId,
      status,
      paymentMethod,
      installments,
      transactionAmount,
      processedAt
    } = req.body;

    const paymentData = {
      paymentId,
      status,
      paymentMethod,
      installments,
      transactionAmount,
      processedAt
    };

    const query = `
      UPDATE orders 
      SET payment_data = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;

    const result = await pool.query(query, [JSON.stringify(paymentData), id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }

    res.json({
      success: true,
      message: 'Dados do pagamento salvos com sucesso'
    });

  } catch (error) {
    console.error('Erro ao salvar dados do pagamento:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// 4. Buscar Pedido por ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT * FROM orders WHERE id = $1
    `;

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }

    const order = result.rows[0];

    res.json({
      success: true,
      order: {
        id: order.id,
        userId: order.user_id,
        planId: order.plan_id,
        planName: order.plan_name,
        planDays: order.plan_days,
        amount: order.amount,
        status: order.status,
        paymentMethod: order.payment_method,
        installments: order.installments,
        customerData: order.customer_data,
        paymentData: order.payment_data,
        createdAt: order.created_at,
        updatedAt: order.updated_at
      }
    });

  } catch (error) {
    console.error('Erro ao buscar pedido:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// 5. Listar Pedidos do Usuário
router.get('/user/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10, status } = req.query;

    let query = `
      SELECT * FROM orders 
      WHERE user_id = $1
    `;
    
    let values = [userId];
    let paramCount = 1;

    if (status) {
      query += ` AND status = $${++paramCount}`;
      values.push(status);
    }

    query += ` ORDER BY created_at DESC LIMIT $${++paramCount} OFFSET $${++paramCount}`;
    values.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));

    const result = await pool.query(query, values);

    // Contar total de pedidos para paginação
    let countQuery = `
      SELECT COUNT(*) FROM orders WHERE user_id = $1
    `;
    
    let countValues = [userId];
    
    if (status) {
      countQuery += ` AND status = $2`;
      countValues.push(status);
    }

    const countResult = await pool.query(countQuery, countValues);
    const totalOrders = parseInt(countResult.rows[0].count);

    res.json({
      success: true,
      orders: result.rows.map(order => ({
        id: order.id,
        planId: order.plan_id,
        planName: order.plan_name,
        amount: order.amount,
        status: order.status,
        createdAt: order.created_at
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalOrders,
        pages: Math.ceil(totalOrders / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Erro ao listar pedidos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// 6. Cancelar Pedido
router.patch('/:id/cancel', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    // Verificar se o pedido pode ser cancelado
    const checkQuery = `
      SELECT status FROM orders WHERE id = $1
    `;

    const checkResult = await pool.query(checkQuery, [id]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }

    const order = checkResult.rows[0];

    if (order.status !== 'pending') {
      return res.status(400).json({ error: 'Pedido não pode ser cancelado' });
    }

    // Cancelar pedido
    const updateQuery = `
      UPDATE orders 
      SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;

    const result = await pool.query(updateQuery, [id]);

    res.json({
      success: true,
      message: 'Pedido cancelado com sucesso',
      order: {
        id: result.rows[0].id,
        status: result.rows[0].status
      }
    });

  } catch (error) {
    console.error('Erro ao cancelar pedido:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// 7. Webhook do Mercado Pago (Temporariamente desabilitado)
// router.post('/webhook/mercadopago', async (req, res) => {
//   try {
//     const { data } = req.body;

//     if (data.type === 'payment') {
//       const paymentId = data.id;

//       // Buscar detalhes do pagamento no Mercado Pago
//       const paymentInstance = new Payment(mercadopagoConfig);
//       const payment = await paymentInstance.get({ id: paymentId });
      
//       if (!payment) {
//         console.error('Pagamento não encontrado:', paymentId);
//         return res.status(404).json({ error: 'Pagamento não encontrado' });
//       }

//       const externalReference = payment.external_reference;
//       const status = payment.status;

//       // Atualizar status do pedido
//       await updateOrderStatus(externalReference, status);

//       // Se aprovado, ativar VIP
//       if (status === 'approved') {
//         await activateUserVIP(externalReference);
//       }

//       console.log(`Webhook processado: Pedido ${externalReference} - Status: ${status}`);
//     }

//     res.status(200).json({ received: true });

//   } catch (error) {
//     console.error('Erro no webhook:', error);
//     res.status(500).json({ error: 'Erro interno' });
//     res.status(500).json({ error: 'Erro interno' });
//   }
// });

// 8. Criar Pedido PIX
router.post('/pix', authenticateToken, async (req, res) => {
  try {
    const {
      userId,
      planId,
      planName,
      planDays,
      amount,
      customerData
    } = req.body;

    // Validações básicas mais rigorosas
    if (!userId || !planId || !planName || !planDays || !amount) {
      return res.status(400).json({ error: 'Dados obrigatórios não fornecidos' });
    }

    if (!customerData || !customerData.email || !customerData.firstName || !customerData.lastName || !customerData.cpf) {
      return res.status(400).json({ error: 'Dados do cliente incompletos' });
    }

    // Validar formato do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerData.email)) {
      return res.status(400).json({ error: 'Formato de email inválido' });
    }

    // Validar CPF (formato básico)
    const cpfRegex = /^\d{11}$/;
    if (!cpfRegex.test(customerData.cpf.replace(/\D/g, ''))) {
      return res.status(400).json({ error: 'CPF inválido' });
    }

    // Inserir pedido no banco
    const query = `
      INSERT INTO orders (user_id, plan_id, plan_name, plan_days, amount, status, payment_method, installments, customer_data)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

    const values = [
      userId,
      planId,
      planName,
      planDays,
      amount,
      'pending',
      'pix',
      1, // PIX sempre é à vista
      JSON.stringify(customerData)
    ];

    const result = await pool.query(query, values);
    const order = result.rows[0];

    // Gerar PIX usando o serviço aprimorado
    console.log(`🔄 Gerando PIX para pedido ${order.id}...`);
    
    const pixPayment = await mercadopagoService.createPixPayment({
      amount: parseFloat(amount),
      description: `Plano ${planName} - PIX`,
      externalReference: order.id.toString(),
      payer: {
        email: customerData.email,
        firstName: customerData.firstName,
        lastName: customerData.lastName,
        cpf: customerData.cpf
      }
    });

    // Extrair dados do PIX usando o serviço
    const pixData = mercadopagoService.extractPixData(pixPayment);

    // Log dos dados extraídos
    console.log('🔍 Dados extraídos do PIX:', {
      pixCode: pixData.pixCode ? '✅ Presente' : '❌ Ausente',
      pixCodeBase64: pixData.pixCodeBase64 ? '✅ Presente' : '❌ Ausente',
      ticketUrl: pixData.ticketUrl ? '✅ Presente' : '❌ Ausente',
      paymentId: pixData.paymentId,
      status: pixData.status,
      orderId: order.id
    });

    // Verificar se pelo menos um dos códigos PIX foi gerado
    if (!pixData.pixCode && !pixData.pixCodeBase64) {
      console.error('❌ Nenhum código PIX foi gerado:', pixData);
      throw new Error('Falha ao gerar códigos PIX');
    }

    await pool.query(
      'UPDATE orders SET payment_data = $1 WHERE id = $2',
      [JSON.stringify(pixData), order.id]
    );

    res.status(201).json({
      success: true,
      order: {
        id: order.id,
        status: order.status,
        planName: order.plan_name,
        amount: order.amount,
        createdAt: order.created_at
      },
      pix: pixData
    });

  } catch (error) {
    console.error('❌ Erro ao criar pedido PIX:', {
      error: error.message,
      stack: error.stack,
      requestBody: req.body,
      timestamp: new Date().toISOString()
    });

    // Se falhar ao gerar PIX, deletar o pedido criado (se existir)
    if (req.body && req.body.planId) {
      try {
        await pool.query('DELETE FROM orders WHERE user_id = $1 AND plan_id = $2 AND status = $3', 
          [req.body.userId, req.body.planId, 'pending']);
        console.log('🗑️ Pedido pendente removido após falha');
      } catch (deleteError) {
        console.error('❌ Erro ao remover pedido pendente:', deleteError);
      }
    }

    res.status(500).json({ 
      error: error.message || 'Erro interno do servidor',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });
  }
});

// Funções auxiliares (Temporariamente desabilitadas)
// async function updateOrderStatus(orderId, status) { ... }
// async function activateUserVIP(orderId) { ... }

module.exports = router;
