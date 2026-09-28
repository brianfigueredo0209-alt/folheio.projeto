# Documentação da Arquitetura do Backend e Infraestrutura Docker — Projeto Folheio

Este documento detalha o planejamento, a arquitetura técnica, os microsserviços e a estratégia de conteinerização com Docker para o desenvolvimento do backend da plataforma **Folheio**.

---

## 1. Visão Geral da Infraestrutura com Docker

Para garantir consistência entre os ambientes de desenvolvimento, homologação e produção, todo o ecossistema do backend e bancos de dados será executado através do **Docker** e orquestrado via **Docker Compose**.

### Componentes do Docker Compose (`docker-compose.yml` planejado):

1. **`api-core` (Go):** Microsserviço principal responsável pelas rotas HTTP, regras de negócio, autenticação e chat.
2. **`ai-service` (Python):** Microsserviço para algoritmos de recomendação e processamento de dados/IA.
3. **`postgres` (Banco Relacional):** Armazenamento estruturado de usuários, livros e transações.
4. **`mongodb` (Banco Não-Relacional):** Armazenamento flexível de logs e histórico de mensagens do chat.
5. **`redis` (Cache e Sessões):** Gerenciamento rápido de tokens, sessões ativas e cache de alta performance.

---

## 2. Estrutura de Diretórios Planejada para o Backend

O projeto do backend será estruturado de forma modular, separando claramente o serviço Core (Go) do serviço de IA (Python):

```text
folheio.projeto/
├── backend/
│   ├── api-core/                  # Microsserviço Principal em Go
│   │   ├── cmd/
│   │   │   └── server/            # Ponto de entrada (main.go)
│   │   ├── internal/
│   │   │   ├── delivery/          # Handlers HTTP, rotas e middlewares
│   │   │   ├── usecase/           # Regras de negócio da aplicação
│   │   │   ├── repository/        # Camada de persistência (PostgreSQL / MongoDB)
│   │   │   └── domain/            # Modelos de domínio e interfaces
│   │   ├── Dockerfile
│   │   └── go.mod
│   │
│   └── ai-service/                # Microsserviço de IA e Dados em Python
│       ├── app/
│       │   ├── main.py            # API FastAPI ou script principal
│       │   ├── recomendacao/      # Algoritmos de recomendação de livros
│       │   └── processamento/     # Rotinas de análise
│       ├── Dockerfile
│       └── requirements.txt
│
└── docker-compose.yml             # Orquestrador de todos os containers
```

---

## 3. Contratos e Padrões de Comunicação

### Comunicação Externa (Web/Mobile ➔ API Gateway / Core)

- Protocolo: HTTP/HTTPS (RESTful JSON) e WebSockets (para chat em tempo real).
- Autenticação: JSON Web Tokens (JWT) enviados no cabeçalho `Authorization: Bearer <token>`.

### Comunicação Interna (Core ➔ Serviço de IA)

- O microsserviço em **Go** poderá chamar rotas internas do microsserviço em **Python** via requisições HTTP internas dentro da rede bridge do Docker (`http://ai-service:8000/...`) para obter sugestões de livros personalizados para os usuários.

---

## 4. Próximos Passos (Planejamento de Execução)

1. **Fração 1 (Infraestrutura):** Criar o arquivo `docker-compose.yml` e configurar os containers de banco de dados (PostgreSQL, MongoDB e Redis).
2. **Fração 2 (API Core):** Inicializar o projeto Go, estruturar as camadas e conectar ao PostgreSQL.
3. **Fração 3 (Autenticação e Catálogo):** Implementar rotas de registro, login (JWT) e CRUD de livros.
4. **Fração 4 (Serviço de IA):** Configurar o ambiente Python com FastAPI para o motor de recomendações.
