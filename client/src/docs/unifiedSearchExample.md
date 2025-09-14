# Sistema de Busca Unificada - Exemplo de Uso

## Visão Geral

O sistema de busca unificada permite aos usuários pesquisar por:

- **Mercados** (ex: "Escanteios", "Handicap", "Over/Under")
- **Casas de Apostas** (ex: "Bet365", "Betano", "Pinnacle")
- **Campeonatos** (ex: "Premier League", "Brasileirão", "Champions League")
- **Esportes** (ex: "Futebol", "Basquete", "Tênis")

## Funcionalidades Implementadas

### ✅ **Campo de Busca Unificado**

- Campo único que substitui a busca separada por mercado
- Placeholder informativo: "Pesquisar por mercado, casa de apostas ou campeonato..."
- Busca inteligente em tempo real

### ✅ **Sugestões Automáticas**

- Lista de sugestões aparece ao focar no campo
- Categorizadas por tipo (Mercado, Casa, Campeonato, Esporte)
- Máximo de 8 sugestões exibidas
- Navegação com mouse e teclado

### ✅ **Indicadores Visuais**

- Badge colorido mostra o tipo de busca ativa
- Cores diferentes para cada categoria:
  - 🟢 **Mercado**: Verde
  - 🔵 **Casa de Apostas**: Azul
  - 🟣 **Campeonato**: Roxo
  - 🟡 **Esporte**: Amarelo
  - ⚪ **Geral**: Cinza

### ✅ **Filtros Combinados**

- Busca simultânea em todos os campos relevantes
- Suporte a traduções automáticas
- Fallbacks inteligentes para casos não mapeados

## Exemplos de Uso

### Busca por Mercado

```
Digite: "escanteios"
Resultado: Filtra surebets com mercados relacionados a escanteios
Badge: "Mercado" (verde)
```

### Busca por Casa de Apostas

```
Digite: "bet365"
Resultado: Filtra surebets da Bet365
Badge: "Casa de Apostas" (azul)
```

### Busca por Campeonato

```
Digite: "premier league"
Resultado: Filtra surebets da Premier League
Badge: "Campeonato" (roxo)
```

### Busca por Esporte

```
Digite: "futebol"
Resultado: Filtra surebets de futebol
Badge: "Esporte" (amarelo)
```

## Estrutura Técnica

### Variáveis de Estado

```javascript
data() {
  return {
    unifiedSearchTerm: '',           // Termo de busca atual
    activeSearchType: null,          // Tipo de busca ativa
    searchSuggestions: [],           // Lista de sugestões
    showSearchSuggestions: false,    // Mostrar/ocultar sugestões
    selectedSuggestionIndex: -1      // Índice da sugestão selecionada
  }
}
```

### Computed Properties

```javascript
computed: {
  // Filtra surebets baseado na busca unificada
  filteredSurebetsByUnifiedSearch() {
    // Busca em: mercado, casa de apostas, campeonato, esporte
  },

  // Paginação baseada na busca unificada
  paginatedSurebets() {
    return this.filteredSurebetsByUnifiedSearch.slice(0, this.currentPage * this.itemsPerPage)
  }
}
```

### Métodos Principais

```javascript
methods: {
  // Gera sugestões baseadas no termo de busca
  generateSearchSuggestions() {
    // Busca em traduções de mercados, casas, campeonatos, esportes
  },

  // Detecta o tipo de busca baseado nas sugestões
  detectSearchType() {
    // Define activeSearchType baseado nas sugestões encontradas
  },

  // Seleciona uma sugestão
  selectSuggestion(suggestion) {
    // Aplica a sugestão selecionada
  }
}
```

## Integração com Traduções

### Mercados

- Usa `getMarketTranslations()` para buscar traduções
- Suporte a termos em português e inglês
- Fallback para termos não traduzidos

### Campeonatos

- Usa `getTournamentTranslations()` para buscar traduções
- Integrado com o arquivo `tournamentTranslations.json`
- 253+ campeonatos únicos mapeados

### Casas de Apostas

- Usa `filterOptions.houses` para buscar casas
- Suporte a nomes completos e abreviações
- Busca case-insensitive

## Estilos CSS

### Campo de Busca

```css
.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}
```

### Sugestões

```css
.search-suggestions {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
}
```

### Badges de Tipo

```css
.search-type-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
}
```

## Benefícios

### ✅ **Experiência do Usuário**

- Interface mais limpa e intuitiva
- Busca mais rápida e eficiente
- Sugestões contextuais

### ✅ **Funcionalidade**

- Busca unificada em múltiplos campos
- Suporte a traduções automáticas
- Filtros combinados inteligentes

### ✅ **Manutenibilidade**

- Código centralizado e organizado
- Fácil adição de novos tipos de busca
- Integração com sistemas de tradução existentes

## Próximos Passos

1. **Testes**: Implementar testes unitários para os métodos de busca
2. **Performance**: Otimizar geração de sugestões para grandes datasets
3. **Acessibilidade**: Adicionar suporte completo a navegação por teclado
4. **Analytics**: Implementar tracking de termos de busca mais populares

## Conclusão

O sistema de busca unificada representa uma melhoria significativa na experiência do usuário, permitindo busca inteligente e contextual em múltiplos campos com interface intuitiva e sugestões automáticas.
