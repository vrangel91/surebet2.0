# Sistema de Temas - Surebet

## Visão Geral

Este sistema de temas foi criado para fornecer uma solução modular e organizada para gerenciar cores em toda a aplicação Surebet. Os temas estão separados em arquivos individuais para facilitar manutenção e customização.

## Estrutura de Arquivos

```
assets/styles/
├── dark-theme.scss      # Tema escuro (padrão)
├── light-theme.scss     # Tema claro
├── themes.scss          # Arquivo de índice que importa ambos os temas
├── main.scss            # Arquivo principal que importa themes.scss
└── README-THEMES.md     # Esta documentação
```

## Como Funciona

### 1. Tema Escuro (Padrão)
- Definido em `:root` (seletor global)
- Aplicado automaticamente quando nenhum tema específico está ativo
- Cores escuras com destaque verde (#00ff88)

### 2. Tema Claro
- Definido em `[data-theme="light"]`
- Ativado quando o atributo `data-theme="light"` é adicionado ao elemento `<html>`
- Cores claras com destaque verde (#198754)

## Como Usar

### Importação Básica

Para usar os temas em qualquer componente Vue, importe o arquivo de temas:

```scss
<style lang="scss" scoped>
@import '@/assets/styles/themes.scss';

.meu-componente {
  background: var(--bg-primary);
  color: var(--text-primary);
  border: 1px solid var(--border-primary);
}
</style>
```

### Alternando Temas via JavaScript

```javascript
// Aplicar tema claro
document.documentElement.setAttribute('data-theme', 'light');

// Aplicar tema escuro (padrão)
document.documentElement.removeAttribute('data-theme');
// ou
document.documentElement.setAttribute('data-theme', 'dark');
```

### Alternando Temas via Vue

```javascript
// No seu componente Vue
export default {
  methods: {
    setTheme(theme) {
      if (theme === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
      } else {
        document.documentElement.removeAttribute('data-theme');
      }
      
      // Opcional: salvar preferência no localStorage
      localStorage.setItem('theme', theme);
    }
  },
  
  mounted() {
    // Restaurar tema salvo
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      this.setTheme(savedTheme);
    }
  }
}
```

## Variáveis Disponíveis

### Backgrounds
- `--bg-primary`: Fundo principal
- `--bg-secondary`: Fundo secundário
- `--bg-tertiary`: Fundo terciário
- `--bg-card`: Fundo de cards
- `--bg-modal`: Fundo de modais
- `--bg-input`: Fundo de inputs
- `--bg-overlay`: Fundo de overlays

### Textos
- `--text-primary`: Texto principal
- `--text-secondary`: Texto secundário
- `--text-tertiary`: Texto terciário
- `--text-accent`: Texto de destaque
- `--text-muted`: Texto atenuado
- `--text-disabled`: Texto desabilitado

### Bordas
- `--border-primary`: Borda principal
- `--border-secondary`: Borda secundária
- `--border-accent`: Borda de destaque
- `--border-input`: Borda de inputs
- `--border-card`: Borda de cards

### Cores de Status
- `--success`: Cor de sucesso
- `--error`: Cor de erro
- `--warning`: Cor de aviso
- `--info`: Cor de informação

### Botões
- `--button-primary-bg`: Fundo do botão primário
- `--button-primary-text`: Texto do botão primário
- `--button-secondary-bg`: Fundo do botão secundário
- `--button-secondary-text`: Texto do botão secundário

### Sombras
- `--shadow`: Sombra padrão
- `--shadow-hover`: Sombra no hover
- `--shadow-card`: Sombra de cards
- `--shadow-modal`: Sombra de modais

### Gráficos
- `--chart-bg`: Fundo de gráficos
- `--chart-text`: Texto de gráficos
- `--chart-grid`: Grade de gráficos
- `--chart-accent`: Destaque de gráficos

## Exemplos de Uso

### Card Básico
```scss
.card {
  background: var(--bg-card);
  color: var(--text-primary);
  border: 1px solid var(--border-card);
  border-radius: 12px;
  padding: 20px;
  box-shadow: var(--shadow-card);
  
  .card-title {
    color: var(--text-accent);
    font-weight: 600;
  }
  
  .card-content {
    color: var(--text-secondary);
  }
}
```

### Botão
```scss
.btn {
  background: var(--button-primary-bg);
  color: var(--button-primary-text);
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-button);
  }
  
  &.btn-secondary {
    background: var(--button-secondary-bg);
    color: var(--button-secondary-text);
  }
}
```

### Input
```scss
.input {
  background: var(--input-bg);
  color: var(--input-text);
  border: 1px solid var(--border-input);
  border-radius: 8px;
  padding: 12px 16px;
  transition: all 0.3s ease;
  
  &:focus {
    border-color: var(--border-input-focus);
    box-shadow: var(--shadow-input-focus);
    outline: none;
  }
  
  &:hover {
    border-color: var(--border-input-hover);
  }
  
  &::placeholder {
    color: var(--text-placeholder);
  }
}
```

### Tabela
```scss
.table {
  background: var(--table-bg);
  border: 1px solid var(--table-border);
  border-radius: 8px;
  overflow: hidden;
  
  .table-header {
    background: var(--table-header-bg);
    color: var(--table-header-text);
    font-weight: 600;
  }
  
  .table-row {
    border-bottom: 1px solid var(--table-row-border);
    
    &:hover {
      background: var(--table-bg-hover);
    }
    
    &:last-child {
      border-bottom: none;
    }
  }
}
```

## Migração de Código Existente

### Antes (Código Legado)
```scss
.component {
  background: #1a1a1a;
  color: #ffffff;
  border: 1px solid #404040;
}
```

### Depois (Com Variáveis CSS)
```scss
.component {
  background: var(--bg-primary);
  color: var(--text-primary);
  border: 1px solid var(--border-primary);
}
```

## Adicionando Novas Cores

Para adicionar novas cores ao sistema:

1. **Adicione a variável no tema escuro** (`dark-theme.scss`):
```scss
:root {
  --nova-cor: #valor;
}
```

2. **Adicione a variável no tema claro** (`light-theme.scss`):
```scss
[data-theme="light"] {
  --nova-cor: #valor-claro;
}
```

3. **Use a variável em seus componentes**:
```scss
.meu-elemento {
  background: var(--nova-cor);
}
```

## Boas Práticas

1. **Sempre use variáveis CSS** em vez de cores hardcoded
2. **Mantenha consistência** na nomenclatura das variáveis
3. **Teste ambos os temas** ao desenvolver novos componentes
4. **Use transições suaves** para mudanças de tema
5. **Documente novas variáveis** quando necessário

## Troubleshooting

### Tema não está funcionando
- Verifique se o arquivo `themes.scss` está sendo importado
- Confirme se o atributo `data-theme` está sendo definido corretamente
- Verifique se não há conflitos CSS

### Cores não estão mudando
- Certifique-se de que está usando variáveis CSS (`var(--nome-variavel)`)
- Verifique se a variável existe em ambos os temas
- Confirme se o seletor CSS está correto

### Performance
- As variáveis CSS são muito eficientes
- Evite usar muitas variáveis desnecessárias
- Considere agrupar variáveis relacionadas

## Suporte

Para dúvidas ou problemas com o sistema de temas:

1. Verifique esta documentação
2. Consulte os exemplos nos arquivos de tema
3. Verifique se a variável existe em ambos os temas
4. Teste em um componente simples primeiro

---

**Nota**: Este sistema foi projetado para ser extensível e fácil de manter. Qualquer dúvida sobre implementação pode ser resolvida seguindo os padrões estabelecidos nos arquivos existentes.
