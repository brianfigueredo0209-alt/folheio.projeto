# Vue.js — Single Page Application do FOLHEIO-WEB

Este documento descreve o que foi implementado, onde esta e como o Vue.js
foi integrado ao FOLHEIO-WEB como framework principal, na forma de uma
Single Page Application completa.

---

## O que foi feito

Foi criada uma versao completa da plataforma FOLHEIO-WEB utilizando **Vue.js com Vite**,
onde cada pagina HTML original foi convertida em um componente `.vue` independente.

A aplicacao funciona como uma **SPA (Single Page Application)**: o navegador carrega
a pagina uma unica vez e o Vue troca os componentes internamente conforme o usuario
navega — sem recarregar nada.

---

## Onde esta cada arquivo

```
folheio-vue/
├── index.html                          — HTML raiz: apenas uma <div id="app">
├── vite.config.js                      — Configuracao do bundler Vite
├── public/
│   └── favicon.jpg                     — Favicon copiado do projeto original
└── src/
    ├── main.js                         — Ponto de entrada: monta o app e o roteador
    ├── App.vue                         — Componente raiz: <BloqueioMobile> + <RouterView>
    ├── assets/
    │   ├── estilo_base.css             — CSS global copiado sem alteracao
    │   ├── estilo_componentes.css      — CSS de componentes copiado sem alteracao
    │   └── estilo_paginas.css          — CSS de paginas copiado sem alteracao
    ├── roteador/
    │   └── indice.js                   — Mapeamento das 5 rotas da aplicacao
    ├── componentes/
    │   ├── CabecalhoPrincipal.vue      — Header reutilizavel (existia em 4 HTMLs)
    │   └── BloqueioMobile.vue          — Overlay mobile (era uma funcao JS)
    └── paginas/
        ├── PaginaLogin.vue             — Converte index.html
        ├── PaginaEncontreLivros.vue    — Converte encontre_livros.html
        ├── PaginaMensagens.vue         — Converte mensagens.html
        ├── PaginaMeuPerfil.vue         — Converte meu_perfil.html
        └── PaginaPublicarLivro.vue     — Converte publicar_livro.html
```

---

## Como executar a aplicacao Vue

```powershell
cd folheio-vue
npm run dev
```

Acesse em: **http://localhost:5173**

---

## Mapeamento de rotas

O arquivo `src/roteador/indice.js` define as rotas da aplicacao:

| URL | Componente carregado | Pagina original |
|---|---|---|
| `/` | `PaginaLogin.vue` | `index.html` |
| `/livros` | `PaginaEncontreLivros.vue` | `encontre_livros.html` |
| `/mensagens` | `PaginaMensagens.vue` | `mensagens.html` |
| `/perfil` | `PaginaMeuPerfil.vue` | `meu_perfil.html` |
| `/publicar` | `PaginaPublicarLivro.vue` | `publicar_livro.html` |

---

## O que cada arquivo Vue faz

### `main.js` — Ponto de entrada

```javascript
import { createApp } from 'vue';
import App from './App.vue';
import roteadorDaAplicacao from './roteador/indice.js';

// Importa os tres arquivos CSS do projeto original — sem reescrever nada
import './assets/estilo_base.css';
import './assets/estilo_componentes.css';
import './assets/estilo_paginas.css';

createApp(App).use(roteadorDaAplicacao).mount('#app');
```

Responsabilidade unica: criar a instancia do app, registrar o roteador e montar no DOM.

---

### `App.vue` — Esqueleto da aplicacao

```vue
<template>
  <BloqueioMobile />
  <RouterView />
</template>
```

- `<BloqueioMobile />` — Exibido em telas pequenas (detectado via CSS media query)
- `<RouterView />` — Espaco onde o Vue injeta o componente da rota ativa

---

### `CabecalhoPrincipal.vue` — Componente reutilizavel

No projeto original, o `<header>` era **copiado em 4 arquivos HTML diferentes**.
No Vue, ele existe em um unico componente e e usado com uma linha em cada pagina:

```vue
<CabecalhoPrincipal />
```

Os links de navegacao usam `<RouterLink>` no lugar de `<a href>`, o que permite
navegar entre paginas sem recarregar o navegador. O Vue aplica automaticamente a
classe `ativo` no link correspondente a rota atual.

---

### `PaginaEncontreLivros.vue` — O principal beneficio do Vue

Esta pagina demonstra os tres recursos mais importantes do Vue aplicados juntos:

**1. Lista reativa com `v-for`**
```vue
<!-- O HTML do cartao e escrito UMA vez e repetido para cada livro do array -->
<article v-for="livro in livrosFiltrados" :key="livro.identificador">
  <h2>{{ livro.titulo }}</h2>
</article>
```

**2. Ligacao bidirecional com `v-model`**
```vue
<!-- Quando o usuario digita, a variavel atualiza automaticamente -->
<input v-model="termoDePesquisa" type="search" />
```

**3. Filtragem em tempo real com `computed`**
```javascript
// Recalcula automaticamente sempre que termoDePesquisa muda
const livrosFiltrados = computed(() => {
  return catalogoDeLivros.value.filter(livro =>
    livro.titulo.toLowerCase().includes(termoDePesquisa.value.toLowerCase())
  );
});
```

No JavaScript puro original, esse comportamento exigia `addEventListener`,
`querySelector` e manipulacao manual de `style.display` em cada elemento.

---

### `PaginaMensagens.vue` — Chat reativo

A logica de envio de mensagens foi migrada do `script_global.js` para dentro
do proprio componente. O historico de mensagens e um array reativo (`ref([])`):

```javascript
historicoDesMensagens.value.push({ direcao: 'enviada', texto: textoValidado });
```

O Vue detecta a mudanca e re-renderiza o historico automaticamente.
O scroll automatico para o final usa `nextTick` — que garante que o DOM
ja foi atualizado antes de rolar.

---

### `PaginaPublicarLivro.vue` — Formulario completo

Toda a logica do `publicar_livro.js` foi migrada para `<script setup>`:

- Upload de capa com preview via `URL.createObjectURL()`
- Todos os campos gerenciados com `v-model`
- Submissao salva no `localStorage` e navega para `/perfil` via `router.push()`

---

## Conceitos Vue utilizados

| Conceito | Onde foi aplicado |
|---|---|
| `ref()` | Estado de todos os formularios e listas |
| `computed()` | Filtragem de livros e conversas em tempo real |
| `v-model` | Todos os campos de entrada (text, select, textarea) |
| `v-for` | Grade de livros, lista de mensagens, lista de conversas |
| `v-if` | Estado vazio da pesquisa, estado vazio de avaliacoes |
| `:class` | Classes dinamicas nos baloes de mensagem e etiquetas |
| `:src` / `:alt` | Atributos dinamicos nas imagens de capa |
| `@submit.prevent` | Interceptacao de envio de formularios |
| `@click` | Eventos de botao |
| `RouterLink` | Navegacao SPA sem recarregar |
| `RouterView` | Espaco de injecao do componente da rota ativa |
| `useRouter()` | Navegacao programatica via `router.push()` |
| `nextTick()` | Scroll do chat apos re-renderizacao do DOM |
| `<script setup>` | Sintaxe moderna e concisa em todos os componentes |

---

## Comparativo: HTML puro vs Vue.js

| Situacao | HTML + JS puro | Vue.js |
|---|---|---|
| Adicionar mensagem ao chat | 7 linhas de `createElement` + `appendChild` | 1 linha: `array.push(objeto)` |
| Repetir cartao de livro | Copiar e colar o bloco HTML para cada item | `v-for` em um unico bloco |
| Filtrar lista ao digitar | `addEventListener` + loop + `style.display` | `computed()` |
| Navegar entre paginas | `<a href>` recarrega tudo | `<RouterLink>` troca o componente |
| Campo ligado a variavel | `addEventListener('input', ...)` | `v-model` |
| Reutilizar o cabecalho | Copiar em 4 arquivos diferentes | `<CabecalhoPrincipal />` |
