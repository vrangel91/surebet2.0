#!/bin/bash

# Script para corrigir comentários CSS nos arquivos de tema

# Arquivo dark-theme.scss
sed -i 's|^/\* \([A-Za-z].*\)$|/* \1 */|g' /var/www/surebet/client/src/assets/styles/dark-theme.scss

# Arquivo light-theme.scss  
sed -i 's|^/\* \([A-Za-z].*\)$|/* \1 */|g' /var/www/surebet/client/src/assets/styles/light-theme.scss

echo "Comentários corrigidos!"
