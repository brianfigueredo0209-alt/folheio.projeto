<template>
  <CabecalhoPrincipal />
  <main class="recipiente-centralizado">
    <section class="cabecalho-secao"><h1 class="cabecalho-secao__titulo">Dialogos de circulacao</h1><p>Conversas vinculadas aos livros. Atualizacao a cada cinco segundos.</p></section>
    <p v-if="erroDaPagina" role="alert">{{ erroDaPagina }}</p>
    <p v-if="carregando" role="status">Carregando conversas...</p>
    <div class="layout-mensagens-editorial">
      <aside class="painel-conversas">
        <div class="painel-conversas__cabecalho">
          <h2 class="painel-conversas__titulo">Leitores</h2>
          <input v-model="termoDeFiltro" type="search" class="painel-conversas__busca" placeholder="Filtrar por obra ou leitor..." aria-label="Filtrar conversas" />
        </div>
        <div class="painel-conversas__lista">
          <button v-for="conversa in conversasFiltradas" :key="conversa.identificador" :class="['item-conversa', { 'item-conversa--ativo': conversa.identificador === conversaAtiva?.identificador }]" @click="selecionarConversa(conversa)">
            <div class="item-conversa__avatar">{{ conversa.interlocutor.slice(0, 1) }}</div>
            <div class="item-conversa__detalhes"><span class="item-conversa__nome">{{ conversa.interlocutor }}</span><p class="item-conversa__mensagem">{{ conversa.titulo }}</p></div>
          </button>
          <p v-if="!carregando && !listaDeConversas.length">Nenhuma conversa. Selecione um livro no catalogo para negociar.</p>
        </div>
      </aside>
      <section v-if="conversaAtiva" class="janela-chat">
        <header class="janela-chat__cabecalho"><div class="janela-chat__info-usuario"><span class="janela-chat__nome">{{ conversaAtiva.interlocutor }}</span><span class="janela-chat__status">{{ conversaAtiva.titulo }}</span></div></header>
        <div ref="elementoHistorico" class="janela-chat__historico" aria-live="polite">
          <p v-if="!historico.length">Comece a conversa sobre este livro.</p>
          <div v-for="mensagem in historico" :key="mensagem.identificador" :class="['mensagem-container', 'mensagem-container--' + direcao(mensagem)]">
            <div :class="['balao-mensagem', 'balao-mensagem--' + direcao(mensagem)]">{{ mensagem.texto }}</div>
            <span class="mensagem-horario">{{ new Date(mensagem.criado_em).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) }}</span>
          </div>
        </div>
        <form class="janela-chat__entrada" @submit.prevent="enviarMensagem">
          <input v-model="texto" class="campo-entrada janela-chat__campo" aria-label="Mensagem" placeholder="Escreva sua proposta..." maxlength="2000" required />
          <button class="botao botao--primario" :disabled="enviando">Enviar</button>
        </form>
      </section>
    </div>
  </main>
</template>
<script setup>
// ---------------------------------------------------------
// Nome do bloco: Mensagens persistentes com atualizacao periodica e isolamento por conversa
// ---------------------------------------------------------
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import CabecalhoPrincipal from '../componentes/CabecalhoPrincipal.vue';
import { requisitar, sessao } from '../servicos/api.js';
const rota = useRoute();
const listaDeConversas = ref([]);
const conversaAtiva = ref(null);
const historico = ref([]);
const termoDeFiltro = ref('');
const texto = ref('');
const elementoHistorico = ref(null);
const erroDaPagina = ref('');
const carregando = ref(true);
const enviando = ref(false);
let temporizador;
let atualizando = false;
let desmontada = false;
const conversasFiltradas = computed(() => listaDeConversas.value.filter(conversa =>
  (conversa.interlocutor + ' ' + conversa.titulo).toLowerCase().includes(termoDeFiltro.value.toLowerCase())));
function direcao(mensagem) { return mensagem.remetente_id === sessao.value?.usuario.identificador ? 'enviada' : 'recebida'; }
async function selecionarConversa(conversa) {
  conversaAtiva.value = conversa; historico.value = []; texto.value = '';
  try { await carregarMensagens(); erroDaPagina.value = ''; } catch (erro) { erroDaPagina.value = erro.message; }
}
async function carregarMensagens() {
  const identificador = conversaAtiva.value?.identificador;
  if (!identificador) return;
  const dados = await requisitar('/api/v1/conversas/' + identificador + '/mensagens');
  if (desmontada || conversaAtiva.value?.identificador !== identificador) return;
  const anterior = historico.value.at(-1)?.identificador;
  historico.value = dados.mensagens;
  if (anterior !== historico.value.at(-1)?.identificador) {
    await nextTick();
    if (elementoHistorico.value) elementoHistorico.value.scrollTop = elementoHistorico.value.scrollHeight;
  }
}
async function atualizar() {
  if (atualizando || desmontada) return;
  atualizando = true;
  try {
    listaDeConversas.value = (await requisitar('/api/v1/conversas')).conversas;
    if (conversaAtiva.value && !listaDeConversas.value.some(conversa => conversa.identificador === conversaAtiva.value.identificador)) {
      conversaAtiva.value = null; historico.value = [];
    }
    if (!conversaAtiva.value && listaDeConversas.value.length) {
      conversaAtiva.value = listaDeConversas.value.find(conversa => conversa.identificador === rota.query.conversa) || listaDeConversas.value[0];
    }
    if (conversaAtiva.value) conversaAtiva.value = listaDeConversas.value.find(conversa => conversa.identificador === conversaAtiva.value.identificador);
    await carregarMensagens(); erroDaPagina.value = '';
  } catch (erro) { erroDaPagina.value = erro.message; }
  finally { carregando.value = false; atualizando = false; }
}
async function enviarMensagem() {
  if (enviando.value || !texto.value.trim() || !conversaAtiva.value) return;
  const identificador = conversaAtiva.value.identificador;
  const mensagem = texto.value;
  enviando.value = true;
  try {
    await requisitar('/api/v1/conversas/' + identificador + '/mensagens', { metodo: 'POST', dados: { texto: mensagem } });
    if (conversaAtiva.value?.identificador === identificador) { texto.value = ''; await carregarMensagens(); }
    erroDaPagina.value = '';
  } catch (erro) { erroDaPagina.value = erro.message; }
  finally { enviando.value = false; }
}
onMounted(() => { atualizar(); temporizador = setInterval(atualizar, 5000); });
onUnmounted(() => { desmontada = true; clearInterval(temporizador); });
</script>
