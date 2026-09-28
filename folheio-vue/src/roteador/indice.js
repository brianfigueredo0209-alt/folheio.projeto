// ---------------------------------------------------------
// Nome do bloco: Configuracao central de rotas da aplicacao
// Define o mapeamento entre URLs e componentes de pagina
// ---------------------------------------------------------

import { createRouter, createWebHashHistory } from 'vue-router';

import PaginaLogin            from '../paginas/PaginaLogin.vue';
import PaginaEncontreLivros   from '../paginas/PaginaEncontreLivros.vue';
import PaginaMensagens        from '../paginas/PaginaMensagens.vue';
import PaginaMeuPerfil        from '../paginas/PaginaMeuPerfil.vue';
import PaginaPublicarLivro    from '../paginas/PaginaPublicarLivro.vue';

// Definicao das rotas: cada objeto mapeia um caminho a um componente de pagina
const rotas = [
  { path: '/',         component: PaginaLogin,          meta: { titulo: 'Acesso — FOLHEIO' } },
  { path: '/livros',   component: PaginaEncontreLivros,  meta: { titulo: 'Livros — FOLHEIO' } },
  { path: '/mensagens',component: PaginaMensagens,       meta: { titulo: 'Mensagens — FOLHEIO' } },
  { path: '/perfil',   component: PaginaMeuPerfil,       meta: { titulo: 'Perfil — FOLHEIO' } },
  { path: '/publicar', component: PaginaPublicarLivro,   meta: { titulo: 'Anunciar — FOLHEIO' } },
];

// Instancia do roteador com historico baseado em hash (funciona sem servidor backend)
const roteadorDaAplicacao = createRouter({
  history: createWebHashHistory(),
  routes: rotas,
  scrollBehavior() {
    // Rola para o topo da pagina a cada navegacao
    return { top: 0 };
  },
});

// Atualiza o titulo da aba do navegador a cada mudanca de rota
roteadorDaAplicacao.afterEach((rotaDestino) => {
  document.title = rotaDestino.meta.titulo || 'FOLHEIO';
});

export default roteadorDaAplicacao;
