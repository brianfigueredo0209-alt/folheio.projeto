package main

import (
	"github.com/folheio/api-core/internal/plataforma"
	"log"
	"net/http"
	"os"
	"strings"
	"time"
)

// ---------------------------------------------------------
// Nome do bloco: Servidor HTTP com banco persistente e origens configuraveis
// ---------------------------------------------------------
func main() {
	endereco := os.Getenv("DATABASE_URL")
	if endereco == "" {
		log.Fatal("Configure DATABASE_URL para conectar ao PostgreSQL.")
	}
	banco, erro := plataforma.AbrirBanco(endereco)
	if erro != nil {
		log.Fatal(erro)
	}
	defer banco.Close()
	origens := map[string]bool{}
	for _, origem := range strings.Split(os.Getenv("CORS_ORIGINS"), ",") {
		origens[strings.TrimSpace(origem)] = true
	}
	porta := os.Getenv("PORT")
	if porta == "" {
		porta = "8080"
	}
	plataformaAPI := &plataforma.Servidor{Banco: banco, Origens: origens}
	servidor := &http.Server{Addr: ":" + porta, Handler: plataformaAPI.Handler(), ReadHeaderTimeout: 5 * time.Second, ReadTimeout: 20 * time.Second, WriteTimeout: 20 * time.Second, IdleTimeout: 60 * time.Second}
	log.Printf("API FOLHEIO na porta %s", porta)
	log.Fatal(servidor.ListenAndServe())
}
