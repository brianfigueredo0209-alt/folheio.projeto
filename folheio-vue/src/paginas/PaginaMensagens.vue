<template>
  <!-- ---------------------------------------------------------
  Nome do bloco: Pagina de mensagens e dialogos de troca entre leitores
  --------------------------------------------------------- -->
  <CabecalhoPrincipal />

  <main class="recipiente-centralizado">
    <section class="cabecalho-secao">
      <h1 class="cabecalho-secao__titulo">Dialogos de Circulacao</h1>
      <p class="cabecalho-secao__subtitulo"></p>
    </section>

    <div class="layout-mensagens-editorial">

      <!-- Lista de leitores e trocas ativas com filtro reativo -->
      <aside class="painel-conversas">
        <div class="painel-conversas__cabecalho">
          <h2 class="painel-conversas__titulo">Leitores</h2>
          <input
            type="search"
            v-model="termoDeFiltroDeConversas"
            class="painel-conversas__busca"
            placeholder="Filtrar por obra ou leitor..."
          />
        </div>

        <div class="painel-conversas__lista">
          <div
            v-for="conversa in conversasFiltradas"
            :key="conversa.identificador"
            :class="['item-conversa', conversa.estaAtiva ? 'item-conversa--ativo' : '']"
            @click="selecionarConversa(conversa)"
          >
            <div class="item-conversa__avatar">{{ conversa.inicialDoNome }}</div>
            <div class="item-conversa__detalhes">
              <div class="item-conversa__topo">
                <span class="item-conversa__nome">{{ conversa.nomeEObra }}</span>
                <span class="item-conversa__horario">{{ conversa.horario }}</span>
              </div>
              <p class="item-conversa__mensagem">{{ conversa.ultimaMensagem }}</p>
            </div>
          </div>
        </div>
      </aside>

      <!-- Painel ativo do dialogo de troca -->
      <section class="janela-chat">
        <header class="janela-chat__cabecalho">
          <div class="janela-chat__avatar-destaque">{{ conversaAtiva.inicialDoNome }}</div>
          <div class="janela-chat__info-usuario">
            <span class="janela-chat__nome">{{ conversaAtiva.nomeEObra }}</span>
            <span class="janela-chat__status">Em linha para negociacao em Maceio</span>
          </div>
        </header>

        <!-- Historico de mensagens renderizado reativamente -->
        <div class="janela-chat__historico" ref="elementoHistorico">
          <div
            v-for="(mensagem, indice) in historicoDesMensagens"
            :key="indice"
            :class="['mensagem-container', 'mensagem-container--' + mensagem.direcao]"
          >
            <div :class="['balao-mensagem', 'balao-mensagem--' + mensagem.direcao]">
              {{ mensagem.texto }}
            </div>
            <span class="mensagem-horario">{{ mensagem.horario }}</span>
          </div>
        </div>

        <!-- Formulario de envio de nova mensagem -->
        <form class="janela-chat__entrada" @submit.prevent="enviarMensagem">
          <input
            type="text"
            v-model="textoDaNovaMensagem"
            class="campo-entrada janela-chat__campo"
            placeholder="Escreva sua proposta ou mensagem para o leitor..."
            required
          />
          <button type="submit" class="botao botao--primario">Enviar</button>
        </form>
      </section>

    </div>
  </main>
</template>

<script setup>
// ---------------------------------------------------------
// Nome do bloco: Logica da pagina de mensagens
// Gerencia filtro de conversas, selecao de conversa ativa
// e envio de novas mensagens de forma reativa
// ---------------------------------------------------------
import { ref, computed, nextTick } from 'vue';
import CabecalhoPrincipal from '../componentes/CabecalhoPrincipal.vue';

// Referencia ao elemento do historico para controlar o scroll automatico
const elementoHistorico = ref(null);

// Termo de filtro para a lista de conversas
const termoDeFiltroDeConversas = ref('');

// Texto digitado no campo de nova mensagem
const textoDaNovaMensagem = ref('');

// Lista de conversas da barra lateral
const listaDeConversas = ref([
  {
    identificador: 1,
    inicialDoNome: 'A',
    nomeEObra: 'Ana \u2022 Livro 1',
    horario: '14:32',
    ultimaMensagem: 'Podemos combinar a troca?',
    estaAtiva: true,
  },
  {
    identificador: 2,
    inicialDoNome: 'J',
    nomeEObra: 'Joao \u2022 Livro 2',
    horario: 'Ontem',
    ultimaMensagem: 'O livro ja esta embalado para envio.',
    estaAtiva: false,
  },
  {
    identificador: 3,
    inicialDoNome: 'M',
    nomeEObra: 'Maria \u2022 Livro 3',
    horario: 'Seg',
    ultimaMensagem: 'Tem interesse em outros titulos?',
    estaAtiva: false,
  },
]);

// Conversa atualmente selecionada na lista
const conversaAtiva = ref(listaDeConversas.value[0]);

// Historico de mensagens da conversa ativa
const historicoDesMensagens = ref([
  {
    direcao: 'recebida',
    texto: 'Ola! Encontrei seu anuncio de Livro 1. Gostaria de saber se a edicao ainda esta disponivel para troca pelo meu exemplar de classicos modernos?',
    horario: '14:28',
  },
  {
    direcao: 'enviada',
    texto: 'Ola, Ana! Sim, a edicao esta em perfeito estado e pronta para circular. Vi sua estante e tenho interesse sim. Podemos combinar o encontro?',
    horario: '14:32',
  },
]);

// Filtra conversas da barra lateral com base no termo digitado
const conversasFiltradas = computed(() => {
  const termoBuscaNormalizado = termoDeFiltroDeConversas.value.toLowerCase().trim();

  if (!termoBuscaNormalizado) {
    return listaDeConversas.value;
  }

  return listaDeConversas.value.filter((conversa) => {
    return (
      conversa.nomeEObra.toLowerCase().includes(termoBuscaNormalizado) ||
      conversa.ultimaMensagem.toLowerCase().includes(termoBuscaNormalizado)
    );
  });
});

// Define a conversa selecionada como ativa
function selecionarConversa(conversaSelecionada) {
  listaDeConversas.value.forEach((conversa) => {
    conversa.estaAtiva = conversa.identificador === conversaSelecionada.identificador;
  });
  conversaAtiva.value = conversaSelecionada;
}

// Adiciona a nova mensagem ao historico e rola para o final
async function enviarMensagem() {
  const textoValidado = textoDaNovaMensagem.value.trim();

  if (!textoValidado) {
    return;
  }

  const horarioAtual = new Date().toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  historicoDesMensagens.value.push({
    direcao: 'enviada',
    texto: textoValidado,
    horario: horarioAtual,
  });

  textoDaNovaMensagem.value = '';

  // Aguarda o DOM atualizar antes de rolar para o final
  await nextTick();
  if (elementoHistorico.value) {
    elementoHistorico.value.scrollTop = elementoHistorico.value.scrollHeight;
  }
}
</script>
