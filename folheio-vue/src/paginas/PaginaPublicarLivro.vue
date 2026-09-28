<template>
  <!-- ---------------------------------------------------------
  Nome do bloco: Pagina de publicacao de novo exemplar para troca
  --------------------------------------------------------- -->
  <CabecalhoPrincipal />

  <main class="recipiente-centralizado">
    <section class="cabecalho-secao">
      <h1 class="cabecalho-secao__titulo">Disponibilizar exemplar para circulacao</h1>
      <p class="cabecalho-secao__subtitulo">
        Preencha os detalhes do livro para cataloga-lo na rede de trocas
      </p>
    </section>

    <form class="formulario-publicacao-editorial" @submit.prevent="publicarAnuncio">

      <!-- Coluna Esquerda: A Obra -->
      <section class="painel-campos-editorial">
        <div class="secao-passo-editorial__cabecalho">
          <span class="secao-passo-editorial__titulo">A Obra</span>
        </div>

        <div class="grupo-formulario">
          <label for="campo-titulo">Titulo do livro</label>
          <input
            type="text"
            id="campo-titulo"
            v-model="dadosDoFormulario.tituloDaObra"
            class="campo-entrada"
            placeholder="Exemplo: Grande Sertao: Veredas"
            required
          />
        </div>

        <div class="grupo-formulario">
          <label for="campo-autor">Autor da obra</label>
          <input
            type="text"
            id="campo-autor"
            v-model="dadosDoFormulario.autorDaObra"
            class="campo-entrada"
            placeholder="Nome do autor"
            required
          />
        </div>

        <!-- Area de upload de capa com preview reativo -->
        <div
          class="painel-upload-editorial"
          id="painel-capa-container"
          :style="estilosDoPainelDeCapa"
          @click="acionarSeletorDeArquivo"
        >
          <!-- Estado vazio: exibido enquanto nenhuma imagem foi selecionada -->
          <div v-if="!urlPreviewDaCapa" id="conteudo-upload-vazio"
            style="display: flex; flex-direction: column; align-items: center;">
            <svg class="painel-upload-editorial__icone" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            <span class="painel-upload-editorial__titulo">Fotografia da Capa</span>
            <span class="painel-upload-editorial__dica">Clique aqui para enviar a capa manualmente.</span>
          </div>

          <!-- Preview da imagem selecionada -->
          <img
            v-if="urlPreviewDaCapa"
            :src="urlPreviewDaCapa"
            alt="Capa da obra"
            style="max-width: 100%; max-height: 100%; object-fit: contain; border-radius: 4px; box-shadow: var(--sombra-livro);"
          />

          <!-- Input de arquivo oculto acionado por clique no painel -->
          <input
            type="file"
            ref="entradaDeArquivoDeCapa"
            class="painel-upload-editorial__entrada-oculta"
            accept="image/png, image/jpeg"
            @change="processarSelecaoDeCapa"
          />
        </div>
      </section>

      <!-- Coluna Direita: A Troca -->
      <section class="painel-campos-editorial">
        <div class="secao-passo-editorial__cabecalho">
          <span class="secao-passo-editorial__titulo">A Troca</span>
        </div>

        <div class="grupo-formulario">
          <label for="campo-genero">Genero literario</label>
          <select id="campo-genero" v-model="dadosDoFormulario.generoLiterario" class="campo-selecao" required>
            <option value="" disabled>Selecione um genero</option>
            <option value="romance">Romance</option>
            <option value="poesia">Poesia &amp; Cronica</option>
            <option value="filosofia">Filosofia &amp; Ensaios</option>
            <option value="fantasia">Ficcao Especulativa &amp; Fantasia</option>
            <option value="suspense">Suspense &amp; Policial</option>
            <option value="biografia">Biografia &amp; Memorias</option>
            <option value="tecnico">Academico &amp; Tecnico</option>
          </select>
        </div>

        <div class="grupo-formulario">
          <label for="campo-estado">Estado de conservacao</label>
          <select id="campo-estado" v-model="dadosDoFormulario.estadoDeConservacao" class="campo-selecao" required>
            <option value="" disabled>Avalie o estado das paginas e capa</option>
            <option value="novo">Impecavel (novo ou nunca folheado)</option>
            <option value="seminovo">Excelente (sem anotacoes ou desgastes)</option>
            <option value="bom">Bom estado (com leves marcas naturais de leitura)</option>
            <option value="marcas">Com marcas do tempo ou grifos do leitor</option>
          </select>
        </div>

        <div class="grupo-formulario">
          <label for="campo-descricao">Notas do leitor sobre a edicao</label>
          <textarea
            id="campo-descricao"
            v-model="dadosDoFormulario.notasDoLeitor"
            class="campo-texto-longo"
            placeholder="Comente sobre a traducao, editora, papel ou suas impressoes sobre o livro..."
            required
          ></textarea>
        </div>

        <div class="grupo-formulario">
          <label for="campo-desejo">O que voce gostaria em contrapartida?</label>
          <input
            type="text"
            id="campo-desejo"
            v-model="dadosDoFormulario.desejoDeTroca"
            class="campo-entrada"
            placeholder="Ex.: Titulos de Gabriel Garcia Marquez ou romance contemporaneo"
            required
          />
        </div>

        <div class="acoes-formulario">
          <RouterLink to="/livros" class="botao botao--secundario">Cancelar</RouterLink>
          <button type="submit" class="botao botao--primario">Publicar anuncio</button>
        </div>
      </section>

    </form>
  </main>
</template>

<script setup>
// ---------------------------------------------------------
// Nome do bloco: Logica da pagina de publicacao de livro
// Gerencia o formulario, o preview da capa e o mock de publicacao
// via localStorage para simulacao do sistema sem backend
// ---------------------------------------------------------
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import CabecalhoPrincipal from '../componentes/CabecalhoPrincipal.vue';

const roteador = useRouter();

// Referencia ao elemento de input de arquivo para acionamento programatico
const entradaDeArquivoDeCapa = ref(null);

// URL temporaria gerada para o preview da imagem selecionada
const urlPreviewDaCapa = ref('');

// Dados reativos do formulario de publicacao
const dadosDoFormulario = ref({
  tituloDaObra: '',
  autorDaObra: '',
  generoLiterario: '',
  estadoDeConservacao: '',
  notasDoLeitor: '',
  desejoDeTroca: '',
});

// Estilos dinamicos do painel de capa: remove a borda quando uma imagem e exibida
const estilosDoPainelDeCapa = computed(() => {
  if (urlPreviewDaCapa.value) {
    return { padding: '12px', border: 'none', backgroundColor: 'transparent', height: '340px' };
  }
  return { height: '340px', marginTop: '12px' };
});

// Abre o seletor de arquivo ao clicar no painel de capa
function acionarSeletorDeArquivo() {
  if (entradaDeArquivoDeCapa.value) {
    entradaDeArquivoDeCapa.value.click();
  }
}

// Gera o preview local da imagem selecionada pelo usuario
function processarSelecaoDeCapa(eventoDeSelecao) {
  const arquivoSelecionado = eventoDeSelecao.target.files[0];

  if (arquivoSelecionado) {
    urlPreviewDaCapa.value = URL.createObjectURL(arquivoSelecionado);
  }
}

// Salva o anuncio no localStorage e redireciona para o perfil
function publicarAnuncio() {
  const registroDoLivro = {
    identificador: Date.now().toString(),
    titulo: dadosDoFormulario.value.tituloDaObra,
    autor: dadosDoFormulario.value.autorDaObra,
    genero: dadosDoFormulario.value.generoLiterario,
    estado: dadosDoFormulario.value.estadoDeConservacao,
    notas: dadosDoFormulario.value.notasDoLeitor,
    desejo: dadosDoFormulario.value.desejoDeTroca,
    urlCapa: urlPreviewDaCapa.value || '',
    dataDePublicacao: new Date().toISOString(),
  };

  // Recupera publicacoes existentes e adiciona o novo registro
  const livrosPublicados = JSON.parse(localStorage.getItem('folheio_livros') || '[]');
  livrosPublicados.push(registroDoLivro);
  localStorage.setItem('folheio_livros', JSON.stringify(livrosPublicados));

  // Navega para o perfil apos a publicacao
  roteador.push('/perfil');
}
</script>
