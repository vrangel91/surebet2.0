#!/bin/bash

echo "🚀 Otimizando build do projeto..."

# Limpar caches antigos
echo "🧹 Limpando caches antigos..."
cd /var/www/surebet/client
rm -rf node_modules/.cache
rm -rf dist
rm -rf .nuxt
rm -rf .next

# Limpar cache do npm
echo "📦 Limpando cache do npm..."
npm cache clean --force

# Reinstalar dependências de forma otimizada
echo "⬇️ Reinstalando dependências..."
npm ci --only=production --no-audit --no-fund --prefer-offline

# Criar diretório de cache
echo "📁 Criando diretório de cache..."
mkdir -p node_modules/.cache/webpack

# Testar build otimizado
echo "🔨 Testando build otimizado..."
time npm run build:fast

echo "✅ Otimização concluída!"
