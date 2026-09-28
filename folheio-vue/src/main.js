// ---------------------------------------------------------
// Nome do bloco: Ponto de entrada da aplicacao Vue
// Monta o app no elemento raiz e registra o roteador
// ---------------------------------------------------------

import { createApp } from 'vue';
import App from './App.vue';
import roteadorDaAplicacao from './roteador/indice.js';

// Importacao dos estilos globais existentes no projeto
import './assets/estilo_base.css';
import './assets/estilo_componentes.css';
import './assets/estilo_paginas.css';

// Cria a instancia do app Vue, registra o roteador e monta no elemento #app
const aplicacao = createApp(App);
aplicacao.use(roteadorDaAplicacao);
aplicacao.mount('#app');
