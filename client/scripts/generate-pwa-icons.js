const fs = require('fs');
const path = require('path');

// Configurações dos ícones PWA
const ICON_SIZES = [
  { size: 16, name: 'logo-16x16.png' },
  { size: 32, name: 'logo-32x32.png' },
  { size: 72, name: 'logo-72x72.png' },
  { size: 96, name: 'logo-96x96.png' },
  { size: 128, name: 'logo-128x128.png' },
  { size: 144, name: 'logo-144x144.png' },
  { size: 152, name: 'logo-152x152.png' },
  { size: 192, name: 'logo-192x192.png' },
  { size: 384, name: 'logo-384x384.png' },
  { size: 512, name: 'logo-512x512.png' },
  { size: 150, name: 'logo-150x150.png' } // Para Windows
];

// Cores do tema
const THEME_COLORS = {
  primary: '#6366f1',
  secondary: '#8b5cf6',
  background: '#1a1a1a',
  text: '#ffffff'
};

// SVG base para o logo
const LOGO_SVG = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${THEME_COLORS.primary};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${THEME_COLORS.secondary};stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Fundo circular -->
  <circle cx="256" cy="256" r="240" fill="url(#grad1)" stroke="${THEME_COLORS.background}" stroke-width="8"/>
  
  <!-- Símbolo S estilizado -->
  <path d="M 180 120 Q 180 100 200 100 L 280 100 Q 300 100 300 120 L 300 160 Q 300 180 280 180 L 220 180 Q 200 180 200 200 L 200 240 Q 200 260 220 260 L 300 260 Q 320 260 320 280 L 320 320 Q 320 340 300 340 L 220 340 Q 200 340 200 320 L 200 280 Q 200 260 180 260 L 120 260 Q 100 260 100 240 L 100 200 Q 100 180 120 180 L 180 180 Q 200 180 200 160 L 200 120 Q 200 100 180 120 Z" 
        fill="${THEME_COLORS.background}" opacity="0.9"/>
  
  <!-- Destaque -->
  <circle cx="200" cy="200" r="20" fill="${THEME_COLORS.background}" opacity="0.3"/>
  <circle cx="280" cy="280" r="15" fill="${THEME_COLORS.background}" opacity="0.2"/>
</svg>
`;

// Função para criar diretório se não existir
function ensureDirectoryExists(directory) {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
    console.log(`✅ Diretório criado: ${directory}`);
  }
}

// Função para gerar ícone SVG
function generateSVGIcon(size, filename) {
  const svgContent = LOGO_SVG.replace(/width="512"/, `width="${size}"`).replace(/height="512"/, `height="${size}"`);
  const filePath = path.join(__dirname, '..', 'public', 'img', filename.replace('.png', '.svg'));
  
  fs.writeFileSync(filePath, svgContent);
  console.log(`✅ SVG gerado: ${filename.replace('.png', '.svg')} (${size}x${size})`);
}

// Função para gerar ícones PNG (placeholder)
function generatePNGIcon(size, filename) {
  const filePath = path.join(__dirname, '..', 'public', 'img', filename);
  
  // Criar um arquivo placeholder (você precisará converter o SVG para PNG)
  const placeholderContent = `# Placeholder para ${filename}
# Este arquivo deve ser substituído por uma imagem PNG real de ${size}x${size} pixels
# Você pode usar ferramentas online como:
# - https://convertio.co/svg-png/
# - https://cloudconvert.com/svg-to-png
# - https://www.icoconverter.com/
# 
# Ou usar o comando ImageMagick:
# magick logo.svg -resize ${size}x${size} ${filename}`;
  
  fs.writeFileSync(filePath, placeholderContent);
  console.log(`⚠️  Placeholder criado: ${filename} (${size}x${size}) - Converta para PNG`);
}

// Função principal
function generatePWAIcons() {
  console.log('🚀 Gerando ícones PWA para SureStake...\n');
  
  // Criar diretório de imagens se não existir
  const imgDir = path.join(__dirname, '..', 'public', 'img');
  ensureDirectoryExists(imgDir);
  
  // Gerar ícones SVG
  console.log('📱 Gerando ícones SVG...');
  ICON_SIZES.forEach(({ size, name }) => {
    generateSVGIcon(size, name);
  });
  
  console.log('\n🖼️  Gerando placeholders PNG...');
  ICON_SIZES.forEach(({ size, name }) => {
    generatePNGIcon(size, name);
  });
  
  console.log('\n✨ Ícones PWA gerados com sucesso!');
  console.log('\n📋 Próximos passos:');
  console.log('1. Converta os arquivos SVG para PNG usando ferramentas online');
  console.log('2. Ou use o comando ImageMagick: magick logo.svg -resize SIZExSIZE filename.png');
  console.log('3. Substitua os placeholders pelos arquivos PNG reais');
  console.log('4. Teste a instalação do PWA no navegador');
  
  // Criar arquivo de instruções
  const instructionsPath = path.join(__dirname, '..', 'public', 'img', 'README-ICONS.md');
  const instructions = `# Instruções para Ícones PWA

## Arquivos Gerados

Este diretório contém os ícones necessários para o PWA SureStake.

### Tamanhos Necessários

${ICON_SIZES.map(icon => `- ${icon.name} (${icon.size}x${icon.size}px)`).join('\n')}

### Como Converter SVG para PNG

1. **Ferramentas Online:**
   - https://convertio.co/svg-png/
   - https://cloudconvert.com/svg-to-png
   - https://www.icoconverter.com/

2. **ImageMagick (CLI):**
   \`\`\`bash
   magick logo.svg -resize 192x192 logo-192x192.png
   magick logo.svg -resize 512x512 logo-512x512.png
   \`\`\`

3. **Inkscape (GUI):**
   - Abra o arquivo SVG
   - File > Export PNG Image
   - Defina o tamanho desejado
   - Export

### Verificação

Após converter todos os ícones:
1. Verifique se todos os arquivos PNG existem
2. Teste a instalação do PWA
3. Verifique se o ícone aparece corretamente na tela inicial

### Notas

- Os ícones devem ter fundo transparente ou sólido
- Use cores consistentes com o tema da aplicação
- Teste em diferentes dispositivos e navegadores
`;

  fs.writeFileSync(instructionsPath, instructions);
  console.log(`\n📖 Instruções salvas em: ${instructionsPath}`);
}

// Executar se chamado diretamente
if (require.main === module) {
  generatePWAIcons();
}

module.exports = { generatePWAIcons, ICON_SIZES, LOGO_SVG };
