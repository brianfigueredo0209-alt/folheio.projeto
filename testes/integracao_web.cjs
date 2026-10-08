const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');

// ---------------------------------------------------------
// Nome do bloco: Fluxo Web com duas sessoes independentes usando banco exclusivo de teste
// ---------------------------------------------------------
(async () => {
  const navegador = await chromium.launch({ headless: true });
  const erros = [];
  const identificador = Date.now().toString();
  const contextos = [];
  try {
    async function abrirCliente() {
      const contexto = await navegador.newContext({ viewport: { width: 1440, height: 1000 } });
      contextos.push(contexto);
      await contexto.route('http://localhost:8080/**', rota =>
        rota.continue({ url: rota.request().url().replace('localhost:8080', 'localhost:8081') }));
      const pagina = await contexto.newPage();
      pagina.on('pageerror', erro => erros.push(erro.message));
      await pagina.goto('http://127.0.0.1:5173/');
      return pagina;
    }
    async function cadastrar(pagina, nome, sufixo) {
      await pagina.getByRole('button', { name: 'Cadastrar estante', exact: true }).click();
      await pagina.getByLabel('Nome', { exact: true }).fill(nome);
      await pagina.getByLabel('Cidade e estado').fill('Maceio - AL');
      await pagina.getByLabel('Endereco de e-mail').fill(identificador + sufixo + '@teste.example');
      await pagina.getByLabel('Senha de acesso').fill('SenhaTeste123!');
      await pagina.getByRole('button', { name: 'Criar conta', exact: true }).click();
      await pagina.waitForURL('**/#/livros');
    }
    const publicador = await abrirCliente();
    await cadastrar(publicador, 'Publicador de teste', 'a');
    await publicador.getByRole('link', { name: 'Anunciar', exact: true }).click();
    await publicador.getByLabel('Titulo do livro').fill('Livro integrado ' + identificador);
    await publicador.getByLabel('Autor da obra').fill('Autora de teste');
    await publicador.getByLabel('Genero literario').selectOption('romance');
    await publicador.getByLabel('Estado de conservacao').selectOption('bom');
    await publicador.getByLabel('Notas do leitor sobre a edicao').fill('Edicao publicada pela API compartilhada.');
    await publicador.getByLabel('O que voce gostaria em contrapartida?').fill('Outro romance');
    await publicador.getByRole('button', { name: 'Publicar anuncio', exact: true }).click();
    await publicador.waitForURL('**/#/perfil');
    await publicador.getByRole('heading', { name: 'Livro integrado ' + identificador, exact: true }).waitFor();
    const leitor = await abrirCliente();
    await cadastrar(leitor, 'Leitor de teste', 'b');
    await leitor.getByRole('searchbox', { name: 'Buscar livros' }).fill(identificador);
    await leitor.getByRole('button', { name: 'Tenho interesse', exact: true }).click();
    await leitor.waitForURL('**/#/mensagens?**');
    await leitor.getByRole('textbox', { name: 'Mensagem', exact: true }).fill('Proposta enviada pelo leitor');
    await leitor.getByRole('button', { name: 'Enviar', exact: true }).click();
    await leitor.getByText('Proposta enviada pelo leitor', { exact: true }).waitFor();
    await publicador.getByRole('link', { name: 'Mensagens', exact: true }).click();
    await publicador.getByText('Proposta enviada pelo leitor', { exact: true }).waitFor();
    await publicador.getByRole('textbox', { name: 'Mensagem', exact: true }).fill('Resposta do proprietario');
    await publicador.getByRole('button', { name: 'Enviar', exact: true }).click();
    await leitor.getByText('Resposta do proprietario', { exact: true }).waitFor({ timeout: 12000 });
    await publicador.getByRole('link', { name: 'Perfil', exact: true }).click();
    await publicador.getByRole('link', { name: 'Editar anuncio', exact: true }).click();
    await publicador.getByLabel('Titulo do livro').fill('Livro editado ' + identificador);
    await publicador.getByLabel('Modalidade da oferta').selectOption('venda');
    await publicador.getByLabel('Preco em reais').fill('25.90');
    await publicador.getByRole('button', { name: 'Salvar alteracoes', exact: true }).click();
    await publicador.waitForURL('**/#/perfil');
    await publicador.getByRole('heading', { name: 'Livro editado ' + identificador, exact: true }).waitFor();
    await publicador.screenshot({ path: 'tmp/estante-integrada.png', fullPage: true });
    publicador.once('dialog', dialogo => dialogo.accept());
    await publicador.getByRole('button', { name: 'Remover anuncio', exact: true }).click();
    await publicador.getByText('Sua estante ainda esta vazia.', { exact: false }).waitFor();
    await publicador.getByRole('button', { name: 'Sair', exact: true }).click();
    await publicador.waitForURL('**/#/');
    assert.deepEqual(erros, []);
    console.log('PASS: cadastro, publicacao, catalogo compartilhado, chat entre duas contas, edicao, remocao e logout.');
  } finally { await navegador.close(); }
})().catch(erro => { console.error(erro); process.exitCode = 1; });
