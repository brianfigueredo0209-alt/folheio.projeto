import { ref } from 'vue';

// ---------------------------------------------------------
// Nome do bloco: Sessao compartilhada e cliente do contrato HTTP
// O navegador guarda somente a sessao; livros e conversas pertencem ao backend.
// ---------------------------------------------------------
function recuperarSessao() {
  try { return JSON.parse(sessionStorage.getItem('folheio_sessao') || 'null'); }
  catch { sessionStorage.removeItem('folheio_sessao'); return null; }
}
export const sessao = ref(recuperarSessao());
const enderecoAPI = (import.meta.env.VITE_API_URL || 'http://localhost:8080').replace(/\/$/, '');
export function guardarSessao(dados) {
  sessao.value = dados;
  if (dados) sessionStorage.setItem('folheio_sessao', JSON.stringify(dados));
  else sessionStorage.removeItem('folheio_sessao');
}
export async function requisitar(caminho, { metodo = 'GET', dados } = {}) {
  const controlador = new AbortController();
  const limite = setTimeout(() => controlador.abort(), 15000);
  try {
    const cabecalhos = { 'Content-Type': 'application/json' };
    if (sessao.value?.token) cabecalhos.Authorization = `Bearer ${sessao.value.token}`;
    const resposta = await fetch(`${enderecoAPI}${caminho}`, {
      method: metodo, headers: cabecalhos,
      body: dados === undefined ? undefined : JSON.stringify(dados),
      signal: controlador.signal,
    });
    const resultado = await resposta.json();
    if (!resposta.ok) {
      if (resposta.status === 401 && !caminho.startsWith('/api/v1/auth/')) {
        guardarSessao(null);
        window.dispatchEvent(new Event('folheio-sessao-expirada'));
      }
      throw new Error(resultado.data?.message || 'Nao foi possivel concluir a operacao.');
    }
    return resultado.data;
  } catch (erro) {
    if (erro.name === 'AbortError') throw new Error('A API demorou para responder. Tente novamente.');
    if (erro instanceof TypeError) throw new Error('Nao foi possivel conectar a API. Confira o servidor e a rede.');
    throw erro;
  } finally { clearTimeout(limite); }
}
export function prepararLivro(livro, indice) {
  return { ...livro, numero: String(indice + 1).padStart(2, '0'),
    urlCapa: livro.capa || '/capa_padrao_editorial.svg',
    etiqueta: livro.modalidade === 'venda'
      ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(livro.preco_centavos / 100)
      : livro.modalidade === 'doacao' ? 'Doacao' : 'Troca',
    classeEtiqueta: 'etiqueta--troca', localizacao: livro.cidade, edicao: livro.estado };
}
export function tratarErroAoCarregarCapa(evento) {
  const imagem = evento.target;
  if (!imagem.src.endsWith('/capa_padrao_editorial.svg')) imagem.src = '/capa_padrao_editorial.svg';
}
