# Instruções para Ícones PWA

## Arquivos Gerados

Este diretório contém os ícones necessários para o PWA SureStake.

### Tamanhos Necessários

- logo-16x16.png (16x16px)
- logo-32x32.png (32x32px)
- logo-72x72.png (72x72px)
- logo-96x96.png (96x96px)
- logo-128x128.png (128x128px)
- logo-144x144.png (144x144px)
- logo-152x152.png (152x152px)
- logo-192x192.png (192x192px)
- logo-384x384.png (384x384px)
- logo-512x512.png (512x512px)
- logo-150x150.png (150x150px)

### Como Converter SVG para PNG

1. **Ferramentas Online:**
   - https://convertio.co/svg-png/
   - https://cloudconvert.com/svg-to-png
   - https://www.icoconverter.com/

2. **ImageMagick (CLI):**
   ```bash
   magick logo.svg -resize 192x192 logo-192x192.png
   magick logo.svg -resize 512x512 logo-512x512.png
   ```

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
