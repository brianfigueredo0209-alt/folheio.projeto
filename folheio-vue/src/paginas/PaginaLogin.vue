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
        <h2 class="caixa-formulario-login__titulo">Entrar na sua estante</h2>
        <p class="caixa-formulario-login__subtitulo">
          Insira suas credenciais para gerenciar suas trocas
        </p>

        <!-- O submit navega para a pagina de livros sem recarregar -->
        <form @submit.prevent="realizarAcesso">
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
              <a href="#" class="link-recuperar-senha">Esqueceu a senha?</a>
            </div>
            <div class="campo-com-acao">
              <input
                :type="senhaEstaVisivel ? 'text' : 'password'"
                id="campo-senha"
                v-model="senhaDoCampo"
                class="campo-entrada"
                placeholder="&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;"
                autocomplete="current-password"
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

          <button type="submit" class="botao botao--primario botao--total" style="margin-top: 24px;">
            Acessar plataforma
          </button>

          <div class="chamada-cadastro">
            <span class="chamada-cadastro__texto">Ainda nao possui uma conta?</span>
            <RouterLink to="/livros" class="chamada-cadastro__link">Cadastrar estante</RouterLink>
          </div>
        </form>
      </div>
    </main>

  </div>
</template>

<script setup>
// ---------------------------------------------------------
// Nome do bloco: Logica da pagina de login
// Gerencia a visibilidade da senha e a navegacao apos o acesso
// ---------------------------------------------------------
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const roteador = useRouter();

// Estado dos campos do formulario
const enderecoEmail   = ref('');
const senhaDoCampo    = ref('');
const senhaEstaVisivel = ref(false);

// Alterna o tipo do campo de senha entre texto e senha
function alternarVisibilidadeSenha() {
  senhaEstaVisivel.value = !senhaEstaVisivel.value;
}

// Processa o envio do formulario e navega para a pagina de livros
function realizarAcesso() {
  roteador.push('/livros');
}
</script>
