<template>
  <CabecalhoPrincipal />
  <main class="recipiente-centralizado">
    <p v-if="erroDaPagina" role="alert">{{ erroDaPagina }}</p>
    <p v-if="carregando" role="status">Carregando sua estante...</p>
    <section v-if="usuario" class="painel-perfil-editorial">
      <div class="cartao-perfil__avatar-editorial">{{ usuario.nome.slice(0, 2).toUpperCase() }}</div>
      <div class="cartao-perfil__informacoes">
        <div class="cartao-perfil__titulo-pre">Leitor • {{ usuario.cidade }}</div>
        <h1 class="cartao-perfil__nome">{{ usuario.nome }}</h1>
        <p class="cartao-perfil__localizacao">{{ usuario.email }}</p>
        <div class="cartao-perfil__estatisticas">
          <div class="item-estatistica"><span class="item-estatistica__numero">{{ obrasDaEstante.length }}</span><span class="item-estatistica__rotulo">Obras em circulacao</span></div>
        </div>
      </div>
      <RouterLink to="/publicar" class="botao botao--primario">Publicar livro</RouterLink>
    </section>
    <section>
      <h2 class="secao-meus-livros__titulo">Titulos cadastrados</h2>
      <div class="grade-editorial-livros">
        <article v-for="livro in obrasDaEstante" :key="livro.identificador" class="cartao-livro-editorial">
          <span class="cartao-livro-editorial__numero">Nº {{ livro.numero }}</span>
          <img :src="livro.urlCapa" :alt="'Capa de ' + livro.titulo" class="cartao-livro-editorial__capa-img" @error="tratarErroAoCarregarCapa" />
          <div class="cartao-livro-editorial__detalhes">
            <h3 class="cartao-livro-editorial__titulo">{{ livro.titulo }}</h3>
            <p class="cartao-livro-editorial__autor">{{ livro.autor }}</p>
            <span class="etiqueta etiqueta--troca">{{ livro.etiqueta }}</span>
          </div>
          <div class="cartao-livro-editorial__rodape">
            <RouterLink :to="{ path: '/publicar', query: { livro: livro.identificador } }" class="botao botao--secundario">Editar anuncio</RouterLink><button class="botao botao--secundario" :disabled="removendo" @click="removerLivro(livro)">Remover anuncio</button>
          </div>
        </article>
      </div>
      <p v-if="!carregando && !erroDaPagina && !obrasDaEstante.length">Sua estante ainda esta vazia. Publique um exemplar para comecar.</p>
    </section>
  </main>
</template>
<script setup>
// ---------------------------------------------------------
// Nome do bloco: Perfil e estante autenticados com dados do PostgreSQL
// ---------------------------------------------------------
import { ref, onMounted } from 'vue';
import CabecalhoPrincipal from '../componentes/CabecalhoPrincipal.vue';
import { requisitar, prepararLivro, tratarErroAoCarregarCapa } from '../servicos/api.js';
const usuario = ref(null);
const obrasDaEstante = ref([]);
const carregando = ref(false);
const removendo = ref(false);
const erroDaPagina = ref('');
async function carregarPerfil() {
  carregando.value = true; erroDaPagina.value = '';
  try { const dados = await requisitar('/api/v1/perfil'); usuario.value = dados.usuario; obrasDaEstante.value = dados.livros.map(prepararLivro); }
  catch (erro) { erroDaPagina.value = erro.message; }
  finally { carregando.value = false; }
}
async function removerLivro(livro) {
  if (!window.confirm('Remover este anuncio e as conversas vinculadas a ele?')) return;
  removendo.value = true; erroDaPagina.value = '';
  try { await requisitar('/api/v1/livros/' + livro.identificador, { metodo: 'DELETE' }); await carregarPerfil(); }
  catch (erro) { erroDaPagina.value = erro.message; }
  finally { removendo.value = false; }
}
onMounted(carregarPerfil);
</script>
