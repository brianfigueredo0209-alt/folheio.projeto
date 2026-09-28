# FOLHEIO

Plataforma de circulacao literaria independente. Conecta leitores para troca,
venda e doacao de livros, promovendo o reaproveitamento sustentavel de obras.

---

## Sobre o Projeto

O FOLHEIO e um marketplace literario que permite ao usuario:

- Cadastrar livros ociosos para troca, venda ou doacao
- Encontrar obras de outros leitores por titulo, autor ou genero
- Negociar trocas diretamente via chat integrado
- Avaliar obras e registrar notas de leitura
- Gerenciar sua estante pessoal

---

## Arquitetura de Tecnologias

Este repositorio demonstra a coexistencia de dois frameworks de frontend
em um mesmo projeto, cada um com uma responsabilidade distinta.

| Camada | Tecnologia | Localizacao | Funcao |
|---|---|---|---|
| Prototipo Web | HTML + CSS + JS | `paginas/` | Interface estatica original |
| SPA Completa | Vue.js 3 + Vite | `folheio-vue/` | Todas as paginas como Single Page App |
| Widget Isolado | React 18 + Vite | `folheio-react-widget/` | Sistema de avaliacao como micro-frontend |
| Backend Core | Go (planejado) | — | API REST, autenticacao, chat em tempo real |
| Backend Dados | Python (planejado) | — | Recomendacoes de livros, IA |
| Banco Relacional | PostgreSQL (planejado) | — | Usuarios, livros, transacoes |
| Banco Cache | Redis (planejado) | — | Sessoes, dados temporarios |

---

## Como Executar

### Prototipo HTML (com widget React integrado)

```
Abra paginas/encontre_livros.html diretamente no navegador
```

O widget de avaliacao React ja esta compilado e sera carregado automaticamente.

### SPA Vue.js

```bash
cd folheio-vue
npm install
npm run dev
```

Acesse: http://localhost:5173

### Widget React (recompilar apos alteracoes)

```bash
cd folheio-react-widget
npm install
npm run build
```

O bundle gerado em `dist/widget.js` e utilizado pela pagina HTML automaticamente.

---

## Estrutura do Repositorio

```
FOLHEIO-WEB/
├── index.html                    — Pagina de login (prototipo original)
├── paginas/                      — Paginas HTML do prototipo
│   ├── encontre_livros.html      — Catalogo (com widget React embutido)
│   ├── mensagens.html
│   ├── meu_perfil.html
│   └── publicar_livro.html
├── estilos/                      — CSS global compartilhado por todas as versoes
│   ├── estilo_base.css
│   ├── estilo_componentes.css
│   └── estilo_paginas.css
├── scripts/                      — JavaScript do prototipo original
├── assets/                       — Recursos estaticos (favicon)
├── folheio-vue/                  — Aplicacao Vue.js completa
│   └── src/
│       ├── paginas/              — 5 componentes de pagina
│       ├── componentes/          — Cabecalho e BloqueioMobile reutilizaveis
│       └── roteador/             — Vue Router com 5 rotas
├── folheio-react-widget/         — Widget React de avaliacao literaria
│   ├── src/                      — Codigo-fonte do componente
│   └── dist/widget.js            — Bundle compilado (dependencia da pagina HTML)
├── README.md                     — Este arquivo
├── ENTENDENDO_A_ARQUITETURA.md   — Visao geral da arquitetura do sistema
├── VUE_SPA.md                    — Documentacao detalhada do Vue.js no projeto
├── REACT_WIDGET.md               — Documentacao detalhada do React no projeto
└── FRAMEWORKS_NO_PROJETO.md      — Comparativo Vue vs React com exemplos de codigo
```

---

## Documentacao Tecnica

| Documento | Conteudo |
|---|---|
| [DISSECACAO_ARQUITETURA.md](./DISSECACAO_ARQUITETURA.md) | Visao geral da arquitetura completa (frontend, backend, banco) |
| [VUE_SPA.md](./VUE_SPA.md) | Como o Vue.js foi integrado, componentes criados e conceitos utilizados |
| [REACT_WIDGET.md](./REACT_WIDGET.md) | Como o React foi integrado como micro-frontend e como o widget funciona |
| [FRAMEWORKS_NO_PROJETO.md](./FRAMEWORKS_NO_PROJETO.md) | Comparativo direto entre Vue e React com exemplos de codigo lado a lado |

---

## Licenca

Distribuido sob a licenca MIT. Consulte o arquivo `LICENSE` para mais informacoes.