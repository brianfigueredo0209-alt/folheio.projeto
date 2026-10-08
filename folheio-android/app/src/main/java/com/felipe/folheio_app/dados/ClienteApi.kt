package com.felipe.folheio_app.dados

import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL

// ---------------------------------------------------------
// Nome do bloco: Cliente HTTP do mesmo contrato utilizado pela SPA Vue
// As chamadas devem ser executadas fora da thread principal.
// ---------------------------------------------------------
class ClienteApi(private val endereco: String) {
    var token: String = ""
    var usuario: JSONObject? = null

    fun requisitar(caminho: String, metodo: String = "GET", dados: JSONObject? = null): JSONObject {
        val conexao = URL(endereco.trimEnd('/') + caminho).openConnection() as HttpURLConnection
        try {
            conexao.requestMethod = metodo
            conexao.connectTimeout = 15_000
            conexao.readTimeout = 15_000
            conexao.setRequestProperty("Accept", "application/json")
            if (token.isNotEmpty()) conexao.setRequestProperty("Authorization", "Bearer $token")
            if (dados != null) {
                conexao.doOutput = true
                conexao.setRequestProperty("Content-Type", "application/json; charset=utf-8")
                conexao.outputStream.use { it.write(dados.toString().toByteArray(Charsets.UTF_8)) }
            }
            val codigo = conexao.responseCode
            val fluxo = if (codigo in 200..299) conexao.inputStream else conexao.errorStream
            val conteudo = fluxo?.bufferedReader(Charsets.UTF_8)?.use { it.readText() }
                ?: throw IllegalStateException("A API retornou uma resposta vazia.")
            val resposta = JSONObject(conteudo)
            if (codigo !in 200..299) {
                if (codigo == 401 && !caminho.startsWith("/api/v1/auth/")) {
                    token = ""
                    usuario = null
                }
                throw IllegalStateException(resposta.optJSONObject("data")?.optString("message") ?: "Falha HTTP $codigo.")
            }
            return resposta.getJSONObject("data")
        } finally {
            conexao.disconnect()
        }
    }

    fun autenticar(cadastro: Boolean, email: String, senha: String, nome: String, cidade: String) {
        val dados = JSONObject().put("email", email).put("senha", senha)
        if (cadastro) dados.put("nome", nome).put("cidade", cidade)
        val resposta = requisitar("/api/v1/auth/" + if (cadastro) "cadastro" else "login", "POST", dados)
        token = resposta.getString("token")
        usuario = resposta.getJSONObject("usuario")
    }
}
