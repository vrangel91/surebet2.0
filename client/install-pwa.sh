#!/bin/bash

echo "========================================"
echo "    Instalador PWA - SureStake"
echo "========================================"
echo

echo "[1/4] Instalando dependencias..."
npm install
if [ $? -ne 0 ]; then
    echo "ERRO: Falha ao instalar dependencias"
    exit 1
fi

echo "[2/4] Gerando icones PWA..."
node scripts/generate-pwa-icons.js
if [ $? -ne 0 ]; then
    echo "ERRO: Falha ao gerar icones"
    exit 1
fi

echo "[3/4] Construindo projeto..."
npm run build
if [ $? -ne 0 ]; then
    echo "ERRO: Falha ao construir projeto"
    exit 1
fi

echo "[4/4] Configuracao PWA concluida!"
echo
echo "========================================"
echo "    PWA Configurado com Sucesso!"
echo "========================================"
echo
echo "Proximos passos:"
echo "1. Converta os arquivos SVG para PNG em client/public/img/"
echo "2. Teste a instalacao do PWA no navegador"
echo "3. Verifique se o Service Worker esta funcionando"
echo
echo "Para testar localmente:"
echo "  npm run serve"
echo
echo "Para tornar o script executavel:"
echo "  chmod +x install-pwa.sh"
echo
