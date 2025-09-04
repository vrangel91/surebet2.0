# Sistema de Loader Fullscreen - Documentação

## Visão Geral

O sistema de loader fullscreen foi implementado para fornecer feedback visual consistente durante operações assíncronas, como chamadas de API e transições de página. O loader aparece automaticamente e desaparece quando a operação é concluída.

## Características

- ✅ **Overlay Fullscreen**: Cobre toda a tela com fundo semi-transparente
- ✅ **Spinner Animado**: Círculo girando com múltiplas cores
- ✅ **Gerenciamento Global**: Estado centralizado no Vuex
- ✅ **Integração Automática**: Funciona automaticamente com Axios e Vue Router
- ✅ **Tempo Mínimo**: Evita "piscar" com operações muito rápidas (300ms)
- ✅ **Múltiplas Requisições**: Contador inteligente para requisições simultâneas
- ✅ **Responsivo**: Funciona em desktop e mobile
- ✅ **Acessibilidade**: Respeita preferências de movimento reduzido

## Componentes

### 1. LoaderOverlay.vue
Componente principal que renderiza o loader fullscreen.

**Localização**: `src/components/LoaderOverlay.vue`

**Características**:
- Overlay com backdrop blur
- Spinner com 3 anéis animados
- Transições suaves de entrada/saída
- Responsivo e acessível

### 2. useLoader.js (Composable)
Composable para facilitar o uso do loader em qualquer componente.

**Localização**: `src/composables/useLoader.js`

## Uso

### 1. Controle Manual

```vue
<template>
  <div>
    <button @click="showLoader">Mostrar Loader</button>
    <button @click="hideLoader">Esconder Loader</button>
  </div>
</template>

<script>
import { useLoader } from '@/composables/useLoader'

export default {
  setup() {
    const { showLoader, hideLoader, isLoading } = useLoader()
    
    return {
      showLoader,
      hideLoader,
      isLoading
    }
  }
}
</script>
```

### 2. Com Função Assíncrona

```javascript
import { useLoader } from '@/composables/useLoader'

export default {
  setup() {
    const { withLoader } = useLoader()
    
    const fetchData = () => {
      withLoader(async () => {
        const response = await fetch('/api/data')
        return response.json()
      })
    }
    
    return { fetchData }
  }
}
```

### 3. Múltiplas Requisições

```javascript
const { withLoaderMultiple } = useLoader()

const fetchAllData = () => {
  const apiCalls = [
    () => fetch('/api/users'),
    () => fetch('/api/posts'),
    () => fetch('/api/comments')
  ]
  
  withLoaderMultiple(apiCalls).then(results => {
    console.log('Todas as requisições concluídas:', results)
  })
}
```

### 4. Com Tratamento de Erro

```javascript
const { withLoader } = useLoader()

const riskyOperation = () => {
  withLoader(async () => {
    const response = await fetch('/api/risky-endpoint')
    if (!response.ok) {
      throw new Error('Erro na requisição')
    }
    return response.json()
  }).catch(error => {
    console.error('Erro:', error.message)
    // O loader é automaticamente escondido em caso de erro
  })
}
```

## Integração Automática

### Axios Interceptors

O sistema está integrado automaticamente com o Axios através de interceptors:

- **Request Interceptor**: Inicia o loader para todas as requisições (exceto rotas específicas)
- **Response Interceptor**: Para o loader quando a resposta é recebida
- **Error Interceptor**: Para o loader em caso de erro

**Rotas que não ativam o loader**:
- `/api/vip/status`
- `/api/health`

### Vue Router

O loader é ativado automaticamente durante transições de página:

- **beforeEach**: Inicia o loader quando a navegação começa
- **afterEach**: Para o loader quando a navegação é concluída

## Estado Global (Vuex)

### State
```javascript
{
  isLoading: false,           // Estado atual do loader
  loadingRequests: 0,         // Contador de requisições ativas
  loadingStartTime: null      // Timestamp do início do loading
}
```

### Mutations
- `startLoading()`: Incrementa contador e ativa loader
- `stopLoading()`: Decrementa contador e desativa loader (com tempo mínimo)
- `forceStopLoading()`: Força parada imediata do loader

### Actions
- `showLoader()`: Mostra o loader
- `hideLoader()`: Esconde o loader
- `forceHideLoader()`: Força parada do loader

### Getters
- `isLoading`: Estado atual do loader

## Configurações

### Tempo Mínimo de Exibição
O loader tem um tempo mínimo de 300ms para evitar "piscar" em operações muito rápidas.

### Rotas Excluídas
Algumas rotas não ativam o loader automaticamente:
- Rotas de status/health
- Rotas de verificação VIP

## Estilos CSS

O loader inclui:
- **Responsividade**: Adapta-se a diferentes tamanhos de tela
- **Tema**: Suporte a tema claro/escuro
- **Acessibilidade**: Respeita `prefers-reduced-motion`
- **Transições**: Animações suaves de entrada/saída

## Exemplo Completo

Veja o componente `LoaderExample.vue` para exemplos práticos de uso.

## Troubleshooting

### Loader não aparece
1. Verifique se o componente `LoaderOverlay` está registrado no `App.vue`
2. Confirme se o estado `isLoading` está sendo atualizado no Vuex

### Loader não desaparece
1. Use `forceHideLoader()` para forçar parada
2. Verifique se não há requisições pendentes
3. Confirme se os interceptors do Axios estão funcionando

### Múltiplas requisições
O sistema gerencia automaticamente múltiplas requisições simultâneas através do contador `loadingRequests`.

## Boas Práticas

1. **Use o composable**: Prefira `useLoader()` ao invés de acessar o store diretamente
2. **Trate erros**: Sempre trate erros em operações assíncronas
3. **Tempo mínimo**: O sistema já implementa tempo mínimo, não adicione delays extras
4. **Rotas específicas**: Configure rotas que não devem ativar o loader se necessário

## Compatibilidade

- ✅ Vue 3
- ✅ Vuex 4
- ✅ Vue Router 4
- ✅ Axios
- ✅ Navegadores modernos
- ✅ Dispositivos móveis
