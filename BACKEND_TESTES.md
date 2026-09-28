# Documentação de Testes do Backend — Projeto Folheio

Este documento registra os procedimentos e resultados dos testes executados na infraestrutura e no microsserviço Core do backend (`api-core` em Go).

---

## 1. Ambiente de Teste (Docker Containers)
Os serviços de banco de dados e a API Core rodam isoladamente em containers Docker gerenciados via `docker-compose.yml`.

- **PostgreSQL (`folheio_postgres`):** Porta `5432` (Ativo)
- **MongoDB (`folheio_mongodb`):** Porta `27017` (Ativo)
- **Redis (`folheio_redis`):** Porta `6379` (Ativo)
- **API Core Go (`folheio_api_core`):** Porta `8080` (Ativo e Respondendo)

---

## 2. Teste do Endpoint de Status (`/status`)

### Requisição:
- **Método:** `GET`
- **URL:** `http://localhost:8080/status`

### Resposta Obtida:
```json
{
  "status": "sucesso",
  "code": 200,
  "data": {
    "message": "API Core Backend (Go) conectada com sucesso"
  }
}
```

### Validação:
O servidor HTTP em Go inicializou corretamente, atendeu à requisição na porta `8080` dentro do container Docker e retornou o JSON estruturado conforme o contrato da arquitetura do projeto.
