package com.felipe.folheio_app

import android.app.AlertDialog
import android.graphics.BitmapFactory
import android.graphics.Color
import android.os.Bundle
import android.os.Handler
import android.os.Looper

import android.text.InputType

import android.util.Base64
import android.view.View
import android.widget.*
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import com.felipe.folheio_app.dados.ClienteApi
import org.json.JSONArray
import org.json.JSONObject
import java.math.BigDecimal
import java.util.concurrent.Executors

// ---------------------------------------------------------
// Nome do bloco: Navegacao Android nativa pelos fluxos do contrato compartilhado
// ---------------------------------------------------------
class MainActivity : AppCompatActivity() {
    private val executor = Executors.newSingleThreadExecutor()
    private val principal = Handler(Looper.getMainLooper())
    private lateinit var api: ClienteApi
    private lateinit var corpo: LinearLayout
    private lateinit var aviso: TextView
    private var geracaoTela = 0
    private var ocupada = false
    private var telaAtiva = ""
    private var capaSelecionada = ""
    private var previewCapa: ImageView? = null
    private var retornoAoChat: (() -> Unit)? = null
    private val atualizarChat = object : Runnable {
        override fun run() {
            retornoAoChat?.invoke()
            if (retornoAoChat != null) principal.postDelayed(this, 5000)
        }
    }

    private val selecionarCapa = registerForActivityResult(ActivityResultContracts.GetContent()) { endereco ->
        if (endereco != null && telaAtiva == "Publicar") {
            val geracao = geracaoTela
            pedir({
                val tipo = contentResolver.getType(endereco)
                require(tipo == "image/jpeg" || tipo == "image/png") { "Selecione uma imagem JPEG ou PNG." }
                val bytes = contentResolver.openInputStream(endereco)?.use { fluxo ->
                    val acumulador = java.io.ByteArrayOutputStream()
                    val bloco = ByteArray(8192)
                    while (true) {
                        val quantidade = fluxo.read(bloco)
                        if (quantidade == -1) break
                        require(acumulador.size() + quantidade <= 5 * 1024 * 1024) { "A capa deve ter ate 5 MB." }
                        acumulador.write(bloco, 0, quantidade)
                    }
                    acumulador.toByteArray()
                } ?: error("Nao foi possivel abrir a imagem.")
                require(BitmapFactory.decodeByteArray(bytes, 0, bytes.size) != null) { "Imagem invalida." }
                "data:$tipo;base64," + Base64.encodeToString(bytes, Base64.NO_WRAP)
            }, { capa ->
                if (geracao == geracaoTela) {
                    capaSelecionada = capa
                    mostrarCapa(previewCapa, capa)
                    aviso.text = "Capa selecionada."
                }
            })
        }
    }

    override fun onCreate(estado: Bundle?) {
        super.onCreate(estado)
        api = ClienteApi(BuildConfig.API_URL)
        login()
    }

    // ---------------------------------------------------------
    // Nome do bloco: Layout editorial, componentes e execucao de rede com estados visiveis
    // ---------------------------------------------------------
    private fun espaco(valor: Int): Int = (valor * resources.displayMetrics.density).toInt()
    private fun texto(conteudo: String, tamanho: Float = 16f): TextView =
        TextView(this).apply {
            text = conteudo; textSize = tamanho; setTextColor(Color.rgb(40, 37, 32))
            setPadding(0, espaco(8), 0, espaco(8))
        }
    private fun campo(rotulo: String, tipo: Int = InputType.TYPE_CLASS_TEXT): EditText {
        corpo.addView(texto(rotulo, 14f))
        return EditText(this).apply {
            hint = rotulo; inputType = tipo; setSingleLine(tipo != (InputType.TYPE_CLASS_TEXT or InputType.TYPE_TEXT_FLAG_MULTI_LINE))
            corpo.addView(this)
        }
    }
    private fun botao(rotulo: String, destino: LinearLayout = corpo, acao: () -> Unit): Button =
        Button(this).apply {
            text = rotulo; isAllCaps = false; setOnClickListener { if (!ocupada) acao() }
            destino.addView(this)
        }
    private fun prepararTela(titulo: String, navegacao: Boolean = true) {
        geracaoTela++; telaAtiva = titulo
        retornoAoChat = null; principal.removeCallbacks(atualizarChat)
        previewCapa = null
        val rolagem = ScrollView(this).apply { setBackgroundColor(Color.rgb(247, 244, 237)); isFillViewport = true }
        corpo = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(espaco(20), espaco(40), espaco(20), espaco(24))
        }
        rolagem.addView(corpo)
        setContentView(rolagem)
        corpo.addView(texto("FOLHEIO", 28f))
        corpo.addView(texto(titulo, 24f))
        if (navegacao) {
            val primeiraLinha = LinearLayout(this)
            corpo.addView(primeiraLinha)
            botao("Inicio", primeiraLinha) { catalogo() }
            botao("Publicar", primeiraLinha) { if (api.token.isEmpty()) login() else publicar() }
            val segundaLinha = LinearLayout(this)
            corpo.addView(segundaLinha)
            botao("Perfil", segundaLinha) { perfil() }
            botao("Conversas", segundaLinha) { conversas() }
            botao("Sair", segundaLinha) {
                pedir({ api.requisitar("/api/v1/auth/sair", "POST") }, {
                    api.token = ""; api.usuario = null; login()
                })
            }
        }
        aviso = texto("", 14f).apply { accessibilityLiveRegion = View.ACCESSIBILITY_LIVE_REGION_POLITE }
        corpo.addView(aviso)
    }
    private fun <Resultado> pedir(operacao: () -> Resultado, concluir: (Resultado) -> Unit, silenciosa: Boolean = false) {
        if (ocupada) return
        ocupada = true
        val geracao = geracaoTela
        if (!silenciosa) aviso.text = "Aguarde..."
        executor.execute {
            val resultado = runCatching(operacao)
            principal.post {
                ocupada = false
                if (isFinishing || isDestroyed || geracao != geracaoTela) return@post
                resultado.fold(
                    onSuccess = { if (!silenciosa) aviso.text = ""; concluir(it) },
                    onFailure = {
                        if (api.token.isEmpty() && telaAtiva != "Login" && telaAtiva != "Cadastro") {
                            login(); aviso.text = it.message ?: "Entre novamente."
                        } else aviso.text = it.message ?: "Nao foi possivel conectar a API."
                    }
                )
            }
        }
    }
    private fun mostrarCapa(imagem: ImageView?, capa: String) {
        if (capa.isEmpty() || imagem == null) return
        runCatching {
            val bytes = Base64.decode(capa.substringAfter(','), Base64.DEFAULT)
            val limites = BitmapFactory.Options().apply { inJustDecodeBounds = true }
            BitmapFactory.decodeByteArray(bytes, 0, bytes.size, limites)
            val opcoes = BitmapFactory.Options().apply { inSampleSize = maxOf(1, maxOf(limites.outWidth, limites.outHeight) / 600) }
            imagem.setImageBitmap(BitmapFactory.decodeByteArray(bytes, 0, bytes.size, opcoes))
        }.onFailure { aviso.text = "Nao foi possivel exibir a capa." }
    }

    // ---------------------------------------------------------
    // Nome do bloco: Cadastro e autenticacao do leitor
    // ---------------------------------------------------------
    private fun login(cadastro: Boolean = false) {
        prepararTela(if (cadastro) "Cadastro" else "Login", false)
        val nome = if (cadastro) campo("Nome") else null
        val cidade = if (cadastro) campo("Cidade e estado") else null
        val email = campo("E-mail", InputType.TYPE_CLASS_TEXT or InputType.TYPE_TEXT_VARIATION_EMAIL_ADDRESS)
        val senha = campo("Senha", InputType.TYPE_CLASS_TEXT or InputType.TYPE_TEXT_VARIATION_PASSWORD)
        botao(if (cadastro) "Criar conta" else "Entrar") {
            val emailDigitado = email.text.toString().trim()
            val senhaDigitada = senha.text.toString()
            val nomeDigitado = nome?.text?.toString().orEmpty()
            val cidadeDigitada = cidade?.text?.toString().orEmpty()
            if (emailDigitado.isEmpty() || senhaDigitada.isEmpty()) {
                aviso.text = "Informe e-mail e senha."; return@botao
            }
            pedir({ api.autenticar(cadastro, emailDigitado, senhaDigitada, nomeDigitado, cidadeDigitada) }, { catalogo() })
        }
        botao(if (cadastro) "Ja tenho uma conta" else "Cadastrar estante") { login(!cadastro) }
    }

    // ---------------------------------------------------------
    // Nome do bloco: Catalogo e pesquisa de ofertas compartilhadas
    // ---------------------------------------------------------
    private fun catalogo() {
        prepararTela("Inicio")
        val pesquisa = campo("Buscar por titulo, autor, genero ou cidade")
        val lista = LinearLayout(this).apply { orientation = LinearLayout.VERTICAL }
        corpo.addView(lista)
        botao("Atualizar catalogo") { carregarCatalogo(pesquisa.text.toString(), lista) }
        carregarCatalogo("", lista)
    }
    private fun carregarCatalogo(pesquisa: String, lista: LinearLayout) {
        pedir({
            api.requisitar("/api/v1/livros?busca=" + java.net.URLEncoder.encode(pesquisa, "UTF-8")).getJSONArray("livros")
        }, { livros -> renderizarLivros(livros, lista, false) })
    }
    private fun renderizarLivros(livros: JSONArray, destino: LinearLayout, propriaEstante: Boolean) {
        destino.removeAllViews()
        if (livros.length() == 0) destino.addView(texto("Nenhum livro encontrado."))
        for (indice in 0 until livros.length()) {
            val livro = livros.getJSONObject(indice)
            val cartao = LinearLayout(this).apply {
                orientation = LinearLayout.VERTICAL; setPadding(0, espaco(16), 0, espaco(16))
            }
            destino.addView(cartao)
            val imagem = ImageView(this).apply {
                layoutParams = LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, espaco(180))
                contentDescription = "Capa de " + livro.getString("titulo")
                scaleType = ImageView.ScaleType.FIT_CENTER
            }
            if (livro.optString("capa").isNotEmpty()) { cartao.addView(imagem); mostrarCapa(imagem, livro.getString("capa")) }
            cartao.addView(texto(livro.getString("titulo"), 22f))
            cartao.addView(texto(livro.getString("autor")))
            val modalidade = livro.getString("modalidade")
            val oferta = if (modalidade == "venda") java.text.NumberFormat.getCurrencyInstance(java.util.Locale("pt", "BR")).format(livro.getInt("preco_centavos") / 100.0) else modalidade
            cartao.addView(texto(oferta + " • " + livro.getString("cidade")))
            cartao.addView(texto(livro.getString("descricao")))
            if (propriaEstante) {
                botao("Editar anuncio", cartao) { publicar(livro) }
                botao("Remover anuncio", cartao) {
                    AlertDialog.Builder(this).setMessage("Remover o anuncio e as conversas vinculadas?")
                        .setNegativeButton("Cancelar", null).setPositiveButton("Remover") { _, _ ->
                            pedir({ api.requisitar("/api/v1/livros/" + livro.getString("identificador"), "DELETE") }, { perfil() })
                        }.show()
                }
            } else if (livro.getString("proprietario_id") != api.usuario?.optString("identificador")) {
                botao("Tenho interesse", cartao) {
                    pedir({ api.requisitar("/api/v1/conversas", "POST", JSONObject().put("livro_id", livro.getString("identificador"))) },
                        { conversa -> conversas(conversa.getString("identificador")) })
                }
            }
        }
    }

    // ---------------------------------------------------------
    // Nome do bloco: Publicacao com foto, conservacao e modalidade
    // ---------------------------------------------------------
    private fun publicar(livro: JSONObject? = null) {
        prepararTela("Publicar")
        capaSelecionada = livro?.optString("capa").orEmpty()
        val titulo = campo("Titulo")
        val autor = campo("Autor")
        val genero = campo("Genero literario")
        corpo.addView(texto("Estado de conservacao"))
        val estados = arrayOf("novo", "seminovo", "bom", "marcas")
        val estado = Spinner(this).apply { adapter = ArrayAdapter(this@MainActivity, android.R.layout.simple_spinner_dropdown_item, estados) }
        corpo.addView(estado)
        corpo.addView(texto("Modalidade"))
        val modalidades = arrayOf("troca", "venda", "doacao")
        val modalidade = Spinner(this).apply { adapter = ArrayAdapter(this@MainActivity, android.R.layout.simple_spinner_dropdown_item, modalidades) }
        corpo.addView(modalidade)
        val descricao = campo("Descricao", InputType.TYPE_CLASS_TEXT or InputType.TYPE_TEXT_FLAG_MULTI_LINE)
        val desejo = campo("O que deseja em troca?")
        val preco = campo("Preco em reais (somente venda)", InputType.TYPE_CLASS_NUMBER or InputType.TYPE_NUMBER_FLAG_DECIMAL)
        botao("Selecionar capa") { selecionarCapa.launch("image/*") }
        previewCapa = ImageView(this).apply {
            layoutParams = LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, espaco(180))
            contentDescription = "Previa da capa"
        }
        corpo.addView(previewCapa)
        if (livro != null) {
            titulo.setText(livro.getString("titulo")); autor.setText(livro.getString("autor"))
            genero.setText(livro.getString("genero")); descricao.setText(livro.getString("descricao"))
            desejo.setText(livro.getString("desejo")); preco.setText(BigDecimal(livro.getInt("preco_centavos")).movePointLeft(2).toPlainString())
            estado.setSelection(estados.indexOf(livro.getString("estado")).coerceAtLeast(0))
            modalidade.setSelection(modalidades.indexOf(livro.getString("modalidade")).coerceAtLeast(0))
            mostrarCapa(previewCapa, capaSelecionada)
        }
        botao(if (livro == null) "Publicar anuncio" else "Salvar alteracoes") {
            val modalidadeSelecionada = modalidades[modalidade.selectedItemPosition]
            val precoCentavos = try {
                if (modalidadeSelecionada == "venda") BigDecimal(preco.text.toString().replace(',', '.')).movePointRight(2).intValueExact() else 0
            } catch (_: Exception) { aviso.text = "Informe um preco valido com ate duas casas decimais."; return@botao }
            val dados = JSONObject().put("titulo", titulo.text.toString()).put("autor", autor.text.toString())
                .put("genero", genero.text.toString()).put("estado", estados[estado.selectedItemPosition])
                .put("descricao", descricao.text.toString()).put("modalidade", modalidadeSelecionada)
                .put("desejo", desejo.text.toString()).put("preco_centavos", precoCentavos).put("capa", capaSelecionada)
            pedir({ api.requisitar("/api/v1/livros" + (livro?.let { "/" + it.getString("identificador") } ?: ""), if (livro == null) "POST" else "PUT", dados) }, { perfil() })
        }
    }

    // ---------------------------------------------------------
    // Nome do bloco: Perfil e estante pertencentes ao usuario autenticado
    // ---------------------------------------------------------
    private fun perfil() {
        prepararTela("Perfil")
        pedir({ api.requisitar("/api/v1/perfil") }, { dados ->
            val usuario = dados.getJSONObject("usuario")
            corpo.addView(texto(usuario.getString("nome"), 24f))
            corpo.addView(texto(usuario.getString("cidade")))
            corpo.addView(texto(usuario.getString("email")))
            val lista = LinearLayout(this).apply { orientation = LinearLayout.VERTICAL }
            corpo.addView(lista)
            renderizarLivros(dados.getJSONArray("livros"), lista, true)
        })
    }

    // ---------------------------------------------------------
    // Nome do bloco: Conversas e mensagens com atualizacao periodica enquanto a tela esta ativa
    // ---------------------------------------------------------
    private fun conversas(selecionada: String? = null) {
        prepararTela("Conversas")
        pedir({ api.requisitar("/api/v1/conversas").getJSONArray("conversas") }, { conversas ->
            var encontrada: JSONObject? = null
            for (indice in 0 until conversas.length()) {
                val conversa = conversas.getJSONObject(indice)
                if (conversa.getString("identificador") == selecionada) encontrada = conversa
                botao(conversa.getString("interlocutor") + " • " + conversa.getString("titulo")) { chat(conversa) }
            }
            if (conversas.length() == 0) corpo.addView(texto("Selecione um livro no catalogo para iniciar uma conversa."))
            botao("Atualizar conversas") { conversas() }
            encontrada?.let { chat(it) }
        })
    }
    private fun chat(conversa: JSONObject) {
        prepararTela("Chat")
        corpo.addView(texto(conversa.getString("interlocutor") + " • " + conversa.getString("titulo"), 20f))
        val historico = LinearLayout(this).apply { orientation = LinearLayout.VERTICAL }
        corpo.addView(historico)
        val mensagem = campo("Mensagem")
        val caminho = "/api/v1/conversas/" + conversa.getString("identificador") + "/mensagens"
        val carregar = {
            pedir({ api.requisitar(caminho).getJSONArray("mensagens") }, { mensagens ->
                historico.removeAllViews()
                if (mensagens.length() == 0) historico.addView(texto("Comece a conversa sobre este livro."))
                for (indice in 0 until mensagens.length()) {
                    val registro = mensagens.getJSONObject(indice)
                    val remetente = if (registro.getString("remetente_id") == api.usuario?.getString("identificador")) "Voce" else conversa.getString("interlocutor")
                    historico.addView(texto(remetente + ": " + registro.getString("texto")))
                }
            }, true)
        }
        botao("Enviar") {
            val conteudo = mensagem.text.toString().trim()
            if (conteudo.isEmpty()) { aviso.text = "Digite uma mensagem."; return@botao }
            pedir({ api.requisitar(caminho, "POST", JSONObject().put("texto", conteudo)) }, {
                mensagem.text.clear(); carregar()
            })
        }
        botao("Voltar as conversas") { conversas() }
        retornoAoChat = carregar
        carregar()
        principal.postDelayed(atualizarChat, 5000)
    }
    override fun onStop() {
        principal.removeCallbacks(atualizarChat)
        super.onStop()
    }
    override fun onStart() {
        super.onStart()
        if (retornoAoChat != null) principal.postDelayed(atualizarChat, 5000)
    }
    override fun onDestroy() {
        geracaoTela++
        retornoAoChat = null
        principal.removeCallbacksAndMessages(null)
        executor.shutdownNow()
        super.onDestroy()
    }
}
