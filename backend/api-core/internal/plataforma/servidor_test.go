package plataforma

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"strings"
	"testing"
)

// ---------------------------------------------------------
// Nome do bloco: Validacao de ofertas e formatos perigosos de capa
// ---------------------------------------------------------
func TestValidacaoDaOferta(t *testing.T) {
	base := Livro{Titulo: "Duna", Autor: "Frank Herbert", Genero: "fantasia", Estado: "bom", Descricao: "Edicao conservada", Modalidade: "troca", Desejo: "Romances"}
	casos := []struct {
		nome    string
		alterar func(*Livro)
	}{
		{"titulo vazio", func(livro *Livro) { livro.Titulo = " " }},
		{"venda sem preco", func(livro *Livro) { livro.Modalidade = "venda" }},
		{"doacao com preco", func(livro *Livro) { livro.Modalidade = "doacao"; livro.PrecoCentavos = 1 }},
		{"troca sem desejo", func(livro *Livro) { livro.Desejo = "" }},
		{"estado desconhecido", func(livro *Livro) { livro.Estado = "qualquer" }},
		{"capa javascript", func(livro *Livro) { livro.Capa = "javascript:alert(1)" }},
		{"capa falsa", func(livro *Livro) { livro.Capa = "data:image/png;base64,aHRtbA==" }},
	}
	if erro := validarLivro(&base); erro != nil {
		t.Fatal(erro)
	}
	for _, caso := range casos {
		t.Run(caso.nome, func(t *testing.T) {
			livro := base
			caso.alterar(&livro)
			if validarLivro(&livro) == nil {
				t.Fatal("Oferta invalida aceita")
			}
		})
	}
}

// ---------------------------------------------------------
// Nome do bloco: Integracao real com PostgreSQL em banco exclusivo de testes
// ---------------------------------------------------------
func TestFluxoCompartilhado(t *testing.T) {
	endereco := os.Getenv("TEST_DATABASE_URL")
	if endereco == "" {
		t.Skip("Configure TEST_DATABASE_URL para executar a integracao com PostgreSQL.")
	}
	if !strings.Contains(endereco, "folheio_teste") {
		t.Fatal("Utilize o banco isolado folheio_teste")
	}
	banco, erro := AbrirBanco(endereco)
	if erro != nil {
		t.Fatal(erro)
	}
	t.Cleanup(func() { banco.Close() })
	servidor := &Servidor{Banco: banco, Origens: map[string]bool{"http://localhost:5173": true}}
	handler := servidor.Handler()
	chamada := func(metodo, caminho, token string, entrada any, codigo int) map[string]json.RawMessage {
		t.Helper()
		corpo, _ := json.Marshal(entrada)
		requisicao := httptest.NewRequest(metodo, caminho, bytes.NewReader(corpo))
		if token != "" {
			requisicao.Header.Set("Authorization", "Bearer "+token)
		}
		resposta := httptest.NewRecorder()
		handler.ServeHTTP(resposta, requisicao)
		if resposta.Code != codigo {
			t.Fatalf("%s %s: esperado %d, recebido %d: %s", metodo, caminho, codigo, resposta.Code, resposta.Body.String())
		}
		var envelope struct {
			Dados map[string]json.RawMessage `json:"data"`
		}
		if erro := json.Unmarshal(resposta.Body.Bytes(), &envelope); erro != nil {
			t.Fatal(erro)
		}
		return envelope.Dados
	}
	usuarios := []string{}
	t.Cleanup(func() {
		for _, usuario := range usuarios {
			_, erro := banco.Exec("DELETE FROM mensagens WHERE remetente_id=$1", usuario)
			if erro != nil {
				t.Error(erro)
			}
			_, erro = banco.Exec("DELETE FROM conversas WHERE interessado_id=$1", usuario)
			if erro != nil {
				t.Error(erro)
			}
			_, erro = banco.Exec("DELETE FROM livros WHERE proprietario_id=$1", usuario)
			if erro != nil {
				t.Error(erro)
			}
			_, erro = banco.Exec("DELETE FROM sessoes WHERE usuario_id=$1", usuario)
			if erro != nil {
				t.Error(erro)
			}
			_, erro = banco.Exec("DELETE FROM usuarios WHERE identificador=$1", usuario)
			if erro != nil {
				t.Error(erro)
			}
		}
	})
	cadastrar := func(nome string) (string, Usuario, string) {
		t.Helper()
		email := identificador() + "@teste.example"
		resposta := chamada("POST", "/api/v1/auth/cadastro", "", map[string]string{"nome": nome, "email": email, "senha": "SenhaTeste123!", "cidade": "Maceio - AL"}, 201)
		var token string
		var usuario Usuario
		json.Unmarshal(resposta["token"], &token)
		json.Unmarshal(resposta["usuario"], &usuario)
		usuarios = append(usuarios, usuario.Identificador)
		var senhaArmazenada string
		banco.QueryRow("SELECT senha_hash FROM usuarios WHERE identificador=$1", usuario.Identificador).Scan(&senhaArmazenada)
		if senhaArmazenada == "SenhaTeste123!" || !strings.HasPrefix(senhaArmazenada, "$2") {
			t.Fatal("Senha nao protegida")
		}
		return token, usuario, email
	}
	tokenDono, dono, email := cadastrar("Publicador Android")
	tokenLeitor, leitor, _ := cadastrar("Leitor Web")
	tokenTerceiro, _, _ := cadastrar("Terceiro")
	chamada("GET", "/status", "", nil, 200)
	chamada("POST", "/api/v1/auth/login", "", map[string]string{"email": email, "senha": "errada"}, 401)
	chamada("POST", "/api/v1/auth/login", "", map[string]string{"email": email, "senha": "SenhaTeste123!"}, 200)
	chamada("POST", "/api/v1/auth/cadastro", "", map[string]string{"nome": "Duplicado", "email": email, "senha": "SenhaTeste123!", "cidade": "Maceio"}, 409)
	chamada("POST", "/api/v1/livros", "", map[string]string{"titulo": "Sem sessao"}, 401)
	resposta := chamada("POST", "/api/v1/livros", tokenDono, map[string]any{"titulo": "Livro compartilhado", "autor": "Autora", "genero": "romance", "estado": "bom", "descricao": "Publicado no Android", "modalidade": "troca", "desejo": "Outro romance", "preco_centavos": 0, "capa": ""}, 201)
	var livroID string
	json.Unmarshal(resposta["identificador"], &livroID)
	lista := chamada("GET", "/api/v1/livros?busca=compartilhado", "", nil, 200)
	var livros []Livro
	json.Unmarshal(lista["livros"], &livros)
	if len(livros) != 1 || livros[0].Identificador != livroID || livros[0].ProprietarioID != dono.Identificador {
		t.Fatal("Publicacao nao compartilhada")
	}
	perfil := chamada("GET", "/api/v1/perfil", tokenDono, nil, 200)
	json.Unmarshal(perfil["livros"], &livros)
	if len(livros) != 1 {
		t.Fatal("Livro ausente no perfil")
	}
	chamada("DELETE", "/api/v1/livros/"+livroID, tokenLeitor, nil, 404)
	chamada("POST", "/api/v1/conversas", tokenDono, map[string]string{"livro_id": livroID}, 400)
	conversa := chamada("POST", "/api/v1/conversas", tokenLeitor, map[string]string{"livro_id": livroID}, 200)
	var conversaID string
	json.Unmarshal(conversa["identificador"], &conversaID)
	repetida := chamada("POST", "/api/v1/conversas", tokenLeitor, map[string]string{"livro_id": livroID}, 200)
	if string(repetida["identificador"]) != string(conversa["identificador"]) {
		t.Fatal("Conversa duplicada")
	}
	caminho := "/api/v1/conversas/" + conversaID + "/mensagens"
	chamada("GET", caminho, tokenTerceiro, nil, 404)
	chamada("POST", caminho, tokenTerceiro, map[string]string{"texto": "Invasao"}, 404)
	chamada("POST", caminho, tokenLeitor, map[string]string{"texto": "Tenho interesse pelo site"}, 201)
	chamada("POST", caminho, tokenDono, map[string]string{"texto": "Disponivel no aplicativo"}, 201)
	mensagens := chamada("GET", caminho, tokenDono, nil, 200)
	var historico []Mensagem
	json.Unmarshal(mensagens["mensagens"], &historico)
	if len(historico) != 2 || historico[0].RemetenteID != leitor.Identificador || historico[1].RemetenteID != dono.Identificador {
		t.Fatal("Historico incorreto")
	}
	chamada("POST", caminho, tokenDono, map[string]string{"texto": " "}, 400)
	novaInstancia := &Servidor{Banco: banco, Origens: servidor.Origens}
	handler = novaInstancia.Handler()
	chamada("GET", caminho, tokenLeitor, nil, 200)
	chamada("POST", "/api/v1/auth/sair", tokenLeitor, nil, 200)
	chamada("GET", "/api/v1/perfil", tokenLeitor, nil, 401)
	banco.Exec("UPDATE sessoes SET expira_em=now()-interval '1 day' WHERE usuario_id=$1", dono.Identificador)
	chamada("GET", "/api/v1/perfil", tokenDono, nil, 401)
	requisicao := httptest.NewRequest(http.MethodOptions, "/api/v1/livros", nil)
	requisicao.Header.Set("Origin", "http://localhost:5173")
	respostaCORS := httptest.NewRecorder()
	handler.ServeHTTP(respostaCORS, requisicao)
	if respostaCORS.Code != 204 || respostaCORS.Header().Get("Access-Control-Allow-Origin") != "http://localhost:5173" {
		t.Fatal("CORS local nao permitido")
	}
	requisicao.Header.Set("Origin", "https://origem-invalida.example")
	respostaCORS = httptest.NewRecorder()
	handler.ServeHTTP(respostaCORS, requisicao)
	if respostaCORS.Code != 403 {
		t.Fatal("CORS aceitou origem desconhecida")
	}
}
