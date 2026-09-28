from fastapi import FastAPI

app = FastAPI(title="Folheio AI & Recommendation Service", version="1.0.0")

@app.get("/status")
def get_status():
    return {
        "status": "sucesso",
        "code": 200,
        "data": {
            "message": "Serviço de IA e Processamento (Python) conectado com sucesso"
        }
    }

@app.get("/recomendacoes/{usuario_id}")
def get_recomendacoes(usuario_id: int):
    # Simulação inicial do algoritmo de recomendação de livros
    livros_recomendados = [
        {"id": 1, "titulo": "Dom Casmurro", "autor": "Machado de Assis", "compatibilidade": "98%"},
        {"id": 2, "titulo": "O Cortiço", "autor": "Aluísio Azevedo", "compatibilidade": "91%"}
    ]
    return {
        "status": "sucesso",
        "code": 200,
        "usuario_id": usuario_id,
        "recomendacoes": livros_recomendados
    }
