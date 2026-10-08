<template>
  <CabecalhoPrincipal />
  <main class="recipiente-centralizado">
    <section class="cabecalho-secao">
      <h1 class="cabecalho-secao__titulo">Encontre sua proxima leitura</h1>
      <p class="cabecalho-secao__subtitulo">Livros publicados pelos leitores no site e no aplicativo.</p>
    </section>
    <section v-if="livrosFiltrados[0]" class="vitrine-curadoria">
      <div class="vitrine-curadoria__detalhes">
        <span class="vitrine-curadoria__rotulo">Obra em evidencia</span>
        <h2 class="vitrine-curadoria__titulo">{{ livrosFiltrados[0].titulo }}</h2>
        <p class="vitrine-curadoria__sinopse">{{ livrosFiltrados[0].descricao }}</p>
        <span>Proprietario: {{ livrosFiltrados[0].proprietario }}</span>
      </div>
      <div class="vitrine-curadoria__capa-container">
        <img :src="livrosFiltrados[0].urlCapa" :alt="'Capa de ' + livrosFiltrados[0].titulo" class="vitrine-curadoria__capa" @error="tratarErroAoCarregarCapa" />
      </div>
    </section>
    <search class="barra-pesquisa-editorial">
      <input v-model="termoDePesquisa" type="search" class="barra-pesquisa-editorial__campo" placeholder="Titulo, autor, genero ou cidade..." aria-label="Buscar livros" />
      <select v-model="modalidade" class="campo-selecao" aria-label="Modalidade da oferta">
        <option value="">Todas as ofertas</option><option value="troca">Troca</option><option value="venda">Venda</option><option value="doacao">Doacao</option>
      </select>
      <button class="botao botao--secundario" :disabled="carregando" @click="carregarLivros">Atualizar</button>
    </search>
    <p v-if="erroDaPagina" role="alert">{{ erroDaPagina }}</p>
    <p v-if="carregando" role="status">Carregando catalogo...</p>
    <div class="grade-editorial-livros">
      <article v-for="livro in livrosFiltrados" :key="livro.identificador" class="cartao-livro-editorial">
        <span class="cartao-livro-editorial__numero">Nº {{ livro.numero }}</span>
        <img :src="livro.urlCapa" :alt="'Capa de ' + livro.titulo" class="cartao-livro-editorial__capa-img" @error="tratarErroAoCarregarCapa" />
        <div class="cartao-livro-editorial__detalhes">
          <h2 class="cartao-livro-editorial__titulo">{{ livro.titulo }}</h2>
          <p class="cartao-livro-editorial__autor">{{ livro.autor }}</p>
          <div class="cartao-livro-editorial__metadados">
            <span class="etiqueta etiqueta--troca">{{ livro.etiqueta }}</span>
            <span class="cartao-livro-editorial__localizacao">{{ livro.cidade }}</span>
          </div>
        </div>
        <div class="cartao-livro-editorial__rodape">
          <RouterLink v-if="livro.proprietario_id === sessao?.usuario.identificador" to="/perfil" class="botao botao--secundario botao--total">Meu anuncio</RouterLink>
          <button v-else class="botao botao--primario botao--total" :disabled="iniciandoConversa" @click="negociar(livro)">Tenho interesse</button>
        </div>
      </article>
    </div>
    <p v-if="!carregando && !erroDaPagina && !livrosFiltrados.length">Nenhum exemplar encontrado. Publique a primeira obra ou altere sua busca.</p>
  </main>
</template>
<script setup>
// ---------------------------------------------------------
// Nome do bloco: Catalogo compartilhado e negociacao vinculada ao anuncio
// ---------------------------------------------------------
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import CabecalhoPrincipal from '../componentes/CabecalhoPrincipal.vue';
import { requisitar, prepararLivro, tratarErroAoCarregarCapa, sessao } from '../servicos/api.js';
const roteador = useRouter();
const catalogoDeLivros = ref([]);
const termoDePesquisa = ref('');
const modalidade = ref('');
const carregando = ref(false);
const iniciandoConversa = ref(false);
const erroDaPagina = ref('');
const livrosFiltrados = computed(() => {
  const termo = termoDePesquisa.value.trim().toLocaleLowerCase('pt-BR');
  return catalogoDeLivros.value.filter(livro =>
    (!modalidade.value || livro.modalidade === modalidade.value) &&
    [livro.titulo, livro.autor, livro.genero, livro.cidade].join(' ').toLocaleLowerCase('pt-BR').includes(termo));
});
async function carregarLivros() {
  carregando.value = true; erroDaPagina.value = '';
  try { catalogoDeLivros.value = (await requisitar('/api/v1/livros')).livros.map(prepararLivro); }
  catch (erro) { erroDaPagina.value = erro.message; }
  finally { carregando.value = false; }
}
async function negociar(livro) {
  if (!sessao.value) { await roteador.push('/'); return; }
  iniciandoConversa.value = true; erroDaPagina.value = '';
  try {
    const conversa = await requisitar('/api/v1/conversas', { metodo: 'POST', dados: { livro_id: livro.identificador } });
    await roteador.push({ path: '/mensagens', query: { conversa: conversa.identificador } });
  } catch (erro) { erroDaPagina.value = erro.message; }
  finally { iniciandoConversa.value = false; }
}
onMounted(carregarLivros);
</script>
