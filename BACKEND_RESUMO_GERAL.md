# Resumo Geral do Desenvolvimento do Backend — Projeto Folheio

Este documento sintetiza todas as etapas de desenvolvimento, arquitetura, microsserviços e testes implementados para o backend da plataforma **Folheio**.

---

## 1. Visão Geral da Arquitetura Escolhida

O backend foi planejado e estruturado em **microsserviços desacoplados**, utilizando tecnologias otimizadas para cada domínio:

- **API Core (`backend/api-core` em Go):** Responsável por rotas principais, alta concorrência e regras de negócio.
- **Serviço de IA (`backend/ai-service` em Python/FastAPI):** Responsável por algoritmos de recomendação e processamento de dados.
- **Bancos de Dados Híbridos (Docker):**
  - **PostgreSQL:** Dados relacionais estruturados.
  - **MongoDB:** Dados flexíveis e mensagens.
  - **Redis:** Cache de alta performance e sessões.

---

## 2. Infraestrutura e Docker (`docker-compose.yml`)

Toda a aplicação e seus bancos de dados rodam em ambiente conteinerizado via Docker Compose. Os serviços ativos são:

1. `postgres` (Porta `5432`)
2. `mongodb` (Porta `27017`)
3. `redis` (Porta `6379`)
4. `api-core` (Go - Porta `8080`)
5. `ai-service` (Python - Porta `8000`)

---

## 3. Microsserviço Core (Go)

- **Localização:** `backend/api-core/`
- **Ponto de Entrada:** `cmd/server/main.go`
- **Endpoint Principal:** `GET /status`
  - Retorna um JSON estruturado confirmando a conexão bem-sucedida do serviço Core.

---

## 4. Microsserviço de IA (Python)

- **Localização:** `backend/ai-service/`
- **Framework:** FastAPI (`app/main.py`)
- **Endpoints:**
  - `GET /status`: Confirma a conexão do serviço de IA.
  - `GET /recomendacoes/{usuario_id}`: Retorna sugestões personalizadas de livros baseadas no perfil do usuário.

---

## 5. Padrão de Versionamento (Conventional Commits)

Todas as entregas foram registradas no controle de versão (Git) seguindo o padrão universal de commits:

- `chore(infra): add docker-compose with postgres, mongodb and redis and backend documentation`
- `feat(backend): initialize go core microservice with status endpoint and dockerfile`
- `test(backend): add api-core service to docker-compose and document status endpoint tests`
- `feat(backend): initialize python ai microservice with recommendation endpoint and integrate into docker-compose`
