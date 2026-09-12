// ---------------------------------------------------------
// Nome do bloco: Script de automacao para buscar capas na API e simular publicacao
// ---------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
  const campoTitulo = document.getElementById('campo-titulo');
  
  const painelCapaContainer = document.getElementById('painel-capa-container');
  const conteudoVazio = document.getElementById('conteudo-upload-vazio');
  const estadoCarregando = document.getElementById('estado-carregando');
  const previewCapa = document.getElementById('preview-capa');
  const urlCapaApi = document.getElementById('url-capa-api');
  const formularioPublicacao = document.querySelector('.formulario-publicacao-editorial');

  // Logica de upload de capa (apenas simulação visual local)
  const painelCapaContainer = document.getElementById('painel-capa-container');
  const conteudoVazio = document.getElementById('conteudo-upload-vazio');
  const previewCapa = document.getElementById('preview-capa');
  const inputArquivoCapa = document.getElementById('arquivo-capa');
  
  if (painelCapaContainer && inputArquivoCapa) {
    painelCapaContainer.addEventListener('click', () => {
      inputArquivoCapa.click();
    });

    inputArquivoCapa.addEventListener('change', (evento) => {
      const arquivo = evento.target.files[0];
      if (arquivo) {
        const urlArquivo = URL.createObjectURL(arquivo);
        conteudoVazio.style.display = 'none';
        previewCapa.src = urlArquivo;
        previewCapa.style.display = 'block';
        painelCapaContainer.style.padding = '12px';
        painelCapaContainer.style.border = 'none';
        painelCapaContainer.style.backgroundColor = 'transparent';
        
        // Em um sistema real, não salvaríamos Blob no LocalStorage,
        // mas para esse protótipo, podemos salvar a URL temporária no hidden input
        const urlCapaApi = document.getElementById('url-capa-api');
        if (urlCapaApi) urlCapaApi.value = urlArquivo;
      }
    });
  }

  // Intercepta o envio do formulario para criar o mock no localStorage
  if (formularioPublicacao) {
    formularioPublicacao.addEventListener('submit', (evento) => {
      evento.preventDefault(); // Impede o envio real do formulário

      // Coleta os dados para o mock
      const livroMock = {
        id: Date.now().toString(),
        titulo: campoTitulo ? campoTitulo.value : 'Livro Sem Título',
        autor: document.getElementById('campo-autor') ? document.getElementById('campo-autor').value : 'Autor Desconhecido',
        genero: document.getElementById('campo-genero') ? document.getElementById('campo-genero').value : 'Gênero',
        estado: document.getElementById('campo-estado') ? document.getElementById('campo-estado').value : 'Estado',
        descricao: document.getElementById('campo-descricao') ? document.getElementById('campo-descricao').value : '',
        desejo: document.getElementById('campo-desejo') ? document.getElementById('campo-desejo').value : '',
        capaUrl: (urlCapaApi && urlCapaApi.value) ? urlCapaApi.value : '../assets/livro_placeholder.jpg',
        dataPublicacao: new Date().toISOString()
      };

      // Salva no localStorage (simulando um banco de dados)
      const livrosPublicados = JSON.parse(localStorage.getItem('folheio_livros') || '[]');
      livrosPublicados.push(livroMock);
      localStorage.setItem('folheio_livros', JSON.stringify(livrosPublicados));

      // Feedback visual
      alert('Livro "' + livroMock.titulo + '" catalogado com sucesso!\nRedirecionando para o catálogo...');

      // Redireciona para o catalogo
      window.location.href = formularioPublicacao.getAttribute('action') || 'encontre_livros.html';
    });
  }
});
