const express = require('express');
const router = express.Router();
const { SurebetStats, SurebetAnalytics } = require('../models');
const crypto = require('crypto');

// Middleware de autenticação
const { authenticateToken } = require('../utils/auth');

// Aplicar middleware de autenticação em todas as rotas
router.use(authenticateToken);

// GET /api/surebet-stats - Buscar estatísticas de surebets
router.get('/', async (req, res) => {
  try {
    const { period, sport, limit = 100 } = req.query;
    
    let whereClause = {};
    
    // Filtrar por período
    if (period && period !== 'all') {
      const days = parseInt(period);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      whereClause.date = {
        [require('sequelize').Op.gte]: cutoffDate
      };
    }
    
    // Filtrar por esporte
    if (sport && sport !== 'all') {
      whereClause.sport = sport;
    }
    
    // Filtrar apenas surebets ativas
    whereClause.status = 'active';
    
    const stats = await SurebetStats.findAll({
      where: whereClause,
      order: [['date', 'DESC'], ['hour', 'DESC']],
      limit: parseInt(limit)
    });
    
    res.json({
      success: true,
      data: stats,
      count: stats.length
    });
    
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// POST /api/surebet-stats - Criar nova estatística
router.post('/', async (req, res) => {
  try {
    const {
      surebet_id,
      house,
      market,
      match,
      profit,
      date,
      hour,
      sport,
      period,
      minutes,
      anchorh1,
      anchorh2,
      chance,
      metadata
    } = req.body;
    
    // Validações básicas
    if (!surebet_id || !house || !market || !profit || !date || !hour || !sport) {
      return res.status(400).json({
        success: false,
        error: 'Campos obrigatórios não fornecidos'
      });
    }
    
    // Verificar se já existe uma estatística com o mesmo surebet_id e house
    const existingStat = await SurebetStats.findOne({
      where: {
        surebet_id,
        house,
        date
      }
    });
    
    if (existingStat) {
      // Atualizar estatística existente
      await existingStat.update({
        profit,
        hour,
        period,
        minutes,
        anchorh1,
        anchorh2,
        chance,
        metadata,
        updatedAt: new Date()
      });
      
      return res.json({
        success: true,
        message: 'Estatística atualizada com sucesso',
        data: existingStat
      });
    }
    
    // Criar nova estatística
    const newStat = await SurebetStats.create({
      user_id: req.user.id, // Usar o ID do usuário autenticado
      surebet_id,
      house,
      market,
      match,
      profit,
      date,
      hour,
      sport,
      period,
      minutes,
      anchorh1,
      anchorh2,
      chance,
      metadata,
      status: 'active'
    });
    
    res.status(201).json({
      success: true,
      message: 'Estatística criada com sucesso',
      data: newStat
    });
    
  } catch (error) {
    console.error('❌ Erro ao criar estatística:', error);
    
    // 🔍 DETALHAR O ERRO PARA DEBUG
    let errorMessage = 'Erro interno do servidor';
    let statusCode = 500;
    
    if (error.name === 'SequelizeValidationError') {
      errorMessage = 'Dados inválidos fornecidos';
      statusCode = 400;
    } else if (error.name === 'SequelizeForeignKeyConstraintError') {
      errorMessage = 'Referência inválida (usuário não existe)';
      statusCode = 400;
    } else if (error.name === 'SequelizeUniqueConstraintError') {
      errorMessage = 'Registro já existe';
      statusCode = 409;
    }
    
    res.status(statusCode).json({
      success: false,
      error: errorMessage,
      details: error.message,
      type: error.name
    });
  }
});

// POST /api/surebet-stats/bulk - Criar múltiplas estatísticas
router.post('/bulk', async (req, res) => {
  try {
    const { stats } = req.body;
    
    if (!Array.isArray(stats) || stats.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Array de estatísticas é obrigatório'
      });
    }
    
    // 🔍 VALIDAR CAMPOS OBRIGATÓRIOS EM CADA REGISTRO
    const requiredFields = ['surebet_id', 'house', 'market', 'profit', 'date', 'hour', 'sport'];
    const invalidRecords = [];
    
    stats.forEach((stat, index) => {
      const missingFields = requiredFields.filter(field => !stat[field]);
      if (missingFields.length > 0) {
        invalidRecords.push({
          index,
          surebet_id: stat.surebet_id || 'N/A',
          missingFields,
          data: stat
        });
      }
    });
    
    if (invalidRecords.length > 0) {
      console.error('❌ Registros inválidos recebidos:', invalidRecords);
      return res.status(400).json({
        success: false,
        error: 'Registros com campos obrigatórios faltando',
        details: {
          totalRecords: stats.length,
          invalidRecords: invalidRecords.length,
          invalidDetails: invalidRecords
        }
      });
    }
    
    console.log(`✅ Validados ${stats.length} registros - todos os campos obrigatórios presentes`);
    
    const createdStats = [];
    const updatedStats = [];
    
    for (const stat of stats) {
      const {
        surebet_id,
        house,
        market,
        match,
        profit,
        date,
        hour,
        sport,
        period,
        minutes,
        anchorh1,
        anchorh2,
        chance,
        metadata
      } = stat;
      
      try {
        // Verificar se já existe
        const existingStat = await SurebetStats.findOne({
          where: {
            surebet_id,
            house,
            date
          }
        });
        
        if (existingStat) {
          // Atualizar
          await existingStat.update({
            profit,
            hour,
            period,
            minutes,
            anchorh1,
            anchorh2,
            chance,
            metadata,
            updatedAt: new Date()
          });
          updatedStats.push(existingStat);
          console.log(`✅ Registro atualizado: ${surebet_id} - ${house}`);
        } else {
          // Criar nova
          const newStat = await SurebetStats.create({
            user_id: req.user.id, // Usar o ID do usuário autenticado
            surebet_id,
            house,
            market,
            match,
            profit,
            date,
            hour,
            sport,
            period,
            minutes,
            anchorh1,
            anchorh2,
            chance,
            metadata,
            status: 'active'
          });
          createdStats.push(newStat);
          console.log(`✅ Novo registro criado: ${surebet_id} - ${house}`);
        }
      } catch (recordError) {
        console.error(`❌ Erro ao processar registro ${surebet_id}:`, recordError);
        // Continuar com outros registros em vez de falhar completamente
        continue;
      }
    }
    
    res.status(201).json({
      success: true,
      message: `Bulk operation completed: ${createdStats.length} created, ${updatedStats.length} updated`,
      data: {
        created: createdStats,
        updated: updatedStats
      }
    });
    
  } catch (error) {
    console.error('❌ Erro no bulk operation:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

// GET /api/surebet-stats/analytics - Buscar análises salvas
router.get('/analytics', async (req, res) => {
  try {
    const { period, sport, type } = req.query;
    
    let whereClause = {};
    
    if (period && period !== 'all') {
      whereClause.period_days = parseInt(period);
    }
    
    if (sport && sport !== 'all') {
      whereClause.sport_filter = sport;
    }
    
    if (type) {
      whereClause.analysis_type = type;
    }
    
    const analytics = await SurebetAnalytics.findAll({
      where: whereClause,
      order: [['analyzed_at', 'DESC']],
      limit: 50
    });
    
    res.json({
      success: true,
      data: analytics,
      count: analytics.length
    });
    
  } catch (error) {
    console.error('Erro ao buscar análises:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// POST /api/surebet-stats/analytics - Salvar nova análise
router.post('/analytics', async (req, res) => {
  try {
    const {
      analysis_type,
      period_days,
      sport_filter,
      analysis_data,
      total_surebets,
      unique_houses,
      unique_markets,
      average_profit
    } = req.body;
    
    // Validar campos obrigatórios
    if (!analysis_type || !period_days || !sport_filter || !analysis_data) {
      return res.status(400).json({
        success: false,
        error: 'Campos obrigatórios não fornecidos'
      });
    }
    
    // Gerar hash dos dados para verificar mudanças
    const dataString = JSON.stringify(analysis_data);
    const dataHash = crypto.createHash('md5').update(dataString).digest('hex');
    
    // Verificar se já existe uma análise similar
    const existingAnalytics = await SurebetAnalytics.findOne({
      where: {
        analysis_type,
        period_days,
        sport_filter
      }
    });
    
    if (existingAnalytics) {
      // Verificar se os dados mudaram
      if (existingAnalytics.data_hash === dataHash) {
        return res.json({
          success: true,
          message: 'Análise já existe e não mudou',
          data: existingAnalytics
        });
      }
      
      // Atualizar análise existente
      await existingAnalytics.update({
        analysis_data,
        total_surebets,
        unique_houses,
        unique_markets,
        average_profit,
        analyzed_at: new Date(),
        data_hash: dataHash
      });
      
      return res.json({
        success: true,
        message: 'Análise atualizada com sucesso',
        data: existingAnalytics
      });
    }
    
    // Criar nova análise
    const newAnalytics = await SurebetAnalytics.create({
      user_id: req.user.id, // Usar o ID do usuário autenticado
      analysis_type,
      period_days,
      sport_filter,
      analysis_data,
      total_surebets,
      unique_houses,
      unique_markets,
      average_profit,
      data_hash: dataHash
    });
    
    res.status(201).json({
      success: true,
      message: 'Análise salva com sucesso',
      data: newAnalytics
    });
    
  } catch (error) {
    console.error('Erro ao salvar análise:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// DELETE /api/surebet-stats/:id - Deletar estatística
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const stat = await SurebetStats.findByPk(id);
    if (!stat) {
      return res.status(404).json({
        success: false,
        error: 'Estatística não encontrada'
      });
    }
    
    await stat.destroy();
    
    res.json({
      success: true,
      message: 'Estatística deletada com sucesso'
    });
    
  } catch (error) {
    console.error('Erro ao deletar estatística:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// PUT /api/surebet-stats/:id - Atualizar estatística
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const stat = await SurebetStats.findByPk(id);
    if (!stat) {
      return res.status(404).json({
        success: false,
        error: 'Estatística não encontrada'
      });
    }
    
    await stat.update(updateData);
    
    res.json({
      success: true,
      message: 'Estatística atualizada com sucesso',
      data: stat
    });
    
  } catch (error) {
    console.error('Erro ao atualizar estatística:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

module.exports = router;
