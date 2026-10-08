package plataforma

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"database/sql"
	_ "embed"
	"encoding/base64"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/mail"
	"strings"
	"time"

	"github.com/jackc/pgx/v5/pgconn"
	_ "github.com/jackc/pgx/v5/stdlib"
	"golang.org/x/crypto/bcrypt"
)

// ---------------------------------------------------------
// Nome do bloco: Modelos do contrato compartilhado entre Web e Android
// ---------------------------------------------------------
type Usuario struct {
	Identificador string `json:"identificador"`
	Nome          string `json:"nome"`
	Email         string `json:"email,omitempty"`
	Cidade        string `json:"cidade"`
}
type Livro struct {
	Identificador  string    `json:"identificador"`
	ProprietarioID string    `json:"proprietario_id"`
	Proprietario   string    `json:"proprietario"`
	Cidade         string    `json:"cidade"`
	Titulo         string    `json:"titulo"`
	Autor          string    `json:"autor"`
	Genero         string    `json:"genero"`
	Estado         string    `json:"estado"`
	Descricao      string    `json:"descricao"`
	Modalidade     string    `json:"modalidade"`
	Desejo         string    `json:"desejo"`
	PrecoCentavos  int       `json:"preco_centavos"`
	Capa           string    `json:"capa"`
	CriadoEm       time.Time `json:"criado_em"`
}
type Conversa struct {
	Identificador string `json:"identificador"`
	LivroID       string `json:"livro_id"`
	Titulo        string `json:"titulo"`
	Interlocutor  string `json:"interlocutor"`
}
type Mensagem struct {
	Identificador string    `json:"identificador"`
	RemetenteID   string    `json:"remetente_id"`
	Texto         string    `json:"texto"`
	CriadoEm      time.Time `json:"criado_em"`
}
type Servidor struct {
	Banco   *sql.DB
	Origens map[string]bool
}

//go:embed esquema.sql
var esquema string

// ---------------------------------------------------------
// Nome do bloco: Inicializacao do banco e migracao idempotente
// ---------------------------------------------------------
func AbrirBanco(endereco string) (*sql.DB, error) {
	banco, erro := sql.Open("pgx", endereco)
	if erro != nil {
		return nil, erro
	}
	banco.SetMaxOpenConns(10)
	contexto, cancelar := context.WithTimeout(context.Background(), 20*time.Second)
	defer cancelar()
	if erro = banco.PingContext(contexto); erro == nil {
		_, erro = banco.ExecContext(contexto, esquema)
	}
	if erro != nil {
		banco.Close()
		return nil, erro
	}
	return banco, nil
}

// ---------------------------------------------------------
// Nome do bloco: Respostas uniformes e leitura estrita de requisicoes
// ---------------------------------------------------------
func responder(saida http.ResponseWriter, codigo int, dados any) {
	saida.Header().Set("Content-Type", "application/json; charset=utf-8")
	saida.Header().Set("Cache-Control", "no-store")
	saida.WriteHeader(codigo)
	estado := "sucesso"
	if codigo >= 400 {
		estado = "erro"
	}
	json.NewEncoder(saida).Encode(map[string]any{"status": estado, "code": codigo, "data": dados})
}
func falhar(saida http.ResponseWriter, codigo int, mensagem string) {
	responder(saida, codigo, map[string]string{"message": mensagem})
}
func ler(saida http.ResponseWriter, requisicao *http.Request, destino any) bool {
	requisicao.Body = http.MaxBytesReader(saida, requisicao.Body, 8<<20)
	decodificador := json.NewDecoder(requisicao.Body)
	decodificador.DisallowUnknownFields()
	if erro := decodificador.Decode(destino); erro != nil {
		falhar(saida, 400, "JSON invalido ou campos desconhecidos.")
		return false
	}
	if decodificador.Decode(&struct{}{}) != io.EOF {
		falhar(saida, 400, "Envie apenas um objeto JSON.")
		return false
	}
	return true
}
func identificador() string {
	bytes := make([]byte, 32)
	if _, erro := rand.Read(bytes); erro != nil {
		panic(erro)
	}
	return hex.EncodeToString(bytes)
}
func hashToken(token string) string {
	resumo := sha256.Sum256([]byte(token))
	return hex.EncodeToString(resumo[:])
}
func (servidor *Servidor) erroBanco(saida http.ResponseWriter, erro error) {
	log.Printf("Falha de persistencia: %v", erro)
	falhar(saida, 500, "Nao foi possivel concluir a operacao.")
}

// ---------------------------------------------------------
// Nome do bloco: Rotas, CORS restrito e autenticacao das operacoes privadas
// ---------------------------------------------------------
func (servidor *Servidor) Handler() http.Handler {
	rotas := http.NewServeMux()
	rotas.HandleFunc("GET /status", func(saida http.ResponseWriter, requisicao *http.Request) {
		contexto, cancelar := context.WithTimeout(requisicao.Context(), 2*time.Second)
		defer cancelar()
		if erro := servidor.Banco.PingContext(contexto); erro != nil {
			falhar(saida, 503, "Banco indisponivel.")
			return
		}
		responder(saida, 200, map[string]string{"message": "API Core Backend (Go) conectada com sucesso"})
	})
	rotas.HandleFunc("POST /api/v1/auth/cadastro", servidor.cadastrar)
	rotas.HandleFunc("POST /api/v1/auth/login", servidor.entrar)
	rotas.HandleFunc("GET /api/v1/livros", servidor.listarLivros)
	rotas.HandleFunc("POST /api/v1/auth/sair", servidor.privado(servidor.sair))
	rotas.HandleFunc("GET /api/v1/perfil", servidor.privado(servidor.perfil))
	rotas.HandleFunc("POST /api/v1/livros", servidor.privado(servidor.publicar))
	rotas.HandleFunc("PUT /api/v1/livros/{livro}", servidor.privado(servidor.publicar))
	rotas.HandleFunc("DELETE /api/v1/livros/{livro}", servidor.privado(servidor.remover))
	rotas.HandleFunc("GET /api/v1/conversas", servidor.privado(servidor.conversas))
	rotas.HandleFunc("POST /api/v1/conversas", servidor.privado(servidor.iniciarConversa))
	rotas.HandleFunc("GET /api/v1/conversas/{conversa}/mensagens", servidor.privado(servidor.listarMensagens))
	rotas.HandleFunc("POST /api/v1/conversas/{conversa}/mensagens", servidor.privado(servidor.enviarMensagem))
	return http.HandlerFunc(func(saida http.ResponseWriter, requisicao *http.Request) {
		saida.Header().Set("X-Content-Type-Options", "nosniff")
		origem := requisicao.Header.Get("Origin")
		if origem != "" {
			saida.Header().Set("Vary", "Origin")
			if !servidor.Origens[origem] {
				falhar(saida, 403, "Origem nao permitida.")
				return
			}
			saida.Header().Set("Access-Control-Allow-Origin", origem)
			saida.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
			saida.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		}
		if requisicao.Method == "OPTIONS" {
			saida.WriteHeader(204)
			return
		}
		rotas.ServeHTTP(saida, requisicao)
	})
}
func (servidor *Servidor) privado(acao func(http.ResponseWriter, *http.Request, string)) http.HandlerFunc {
	return func(saida http.ResponseWriter, requisicao *http.Request) {
		cabecalho := requisicao.Header.Get("Authorization")
		if !strings.HasPrefix(cabecalho, "Bearer ") {
			falhar(saida, 401, "Entre na sua conta.")
			return
		}
		var usuario string
		erro := servidor.Banco.QueryRowContext(requisicao.Context(), "SELECT usuario_id FROM sessoes WHERE token_hash=$1 AND expira_em>now()", hashToken(strings.TrimPrefix(cabecalho, "Bearer "))).Scan(&usuario)
		if errors.Is(erro, sql.ErrNoRows) {
			falhar(saida, 401, "Sessao expirada ou invalida.")
			return
		}
		if erro != nil {
			servidor.erroBanco(saida, erro)
			return
		}
		acao(saida, requisicao, usuario)
	}
}
func (servidor *Servidor) sessao(saida http.ResponseWriter, requisicao *http.Request, usuario Usuario, codigo int) {
	token := identificador()
	expiracao := time.Now().UTC().Add(24 * time.Hour)
	_, erro := servidor.Banco.ExecContext(requisicao.Context(), "INSERT INTO sessoes(token_hash,usuario_id,expira_em) VALUES($1,$2,$3)", hashToken(token), usuario.Identificador, expiracao)
	if erro != nil {
		servidor.erroBanco(saida, erro)
		return
	}
	responder(saida, codigo, map[string]any{"token": token, "expira_em": expiracao, "usuario": usuario})
}
func (servidor *Servidor) cadastrar(saida http.ResponseWriter, requisicao *http.Request) {
	var entrada struct {
		Nome   string `json:"nome"`
		Email  string `json:"email"`
		Senha  string `json:"senha"`
		Cidade string `json:"cidade"`
	}
	if !ler(saida, requisicao, &entrada) {
		return
	}
	entrada.Nome = strings.TrimSpace(entrada.Nome)
	entrada.Cidade = strings.TrimSpace(entrada.Cidade)
	entrada.Email = strings.ToLower(strings.TrimSpace(entrada.Email))
	endereco, erroEmail := mail.ParseAddress(entrada.Email)
	if entrada.Nome == "" || len(entrada.Nome) > 120 || entrada.Cidade == "" || len(entrada.Cidade) > 120 || erroEmail != nil || endereco.Address != entrada.Email || len(entrada.Email) > 254 || len(entrada.Senha) < 8 || len(entrada.Senha) > 72 {
		falhar(saida, 400, "Informe nome, cidade, e-mail valido e senha de 8 a 72 bytes.")
		return
	}
	senhaHash, erro := bcrypt.GenerateFromPassword([]byte(entrada.Senha), bcrypt.DefaultCost)
	if erro != nil {
		servidor.erroBanco(saida, erro)
		return
	}
	usuario := Usuario{identificador(), entrada.Nome, entrada.Email, entrada.Cidade}
	_, erro = servidor.Banco.ExecContext(requisicao.Context(), "INSERT INTO usuarios(identificador,nome,email,senha_hash,cidade) VALUES($1,$2,$3,$4,$5)", usuario.Identificador, usuario.Nome, usuario.Email, string(senhaHash), usuario.Cidade)
	if erro != nil {
		var erroPostgres *pgconn.PgError
		if errors.As(erro, &erroPostgres) && erroPostgres.Code == "23505" {
			falhar(saida, 409, "E-mail ja cadastrado.")
			return
		}
		servidor.erroBanco(saida, erro)
		return
	}
	servidor.sessao(saida, requisicao, usuario, 201)
}
func (servidor *Servidor) entrar(saida http.ResponseWriter, requisicao *http.Request) {
	var entrada struct {
		Email string `json:"email"`
		Senha string `json:"senha"`
	}
	if !ler(saida, requisicao, &entrada) {
		return
	}
	var usuario Usuario
	var senhaHash string
	erro := servidor.Banco.QueryRowContext(requisicao.Context(), "SELECT identificador,nome,email,cidade,senha_hash FROM usuarios WHERE email=$1", strings.ToLower(strings.TrimSpace(entrada.Email))).Scan(&usuario.Identificador, &usuario.Nome, &usuario.Email, &usuario.Cidade, &senhaHash)
	if erro != nil && !errors.Is(erro, sql.ErrNoRows) {
		servidor.erroBanco(saida, erro)
		return
	}
	if erro != nil || bcrypt.CompareHashAndPassword([]byte(senhaHash), []byte(entrada.Senha)) != nil {
		falhar(saida, 401, "E-mail ou senha incorretos.")
		return
	}
	servidor.sessao(saida, requisicao, usuario, 200)
}
func (servidor *Servidor) sair(saida http.ResponseWriter, requisicao *http.Request, usuario string) {
	_, erro := servidor.Banco.ExecContext(requisicao.Context(), "DELETE FROM sessoes WHERE token_hash=$1", hashToken(strings.TrimPrefix(requisicao.Header.Get("Authorization"), "Bearer ")))
	if erro != nil {
		servidor.erroBanco(saida, erro)
		return
	}
	responder(saida, 200, map[string]string{"message": "Sessao encerrada."})
}

// ---------------------------------------------------------
// Nome do bloco: Catalogo persistido, validacao da oferta e propriedade
// ---------------------------------------------------------
const consultaLivros = "SELECT l.identificador,l.proprietario_id,u.nome,u.cidade,l.titulo,l.autor,l.genero,l.estado,l.descricao,l.modalidade,l.desejo,l.preco_centavos,l.capa,l.criado_em FROM livros l JOIN usuarios u ON u.identificador=l.proprietario_id "

func (servidor *Servidor) buscarLivros(contexto context.Context, condicao string, argumentos ...any) ([]Livro, error) {
	registros, erro := servidor.Banco.QueryContext(contexto, consultaLivros+condicao, argumentos...)
	if erro != nil {
		return nil, erro
	}
	defer registros.Close()
	livros := []Livro{}
	for registros.Next() {
		var livro Livro
		if erro = registros.Scan(&livro.Identificador, &livro.ProprietarioID, &livro.Proprietario, &livro.Cidade, &livro.Titulo, &livro.Autor, &livro.Genero, &livro.Estado, &livro.Descricao, &livro.Modalidade, &livro.Desejo, &livro.PrecoCentavos, &livro.Capa, &livro.CriadoEm); erro != nil {
			return nil, erro
		}
		livros = append(livros, livro)
	}
	return livros, registros.Err()
}
func (servidor *Servidor) listarLivros(saida http.ResponseWriter, requisicao *http.Request) {
	consulta := requisicao.URL.Query()
	livros, erro := servidor.buscarLivros(requisicao.Context(), "WHERE ($1='' OR concat_ws(' ',l.titulo,l.autor,l.genero,u.cidade) ILIKE '%' || $1 || '%') AND ($2='' OR l.modalidade=$2) ORDER BY l.criado_em DESC LIMIT 100", strings.TrimSpace(consulta.Get("busca")), consulta.Get("modalidade"))
	if erro != nil {
		servidor.erroBanco(saida, erro)
		return
	}
	responder(saida, 200, map[string]any{"livros": livros})
}
func validarLivro(livro *Livro) error {
	livro.Titulo = strings.TrimSpace(livro.Titulo)
	livro.Autor = strings.TrimSpace(livro.Autor)
	livro.Descricao = strings.TrimSpace(livro.Descricao)
	livro.Desejo = strings.TrimSpace(livro.Desejo)
	if livro.Titulo == "" || len(livro.Titulo) > 200 || livro.Autor == "" || len(livro.Autor) > 200 || livro.Genero == "" || len(livro.Genero) > 80 || livro.Descricao == "" || len(livro.Descricao) > 3000 || len(livro.Desejo) > 500 {
		return fmt.Errorf("Informe titulo, autor, genero e descricao dentro dos limites.")
	}
	if livro.Estado != "novo" && livro.Estado != "seminovo" && livro.Estado != "bom" && livro.Estado != "marcas" {
		return fmt.Errorf("Estado de conservacao invalido.")
	}
	if livro.Modalidade != "troca" && livro.Modalidade != "venda" && livro.Modalidade != "doacao" {
		return fmt.Errorf("Modalidade invalida.")
	}
	if livro.Modalidade == "troca" && livro.Desejo == "" {
		return fmt.Errorf("Informe o que deseja em troca.")
	}
	if livro.PrecoCentavos < 0 || livro.PrecoCentavos > 100000000 || (livro.Modalidade == "venda" && livro.PrecoCentavos == 0) || (livro.Modalidade != "venda" && livro.PrecoCentavos != 0) {
		return fmt.Errorf("Informe preco positivo apenas para venda.")
	}
	if livro.Capa != "" {
		prefixo, conteudo, encontrado := strings.Cut(livro.Capa, ",")
		if !encontrado || (prefixo != "data:image/jpeg;base64" && prefixo != "data:image/png;base64") {
			return fmt.Errorf("Capa deve ser JPEG ou PNG em Base64.")
		}
		bytes, erro := base64.StdEncoding.DecodeString(conteudo)
		if erro != nil || len(bytes) > 5<<20 || len(bytes) == 0 {
			return fmt.Errorf("Capa invalida ou maior que 5 MB.")
		}
		tipo := http.DetectContentType(bytes)
		if (prefixo == "data:image/png;base64" && tipo != "image/png") || (prefixo == "data:image/jpeg;base64" && tipo != "image/jpeg") {
			return fmt.Errorf("Conteudo da capa nao corresponde ao formato informado.")
		}
	}
	return nil
}
func (servidor *Servidor) publicar(saida http.ResponseWriter, requisicao *http.Request, usuario string) {
	// Apenas os campos de entrada sao aceitos; a identidade do proprietario vem da sessao.
	var entrada struct {
		Titulo        string `json:"titulo"`
		Autor         string `json:"autor"`
		Genero        string `json:"genero"`
		Estado        string `json:"estado"`
		Descricao     string `json:"descricao"`
		Modalidade    string `json:"modalidade"`
		Desejo        string `json:"desejo"`
		PrecoCentavos int    `json:"preco_centavos"`
		Capa          string `json:"capa"`
	}
	if !ler(saida, requisicao, &entrada) {
		return
	}
	livro := Livro{Titulo: entrada.Titulo, Autor: entrada.Autor, Genero: entrada.Genero, Estado: entrada.Estado, Descricao: entrada.Descricao, Modalidade: entrada.Modalidade, Desejo: entrada.Desejo, PrecoCentavos: entrada.PrecoCentavos, Capa: entrada.Capa}
	if erro := validarLivro(&livro); erro != nil {
		falhar(saida, 400, erro.Error())
		return
	}
	if livroID := requisicao.PathValue("livro"); livroID != "" {
        resultado, erro := servidor.Banco.ExecContext(requisicao.Context(), "UPDATE livros SET titulo=$1,autor=$2,genero=$3,estado=$4,descricao=$5,modalidade=$6,desejo=$7,preco_centavos=$8,capa=$9 WHERE identificador=$10 AND proprietario_id=$11", livro.Titulo,livro.Autor,livro.Genero,livro.Estado,livro.Descricao,livro.Modalidade,livro.Desejo,livro.PrecoCentavos,livro.Capa,livroID,usuario)
        if erro != nil { servidor.erroBanco(saida,erro); return }
        quantidade,_ := resultado.RowsAffected()
        if quantidade == 0 { falhar(saida,404,"Livro nao encontrado na sua estante."); return }
        responder(saida,200,map[string]string{"identificador":livroID}); return
    }
    livro.Identificador = identificador()
	_, erro := servidor.Banco.ExecContext(requisicao.Context(), "INSERT INTO livros(identificador,proprietario_id,titulo,autor,genero,estado,descricao,modalidade,desejo,preco_centavos,capa) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)", livro.Identificador, usuario, livro.Titulo, livro.Autor, livro.Genero, livro.Estado, livro.Descricao, livro.Modalidade, livro.Desejo, livro.PrecoCentavos, livro.Capa)
	if erro != nil {
		servidor.erroBanco(saida, erro)
		return
	}
	responder(saida, 201, map[string]string{"identificador": livro.Identificador})
}
func (servidor *Servidor) remover(saida http.ResponseWriter, requisicao *http.Request, usuario string) {
	resultado, erro := servidor.Banco.ExecContext(requisicao.Context(), "DELETE FROM livros WHERE identificador=$1 AND proprietario_id=$2", requisicao.PathValue("livro"), usuario)
	if erro != nil {
		servidor.erroBanco(saida, erro)
		return
	}
	quantidade, _ := resultado.RowsAffected()
	if quantidade == 0 {
		falhar(saida, 404, "Livro nao encontrado na sua estante.")
		return
	}
	responder(saida, 200, map[string]string{"message": "Livro removido."})
}
func (servidor *Servidor) perfil(saida http.ResponseWriter, requisicao *http.Request, usuarioID string) {
	var usuario Usuario
	erro := servidor.Banco.QueryRowContext(requisicao.Context(), "SELECT identificador,nome,email,cidade FROM usuarios WHERE identificador=$1", usuarioID).Scan(&usuario.Identificador, &usuario.Nome, &usuario.Email, &usuario.Cidade)
	if erro != nil {
		servidor.erroBanco(saida, erro)
		return
	}
	livros, erro := servidor.buscarLivros(requisicao.Context(), "WHERE l.proprietario_id=$1 ORDER BY l.criado_em DESC", usuarioID)
	if erro != nil {
		servidor.erroBanco(saida, erro)
		return
	}
	responder(saida, 200, map[string]any{"usuario": usuario, "livros": livros})
}

// ---------------------------------------------------------
// Nome do bloco: Conversas por livro e mensagens acessiveis apenas aos participantes
// ---------------------------------------------------------
func (servidor *Servidor) iniciarConversa(saida http.ResponseWriter, requisicao *http.Request, usuario string) {
	var entrada struct {
		LivroID string `json:"livro_id"`
	}
	if !ler(saida, requisicao, &entrada) {
		return
	}
	var dono string
	erro := servidor.Banco.QueryRowContext(requisicao.Context(), "SELECT proprietario_id FROM livros WHERE identificador=$1", entrada.LivroID).Scan(&dono)
	if errors.Is(erro, sql.ErrNoRows) {
		falhar(saida, 404, "Livro nao encontrado.")
		return
	}
	if erro != nil {
		servidor.erroBanco(saida, erro)
		return
	}
	if dono == usuario {
		falhar(saida, 400, "Voce nao pode negociar seu proprio anuncio.")
		return
	}
	var conversaID string
	erro = servidor.Banco.QueryRowContext(requisicao.Context(), "INSERT INTO conversas(identificador,livro_id,interessado_id) VALUES($1,$2,$3) ON CONFLICT(livro_id,interessado_id) DO UPDATE SET livro_id=EXCLUDED.livro_id RETURNING identificador", identificador(), entrada.LivroID, usuario).Scan(&conversaID)
	if erro != nil {
		servidor.erroBanco(saida, erro)
		return
	}
	responder(saida, 200, map[string]string{"identificador": conversaID})
}
func (servidor *Servidor) conversas(saida http.ResponseWriter, requisicao *http.Request, usuario string) {
	registros, erro := servidor.Banco.QueryContext(requisicao.Context(), "SELECT c.identificador,l.identificador,l.titulo,CASE WHEN c.interessado_id=$1 THEN dono.nome ELSE leitor.nome END FROM conversas c JOIN livros l ON l.identificador=c.livro_id JOIN usuarios dono ON dono.identificador=l.proprietario_id JOIN usuarios leitor ON leitor.identificador=c.interessado_id WHERE c.interessado_id=$1 OR l.proprietario_id=$1 ORDER BY c.criado_em DESC", usuario)
	if erro != nil {
		servidor.erroBanco(saida, erro)
		return
	}
	defer registros.Close()
	conversas := []Conversa{}
	for registros.Next() {
		var conversa Conversa
		if erro = registros.Scan(&conversa.Identificador, &conversa.LivroID, &conversa.Titulo, &conversa.Interlocutor); erro != nil {
			servidor.erroBanco(saida, erro)
			return
		}
		conversas = append(conversas, conversa)
	}
	if erro = registros.Err(); erro != nil {
		servidor.erroBanco(saida, erro)
		return
	}
	responder(saida, 200, map[string]any{"conversas": conversas})
}
func (servidor *Servidor) autorizarConversa(saida http.ResponseWriter, requisicao *http.Request, usuario string) bool {
	var permitido bool
	erro := servidor.Banco.QueryRowContext(requisicao.Context(), "SELECT EXISTS(SELECT 1 FROM conversas c JOIN livros l ON l.identificador=c.livro_id WHERE c.identificador=$1 AND (c.interessado_id=$2 OR l.proprietario_id=$2))", requisicao.PathValue("conversa"), usuario).Scan(&permitido)
	if erro != nil {
		servidor.erroBanco(saida, erro)
		return false
	}
	if !permitido {
		falhar(saida, 404, "Conversa nao encontrada.")
		return false
	}
	return true
}
func (servidor *Servidor) listarMensagens(saida http.ResponseWriter, requisicao *http.Request, usuario string) {
	if !servidor.autorizarConversa(saida, requisicao, usuario) {
		return
	}
	registros, erro := servidor.Banco.QueryContext(requisicao.Context(), "SELECT identificador,remetente_id,texto,criado_em FROM (SELECT identificador,remetente_id,texto,criado_em FROM mensagens WHERE conversa_id=$1 ORDER BY criado_em DESC,identificador DESC LIMIT 200) recentes ORDER BY criado_em,identificador", requisicao.PathValue("conversa"))
	if erro != nil {
		servidor.erroBanco(saida, erro)
		return
	}
	defer registros.Close()
	mensagens := []Mensagem{}
	for registros.Next() {
		var mensagem Mensagem
		if erro = registros.Scan(&mensagem.Identificador, &mensagem.RemetenteID, &mensagem.Texto, &mensagem.CriadoEm); erro != nil {
			servidor.erroBanco(saida, erro)
			return
		}
		mensagens = append(mensagens, mensagem)
	}
	if erro = registros.Err(); erro != nil {
		servidor.erroBanco(saida, erro)
		return
	}
	responder(saida, 200, map[string]any{"mensagens": mensagens})
}
func (servidor *Servidor) enviarMensagem(saida http.ResponseWriter, requisicao *http.Request, usuario string) {
	if !servidor.autorizarConversa(saida, requisicao, usuario) {
		return
	}
	var entrada struct {
		Texto string `json:"texto"`
	}
	if !ler(saida, requisicao, &entrada) {
		return
	}
	entrada.Texto = strings.TrimSpace(entrada.Texto)
	if entrada.Texto == "" || len(entrada.Texto) > 2000 {
		falhar(saida, 400, "Mensagem deve ter de 1 a 2000 bytes.")
		return
	}
	_, erro := servidor.Banco.ExecContext(requisicao.Context(), "INSERT INTO mensagens(identificador,conversa_id,remetente_id,texto) VALUES($1,$2,$3,$4)", identificador(), requisicao.PathValue("conversa"), usuario, entrada.Texto)
	if erro != nil {
		servidor.erroBanco(saida, erro)
		return
	}
	responder(saida, 201, map[string]string{"message": "Mensagem enviada."})
}
