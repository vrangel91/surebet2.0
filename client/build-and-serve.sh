#!/bin/bash

echo "🚀 Construindo projeto SureStake..."
echo

# Construir o projeto
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Erro na construção do projeto"
    exit 1
fi

echo "✅ Projeto construído com sucesso!"
echo

# Entrar na pasta dist
cd dist

echo "🌐 Iniciando servidor na porta 8080..."
echo "📱 Acesse: http://localhost:8080"
echo "🔌 Certifique-se de que o backend está rodando na porta 3000"
echo

# Iniciar servidor
npx serve -s . -p 8080
