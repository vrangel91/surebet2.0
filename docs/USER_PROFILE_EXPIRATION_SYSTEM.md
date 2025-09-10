# Sistema de Perfil de Usuário com Controle de Expiração

## 📋 Visão Geral

Este sistema implementa um controle completo de expiração de contas de usuário na sidebar, seguindo as especificações solicitadas. O sistema monitora a data de expiração da conta e fornece feedback visual e funcional baseado no status atual.

## 🎯 Funcionalidades Implementadas

### 1. **Exibição de Informações da Conta**
- ✅ Nome do usuário
- ✅ Avatar/ícone representativo
- ✅ Tipo de conta (Básico, Premium, VIP) com badges visuais
- ✅ Status da conta (Ativo/Expirado) com indicadores visuais

### 2. **Controle de Expiração da Conta**
- ✅ Data e hora de expiração claramente exibidas
- ✅ Alertas visuais para contas próximas da expiração (1 semana antes)
- ✅ Destaque visual com cores e animações
- ✅ Contagem regressiva em tempo real para contas prestes a expirar

### 3. **Ações Disponíveis no Perfil**
- ✅ Botão "Sair" da conta
- ✅ Botão "Renovar" que aparece quando necessário
- ✅ Redirecionamento inteligente para página de planos

### 4. **Atualização Dinâmica do Estado**
- ✅ Verificação automática do status da conta
- ✅ Atualização em tempo real sem necessidade de logout/login
- ✅ Timer que atualiza o countdown a cada minuto

### 5. **Interface Intuitiva**
- ✅ Informações essenciais visíveis de forma clara
- ✅ Elementos de ação próximos e destacados
- ✅ Alertas que chamam atenção sem poluir visualmente

## 🎨 Estados Visuais

### **Status da Conta**
- 🟢 **Ativo**: Verde, sem animação
- 🟡 **Aviso** (≤7 dias): Laranja, com animação pulse
- 🔴 **Expirado**: Vermelho, com animação pulse

### **Informações de Expiração**
- **Normal**: Texto verde
- **Aviso** (≤7 dias): Texto laranja
- **Expirado**: Texto vermelho

### **Alertas**
- **Aviso** (≤7 dias): Fundo laranja claro, borda laranja
- **Expirado**: Fundo vermelho claro, borda vermelha
- **Animação**: Pulse suave para chamar atenção

## 📊 Lógica de Funcionamento

### **Cálculo de Dias até Expiração**
```javascript
const now = new Date()
const expiration = new Date(this.accountExpiration)
const timeDiff = expiration - now
const daysUntilExpiration = Math.ceil(timeDiff / (1000 * 60 * 60 * 24))
```

### **Estados da Conta**
- **Ativo**: `timeDiff > 0 && daysUntilExpiration > 7`
- **Aviso**: `timeDiff > 0 && daysUntilExpiration ≤ 7`
- **Expirado**: `timeDiff ≤ 0`

### **Exibição de Texto**
- **Conta expirada**: "Conta expirada"
- **Expira hoje**: "Expira hoje"
- **Expira amanhã**: "Expira amanhã"
- **Outros casos**: "Expira em X dias"

### **Countdown**
- **>24h**: "Xd Yh" (ex: "2d 5h")
- **1-24h**: "Xh Ym" (ex: "5h 30m")
- **<1h**: "Xm" (ex: "45m")

## 🔧 Configuração

### **Estrutura de Dados do Usuário**
O sistema obtém os dados de expiração VIP através da API `/api/vip/my-status`:

```javascript
// Resposta da API /api/vip/my-status
{
  success: true,
  hasVIP: true,
  vipStatus: {
    id: 1,
    planId: "vip",
    planName: "VIP",
    planDays: 30,
    dataInicio: "2024-01-01T00:00:00.000Z",
    dataFim: "2024-01-31T23:59:59.000Z", // ← Data de expiração
    daysRemaining: 15,
    isExpired: false,
    status: "ativo",
    autoRenew: false
  }
}
```

### **Computed Properties Principais**
- `accountExpiration`: Data de expiração da conta
- `accountStatusClass`: Classe CSS para o status
- `accountStatusText`: Texto do status
- `expirationDisplayText`: Texto de expiração
- `showCountdown`: Se deve mostrar countdown
- `countdownText`: Texto do countdown
- `showExpirationAlert`: Se deve mostrar alerta
- `expirationAlertText`: Texto do alerta
- `showRenewButton`: Se deve mostrar botão renovar

## 🎯 Casos de Uso

### **Conta Ativa (>7 dias)**
- Status: Verde, "Ativo"
- Informação: "Expira em X dias" (verde)
- Ações: Apenas "Sair"

### **Conta com Aviso (≤7 dias)**
- Status: Laranja pulsante, "Ativo"
- Informação: "Expira em X dias" (laranja)
- Countdown: "Xd Yh" ou "Xh Ym" (últimos 3 dias)
- Alerta: "Renovação recomendada" (laranja)
- Ações: "Renovar" + "Sair"

### **Conta Expirada**
- Status: Vermelho pulsante, "Expirado"
- Informação: "Conta expirada" (vermelho)
- Alerta: "Renovação necessária!" (vermelho)
- Ações: "Renovar" + "Sair"

## 🔄 Atualização em Tempo Real

### **Timer de Atualização**
- **Frequência**: A cada minuto (60000ms)
- **Método**: `setInterval` com `$forceUpdate()`
- **Limpeza**: Automática no `beforeUnmount`

### **Reatividade**
- Todas as informações são computed properties
- Atualização automática quando a data muda
- Re-render automático do componente

## 📱 Responsividade

### **Sidebar Expandida**
- Todas as informações visíveis
- Botões de ação completos
- Alertas e countdown visíveis

### **Sidebar Colapsada**
- Apenas avatar e tipo de conta
- Informações de expiração ocultas
- Botões de ação ocultos

## 🎨 Estilos CSS

### **Cores Utilizadas**
- **Verde (Ativo)**: `#00ff88`
- **Laranja (Aviso)**: `#ffa500`
- **Vermelho (Expirado)**: `#ff4444`

### **Animações**
- **Pulse**: Para status de aviso/expirado
- **AlertPulse**: Para alertas de expiração
- **VipGlow**: Para badges VIP

### **Transições**
- Todas as mudanças de estado têm transições suaves
- Hover effects nos botões
- Animações de entrada/saída

## 🚀 Integração

### **API Integration**
O sistema se integra com a API VIP para obter dados de expiração:

- **Endpoint**: `GET /api/vip/my-status`
- **Autenticação**: Bearer Token
- **Resposta**: Dados completos do VIP do usuário atual
- **Frequência**: Carregamento inicial + atualização a cada minuto

### **Store Integration**
O sistema se integra com o Vuex store para:
- Obter dados do usuário atual
- Verificar tipo de conta (VIP)
- Verificar permissões de admin

### **Router Integration**
- Redirecionamento para `/plans` para renovação
- Redirecionamento para `/login` no logout

### **Notification System**
- Notificações informativas para ações
- Feedback visual para interações

## 🔮 Melhorias Futuras

### **Funcionalidades Adicionais**
- [ ] Modal de confirmação para renovação
- [ ] Histórico de renovações
- [ ] Notificações push para expiração
- [ ] Integração com sistema de pagamentos

### **Personalização**
- [ ] Temas customizáveis
- [ ] Configuração de alertas
- [ ] Preferências de exibição

### **Analytics**
- [ ] Tracking de renovações
- [ ] Métricas de engajamento
- [ ] Relatórios de expiração

## 🧪 Teste e Debug

### **Arquivo de Teste**
Foi criado um arquivo de teste interativo: `test-vip-sidebar.html`

**Funcionalidades do teste:**
- Simulação de diferentes cenários de expiração
- Teste de chamadas para a API
- Visualização em tempo real dos estados
- Logs detalhados de debug

**Como usar:**
1. Abrir `test-vip-sidebar.html` no navegador
2. Usar os botões para simular diferentes cenários
3. Verificar se os estados visuais estão corretos
4. Testar a integração com a API real

### **Cenários de Teste**
- **VIP Ativo**: >7 dias restantes
- **VIP Aviso**: ≤7 dias restantes
- **VIP Expirado**: Data de expiração no passado
- **Sem VIP**: Usuário sem dados VIP

## 📝 Notas Técnicas

### **Performance**
- Timer otimizado (1 minuto)
- Computed properties eficientes
- Cleanup automático de timers
- Carregamento sob demanda (apenas para usuários VIP)

### **Acessibilidade**
- Tooltips informativos
- Contraste adequado
- Navegação por teclado

### **Compatibilidade**
- Suporte a diferentes formatos de data
- Fallbacks para dados ausentes
- Graceful degradation

---

**Sistema implementado com sucesso! ✅**

O sistema de perfil de usuário com controle de expiração está totalmente funcional e segue todas as especificações solicitadas. A interface é intuitiva, responsiva e fornece feedback visual claro sobre o status da conta do usuário.
