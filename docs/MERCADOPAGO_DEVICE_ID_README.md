# Identificador de Dispositivo - Mercado Pago

## Visão Geral

Este documento descreve a implementação do identificador de dispositivo (Device ID) do Mercado Pago para melhorar a segurança dos pagamentos e reduzir fraudes.

## O que é o Device ID?

O Device ID é um identificador único gerado para cada dispositivo que acessa a aplicação. Ele ajuda o Mercado Pago a:

- Identificar dispositivos confiáveis
- Detectar tentativas de fraude
- Melhorar a aprovação de pagamentos
- Reduzir falsos positivos

## Implementação

### 1. Geração do Device ID

O Device ID é gerado baseado em características únicas do dispositivo:

```javascript
generateDeviceId() {
  // Gerar um ID único baseado em características do dispositivo
  let deviceId = localStorage.getItem('mercadopago_device_id')
  
  if (!deviceId) {
    // Combinar informações do navegador para criar um ID único
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    ctx.textBaseline = 'top'
    ctx.font = '14px Arial'
    ctx.fillText('Device fingerprint', 2, 2)
    
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      canvas.toDataURL(),
      navigator.hardwareConcurrency || 'unknown',
      navigator.maxTouchPoints || 'unknown'
    ].join('|')
    
    // Criar hash simples do fingerprint
    deviceId = this.simpleHash(fingerprint)
    
    // Salvar no localStorage para reutilização
    localStorage.setItem('mercadopago_device_id', deviceId)
  }
  
  return deviceId
}
```

### 2. Configuração no SDK

O Device ID é configurado automaticamente quando o SDK do Mercado Pago é carregado:

```javascript
initializeDeviceId() {
  // Gerar identificador único de dispositivo
  this.deviceId = this.generateDeviceId()
  
  // Configurar device ID no SDK do Mercado Pago
  if (window.Mercadopago && window.Mercadopago.setDeviceId) {
    window.Mercadopago.setDeviceId(this.deviceId)
    console.log('Device ID configurado:', this.deviceId)
  }
}
```

### 3. Uso na Tokenização

O Device ID é incluído automaticamente na tokenização do cartão:

```javascript
const cardData = {
  cardNumber: this.checkoutData.cardNumber.replace(/\s/g, ''),
  cardholderName: this.checkoutData.cardName,
  expirationMonth: this.checkoutData.expiry.split('/')[0],
  expirationYear: '20' + this.checkoutData.expiry.split('/')[1],
  securityCode: this.checkoutData.cvv,
  // Incluir device ID para melhor segurança
  deviceId: this.deviceId
}
```

### 4. Uso no Pagamento

O Device ID também é enviado nos dados do pagamento:

```javascript
const paymentData = {
  // ... outros dados do pagamento
  device_id: this.deviceId
}
```

## Características do Fingerprint

O Device ID é gerado usando as seguintes características do dispositivo:

1. **User Agent**: Identifica o navegador e sistema operacional
2. **Idioma**: Configuração de idioma do navegador
3. **Resolução**: Largura e altura da tela
4. **Fuso Horário**: Offset do fuso horário
5. **Canvas Fingerprint**: Renderização única do canvas
6. **CPU Cores**: Número de cores do processador
7. **Touch Points**: Capacidade de toque da tela

## Persistência

- O Device ID é salvo no `localStorage` para reutilização
- Chave: `mercadopago_device_id`
- Persiste entre sessões do navegador
- É regenerado apenas se não existir

## Segurança

- O Device ID não contém informações pessoais
- É baseado apenas em características técnicas do dispositivo
- Não pode ser usado para rastrear usuários entre sites diferentes
- É específico para esta aplicação

## Benefícios

1. **Maior Aprovação**: Pagamentos de dispositivos conhecidos têm maior chance de aprovação
2. **Detecção de Fraude**: Dispositivos suspeitos são identificados automaticamente
3. **Melhor Experiência**: Usuários legítimos enfrentam menos bloqueios
4. **Conformidade**: Atende às recomendações de segurança do Mercado Pago

## Logs e Debug

O sistema registra logs para facilitar o debug:

```javascript
console.log('Device ID configurado:', this.deviceId)
console.log('Criando token do cartão com device ID:', this.deviceId)
```

## Compatibilidade

- Funciona com todos os navegadores modernos
- Não interfere no layout da aplicação
- Implementação transparente para o usuário
- Compatível com o SDK oficial do Mercado Pago v2

## Monitoramento

Para monitorar a eficácia do Device ID:

1. Verifique os logs do console para confirmação de configuração
2. Monitore as taxas de aprovação de pagamento
3. Acompanhe relatórios de fraude no painel do Mercado Pago
4. Verifique se o Device ID está sendo enviado nas requisições

## Troubleshooting

### Device ID não está sendo gerado
- Verifique se o localStorage está habilitado
- Confirme se o SDK do Mercado Pago foi carregado corretamente

### Device ID não está sendo enviado
- Verifique se `this.deviceId` não é null
- Confirme se o SDK suporta `setDeviceId()`

### Pagamentos ainda sendo rejeitados
- O Device ID é apenas uma das medidas de segurança
- Verifique outros fatores como dados do cartão e endereço
- Consulte a documentação do Mercado Pago para outras recomendações
