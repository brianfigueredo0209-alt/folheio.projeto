# Widget React — Sistema de Avaliacao Literaria

Este documento descreve o que foi implementado, onde esta e como o React
foi integrado ao FOLHEIO-WEB como segundo framework, na forma de um micro-frontend.

---

## O que foi feito

Foi criado um **widget de avaliacao de livros** construido inteiramente com React,
compilado para um unico arquivo JavaScript auto-executavel e embutido diretamente
na pagina `paginas/encontre_livros.html` — sem alterar nenhum arquivo existente
do Vue.js ou do HTML original.

O widget permite ao usuario:

1. Selecionar uma obra do catalogo da plataforma
2. Atribuir uma nota de 1 a 5 estrelas com interatividade visual
3. Escrever uma nota pessoal sobre a leitura
4. Registrar a avaliacao (salva via `localStorage`)
5. Visualizar todas as avaliacoes registradas abaixo do formulario, mesmo apos recarregar a pagina

---

## Onde esta cada arquivo

```
folheio-react-widget/
├── src/
│   ├── principal.jsx       — Ponto de entrada: monta o React na div da pagina host
│   └── WidgetAvaliacao.jsx — Componente principal com toda a logica e sub-componentes
├── dist/
│   └── widget.js           — Bundle final gerado pelo Vite (React embutido, 654kb)
└── vite.config.js          — Configurado em modo biblioteca IIFE
```

O bundle `dist/widget.js` e o unico arquivo que a pagina HTML precisa conhecer.

---

## Como a integracao funciona

A pagina `paginas/encontre_livros.html` recebeu apenas dois acrescimos:

```html
<!-- Container onde o React vai montar o componente -->
<div id="widget-avaliacao-react"></div>

<!-- Bundle auto-executavel com React embutido -->
<script src="../folheio-react-widget/dist/widget.js"></script>
```

O `principal.jsx` escuta o evento `DOMContentLoaded`, localiza a `div` pelo ID
e usa `createRoot` do React para montar o widget dentro dela.

O restante da pagina (HTML, CSS e JavaScript do FOLHEIO) nao foi tocado.

---

## Por que isso e um micro-frontend

Um micro-frontend e quando uma parte da interface e construida com uma tecnologia
diferente da pagina principal e funciona de forma completamente independente.

Neste projeto:

| Camada | Tecnologia | Responsabilidade |
|---|---|---|
| Pagina principal | HTML + CSS + JS puro | Cabecalho, catalogo de livros, barra de busca |
| Widget embutido | **React** | Sistema de avaliacao de livros |
| App SPA separado | **Vue.js** (pasta `folheio-vue/`) | Versao completa da plataforma como Single Page App |

O React nao sabe que existe HTML ou Vue na pagina.
O Vue nao sabe que existe React no projeto.
Eles coexistem sem conflito porque cada um atua em seu proprio espaco do DOM.

---

## Conceitos React utilizados

| Conceito | Onde foi aplicado |
|---|---|
| `useState` | Estado do formulario (titulo, nota, texto), lista de avaliacoes, feedback |
| `useEffect` | Carregamento das avaliacoes do `localStorage` ao montar o componente |
| `createRoot` | Montagem do React dentro da `div` da pagina HTML host |
| Componentes funcionais | `WidgetAvaliacao`, `SeletorDeEstrelas`, `CartaoDeAvaliacao` |
| Props | `SeletorDeEstrelas` recebe `notaAtual` e `aoAlterarNota` do componente pai |
| Estilos inline isolados | CSS-in-JS via objeto `estilos` — sem dependencia do CSS global da pagina |
| Eventos sinteticos | `onChange`, `onSubmit`, `onMouseEnter`, `onMouseLeave`, `onClick` |

---

## Como atualizar o widget apos modificacoes

Sempre que alterar qualquer arquivo em `folheio-react-widget/src/`, e necessario
recompilar o bundle para que as mudancas reflitam na pagina:

```powershell
cd folheio-react-widget
npm run build
```

O arquivo `dist/widget.js` sera regenerado automaticamente.

---

## Comparativo rapido: Vue.js vs React neste projeto

| Aspecto | Vue.js (folheio-vue/) | React (folheio-react-widget/) |
|---|---|---|
| Dado reativo | `ref('valor')` | `useState('valor')` |
| Efeito ao montar | Nao necessario no projeto | `useEffect(() => {}, [])` |
| Repetir por lista | `v-for="item in lista"` | `lista.map(item => <Comp />)` |
| Escutar campo | `v-model="variavel"` | `onChange={(e) => set(e.target.value)}` |
| Componente | Arquivo `.vue` com `<template>` | Funcao que retorna JSX |
| Estilos | CSS global importado | CSS-in-JS (objeto `estilos`) |
| Montagem no DOM | `createApp().mount('#app')` | `createRoot(div).render(...)` |
