<template>
  <!-- ---------------------------------------------------------
  Nome do bloco: Cabecalho principal reutilizavel
  Presente em todas as paginas internas da plataforma
  Usa RouterLink para navegacao SPA sem recarregar a pagina
  --------------------------------------------------------- -->
  <header class="cabecalho-principal">
    <RouterLink to="/livros" class="cabecalho-principal__logo">
      FOLHEIO
      <span class="cabecalho-principal__edicao">Curadoria</span>
    </RouterLink>

    <nav class="cabecalho-principal__navegacao" aria-label="Navegacao principal">
      <RouterLink
        to="/livros"
        class="cabecalho-principal__link"
        active-class="ativo"
      >
        Livros
      </RouterLink>
      <RouterLink
        to="/publicar"
        class="cabecalho-principal__link"
        active-class="ativo"
      >
        Anunciar
      </RouterLink>
      <RouterLink
        to="/mensagens"
        class="cabecalho-principal__link"
        active-class="ativo"
      >
        Mensagens
      </RouterLink>
      <RouterLink
        to="/perfil"
        class="cabecalho-principal__link"
        active-class="ativo"
      >
        Perfil
      </RouterLink>
    </nav>

    <div class="cabecalho-principal__acoes"><button v-if="sessao" class="botao botao--secundario" :disabled="saindo" @click="sair">Sair</button><RouterLink v-else to="/" class="botao botao--secundario">Entrar</RouterLink><span v-if="erroDeSaida" role="alert">{{ erroDeSaida }}</span>
      <RouterLink to="/publicar" class="botao botao--primario">
        + Anunciar livro
      </RouterLink>
    </div>
  </header>
</template>

<script setup>
// ---------------------------------------------------------
// Nome do bloco: Encerramento da sessao no cliente e no servidor
// ---------------------------------------------------------
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { requisitar, sessao, guardarSessao } from '../servicos/api.js';
const roteador = useRouter();
const saindo = ref(false);
const erroDeSaida = ref('');
async function sair() {
  saindo.value = true; erroDeSaida.value = '';
  try { await requisitar('/api/v1/auth/sair', { metodo: 'POST' }); guardarSessao(null); await roteador.push('/'); }
  catch (erro) { erroDeSaida.value = erro.message; }
  finally { saindo.value = false; }
}
</script>
