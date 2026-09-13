// ---------------------------------------------------------
// Nome do bloco: Script de automacao para simular publicacao de livro
// Gerencia o upload de capa com validacao e a persistencia via localStorage
// ---------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {

  // ---------------------------------------------------------
  // Coleta de referencias aos elementos do DOM
  // Declaracoes consolidadas em um unico bloco para evitar redeclaracao
  // ---------------------------------------------------------
  const campoTitulo = document.getElementById('campo-titulo');
  const painelCapaContainer = document.getElementById('painel-capa-container');
  const conteudoVazio = document.getElementById('conteudo-upload-vazio');
  const previewCapa = document.getElementById('preview-capa');
  const urlCapaApi = document.getElementById('url-capa-api');
  const inputArquivoCapa = document.getElementById('arquivo-capa');
  const formularioPublicacao = document.querySelector('.formulario-publicacao-editorial');

  // ---------------------------------------------------------
  // Constantes de validacao do arquivo de capa
  // O atributo "accept" do HTML pode ser contornado pelo usuario,
  // por isso a validacao deve ser feita obrigatoriamente no JavaScript
  // ---------------------------------------------------------
  const TIPOS_MIME_PERMITIDOS = ['image/jpeg', 'image/png'];
  const TAMANHO_MAXIMO_BYTES = 5 * 1024 * 1024; // 5 MB

  // ---------------------------------------------------------
  // Logica de upload de capa com validacao de tipo MIME e tamanho
  // ---------------------------------------------------------
  if (painelCapaContainer && inputArquivoCapa) {
    painelCapaContainer.addEventListener('click', () => {
      inputArquivoCapa.click();
    });

    inputArquivoCapa.addEventListener('change', (evento) => {
      const arquivo = evento.target.files[0];

      if (!arquivo) {
        return;
      }

      // Valida o tipo MIME real do arquivo, independente da extensao informada
      if (!TIPOS_MIME_PERMITIDOS.includes(arquivo.type)) {
        alert('Formato de arquivo invalido. Utilize apenas JPEG ou PNG.');
        evento.target.value = '';
        return;
      }

      // Valida o tamanho maximo para evitar travamento do navegador
      if (arquivo.size > TAMANHO_MAXIMO_BYTES) {
        alert('O arquivo excede o limite maximo de 5 MB. Selecione uma imagem menor.');
        evento.target.value = '';
        return;
      }

      const urlArquivo = URL.createObjectURL(arquivo);
      conteudoVazio.style.display = 'none';
      previewCapa.src = urlArquivo;
      previewCapa.style.display = 'block';
      painelCapaContainer.style.padding = '12px';
      painelCapaContainer.style.border = 'none';
      painelCapaContainer.style.backgroundColor = 'transparent';

      // Armazena a URL temporaria no campo oculto para uso no submit
      if (urlCapaApi) {
        urlCapaApi.value = urlArquivo;
      }
    });
  }

  // ---------------------------------------------------------
  // Intercepta o envio do formulario para criar o registro no localStorage
  // IMPORTANTE (seguranca): os dados salvos aqui sao lidos e renderizados
  // via textContent ou via React (que escapa HTML automaticamente).
  // Nunca renderizar estes dados via innerHTML sem sanitizacao previa.
  // ---------------------------------------------------------
  if (formularioPublicacao) {
    formularioPublicacao.addEventListener('submit', (evento) => {
      evento.preventDefault();

      // Coleta os dados do formulario para o registro local
      const livroMock = {
        id: Date.now().toString(),
        titulo: campoTitulo ? campoTitulo.value : 'Livro Sem Titulo',
        autor: document.getElementById('campo-autor') ? document.getElementById('campo-autor').value : 'Autor Desconhecido',
        genero: document.getElementById('campo-genero') ? document.getElementById('campo-genero').value : 'Genero',
        estado: document.getElementById('campo-estado') ? document.getElementById('campo-estado').value : 'Estado',
        descricao: document.getElementById('campo-descricao') ? document.getElementById('campo-descricao').value : '',
        desejo: document.getElementById('campo-desejo') ? document.getElementById('campo-desejo').value : '',
        capaUrl: (urlCapaApi && urlCapaApi.value) ? urlCapaApi.value : '../assets/livro_placeholder.jpg',
        dataPublicacao: new Date().toISOString()
      };

      // Persiste o registro no localStorage simulando um banco de dados
      const livrosPublicados = JSON.parse(localStorage.getItem('folheio_livros') || '[]');
      livrosPublicados.push(livroMock);
      localStorage.setItem('folheio_livros', JSON.stringify(livrosPublicados));

      // Exibe confirmacao e redireciona para o catalogo
      alert('Livro "' + livroMock.titulo + '" catalogado com sucesso!\nRedirecionando para o catalogo...');
      window.location.href = formularioPublicacao.getAttribute('action') || 'encontre_livros.html';
    });
  }
});

