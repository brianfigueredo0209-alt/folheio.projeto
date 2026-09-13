<template>
  <!-- ---------------------------------------------------------
  Nome do bloco: Pagina de perfil do leitor e sua estante pessoal
  --------------------------------------------------------- -->
  <CabecalhoPrincipal />

  <main class="recipiente-centralizado">

    <!-- Painel do Leitor com Estilo Editorial -->
    <section class="painel-perfil-editorial">
      <div class="cartao-perfil__avatar-editorial">FL</div>

      <div class="cartao-perfil__informacoes">
        <div class="cartao-perfil__titulo-pre">Leitor &amp; Curador &bull; Maceio - AL</div>
        <h1 class="cartao-perfil__nome">Felipe Lanches</h1>
        <p class="cartao-perfil__localizacao">
          Membro ativo da rede de circulacao sustentavel desde 2026
        </p>

        <div class="cartao-perfil__estatisticas">
          <div class="item-estatistica">
            <span class="item-estatistica__numero">{{ totalDeObrasEmCirculacao }}</span>
            <span class="item-estatistica__rotulo">Obras em Circulacao</span>
          </div>
          <div class="item-estatistica">
            <span class="item-estatistica__numero">03</span>
            <span class="item-estatistica__rotulo">Trocas Concluidas</span>
          </div>
          <div class="item-estatistica">
            <span class="item-estatistica__numero">100%</span>
            <span class="item-estatistica__rotulo">Avaliacao Positiva</span>
          </div>
        </div>
      </div>

      <div>
        <button type="button" class="botao botao--secundario">
          Editar estante
        </button>
      </div>
    </section>

    <!-- Obras do Leitor com Grade Editorial -->
    <section>
      <h2 class="secao-meus-livros__titulo">Titulos Cadastrados</h2>

      <div class="grade-editorial-livros">
        <article
          v-for="livro in obrasDaEstante"
          :key="livro.identificador"
          class="cartao-livro-editorial"
        >
          <span class="cartao-livro-editorial__numero">N&#186; {{ livro.numero }}</span>

          <img
            :src="livro.urlCapa"
            :alt="'Capa de ' + livro.titulo"
            class="cartao-livro-editorial__capa-img"
          />

          <div class="cartao-livro-editorial__detalhes">
            <h3 class="cartao-livro-editorial__titulo">{{ livro.titulo }}</h3>
            <p class="cartao-livro-editorial__autor">{{ livro.autor }}</p>
            <div class="cartao-livro-editorial__metadados">
              <span :class="'etiqueta ' + livro.classeEtiqueta">{{ livro.etiqueta }}</span>
              <span class="cartao-livro-editorial__localizacao">{{ livro.edicao }}</span>
            </div>
          </div>
        </article>
      </div>
    </section>

  </main>
</template>

<script setup>
// ---------------------------------------------------------
// Nome do bloco: Logica da pagina de perfil do leitor
// Gerencia as obras da estante pessoal e calcula estatisticas
// ---------------------------------------------------------
import { ref, computed } from 'vue';
import CabecalhoPrincipal from '../componentes/CabecalhoPrincipal.vue';

// Obras cadastradas na estante do leitor
const obrasDaEstante = ref([
  {
    identificador: 1,
    numero: '01',
    titulo: 'Ensaio Sobre a Cegueira',
    autor: 'Jose Saramago',
    urlCapa: 'https://covers.openlibrary.org/b/id/14618693-L.jpg',
    etiqueta: 'Em negociacao',
    classeEtiqueta: 'etiqueta--status',
    edicao: 'Edicao Especial',
  },
  {
    identificador: 2,
    numero: '02',
    titulo: 'Duna',
    autor: 'Frank Herbert',
    urlCapa: 'https://covers.openlibrary.org/b/id/15228531-L.jpg',
    etiqueta: 'Disponivel',
    classeEtiqueta: 'etiqueta--troca',
    edicao: 'Capa Dura',
  },
  {
    identificador: 3,
    numero: '03',
    titulo: 'O Hobbit',
    autor: 'J.R.R. Tolkien',
    urlCapa: 'https://covers.openlibrary.org/b/id/14849956-L.jpg',
    etiqueta: 'Disponivel',
    classeEtiqueta: 'etiqueta--troca',
    edicao: 'Ilustrado',
  },
]);

// Total de obras em circulacao calculado dinamicamente
const totalDeObrasEmCirculacao = computed(() => {
  return String(obrasDaEstante.value.length).padStart(2, '0');
});
</script>
