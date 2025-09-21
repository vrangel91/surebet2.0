# 📱 PWA SureStake - Configuração e Teste

## 🎯 Visão Geral

O SureStake foi configurado como uma Progressive Web App (PWA) completa, permitindo que os usuários instalem a aplicação diretamente em seus dispositivos móveis e desktop.

## 🚀 Configuração Atual

### ✅ Ícones PWA
- **Favicon base**: Usa o `favicon.svg` existente como base
- **Tamanhos gerados**: 16x16, 32x32, 72x72, 96x96, 128x128, 144x144, 152x152, 192x192, 384x384, 512x512, 150x150
- **Formatos**: PNG (otimizado) e SVG (escalável)
- **Cores**: Gradiente azul/roxo (#6366f1 → #8b5cf6) com fundo escuro

### 📋 Manifest.json
- **Nome**: SureStake
- **Tema**: Verde neon (#00ff88)
- **Fundo**: Escuro (#1a1a1a)
- **Orientação**: Portrait (mobile-first)
- **Categorias**: Sports, Finance, Entertainment

### 🔧 Service Worker
- **Modo**: InjectManifest (personalizado)
- **Cache**: Estratégia inteligente para assets estáticos
- **Offline**: Suporte básico para navegação offline

## 🛠️ Comandos Disponíveis

```bash
# Gerar ícones PWA a partir do favicon
npm run pwa:generate-icons

# Testar configuração do PWA
npm run pwa:test

# Configuração completa (gerar + testar)
npm run pwa:setup
```

## 📱 Como Testar o PWA

### 1. Desenvolvimento Local
```bash
npm run serve
# Acesse: https://localhost:3001
```

### 2. Verificação no Navegador
1. Abra as **Ferramentas de Desenvolvedor** (F12)
2. Vá para a aba **Application** > **Manifest**
3. Verifique se todos os ícones aparecem corretamente
4. Teste a instalação do PWA

### 3. Instalação do PWA
- **Chrome/Edge**: Ícone de instalação na barra de endereços
- **Firefox**: Menu "Instalar" no menu de aplicações
- **Safari**: Compartilhar > Adicionar à Tela Inicial

## 🎨 Personalização dos Ícones

### Alterar o Ícone Base
1. Substitua o arquivo `public/favicon.svg`
2. Execute: `npm run pwa:generate-icons`
3. Teste: `npm run pwa:test`

### Cores do Tema
Edite o arquivo `scripts/generate-pwa-icons.js`:
```javascript
const THEME_COLORS = {
  primary: '#6366f1',    // Cor primária
  secondary: '#8b5cf6',  // Cor secundária
  background: '#1a1a1a', // Cor de fundo
  text: '#ffffff'        // Cor do texto
};
```

## 📊 Verificação de Qualidade

O script de teste verifica:
- ✅ Existência de todos os arquivos de ícone
- ✅ Validade do manifest.json
- ✅ Configuração correta dos ícones
- ✅ Tamanhos e formatos adequados

## 🔄 Atualizações

### Regenerar Ícones
```bash
npm run pwa:generate-icons
```

### Verificar Configuração
```bash
npm run pwa:test
```

### Configuração Completa
```bash
npm run pwa:setup
```

## 📱 Compatibilidade

- ✅ **Android**: Chrome, Firefox, Samsung Internet
- ✅ **iOS**: Safari (iOS 11.3+)
- ✅ **Desktop**: Chrome, Edge, Firefox
- ✅ **Windows**: Edge, Chrome
- ✅ **macOS**: Safari, Chrome

## 🐛 Solução de Problemas

### Ícones não aparecem
1. Verifique se os arquivos PNG existem em `public/img/`
2. Execute: `npm run pwa:test`
3. Limpe o cache do navegador

### PWA não instala
1. Verifique se está usando HTTPS
2. Confirme se o manifest.json é válido
3. Teste em modo incógnito

### Ícones pixelados
1. Regenerar ícones: `npm run pwa:generate-icons`
2. Verificar se os arquivos PNG foram criados corretamente

## 📚 Recursos Adicionais

- [PWA Checklist](https://web.dev/pwa-checklist/)
- [Manifest Generator](https://app-manifest.firebaseapp.com/)
- [PWA Builder](https://www.pwabuilder.com/)

---

**Desenvolvido com ❤️ para SureStake**

