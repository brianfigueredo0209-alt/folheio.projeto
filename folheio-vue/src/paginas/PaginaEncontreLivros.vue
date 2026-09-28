<template>
  <!-- ---------------------------------------------------------
  Nome do bloco: Pagina de catalogo de livros disponiveis para troca
  --------------------------------------------------------- -->
  <CabecalhoPrincipal />

  <main class="recipiente-centralizado">

    <!-- Vitrine de Destaque da Curadoria -->
    <section class="vitrine-curadoria">
      <div class="vitrine-curadoria__detalhes">
        <span class="vitrine-curadoria__rotulo">Obra em Evidencia &bull; Esta Semana</span>
        <h1 class="vitrine-curadoria__titulo">Cem Anos de Solidao</h1>
        <p class="vitrine-curadoria__sinopse">
          Exemplar capa dura em estado impecavel disponivel para troca em Maceio.
          O leitor busca edicoes de literatura latino-americana ou classicos do seculo XX.
        </p>
        <div style="display: flex; gap: 14px; align-items: center;">
          <RouterLink to="/mensagens" class="botao botao--primario">Propor troca</RouterLink>
          <span style="font-size: 13px; color: var(--cor-texto-suave);">Proprietario: Felipe Lanches</span>
        </div>
      </div>

      <div class="vitrine-curadoria__capa-container">
        <img
          src="https://covers.openlibrary.org/b/id/12627383-L.jpg"
          alt="Capa de Cem Anos de Solidao"
          class="vitrine-curadoria__capa"
        />
      </div>
    </section>

    <!-- Barra de pesquisa com filtragem reativa -->
    <search class="barra-pesquisa-editorial" role="search">
      <input
        type="search"
        v-model="termoDePesquisa"
        class="barra-pesquisa-editorial__campo"
        placeholder="Pesquise por titulo, autor, genero ou cidade..."
        aria-label="Buscar no catalogo"
      />
      <button type="button" class="botao botao--secundario" style="padding: 8px 18px;">
        Filtros avancados
      </button>
    </search>

    <!-- Grade editorial com livros filtrados dinamicamente -->
    <div class="grade-editorial-livros">
      <article
        v-for="livro in livrosFiltrados"
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
          <h2 class="cartao-livro-editorial__titulo">{{ livro.titulo }}</h2>
          <p class="cartao-livro-editorial__autor">{{ livro.autor }}</p>

          <div class="cartao-livro-editorial__metadados">
            <span :class="'etiqueta ' + livro.classeEtiqueta">{{ livro.etiqueta }}</span>
            <span class="cartao-livro-editorial__localizacao">{{ livro.localizacao }}</span>
          </div>
        </div>

        <div class="cartao-livro-editorial__rodape">
          <RouterLink to="/mensagens" class="botao botao--primario botao--total">
            Tenho interesse
          </RouterLink>
        </div>
      </article>

      <!-- Estado vazio: exibido quando a pesquisa nao retorna resultados -->
      <p v-if="livrosFiltrados.length === 0" style="color: var(--cor-texto-suave); padding: 24px 0;">
        Nenhum exemplar encontrado para a pesquisa informada.
      </p>
    </div>

  </main>
</template>

<script setup>
// ---------------------------------------------------------
// Nome do bloco: Logica da pagina de catalogo de livros
// Gerencia o catalogo estatico e a pesquisa reativa em tempo real
// ---------------------------------------------------------
import { ref, computed } from 'vue';
import CabecalhoPrincipal from '../componentes/CabecalhoPrincipal.vue';

// Termo digitado pelo usuario no campo de pesquisa
const termoDePesquisa = ref('');

// Catalogo de livros disponiveis para troca
const catalogoDeLivros = ref([
  {
    identificador: 1,
    numero: '01',
    titulo: 'Little Fires Everywhere',
    autor: 'Celeste Ng',
    urlCapa: 'https://covers.openlibrary.org/b/id/12667447-L.jpg',
    etiqueta: 'Disponivel',
    classeEtiqueta: 'etiqueta--troca',
    localizacao: 'Maceio - AL',
  },
  {
    identificador: 2,
    numero: '02',
    titulo: 'Duna',
    autor: 'Frank Herbert',
    urlCapa: 'https://covers.openlibrary.org/b/id/15228531-L.jpg',
    etiqueta: 'Ficcao Cientifica',
    classeEtiqueta: 'etiqueta--destaque',
    localizacao: 'Maceio - AL',
  },
  {
    identificador: 3,
    numero: '03',
    titulo: 'O Hobbit',
    autor: 'J.R.R. Tolkien',
    urlCapa: 'https://covers.openlibrary.org/b/id/14849956-L.jpg',
    etiqueta: 'Disponivel',
    classeEtiqueta: 'etiqueta--troca',
    localizacao: 'Maceio - AL',
  },
  {
    identificador: 4,
    numero: '04',
    titulo: 'Ensaio Sobre a Cegueira',
    autor: 'Jose Saramago',
    urlCapa: 'https://covers.openlibrary.org/b/id/14618040-L.jpg',
    etiqueta: 'Literatura',
    classeEtiqueta: 'etiqueta--destaque',
    localizacao: 'Maceio - AL',
  },
]);

// Propriedade computada: filtra o catalogo com base no termo de pesquisa
const livrosFiltrados = computed(() => {
  const termoBuscaNormalizado = termoDePesquisa.value.toLowerCase().trim();

  if (!termoBuscaNormalizado) {
    return catalogoDeLivros.value;
  }

  return catalogoDeLivros.value.filter((livro) => {
    return (
      livro.titulo.toLowerCase().includes(termoBuscaNormalizado) ||
      livro.autor.toLowerCase().includes(termoBuscaNormalizado) ||
      livro.etiqueta.toLowerCase().includes(termoBuscaNormalizado) ||
      livro.localizacao.toLowerCase().includes(termoBuscaNormalizado)
    );
  });
});
</script>
