CREATE TABLE IF NOT EXISTS usuarios (
 identificador TEXT PRIMARY KEY, nome TEXT NOT NULL, email TEXT NOT NULL UNIQUE,
 senha_hash TEXT NOT NULL, cidade TEXT NOT NULL, criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS sessoes (
 token_hash TEXT PRIMARY KEY, usuario_id TEXT NOT NULL REFERENCES usuarios(identificador),
 expira_em TIMESTAMPTZ NOT NULL
);
CREATE TABLE IF NOT EXISTS livros (
 identificador TEXT PRIMARY KEY, proprietario_id TEXT NOT NULL REFERENCES usuarios(identificador),
 titulo TEXT NOT NULL, autor TEXT NOT NULL, genero TEXT NOT NULL, estado TEXT NOT NULL,
 descricao TEXT NOT NULL, modalidade TEXT NOT NULL CHECK (modalidade IN ('troca','venda','doacao')),
 desejo TEXT NOT NULL DEFAULT '', preco_centavos INTEGER NOT NULL DEFAULT 0 CHECK (preco_centavos >= 0),
 capa TEXT NOT NULL DEFAULT '', criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS conversas (
 identificador TEXT PRIMARY KEY, livro_id TEXT NOT NULL REFERENCES livros(identificador) ON DELETE CASCADE,
 interessado_id TEXT NOT NULL REFERENCES usuarios(identificador), criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
 UNIQUE(livro_id, interessado_id)
);
CREATE TABLE IF NOT EXISTS mensagens (
 identificador TEXT PRIMARY KEY, conversa_id TEXT NOT NULL REFERENCES conversas(identificador) ON DELETE CASCADE,
 remetente_id TEXT NOT NULL REFERENCES usuarios(identificador), texto TEXT NOT NULL,
 criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS livros_proprietario ON livros(proprietario_id);
CREATE INDEX IF NOT EXISTS mensagens_conversa ON mensagens(conversa_id, criado_em);
