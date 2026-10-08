<template>
  <!-- ---------------------------------------------------------
  Nome do bloco: Pagina de publicacao de novo exemplar para troca
  --------------------------------------------------------- -->
  <CabecalhoPrincipal />

  <main class="recipiente-centralizado">
    <section class="cabecalho-secao">
      <h1 class="cabecalho-secao__titulo">{{ rota.query.livro ? 'Editar anuncio' : 'Disponibilizar exemplar para circulacao' }}</h1>
      <p class="cabecalho-secao__subtitulo">
        Preencha os detalhes do livro para cataloga-lo na rede de trocas
      </p>
    </section>

    <p v-if="carregandoEdicao" role="status">Carregando anuncio...</p><p v-if="erroDaPagina" role="alert">{{ erroDaPagina }}</p><form class="formulario-publicacao-editorial" @submit.prevent="publicarAnuncio">

      <!-- Coluna Esquerda: A Obra -->
      <section class="painel-campos-editorial">
        <div class="secao-passo-editorial__cabecalho">
          <span class="secao-passo-editorial__titulo">A Obra</span>
        </div>

        <div class="grupo-formulario">
          <label for="campo-titulo">Titulo do livro</label>
          <input :disabled="carregandoEdicao || enviando"
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
          <input :disabled="carregandoEdicao || enviando"
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
          <input :disabled="carregandoEdicao || enviando"
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
          <select :disabled="carregandoEdicao || enviando" id="campo-genero" v-model="dadosDoFormulario.generoLiterario" class="campo-selecao" required>
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
          <select :disabled="carregandoEdicao || enviando" id="campo-estado" v-model="dadosDoFormulario.estadoDeConservacao" class="campo-selecao" required>
            <option value="" disabled>Avalie o estado das paginas e capa</option>
            <option value="novo">Impecavel (novo ou nunca folheado)</option>
            <option value="seminovo">Excelente (sem anotacoes ou desgastes)</option>
            <option value="bom">Bom estado (com leves marcas naturais de leitura)</option>
            <option value="marcas">Com marcas do tempo ou grifos do leitor</option>
          </select>
        </div>

        <div class="grupo-formulario">
          <label for="campo-descricao">Notas do leitor sobre a edicao</label>
          <textarea :disabled="carregandoEdicao || enviando"
            id="campo-descricao"
            v-model="dadosDoFormulario.notasDoLeitor"
            class="campo-texto-longo"
            placeholder="Comente sobre a traducao, editora, papel ou suas impressoes sobre o livro..."
            required
          ></textarea>
        </div>

        <div class="grupo-formulario">
          <label for="campo-modalidade">Modalidade da oferta</label>
          <select :disabled="carregandoEdicao || enviando" id="campo-modalidade" v-model="dadosDoFormulario.modalidade" class="campo-selecao">
            <option value="troca">Troca</option><option value="venda">Venda</option><option value="doacao">Doacao</option>
          </select>
          <template v-if="dadosDoFormulario.modalidade === 'venda'">
            <label for="campo-preco">Preco em reais</label>
            <input :disabled="carregandoEdicao || enviando" id="campo-preco" v-model="precoEmReais" type="number" min="0.01" max="1000000" step="0.01" class="campo-entrada" required />
          </template>
          <label for="campo-desejo">O que voce gostaria em contrapartida?</label>
          <input :disabled="carregandoEdicao || enviando"
            type="text"
            id="campo-desejo"
            v-model="dadosDoFormulario.desejoDeTroca" :required="dadosDoFormulario.modalidade === 'troca'"
            class="campo-entrada"
            placeholder="Ex.: Titulos de Gabriel Garcia Marquez ou romance contemporaneo"
          />
        </div>

        <div class="acoes-formulario">
          <RouterLink to="/livros" class="botao botao--secundario">Cancelar</RouterLink>
          <button type="submit" class="botao botao--primario" :disabled="enviando || lendoCapa || carregandoEdicao">{{ enviando ? 'Salvando...' : rota.query.livro ? 'Salvar alteracoes' : 'Publicar anuncio' }}</button>
        </div>
      </section>

    </form>
  </main>
</template>

<script setup>
// ---------------------------------------------------------
// Nome do bloco: Publicacao persistente com capa e modalidade da oferta
// ---------------------------------------------------------
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import CabecalhoPrincipal from '../componentes/CabecalhoPrincipal.vue';
import { requisitar } from '../servicos/api.js';
const roteador = useRouter();
const rota = useRoute();
const carregandoEdicao = ref(false);
const entradaDeArquivoDeCapa = ref(null);
const urlPreviewDaCapa = ref('');
const enviando = ref(false);
const lendoCapa = ref(false);
const erroDaPagina = ref('');
const precoEmReais = ref('');
const dadosDoFormulario = ref({ tituloDaObra: '', autorDaObra: '', generoLiterario: '', estadoDeConservacao: '', notasDoLeitor: '', desejoDeTroca: '', modalidade: 'troca' });
const estilosDoPainelDeCapa = computed(() => urlPreviewDaCapa.value
  ? { padding: '12px', border: 'none', backgroundColor: 'transparent', height: '340px' }
  : { height: '340px', marginTop: '12px' });
function acionarSeletorDeArquivo() { entradaDeArquivoDeCapa.value?.click(); }
function processarSelecaoDeCapa(evento) {
  const arquivo = evento.target.files[0];
  erroDaPagina.value = '';
  if (!arquivo) return;
  if (!['image/png', 'image/jpeg'].includes(arquivo.type) || arquivo.size > 5 * 1024 * 1024) {
    erroDaPagina.value = 'Selecione uma capa JPEG ou PNG de ate 5 MB.'; evento.target.value = ''; return;
  }
  lendoCapa.value = true;
  const leitor = new FileReader();
  leitor.onload = () => { urlPreviewDaCapa.value = leitor.result; lendoCapa.value = false; };
  leitor.onerror = () => { erroDaPagina.value = 'Nao foi possivel ler a capa.'; lendoCapa.value = false; };
  leitor.readAsDataURL(arquivo);
}
async function publicarAnuncio() {
  if (enviando.value || lendoCapa.value) return;
  enviando.value = true; erroDaPagina.value = '';
  try {
    const formulario = dadosDoFormulario.value;
    await requisitar('/api/v1/livros' + (rota.query.livro ? '/' + encodeURIComponent(rota.query.livro) : ''), { metodo: rota.query.livro ? 'PUT' : 'POST', dados: {
      titulo: formulario.tituloDaObra, autor: formulario.autorDaObra,
      genero: formulario.generoLiterario, estado: formulario.estadoDeConservacao,
      descricao: formulario.notasDoLeitor, desejo: formulario.desejoDeTroca,
      modalidade: formulario.modalidade, preco_centavos: formulario.modalidade === 'venda' ? Math.round(Number(precoEmReais.value) * 100) : 0,
      capa: urlPreviewDaCapa.value,
    } });
    await roteador.push('/perfil');
  } catch (erro) { erroDaPagina.value = erro.message; }
  finally { enviando.value = false; }
}
onMounted(async () => {
  if (!rota.query.livro) return;
  carregandoEdicao.value = true;
  try {
    const livro = (await requisitar('/api/v1/perfil')).livros.find(obra => obra.identificador === rota.query.livro);
    if (!livro) throw new Error('Anuncio nao encontrado na sua estante.');
    dadosDoFormulario.value = { tituloDaObra: livro.titulo, autorDaObra: livro.autor, generoLiterario: livro.genero, estadoDeConservacao: livro.estado, notasDoLeitor: livro.descricao, desejoDeTroca: livro.desejo, modalidade: livro.modalidade };
    precoEmReais.value = livro.preco_centavos / 100;
    urlPreviewDaCapa.value = livro.capa;
  } catch (erro) { erroDaPagina.value = erro.message; }
  finally { carregandoEdicao.value = false; }
});
</script>
