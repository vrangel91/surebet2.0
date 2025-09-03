# 🧪 Instruções para Testar o PWA - SureStake

## 📋 Pré-requisitos

1. **Navegador Compatível**: Chrome, Edge, Firefox ou Safari
2. **HTTPS ou localhost**: PWA só funciona em ambiente seguro
3. **Arquivos construídos**: Execute `npm run build` primeiro

## 🚀 Como Testar

### 1. **Construir o Projeto**
```bash
npm run build
```

### 2. **Iniciar Servidor Local**
```bash
cd dist
python -m http.server 8080
# ou
npx serve -s . -p 8080
```

### 3. **Acessar a Aplicação**
- Abra o navegador e vá para: `http://localhost:8080`
- Para o arquivo de teste: `http://localhost:8080/test-pwa.html`

## 🔍 Verificações no Navegador

### **Chrome/Edge DevTools**
1. Abra DevTools (F12)
2. Vá para a aba **"Application"**
3. Verifique:
   - **Manifest**: Deve mostrar o manifesto do PWA
   - **Service Workers**: Deve mostrar o SW registrado
   - **Storage**: Deve mostrar caches criados

### **Console do Navegador**
Procure por logs com prefixo `[PWA]`:
```
[PWA] Verificando instalação...
[PWA] Navegador suporta PWA
[PWA] Evento beforeinstallprompt capturado!
```

## 📱 Testando a Instalação

### **Banner de Instalação**
1. Aguarde 3 segundos após carregar a página
2. Deve aparecer um banner "Instalar SureStake"
3. Clique em "Instalar"
4. Confirme a instalação no navegador

### **Botão de Instalação do Navegador**
1. Procure pelo ícone de instalação na barra de endereços
2. Clique no ícone (geralmente um "+" ou "↓")
3. Confirme a instalação

## 🚨 Problemas Comuns e Soluções

### **"PWA já instalado ou não disponível para instalação"**

**Causas:**
- Evento `beforeinstallprompt` não foi capturado
- Service Worker não está registrado
- Manifesto não está sendo carregado

**Soluções:**
1. **Verificar Service Worker:**
   ```javascript
   // No console do navegador
   navigator.serviceWorker.getRegistrations().then(registrations => {
     console.log('SWs registrados:', registrations);
   });
   ```

2. **Verificar Manifesto:**
   ```javascript
   // No console do navegador
   console.log('Manifest:', document.querySelector('link[rel="manifest"]'));
   ```

3. **Verificar Evento beforeinstallprompt:**
   ```javascript
   // No console do navegador
   console.log('beforeinstallprompt disponível:', 'beforeinstallprompt' in window);
   ```

### **Banner não aparece**

**Causas:**
- PWA já está instalado
- Usuário fechou o banner anteriormente
- Dispositivo móvel (banner só aparece em desktop)

**Soluções:**
1. **Limpar localStorage:**
   ```javascript
   // No console do navegador
   localStorage.removeItem('pwa-banner-dismissed');
   ```

2. **Verificar se é dispositivo móvel:**
   ```javascript
   // No console do navegador
   const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
   console.log('É dispositivo móvel:', isMobile);
   ```

### **Service Worker não registra**

**Causas:**
- Arquivo `sw.js` não existe
- Erro no código do Service Worker
- Problema de CORS

**Soluções:**
1. **Verificar arquivo:**
   - Confirme que `dist/sw.js` existe
   - Verifique se não há erros de sintaxe

2. **Verificar console:**
   - Procure por erros relacionados ao Service Worker

3. **Verificar rede:**
   - Na aba Network do DevTools, procure por `sw.js`

## 🧪 Arquivo de Teste

Use o arquivo `test-pwa.html` para testes isolados:

1. **Acesse:** `http://localhost:8080/test-pwa.html`
2. **Clique em:** "Verificar Status" para ver o que está funcionando
3. **Clique em:** "Registrar Service Worker" para registrar o SW
4. **Clique em:** "Verificar Instalação" para ver se pode instalar
5. **Clique em:** "Instalar PWA" para testar a instalação

## 🔧 Debug Avançado

### **Verificar Estado do PWA**
```javascript
// No console do navegador
console.log('PWA Status:', {
  serviceWorker: 'serviceWorker' in navigator,
  pushManager: 'PushManager' in window,
  notifications: 'Notification' in window,
  caches: 'caches' in window,
  beforeinstallprompt: 'beforeinstallprompt' in window,
  standalone: window.matchMedia('(display-mode: standalone)').matches
});
```

### **Verificar Service Worker**
```javascript
// No console do navegador
navigator.serviceWorker.ready.then(registration => {
  console.log('SW pronto:', registration);
  console.log('SW ativo:', navigator.serviceWorker.controller);
});
```

### **Verificar Cache**
```javascript
// No console do navegador
caches.keys().then(names => {
  console.log('Caches disponíveis:', names);
});
```

## 📱 Testando em Dispositivos Reais

### **Android (Chrome)**
1. Abra o Chrome no Android
2. Acesse a aplicação
3. Deve aparecer "Adicionar à tela inicial"
4. Toque para instalar

### **iOS (Safari)**
1. Abra o Safari no iOS
2. Acesse a aplicação
3. Toque no botão de compartilhar
4. Selecione "Adicionar à tela inicial"

## ✅ Checklist de Verificação

- [ ] Service Worker registrado sem erros
- [ ] Manifesto carregado corretamente
- [ ] Evento `beforeinstallprompt` capturado
- [ ] Banner de instalação aparece
- [ ] Botão de instalação funciona
- [ ] PWA instala sem erros
- [ ] Funciona offline (página offline)
- [ ] Cache funcionando

## 🆘 Suporte

Se ainda houver problemas:

1. **Verifique o console** do navegador para erros
2. **Use o arquivo de teste** para isolamento
3. **Teste em navegador diferente** para comparar
4. **Verifique se está em HTTPS/localhost**
5. **Confirme que todos os arquivos foram construídos**

## 🎯 Resultado Esperado

Após seguir todos os passos, você deve conseguir:
- ✅ Ver o banner de instalação
- ✅ Instalar o PWA na tela inicial
- ✅ Abrir o app como aplicativo nativo
- ✅ Usar funcionalidades offline
- ✅ Receber notificações de atualização
