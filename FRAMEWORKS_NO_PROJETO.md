# Arquitetura de Frameworks — FOLHEIO-WEB

Este documento explica como **Vue.js** e **React** coexistem no mesmo projeto,
qual e o papel de cada um e como eles se diferenciam na pratica.

---

## Visao Geral da Arquitetura

```
FOLHEIO-WEB/
│
├── paginas/                          ← HTML + CSS + JS puro (prototipo original)
│   ├── encontre_livros.html          ← Recebe o widget React embutido
│   ├── mensagens.html
│   ├── meu_perfil.html
│   └── publicar_livro.html
│
├── folheio-vue/                      ← Vue.js: SPA completa da plataforma
│   └── src/
│       ├── paginas/                  ← 5 componentes de pagina
│       ├── componentes/              ← CabecalhoPrincipal, BloqueioMobile
│       └── roteador/                 ← Vue Router com 5 rotas
│
└── folheio-react-widget/             ← React: widget isolado (micro-frontend)
    └── src/
        ├── WidgetAvaliacao.jsx       ← Componente principal do widget
        └── principal.jsx             ← Monta o React na div da pagina host
```

---

## O papel de cada framework

| Framework | Onde esta | O que faz |
|---|---|---|
| **Vue.js** | `folheio-vue/` | SPA completa: todas as 5 paginas da plataforma, roteamento, estado reativo |
| **React** | `folheio-react-widget/` | Widget isolado de avaliacao de livros embutido em `encontre_livros.html` |

Os dois frameworks **nao se comunicam entre si** e nao sabem da existencia um do outro.
Cada um atua em seu proprio espaco do DOM.

---

## Como os dois coexistem na mesma pagina

Na pagina `encontre_livros.html`, Vue e React estao presentes ao mesmo tempo:

```
encontre_livros.html (HTML puro)
│
├── <header>          ← HTML + CSS do projeto original
├── <main>
│   ├── vitrine       ← HTML + CSS do projeto original
│   ├── barra busca   ← HTML + CSS do projeto original
│   └── grade livros  ← HTML + CSS do projeto original
│
└── <div id="widget-avaliacao-react">
      └── [React monta aqui] — completamente isolado
```

O React nao toca no HTML acima. O HTML nao sabe o que o React faz dentro da `div`.
Essa independencia e o principio fundamental de um **micro-frontend**.

---

## Comparativo direto entre Vue.js e React

### Declarar um dado que a tela observa

```javascript
// Vue.js
import { ref } from 'vue';
const termoDePesquisa = ref('');

// React
import { useState } from 'react';
const [termoDePesquisa, definirTermoDePesquisa] = useState('');
```

**Diferenca:** No Vue, voce modifica o valor via `.value`. No React, voce usa
a funcao `set` retornada pelo `useState` — nunca modifica a variavel diretamente.

---

### Ligar um campo de texto a uma variavel

```vue
<!-- Vue.js: v-model faz a ligacao bidirecional automaticamente -->
<input v-model="termoDePesquisa" type="search" />
```

```jsx
// React: onChange atualiza o estado manualmente
<input
  value={termoDePesquisa}
  onChange={(e) => definirTermoDePesquisa(e.target.value)}
  type="search"
/>
```

**Diferenca:** O Vue abstrai o evento com `v-model`. O React e explicito: voce
sempre ve exatamente o que acontece com cada evento.

---

### Repetir um elemento por uma lista

```vue
<!-- Vue.js: diretiva v-for no proprio elemento HTML -->
<article v-for="livro in catalogoDeLivros" :key="livro.identificador">
  <h2>{{ livro.titulo }}</h2>
</article>
```

```jsx
// React: metodo .map() do JavaScript, retorna JSX
{catalogoDeLivros.map((livro) => (
  <article key={livro.identificador}>
    <h2>{livro.titulo}</h2>
  </article>
))}
```

**Diferenca:** O Vue usa atributos especiais no HTML. O React usa JavaScript puro
(`.map()`) dentro do JSX — mais proximo do JS que voce ja conhece.

---

### Executar algo ao montar o componente

```javascript
// Vue.js: onMounted (nao utilizado neste projeto, mas e o equivalente)
import { onMounted } from 'vue';
onMounted(() => {
  // executa uma vez ao montar
});

// React: useEffect com array de dependencias vazio
import { useEffect } from 'react';
useEffect(() => {
  // executa uma vez ao montar
}, []);
```

No widget React do FOLHEIO, o `useEffect` e usado para carregar as avaliacoes
salvas no `localStorage` assim que o componente aparece na tela.

---

### Template vs JSX

Vue separa claramente o HTML do JavaScript:

```vue
<template>
  <h2>{{ tituloDaObra }}</h2>
</template>

<script setup>
const tituloDaObra = ref('Duna');
</script>
```

React mistura JavaScript e HTML em um formato chamado JSX:

```jsx
function CartaoLivro() {
  const tituloDaObra = 'Duna';
  return <h2>{tituloDaObra}</h2>;
}
```

**Nao ha certo ou errado** — sao filosofias diferentes. Vue prioriza a separacao
de responsabilidades. React prioriza que tudo seja JavaScript.

---

## Quando usar cada um

| Situacao | Framework recomendado |
|---|---|
| Construir uma interface completa com multiplas paginas | **Vue.js** (ou React) |
| Adicionar interatividade a uma pagina HTML ja existente | **React** como widget |
| Projeto de portfolio que demonstra os dois frameworks | **Ambos** — como neste projeto |
| App mobile no futuro (React Native) | **React** — o conhecimento e transferido diretamente |
| Equipe que trabalha com HTML e precisa de curva suave | **Vue.js** |

---

## Fluxo de dados em cada framework

### Vue.js (PaginaEncontreLivros.vue)

```
usuario digita no campo de busca
        |
        v
termoDePesquisa (ref) atualiza via v-model
        |
        v
livrosFiltrados (computed) recalcula automaticamente
        |
        v
v-for re-renderiza apenas os cartoes filtrados
```

### React (WidgetAvaliacao.jsx)

```
usuario clica em uma estrela
        |
        v
onClick chama definirNotaSelecionada(valor)
        |
        v
React re-renderiza o SeletorDeEstrelas com novo estado
        |
        v
estrelas destacadas refletem a nota selecionada
```

Nos dois casos, a tela se atualiza automaticamente quando o estado muda.
A diferenca e apenas na sintaxe — o conceito de reatividade e o mesmo.

---

## Como executar cada parte do projeto

### Versao Vue.js (SPA completa)

```powershell
cd folheio-vue
npm run dev
# Acesse: http://localhost:5173
```

### Widget React (modo desenvolvimento)

```powershell
cd folheio-react-widget
npm run build
# Abra: paginas/encontre_livros.html diretamente no navegador
```

### Versao HTML original (com widget React embutido)

Abra `paginas/encontre_livros.html` diretamente no navegador.
O widget de avaliacao aparece abaixo da grade de livros.

---

## Resumo final

| Aspecto | Vue.js | React |
|---|---|---|
| Tipo de integracao | SPA completa em `folheio-vue/` | Micro-frontend em `folheio-react-widget/` |
| Arquivo de entrada | `src/main.js` | `src/principal.jsx` |
| Componente raiz | `App.vue` | `WidgetAvaliacao.jsx` |
| Montagem no DOM | `createApp().mount('#app')` | `createRoot(div).render(...)` |
| Estilo | CSS global importado | CSS-in-JS (objeto `estilos`) |
| Roteamento | Vue Router (`/livros`, `/mensagens`...) | Nao necessario (widget unico) |
| Estado | `ref()` + `computed()` | `useState()` + `useEffect()` |
| Template | HTML com diretivas (`v-for`, `v-model`) | JSX (JavaScript + HTML misturados) |
| Curva de aprendizado | Mais suave para quem vem do HTML | Requer entender JSX e `.map()` |
| Valor de mercado | Alto | Muito alto |
