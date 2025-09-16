#!/bin/bash

# Script para build automático do frontend
echo "🚀 Iniciando build automático do frontend..."

# Função para fazer build
build_frontend() {
    echo "📦 Executando npm run build..."
    npm run build
    
    if [ $? -eq 0 ]; then
        echo "✅ Build concluído com sucesso!"
        echo "🔄 Reiniciando servidor PM2..."
        pm2 restart surestake
    else
        echo "❌ Erro no build!"
        exit 1
    fi
}

# Fazer build inicial
build_frontend

# Monitorar mudanças nos arquivos
echo "👀 Monitorando mudanças nos arquivos..."
echo "Pressione Ctrl+C para parar"

# Usar inotifywait para monitorar mudanças
while inotifywait -r -e modify,create,delete /var/www/surebet/client/src/; do
    echo "🔄 Mudança detectada, fazendo rebuild..."
    build_frontend
done
