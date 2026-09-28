package main

import (
	"encoding/json"
	"log"
	"net/http"
)

type StatusResponse struct {
	Status string `json:"status"`
	Code   int    `json:"code"`
	Data   struct {
		Message string `json:"message"`
	} `json:"data"`
}

func main() {
	mux := http.NewServeMux()

	mux.HandleFunc("/status", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)

		response := StatusResponse{
			Status: "sucesso",
			Code:   200,
		}
		response.Data.Message = "API Core Backend (Go) conectada com sucesso"

		json.NewEncoder(w).Encode(response)
	})

	log.Println("Servidor Go rodando na porta 8080...")
	if err := http.ListenAndServe(":8080", mux); err != nil {
		log.Fatalf("Erro ao iniciar o servidor: %v", err)
	}
}
