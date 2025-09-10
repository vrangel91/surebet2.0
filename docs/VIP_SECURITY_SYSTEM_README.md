# 🔒 Sistema de Segurança VIP - SureStake

## 📋 Visão Geral

O Sistema de Segurança VIP é uma solução robusta que garante que o acesso VIP seja sempre validado online quando possível, usando cache offline apenas temporariamente com expiração controlada para prevenir fraudes.

## 🎯 Objetivos

- **🔐 Validação Online Obrigatória**: VIP sempre é verificado no servidor quando há conexão
- **💾 Cache Offline Temporário**: Dados locais são usados apenas por tempo limitado
- **🛡️ Prevenção de Fraudes**: Validação de integridade e expiração automática
- **🔄 Sincronização Automática**: Força validação quando a conexão é restaurada

## 🏗️ Arquitetura

### Camadas do Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                    🌐 CAMADA ONLINE                        │
│  • Validação VIP no servidor                              │
│  • Verificação periódica (5 min)                          │
│  • Sincronização forçada ao voltar online                 │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    💾 CAMADA OFFLINE                       │
│  • Cache local com timestamp                              │
│  • Validação de integridade (checksum)                    │
│  • Expiração automática (2h offline, 24h cache)          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    🔒 SEGURANÇA                            │
│  • Validação de dados                                      │
│  • Verificação de expiração                                │
│  • Bloqueio automático                                     │
└─────────────────────────────────────────────────────────────┘
```

## ⚙️ Configurações de Segurança

```javascript
SECURITY_CONFIG = {
  // Tempo máximo offline antes de forçar sincronização (2 horas)
  MAX_OFFLINE_TIME: 2 * 60 * 60 * 1000,
  
  // Tempo máximo para usar cache offline (24 horas)
  MAX_CACHE_TIME: 24 * 60 * 60 * 1000,
  
  // Intervalo para verificar status online (5 minutos)
  ONLINE_CHECK_INTERVAL: 5 * 60 * 1000,
  
  // Tempo para forçar sincronização após voltar online (30 segundos)
  FORCE_SYNC_DELAY: 30 * 1000
}
```

## 🔄 Fluxo de Funcionamento

### 1. **Login e Validação Inicial**
```
Usuário faz login → Backend retorna status VIP → Dados salvos localmente com timestamp
```

### 2. **Funcionamento Online**
```
A cada 5 min → Verifica VIP no servidor → Atualiza cache local → Configura expiração offline
```

### 3. **Funcionamento Offline**
```
Usa cache local → Valida integridade → Verifica expiração → Bloqueia se necessário
```

### 4. **Retorno Online**
```
Detecta conexão → Aguarda 30s → Força validação → Atualiza status → Limpa cache se inválido
```

## 🛠️ Componentes do Sistema

### 1. **VIPSecurityManager** (`/utils/vipSecurityManager.js`)
- **Classe principal** que gerencia toda a lógica de segurança
- **Validação online** com fallback para cache offline
- **Monitoramento de conectividade** e sincronização automática
- **Geração de checksum** para validação de integridade

### 2. **VIPBlockedModal** (`/components/VIPBlockedModal.vue`)
- **Modal de bloqueio** que aparece quando o acesso VIP é negado
- **Informações detalhadas** sobre o motivo do bloqueio
- **Opções de ação**: tentar online, fazer login, contatar suporte
- **Retry automático** quando a conexão é restaurada

### 3. **Integração nos Componentes**
- **Header.vue**: Verificação principal de acesso VIP
- **Sidebar.vue**: Verificação secundária e exibição de status
- **Rota API**: `/api/user/vip-status` para validação no servidor

## 🔐 Validações de Segurança

### 1. **Validação de Integridade**
```javascript
// Verifica se todos os campos obrigatórios existem
const requiredFields = ['isVIP', 'expiration', 'lastValidation', 'source'];

// Valida tipos dos dados
if (typeof data.isVIP !== 'boolean') return false;

// Verifica se a data não é no passado
if (new Date(data.expiration) <= new Date()) return false;
```

### 2. **Validação de Expiração**
```javascript
// Cache expirado (24h)
const cacheAge = now - data.lastValidation;
if (cacheAge > MAX_CACHE_TIME) return false;

// VIP expirado
if (new Date(data.expiration) <= new Date()) return false;

// Tempo offline excedido (2h)
if (offlineTime > MAX_OFFLINE_TIME) return false;
```

### 3. **Checksum de Integridade**
```javascript
// Gera hash simples dos dados
const dataString = JSON.stringify({
  isVIP: data.isVIP,
  expiration: data.expiration,
  lastValidation: data.lastValidation,
  source: data.source
});

// Converte para base36 para armazenamento
return hash.toString(36);
```

## 📱 Como Usar

### 1. **Verificar Acesso VIP**
```javascript
import vipSecurityManager from '@/utils/vipSecurityManager';

const result = await vipSecurityManager.checkVIPAccess();

if (result.access) {
  console.log('✅ Acesso VIP autorizado:', result.source);
} else {
  console.log('❌ Acesso bloqueado:', result.reason);
}
```

### 2. **Monitorar Status**
```javascript
const status = vipSecurityManager.getStatus();
console.log('Status atual:', status);
```

### 3. **Forçar Validação Online**
```javascript
await vipSecurityManager.validateVIPOnline();
```

## 🚨 Cenários de Bloqueio

### 1. **VIP Expirado**
- **Motivo**: Data de expiração no passado
- **Ação**: Bloqueia acesso imediatamente
- **Solução**: Renovar assinatura

### 2. **Tempo Offline Excedido**
- **Motivo**: Ficou offline por mais de 2 horas
- **Ação**: Bloqueia acesso offline
- **Solução**: Conectar à internet para validar

### 3. **Cache Expirado**
- **Motivo**: Cache local expirou (24h)
- **Ação**: Bloqueia acesso offline
- **Solução**: Conectar à internet para renovar

### 4. **Dados Corrompidos**
- **Motivo**: Checksum inválido ou campos ausentes
- **Ação**: Limpa cache e bloqueia acesso
- **Solução**: Fazer login novamente

## 🔧 Configuração e Personalização

### 1. **Ajustar Tempos de Expiração**
```javascript
// No VIPSecurityManager
this.SECURITY_CONFIG = {
  MAX_OFFLINE_TIME: 1 * 60 * 60 * 1000, // 1 hora
  MAX_CACHE_TIME: 12 * 60 * 60 * 1000,  // 12 horas
  // ... outras configurações
};
```

### 2. **Personalizar Mensagens de Bloqueio**
```javascript
// No VIPBlockedModal
const statusMessage = computed(() => {
  switch (props.reason) {
    case 'VIP expirado':
      return 'Sua assinatura expirou';
    // ... outras mensagens
  }
});
```

### 3. **Adicionar Novas Validações**
```javascript
// No VIPSecurityManager
validateDataIntegrity(data) {
  // Validações existentes...
  
  // Nova validação personalizada
  if (data.someCustomField && !this.validateCustomField(data.someCustomField)) {
    return false;
  }
  
  return true;
}
```

## 📊 Monitoramento e Debug

### 1. **Logs do Sistema**
```javascript
// Logs automáticos para todas as operações
console.log('🔒 [VIP Security] Verificando acesso VIP...');
console.log('✅ [VIP Security] VIP validado online:', vipData);
console.log('❌ [VIP Security] VIP inválido offline:', result.reason);
```

### 2. **Status em Tempo Real**
```javascript
// Obter status completo do sistema
const status = vipSecurityManager.getStatus();
console.log('Status VIP:', status);
```

### 3. **Debug de Problemas**
```javascript
// Verificar integridade manualmente
const isValid = vipSecurityManager.validateDataIntegrity(cachedData);
console.log('Integridade dos dados:', isValid);

// Verificar expirações
const isExpired = vipSecurityManager.isVIPExpired(expirationDate);
console.log('VIP expirado:', isExpired);
```

## 🚀 Melhorias Futuras

### 1. **Criptografia Avançada**
- Implementar criptografia AES para dados sensíveis
- Assinatura digital com chaves públicas/privadas
- Validação de certificados SSL

### 2. **Machine Learning**
- Detecção de padrões suspeitos de uso
- Análise de comportamento para identificar fraudes
- Adaptação automática de níveis de segurança

### 3. **Integração com Blockchain**
- Validação de status VIP em blockchain
- Smart contracts para assinaturas
- Histórico imutável de transações

### 4. **Monitoramento Avançado**
- Dashboard de segurança em tempo real
- Alertas automáticos para atividades suspeitas
- Relatórios detalhados de acesso

## 🔍 Troubleshooting

### 1. **Problema: Cache sempre expira**
- **Causa**: Configuração de tempo muito baixa
- **Solução**: Ajustar `MAX_CACHE_TIME` e `MAX_OFFLINE_TIME`

### 2. **Problema: Validação online falha**
- **Causa**: API não responde ou erro de rede
- **Solução**: Verificar endpoint `/api/user/vip-status` e logs do servidor

### 3. **Problema: Modal não aparece**
- **Causa**: Componente não está registrado ou props incorretos
- **Solução**: Verificar import e props do `VIPBlockedModal`

### 4. **Problema: Loop infinito de validação**
- **Causa**: Sistema de recuperação automática ativo
- **Solução**: Verificar se as verificações automáticas estão desabilitadas

## 📚 Referências

- [Vue.js Composition API](https://vuejs.org/guide/extras/composition-api-faq.html)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Progressive Web Apps](https://web.dev/progressive-web-apps/)
- [Security Best Practices](https://owasp.org/www-project-top-ten/)

---

**Desenvolvido para SureStake** 🔒✨
**Versão**: 1.0.0
**Última atualização**: Janeiro 2025
