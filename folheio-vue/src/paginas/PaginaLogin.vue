<template>
  <!-- ---------------------------------------------------------
  Nome do bloco: Pagina de login com layout editorial em tela dividida
  --------------------------------------------------------- -->
  <div class="layout-login-editorial">

    <!-- Painel Manifesto Editorial (Lado Esquerdo) -->
    <section class="painel-login-manifesto">
      <header>
        <div class="manifesto-marca">FOLHEIO</div>
      </header>

      <div class="manifesto-corpo">
        <h1 class="manifesto-titulo">
          Historias que merecem <em>novas paginas</em> e novos leitores.
        </h1>
        <p class="manifesto-descricao">
          Uma plataforma para circular obras raras, classicos e leituras contemporaneas.
          Conecte sua estante a outros leitores e descubra seu proximo capitulo.
        </p>
      </div>

      <footer class="manifesto-rodape">
        <span>Circulacao Literaria Independente</span>
      </footer>
    </section>

    <!-- Painel de Autenticacao (Lado Direito) -->
    <main class="painel-login-formulario">
      <div class="caixa-formulario-login">
        <h2 class="caixa-formulario-login__titulo">{{ criandoConta ? 'Cadastrar sua estante' : 'Entrar na sua estante' }}</h2>
        <p class="caixa-formulario-login__subtitulo">
          Insira suas credenciais para gerenciar suas trocas
        </p>

        <!-- O submit navega para a pagina de livros sem recarregar -->
        <form @submit.prevent="realizarAcesso">
          <p v-if="erroDeAcesso" role="alert">{{ erroDeAcesso }}</p>
          <div v-if="criandoConta" class="grupo-formulario">
            <label for="campo-nome">Nome</label>
            <input id="campo-nome" v-model="nome" class="campo-entrada" maxlength="120" required />
            <label for="campo-cidade">Cidade e estado</label>
            <input id="campo-cidade" v-model="cidade" class="campo-entrada" maxlength="120" placeholder="Maceio - AL" required />
          </div>
          <div class="grupo-formulario">
            <label for="campo-email">Endereco de e-mail</label>
            <input
              type="email"
              id="campo-email"
              v-model="enderecoEmail"
              class="campo-entrada"
              placeholder="seu.nome@exemplo.com"
              autocomplete="email"
              required
            />
          </div>

          <div class="grupo-formulario">
            <div class="grupo-formulario__cabecalho">
              <label for="campo-senha">Senha de acesso</label>

            </div>
            <div class="campo-com-acao">
              <input
                :type="senhaEstaVisivel ? 'text' : 'password'"
                id="campo-senha"
                v-model="senhaDoCampo"
                class="campo-entrada"
                placeholder="&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;"
                :autocomplete="criandoConta ? 'new-password' : 'current-password'" :minlength="criandoConta ? 8 : undefined" maxlength="72"
                required
              />
              <button
                type="button"
                id="botao-alternar-senha"
                class="botao-acao-campo"
                aria-label="Alternar exibicao da senha"
                @click="alternarVisibilidadeSenha"
              >
                {{ senhaEstaVisivel ? 'Ocultar' : 'Exibir' }}
              </button>
            </div>
          </div>

          <button type="submit" :disabled="enviando" class="botao botao--primario botao--total" style="margin-top: 24px;">
            {{ enviando ? 'Aguarde...' : criandoConta ? 'Criar conta' : 'Acessar plataforma' }}
          </button>

          <div class="chamada-cadastro">

            <button type="button" class="chamada-cadastro__link" :disabled="enviando" @click="criandoConta = !criandoConta; erroDeAcesso = ''">{{ criandoConta ? 'Ja tenho uma conta' : 'Cadastrar estante' }}</button>
          </div>
        </form>
      </div>
    </main>

  </div>
</template>

<script setup>
// ---------------------------------------------------------
// Nome do bloco: Cadastro e login reais pelo contrato compartilhado
// ---------------------------------------------------------
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { requisitar, guardarSessao } from '../servicos/api.js';
const roteador = useRouter();
const enderecoEmail = ref('');
const senhaDoCampo = ref('');
const senhaEstaVisivel = ref(false);
const criandoConta = ref(false);
const nome = ref('');
const cidade = ref('');
const enviando = ref(false);
const erroDeAcesso = ref('');
function alternarVisibilidadeSenha() { senhaEstaVisivel.value = !senhaEstaVisivel.value; }
async function realizarAcesso() {
  if (enviando.value) return;
  enviando.value = true; erroDeAcesso.value = '';
  try {
    const dados = { email: enderecoEmail.value, senha: senhaDoCampo.value };
    if (criandoConta.value) Object.assign(dados, { nome: nome.value, cidade: cidade.value });
    guardarSessao(await requisitar('/api/v1/auth/' + (criandoConta.value ? 'cadastro' : 'login'), { metodo: 'POST', dados }));
    senhaDoCampo.value = '';
    await roteador.push('/livros');
  } catch (erro) { erroDeAcesso.value = erro.message; }
  finally { enviando.value = false; }
}
</script>
