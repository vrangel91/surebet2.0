/**
 * 🔒 Sistema de Segurança VIP - SureStake
 * 
 * Este sistema garante que:
 * - VIP sempre é validado online quando possível
 * - Cache offline é usado apenas temporariamente
 * - Prevenção de fraudes com validação de integridade
 * - Expiração automática para evitar abusos
 */

import { ref, computed } from 'vue';
import api from '@/utils/axios';

class VIPSecurityManager {
  constructor() {
    this.vipStatus = ref(null);
    this.vipExpiration = ref(null);
    this.lastOnlineValidation = ref(null);
    this.offlineExpiration = ref(null);
    this.isOnline = ref(navigator.onLine);
    this.validationInterval = null;
    this.forceSyncTimeout = null;
    
    // Configurações de segurança
    this.SECURITY_CONFIG = {
      // Tempo máximo offline antes de forçar sincronização (2 horas)
      MAX_OFFLINE_TIME: 2 * 60 * 60 * 1000,
      
      // Tempo máximo para usar cache offline (24 horas)
      MAX_CACHE_TIME: 24 * 60 * 60 * 1000,
      
      // Intervalo para verificar status online (5 minutos)
      ONLINE_CHECK_INTERVAL: 5 * 60 * 1000,
      
      // Tempo para forçar sincronização após voltar online (30 segundos)
      FORCE_SYNC_DELAY: 30 * 1000
    };
    
    this.setupEventListeners();
  }

  // 🔍 Verificar se o usuário tem acesso VIP válido
  async checkVIPAccess() {
    console.log('🔒 [VIP Security] Verificando acesso VIP...');
    
    try {
      // 1. Tentar validação online primeiro
      if (this.isOnline.value) {
        console.log('🔒 [VIP Security] Online - validando no servidor...');
        const onlineStatus = await this.validateVIPOnline();
        
        if (onlineStatus.isValid) {
          console.log('✅ [VIP Security] VIP válido online');
          return { access: true, source: 'online', data: onlineStatus };
        } else {
          console.log('❌ [VIP Security] VIP inválido online');
          this.clearVIPCache();
          return { access: false, source: 'online', reason: 'VIP expirado/removido' };
        }
      }
      
      // 2. Se offline, verificar cache com validação de segurança
      console.log('🔒 [VIP Security] Offline - verificando cache...');
      const offlineStatus = this.validateVIPOffline();
      
      if (offlineStatus.isValid) {
        console.log('✅ [VIP Security] VIP válido offline (cache)');
        return { access: true, source: 'offline', data: offlineStatus };
      } else {
        console.log('❌ [VIP Security] VIP inválido offline');
        return { access: false, source: 'offline', reason: offlineStatus.reason };
      }
      
    } catch (error) {
      console.error('❌ [VIP Security] Erro ao verificar VIP:', error);
      return { access: false, source: 'error', reason: 'Erro de validação' };
    }
  }

  // 🌐 Validação online obrigatória
  async validateVIPOnline() {
    try {
      console.log('🌐 [VIP Security] Validando VIP no servidor...');
      
      const response = await api.get('/api/vip/my-status', {
        timeout: 10000 // 10 segundos timeout
      });
      
      const vipData = response.data;
      
      // Validar dados recebidos
      if (!vipData || typeof vipData.hasVIP !== 'boolean') {
        throw new Error('Resposta inválida do servidor');
      }
      
      // Extrair dados da resposta da API
      const isVIP = vipData.hasVIP;
      const expiration = vipData.vipStatus?.dataFim || null;
      
      // Salvar dados validados localmente
      this.saveVIPData({
        isVIP: isVIP,
        expiration: expiration,
        lastValidation: Date.now(),
        source: 'online'
      });
      
      // Atualizar status
      this.vipStatus.value = isVIP;
      this.vipExpiration.value = expiration;
      this.lastOnlineValidation.value = Date.now();
      
      // Configurar expiração offline
      this.setupOfflineExpiration();
      
      console.log('✅ [VIP Security] VIP validado online:', vipData);
      
      return {
        isValid: isVIP,
        expiration: expiration,
        lastValidation: Date.now()
      };
      
    } catch (error) {
      console.error('❌ [VIP Security] Erro na validação online:', error);
      
      // Se falhar online, tentar usar cache offline como fallback
      const offlineStatus = this.validateVIPOffline();
      
      if (offlineStatus.isValid) {
        console.log('⚠️ [VIP Security] Usando cache offline como fallback');
        return offlineStatus;
      }
      
      throw error;
    }
  }

  // 💾 Validação offline com segurança
  validateVIPOffline() {
    try {
      console.log('💾 [VIP Security] Validando cache offline...');
      
      // Carregar dados do cache
      const cachedData = this.loadVIPData();
      
      if (!cachedData) {
        return { isValid: false, reason: 'Cache não encontrado' };
      }
      
      // Validar integridade dos dados
      if (!this.validateDataIntegrity(cachedData)) {
        console.log('❌ [VIP Security] Dados corrompidos no cache');
        this.clearVIPCache();
        return { isValid: false, reason: 'Dados corrompidos' };
      }
      
      // Verificar se o cache não expirou
      if (this.isCacheExpired(cachedData)) {
        console.log('❌ [VIP Security] Cache expirado');
        this.clearVIPCache();
        return { isValid: false, reason: 'Cache expirado' };
      }
      
      // Verificar se o VIP não expirou
      if (this.isVIPExpired(cachedData.expiration)) {
        console.log('❌ [VIP Security] VIP expirado');
        this.clearVIPCache();
        return { isValid: false, reason: 'VIP expirado' };
      }
      
      // Verificar tempo offline máximo
      if (this.isOfflineTimeExceeded(cachedData.lastValidation)) {
        console.log('❌ [VIP Security] Tempo offline excedido');
        this.clearVIPCache();
        return { isValid: false, reason: 'Tempo offline excedido' };
      }
      
      console.log('✅ [VIP Security] Cache offline válido');
      
      return {
        isValid: cachedData.isVIP,
        expiration: cachedData.expiration,
        lastValidation: cachedData.lastValidation,
        source: 'offline'
      };
      
    } catch (error) {
      console.error('❌ [VIP Security] Erro na validação offline:', error);
      return { isValid: false, reason: 'Erro na validação offline' };
    }
  }

  // 🔐 Validar integridade dos dados
  validateDataIntegrity(data) {
    try {
      // Verificar se todos os campos obrigatórios existem
      const requiredFields = ['isVIP', 'expiration', 'lastValidation', 'source'];
      const hasAllFields = requiredFields.every(field => data.hasOwnProperty(field));
      
      if (!hasAllFields) {
        console.log('❌ [VIP Security] Campos obrigatórios ausentes');
        return false;
      }
      
      // Verificar tipos dos dados
      if (typeof data.isVIP !== 'boolean') {
        console.log('❌ [VIP Security] Tipo inválido para isVIP');
        return false;
      }
      
      if (typeof data.expiration !== 'string' || isNaN(Date.parse(data.expiration))) {
        console.log('❌ [VIP Security] Data de expiração inválida');
        return false;
      }
      
      if (typeof data.lastValidation !== 'number' || data.lastValidation <= 0) {
        console.log('❌ [VIP Security] Timestamp de validação inválido');
        return false;
      }
      
      // Verificar se a data de expiração não é no passado
      if (new Date(data.expiration) <= new Date()) {
        console.log('❌ [VIP Security] VIP já expirou');
        return false;
      }
      
      return true;
      
    } catch (error) {
      console.error('❌ [VIP Security] Erro na validação de integridade:', error);
      return false;
    }
  }

  // ⏰ Verificar se o cache expirou
  isCacheExpired(data) {
    const now = Date.now();
    const cacheAge = now - data.lastValidation;
    const maxCacheTime = this.SECURITY_CONFIG.MAX_CACHE_TIME;
    
    if (cacheAge > maxCacheTime) {
      console.log(`❌ [VIP Security] Cache expirado: ${cacheAge}ms > ${maxCacheTime}ms`);
      return true;
    }
    
    return false;
  }

  // 📅 Verificar se o VIP expirou
  isVIPExpired(expirationDate) {
    const now = new Date();
    const expiration = new Date(expirationDate);
    
    if (expiration <= now) {
      console.log('❌ [VIP Security] VIP expirou:', expiration, '<=', now);
      return true;
    }
    
    return false;
  }

  // ⏱️ Verificar se o tempo offline foi excedido
  isOfflineTimeExceeded(lastValidation) {
    const now = Date.now();
    const offlineTime = now - lastValidation;
    const maxOfflineTime = this.SECURITY_CONFIG.MAX_OFFLINE_TIME;
    
    if (offlineTime > maxOfflineTime) {
      console.log(`❌ [VIP Security] Tempo offline excedido: ${offlineTime}ms > ${maxOfflineTime}ms`);
      return true;
    }
    
    return false;
  }

  // 💾 Salvar dados VIP com timestamp
  saveVIPData(data) {
    try {
      const vipData = {
        ...data,
        timestamp: Date.now(),
        checksum: this.generateChecksum(data)
      };
      
      localStorage.setItem('vip_security_data', JSON.stringify(vipData));
      console.log('💾 [VIP Security] Dados VIP salvos no cache');
      
    } catch (error) {
      console.error('❌ [VIP Security] Erro ao salvar dados VIP:', error);
    }
  }

  // 📖 Carregar dados VIP do cache
  loadVIPData() {
    try {
      const cachedData = localStorage.getItem('vip_security_data');
      
      if (!cachedData) {
        return null;
      }
      
      const data = JSON.parse(cachedData);
      
      // Verificar checksum para integridade
      if (data.checksum !== this.generateChecksum(data)) {
        console.log('❌ [VIP Security] Checksum inválido - dados corrompidos');
        this.clearVIPCache();
        return null;
      }
      
      return data;
      
    } catch (error) {
      console.error('❌ [VIP Security] Erro ao carregar dados VIP:', error);
      this.clearVIPCache();
      return null;
    }
  }

  // 🗑️ Limpar cache VIP
  clearVIPCache() {
    try {
      localStorage.removeItem('vip_security_data');
      this.vipStatus.value = null;
      this.vipExpiration.value = null;
      this.lastOnlineValidation.value = null;
      this.offlineExpiration.value = null;
      
      console.log('🗑️ [VIP Security] Cache VIP limpo');
      
    } catch (error) {
      console.error('❌ [VIP Security] Erro ao limpar cache:', error);
    }
  }

  // 🔐 Gerar checksum para integridade
  generateChecksum(data) {
    try {
      const dataString = JSON.stringify({
        isVIP: data.isVIP,
        expiration: data.expiration,
        lastValidation: data.lastValidation,
        source: data.source
      });
      
      // Checksum simples baseado em hash da string
      let hash = 0;
      for (let i = 0; i < dataString.length; i++) {
        const char = dataString.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
      }
      
      return hash.toString(36);
      
    } catch (error) {
      console.error('❌ [VIP Security] Erro ao gerar checksum:', error);
      return '';
    }
  }

  // ⏰ Configurar expiração offline
  setupOfflineExpiration() {
    const now = Date.now();
    const maxOfflineTime = this.SECURITY_CONFIG.MAX_OFFLINE_TIME;
    
    this.offlineExpiration.value = now + maxOfflineTime;
    
    console.log(`⏰ [VIP Security] Expiração offline configurada: ${new Date(this.offlineExpiration.value)}`);
  }

  // 🔄 Configurar verificação periódica online
  setupPeriodicValidation() {
    if (this.validationInterval) {
      clearInterval(this.validationInterval);
    }
    
    this.validationInterval = setInterval(async () => {
      if (this.isOnline.value) {
        console.log('🔄 [VIP Security] Verificação periódica online...');
        try {
          await this.validateVIPOnline();
        } catch (error) {
          console.error('❌ [VIP Security] Erro na verificação periódica:', error);
        }
      }
    }, this.SECURITY_CONFIG.ONLINE_CHECK_INTERVAL);
    
    console.log('🔄 [VIP Security] Verificação periódica configurada');
  }

  // 🌐 Forçar sincronização quando voltar online
  async forceSyncWhenOnline() {
    if (this.forceSyncTimeout) {
      clearTimeout(this.forceSyncTimeout);
    }
    
    this.forceSyncTimeout = setTimeout(async () => {
      if (this.isOnline.value) {
        console.log('🔄 [VIP Security] Forçando sincronização online...');
        try {
          await this.validateVIPOnline();
        } catch (error) {
          console.error('❌ [VIP Security] Erro na sincronização forçada:', error);
        }
      }
    }, this.SECURITY_CONFIG.FORCE_SYNC_DELAY);
  }

  // 📡 Configurar listeners de eventos
  setupEventListeners() {
    // Monitorar mudanças de conectividade
    window.addEventListener('online', () => {
      console.log('🌐 [VIP Security] Conexão restaurada');
      this.isOnline.value = true;
      this.forceSyncWhenOnline();
    });
    
    window.addEventListener('offline', () => {
      console.log('📴 [VIP Security] Conexão perdida');
      this.isOnline.value = false;
    });
    
    // Verificar conectividade inicial
    this.isOnline.value = navigator.onLine;
    
    // Configurar verificação periódica
    this.setupPeriodicValidation();
  }

  // 🧹 Cleanup
  destroy() {
    if (this.validationInterval) {
      clearInterval(this.validationInterval);
    }
    
    if (this.forceSyncTimeout) {
      clearTimeout(this.forceSyncTimeout);
    }
    
    console.log('🧹 [VIP Security] Manager destruído');
  }

  // 📊 Status atual do sistema
  getStatus() {
    return {
      vipStatus: this.vipStatus.value,
      vipExpiration: this.vipExpiration.value,
      lastOnlineValidation: this.lastOnlineValidation.value,
      offlineExpiration: this.offlineExpiration.value,
      isOnline: this.isOnline.value,
      cacheValid: this.validateVIPOffline().isValid
    };
  }
}

// Instância singleton
const vipSecurityManager = new VIPSecurityManager();

export default vipSecurityManager;
