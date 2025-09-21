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

// Cores do tema (usando as cores do favicon existente)
const THEME_COLORS = {
  primary: '#6366f1',
  secondary: '#8b5cf6',
  background: '#1a1a1a',
  text: '#ffffff'
};

// SVG base para o logo (usando o favicon existente como base)
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

// Função para ler o favicon SVG existente
function getFaviconSVG() {
  try {
    const faviconPath = path.join(__dirname, '..', 'public', 'favicon.svg');
    if (fs.existsSync(faviconPath)) {
      return fs.readFileSync(faviconPath, 'utf8');
    }
  } catch (error) {
    console.log('⚠️  Não foi possível ler o favicon.svg, usando SVG padrão');
  }
  return LOGO_SVG;
}

// Função para criar diretório se não existir
function ensureDirectoryExists(directory) {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
    console.log(`✅ Diretório criado: ${directory}`);
  }
}

// Função para gerar ícone SVG
function generateSVGIcon(size, filename) {
  // Usar o favicon SVG existente como base
  const faviconSVG = getFaviconSVG();
  const svgContent = faviconSVG.replace(/width="32"/, `width="${size}"`).replace(/height="32"/, `height="${size}"`);
  const filePath = path.join(__dirname, '..', 'public', 'img', filename.replace('.png', '.svg'));
  
  fs.writeFileSync(filePath, svgContent);
  console.log(`✅ SVG gerado: ${filename.replace('.png', '.svg')} (${size}x${size})`);
}

// Função para gerar ícones PNG
async function generatePNGIcon(size, filename) {
  const filePath = path.join(__dirname, '..', 'public', 'img', filename);
  const svgPath = path.join(__dirname, '..', 'public', 'img', filename.replace('.png', '.svg'));
  
  try {
    if (fs.existsSync(svgPath)) {
      // Usar Sharp para converter SVG para PNG
      const sharp = require('sharp');
      
      await sharp(svgPath)
        .resize(size, size)
        .png()
        .toFile(filePath);
      
      console.log(`✅ PNG gerado: ${filename} (${size}x${size})`);
      return;
    }
  } catch (error) {
    console.log(`⚠️  Erro ao converter ${filename}: ${error.message}`);
  }
  
  // Fallback: criar placeholder se a conversão falhar
  const placeholderContent = `# Placeholder para ${filename}
# Este arquivo deve ser substituído por uma imagem PNG real de ${size}x${size} pixels
# 
# Para converter manualmente, use ferramentas online:
# - https://convertio.co/svg-png/
# - https://cloudconvert.com/svg-to-png
# - https://www.icoconverter.com/`;
  
  fs.writeFileSync(filePath, placeholderContent);
  console.log(`⚠️  Placeholder criado: ${filename} (${size}x${size}) - Converta para PNG`);
}

// Função principal
async function generatePWAIcons() {
  console.log('🚀 Gerando ícones PWA para SureStake usando o favicon existente...\n');
  
  // Verificar se o favicon existe
  const faviconPath = path.join(__dirname, '..', 'public', 'favicon.svg');
  if (!fs.existsSync(faviconPath)) {
    console.log('❌ Erro: favicon.svg não encontrado em public/favicon.svg');
    console.log('   Certifique-se de que o arquivo existe antes de executar este script.');
    return;
  }
  
  console.log('✅ Favicon encontrado, usando como base para os ícones PWA\n');
  
  // Criar diretório de imagens se não existir
  const imgDir = path.join(__dirname, '..', 'public', 'img');
  ensureDirectoryExists(imgDir);
  
  // Gerar ícones SVG
  console.log('📱 Gerando ícones SVG...');
  ICON_SIZES.forEach(({ size, name }) => {
    generateSVGIcon(size, name);
  });
  
  console.log('\n🖼️  Gerando ícones PNG...');
  for (const { size, name } of ICON_SIZES) {
    await generatePNGIcon(size, name);
  }
  
  console.log('\n✨ Ícones PWA gerados com sucesso!');
  console.log('\n📋 Próximos passos:');
  console.log('1. Verifique se todos os arquivos PNG foram gerados corretamente');
  console.log('2. Teste a instalação do PWA no navegador');
  console.log('3. Verifique se o ícone aparece corretamente na tela inicial');
  
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
  generatePWAIcons().catch(console.error);
}

module.exports = { generatePWAIcons, ICON_SIZES, LOGO_SVG };
