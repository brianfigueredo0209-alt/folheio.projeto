# Contrato compartilhado FOLHEIO — API v1

A SPA Vue e o aplicativo Android em Kotlin consomem a mesma API Go. O PostgreSQL guarda usuarios, sessoes, livros, conversas e mensagens. A especificacao de maquina esta em [contrato.openapi.json](backend/contrato.openapi.json).

## Enderecos de desenvolvimento

- API no computador: http://localhost:8080.
- SPA: http://127.0.0.1:5173 ou http://localhost:5173.
- Emulador Android: http://10.0.2.2:8080.
- Celular fisico: endereco IP do computador na mesma rede, porta 8080.
- O aplicativo permite HTTP somente no build de depuracao. A distribuicao exige HTTPS.

## Resposta e autenticacao

Todas as rotas documentadas retornam o envelope:

~~~json
{
  "status": "sucesso",
  "code": 200,
  "data": {}
}
~~~

Erros retornam status "erro" e data.message. Os nomes code/data/message preservam o endpoint recebido no pull; os campos de dominio usam portugues.

Cadastro e login retornam data.token, data.expira_em e data.usuario. Envie Authorization: Bearer TOKEN nas rotas privadas. Nesta versao o token e uma sessao opaca aleatoria de 256 bits, com validade de 24 horas, hash SHA-256 no banco e revogacao imediata ao sair. JWT permanece uma possibilidade de evolucao, nao uma dependencia dos clientes. Senhas usam bcrypt. A SPA guarda a sessao em sessionStorage e o Android em memoria; dados do catalogo nunca sao guardados como fonte local de verdade.

## Rotas implementadas

| Metodo | Rota | Acesso | Dados |
|---|---|---|---|
| GET | /status | Publico | Disponibilidade da API e PostgreSQL |
| POST | /api/v1/auth/cadastro | Publico | nome, email, senha, cidade |
| POST | /api/v1/auth/login | Publico | email, senha |
| POST | /api/v1/auth/sair | Privado | Revoga o token atual |
| GET | /api/v1/perfil | Privado | usuario e livros do titular |
| GET | /api/v1/livros | Publico | livros; filtros busca e modalidade |
| POST | /api/v1/livros | Privado | Cria livro |
| PUT | /api/v1/livros/{livro} | Proprietario | Atualiza todos os campos da oferta |
| DELETE | /api/v1/livros/{livro} | Proprietario | Remove anuncio e suas conversas/mensagens |
| GET | /api/v1/conversas | Privado | conversas do participante |
| POST | /api/v1/conversas | Privado | livro_id; cria ou recupera conversa |
| GET | /api/v1/conversas/{conversa}/mensagens | Participante | mensagens da conversa |
| POST | /api/v1/conversas/{conversa}/mensagens | Participante | texto |

## Publicacao e edicao

~~~json
{
  "titulo": "Duna",
  "autor": "Frank Herbert",
  "genero": "fantasia",
  "estado": "bom",
  "descricao": "Capa dura, sem anotacoes.",
  "modalidade": "troca",
  "desejo": "Romances contemporaneos",
  "preco_centavos": 0,
  "capa": ""
}
~~~

- titulo/autor: obrigatorios, ate 200 bytes; genero: ate 80 bytes.
- descricao: obrigatoria, ate 3000 bytes; desejo: ate 500 bytes.
- estado: novo, seminovo, bom ou marcas.
- modalidade: troca, venda ou doacao.
- troca exige desejo. Venda exige preco_centavos positivo; as outras modalidades usam zero.
- Preco usa inteiro em centavos e limite de 100000000.
- capa e opcional: data URL JPEG/PNG Base64, com ate 5 MB de imagem. O servidor valida os bytes.
- O usuario/proprietario vem exclusivamente do token; nao pode ser escolhido pelo cliente.
- Cadastro exige nome/cidade de ate 120 bytes, e-mail valido e senha de 8 a 72 bytes.

## Conversas

O interessado cria a conversa enviando livro_id. O proprietario passa a encontra-la na sua lista. Repetir a solicitacao recupera a mesma conversa. Nenhum usuario pode negociar o proprio anuncio nem acessar mensagens de uma conversa da qual nao participa.

Web e Android consultam mensagens a cada cinco segundos enquanto o chat esta ativo. Esta versao usa HTTP com consulta periodica; WebSocket ainda nao foi implementado.

## Limites e proximas entregas

O catalogo retorna os 100 anuncios mais recentes, com pesquisa no servidor. Mensagens retornam as 200 mais recentes, em ordem cronologica. Paginacao, upload em armazenamento de objetos, recuperacao de senha, edicao de dados do perfil e registro de negociacao concluida ficam para uma proxima entrega. Venda representa uma oferta negociada por chat; nao ha pagamento integrado nem logistica.

O Python recebido no pull continua com recomendacoes fixas. MongoDB e Redis continuam configurados, mas o fluxo implementado persiste no PostgreSQL. Nao sao necessarios para executar esta demonstracao.

## Executar

~~~powershell
docker compose up -d --build api-core
npm run dev --prefix folheio-vue
~~~

O Compose aguarda o healthcheck do PostgreSQL. A API executa o esquema idempotente ao iniciar. Os volumes preservam os dados entre reinicializacoes. As credenciais do Compose sao de desenvolvimento.

A SPA permite sobrescrever a URL por VITE_API_URL. CORS_ORIGINS na API deve listar a origem exata da SPA.

No Android Studio, abra FOLHEIO_app e execute o build debug. Para celular fisico:

~~~powershell
.\gradlew.bat :app:assembleDebug -PfolheioApiUrl=http://IP_DO_COMPUTADOR:8080
~~~

## Verificacao

O teste Go usa um banco separado chamado folheio_teste, indicado em TEST_DATABASE_URL; recusa outro nome. Valida cadastro duplicado, hash de senha, login, publicacao compartilhada, perfil, propriedade, conversa unica, mensagens, isolamento, logout, expiracao e CORS.

O teste testes/integracao_web.cjs usa Playwright, duas sessoes independentes e uma API temporaria em localhost:8081 ligada ao banco de testes. O site deve estar em 127.0.0.1:5173. O teste redireciona apenas as chamadas da API dos navegadores para o servidor de testes.

~~~powershell
node testes/integracao_web.cjs
~~~

Requer Playwright e Chromium instalados no ambiente de testes. O teste cria contas apenas no banco de testes.
