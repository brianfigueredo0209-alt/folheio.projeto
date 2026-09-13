# Entendendo a Arquitetura do Projeto

Este documento explica o funcionamento da arquitetura antes da execução prática. O objetivo é compreender como as partes se comunicam, não apenas seguir o cronograma de tarefas.

---

## 1. Visão Geral (Stack Tecnológica Definitiva)

O projeto evoluirá para uma arquitetura moderna orientada a microsserviços. Teremos dois frameworks no Frontend (para atender Web e Mobile) e duas linguagens no Backend (Go e Python), apoiadas por um ecossistema híbrido de banco de dados (SQL e NoSQL).

| Camada | Tecnologia Proposta | Responsabilidade Principal |
| :--- | :--- | :--- |
| **Frontend Web** | **React / Next.js** (Framework 1) | Interface Web rápida, SEO otimizado e componentes reutilizáveis. |
| **Frontend Mobile** | **Flutter ou React Native** (Framework 2) | Aplicativo Mobile de alta performance para Android e iOS. |
| **Backend (Core API)** | **Go (Golang)** | Alta performance, concorrência, rotas principais e chat em tempo real. |
| **Backend (Dados/IA)** | **Python** | Algoritmos de recomendação de livros, scripts de automação e IA. |
| **Banco de Dados Relacional** | **PostgreSQL (SQL)** | Dados estruturados (Usuários, Transações, Catálogo de Livros). |
| **Banco de Dados Não-Relacional**| **MongoDB / Redis (NoSQL)** | Logs de atividade, cache rápido de sessões e metadados flexíveis. |

## 2. Fluxo Principal da Arquitetura

```text
       [React/Next.js] (Web)      [Flutter] (Mobile)
                 │                         │
                 └───────────┬─────────────┘
                             │
                      API Gateway / REST
                             │
             ┌───────────────┴───────────────┐
             │                               │
       Microserviço A                  Microserviço B
       (Escrito em Go)               (Escrito em Python)
     [Alta Concorrência]             [Processamento/Dados]
             │                               │
             ├───────────────┬───────────────┤
             │               │               │
       [PostgreSQL]      [MongoDB]        [Redis]
          (SQL)           (NoSQL)         (Cache)
```

1. O usuário interage com a Web ou com o Mobile.
2. A aplicação realiza uma requisição HTTP para uma rota da API.
3. O Backend recebe a requisição.
4. O sistema identifica qual rota foi chamada e executa a lógica correspondente.
5. O Backend acessa o banco de dados (quando aplicável).
6. Uma resposta é construída e devolvida em formato JSON.
7. A Web ou o Mobile recebe o JSON e apresenta o resultado ao usuário.

## 3. Papel do Backend

O Backend é a camada central do sistema. Suas responsabilidades:

- Subir um servidor HTTP e escutar uma porta;
- Receber requisições vindas da Web ou do Mobile;
- Identificar qual rota foi chamada;
- Executar a lógica correspondente;
- Acessar o banco de dados (quando necessário);
- Construir e devolver uma resposta em JSON.

## 4. Contrato de Comunicação — API

A API é o contrato de comunicação entre Web, Mobile e Backend. Ela define:

- Quais rotas estão disponíveis;
- Qual método HTTP cada rota utiliza;
- Quais dados podem ser enviados;
- Quais dados serão devolvidos;
- Qual estrutura de resposta os clientes devem esperar.

Rotas do Backend (exemplo):

```text
GET  /status
GET  /teste
GET  /livros
POST /livros
```

Web e Mobile não dependem da implementação interna do Backend; eles consomem apenas o contrato público da API.

## 5. Frontend Web

Interface executada no navegador, em HTML, CSS e JavaScript. Responsabilidades:

- Apresentar informações ao usuário e receber ações da interface;
- Enviar requisições HTTP para o Backend;
- Interpretar as respostas da API e transformá-las em elementos visíveis na tela.

## 6. Mobile

Aplicação Android em Kotlin. Responsabilidades:

- Apresentar interface e receber ações do usuário;
- Realizar requisições HTTP para o Backend;
- Consumir as rotas da API e exibir os dados recebidos.

## 7. Formato JSON

Formato utilizado para a troca de dados entre Web, Mobile e Backend.

```json
{
  "status": "sucesso",
  "codigo": 200,
  "dados": {
    "mensagem": "API Backend conectada com sucesso"
  }
}
```

- **status:** resultado da operação;
- **codigo:** código associado à resposta;
- **dados:** informações retornadas pela API.

## 8. Separação de Responsabilidades (Microsserviços)

- **Backend Core (Go):** Responsável por autenticação de usuários, chat em tempo real, transações de trocas e CRUD principal do catálogo. É rápido e seguro.
- **Backend Dados/IA (Python):** Processamento em lote, sugestão de livros com base no gosto do usuário, scripts de inteligência artificial.
- **Frontend Web (React/Next.js):** Interface rica consumida no navegador, com foco em SEO (para que os livros sejam encontrados no Google).
- **Frontend Mobile (Flutter/React Native):** Aplicativo nativo, garantindo notificações em tempo real e experiência fluida no celular.
- **Banco SQL (PostgreSQL):** Mantém a consistência dos dados vitais (ex.: "O usuário X trocou o livro Y com Z").
- **Banco NoSQL (MongoDB/Redis):** Armazena cache de imagens, logs rápidos, dados não estruturados de eventos no aplicativo.

Web e Mobile nunca acessam o banco de dados diretamente — o acesso passa sempre pelo API Gateway / Backend, centralizando as regras e garantindo a segurança de ponta a ponta.

## 9. Ambiente de Demonstração

Para fins de teste e apresentação, o Backend (Go ou Java) pode rodar localmente em um notebook, com Web e Mobile acessando pela mesma rede local. Decisões como Docker, containers ou deploy em nuvem são etapas de preparação do ambiente e não alteram a arquitetura descrita aqui.

O ponto que importa para a demo funcionar: **Web e Mobile precisam consumir a mesma implementação ativa do Backend durante a execução.**