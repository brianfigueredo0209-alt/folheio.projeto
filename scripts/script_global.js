// ---------------------------------------------------------
// Nome do bloco: Configuracoes e inicializacao global do sistema
// ---------------------------------------------------------

document.addEventListener('DOMContentLoaded', function () {
  configurarAlternadorDeSenha();
  configurarAreaDeCarregamentoDeFoto();
  configurarEnvioDeMensagensNoChat();
  configurarFiltroDeConversas();
  configurarBloqueioMobile();
});

// ---------------------------------------------------------
// Nome do bloco: Alternancia de visibilidade do campo de senha
// ---------------------------------------------------------
function configurarAlternadorDeSenha() {
  const botaoAlternarSenha = document.getElementById('botao-alternar-senha');
  const campoSenha = document.getElementById('campo-senha');

  if (!botaoAlternarSenha || !campoSenha) {
    return;
  }

  botaoAlternarSenha.addEventListener('click', function () {
    const oTipoAtualEhSenha = campoSenha.getAttribute('type') === 'password';

    if (oTipoAtualEhSenha) {
      campoSenha.setAttribute('type', 'text');
      botaoAlternarSenha.textContent = 'Ocultar';
    } else {
      campoSenha.setAttribute('type', 'password');
      botaoAlternarSenha.textContent = 'Exibir';
    }
  });
}

// ---------------------------------------------------------
// Nome do bloco: Interacao com a area de upload de foto
// ---------------------------------------------------------
function configurarAreaDeCarregamentoDeFoto() {
  const elementoEntradaArquivo = document.getElementById('arquivo-capa');
  const textoInformativoUpload = document.querySelector('.painel-upload-editorial__titulo, .painel-upload__titulo');

  if (!elementoEntradaArquivo || !textoInformativoUpload) {
    return;
  }

  elementoEntradaArquivo.addEventListener('change', function () {
    const arquivoFoiSelecionado = elementoEntradaArquivo.files && elementoEntradaArquivo.files.length > 0;

    if (arquivoFoiSelecionado) {
      const nomeDoArquivoSelecionado = elementoEntradaArquivo.files[0].name;
      textoInformativoUpload.textContent = 'Arquivo selecionado: ' + nomeDoArquivoSelecionado;
    }
  });
}

// ---------------------------------------------------------
// Nome do bloco: Simulacao de envio de mensagem no chat
// ---------------------------------------------------------
function configurarEnvioDeMensagensNoChat() {
  const formularioEnvioMensagem = document.querySelector('.janela-chat__entrada');
  const campoTextoMensagem = document.querySelector('.janela-chat__campo');
  const historicoDeMensagens = document.querySelector('.janela-chat__historico');

  if (!formularioEnvioMensagem || !campoTextoMensagem || !historicoDeMensagens) {
    return;
  }

  formularioEnvioMensagem.addEventListener('submit', function (eventoDeEnvio) {
    eventoDeEnvio.preventDefault();

    const textoDaMensagem = campoTextoMensagem.value.trim();

    if (textoDaMensagem === '') {
      return;
    }

    const horarioAtual = new Date().toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });

    const recipienteDaMensagem = document.createElement('div');
    recipienteDaMensagem.className = 'mensagem-container mensagem-container--enviada';

    const balaoDaMensagem = document.createElement('div');
    balaoDaMensagem.className = 'balao-mensagem balao-mensagem--enviada';
    balaoDaMensagem.textContent = textoDaMensagem;

    const elementoHorario = document.createElement('span');
    elementoHorario.className = 'mensagem-horario';
    elementoHorario.textContent = horarioAtual;

    recipienteDaMensagem.appendChild(balaoDaMensagem);
    recipienteDaMensagem.appendChild(elementoHorario);
    historicoDeMensagens.appendChild(recipienteDaMensagem);

    campoTextoMensagem.value = '';
    historicoDeMensagens.scrollTop = historicoDeMensagens.scrollHeight;
  });
}

// ---------------------------------------------------------
// Nome do bloco: Filtro dinamico na lista de conversas
// ---------------------------------------------------------
function configurarFiltroDeConversas() {
  const campoBuscaConversas = document.querySelector('.painel-conversas__busca');
  const listaDeItensDeConversa = document.querySelectorAll('.item-conversa');

  if (!campoBuscaConversas || listaDeItensDeConversa.length === 0) {
    return;
  }

  campoBuscaConversas.addEventListener('input', function () {
    const termoDeBuscaNormalizado = campoBuscaConversas.value.toLowerCase().trim();

    listaDeItensDeConversa.forEach(function (itemDaConversa) {
      const elementoNome = itemDaConversa.querySelector('.item-conversa__nome');
      const elementoMensagem = itemDaConversa.querySelector('.item-conversa__mensagem');

      const textoDoNome = elementoNome ? elementoNome.textContent.toLowerCase() : '';
      const textoDaMensagem = elementoMensagem ? elementoMensagem.textContent.toLowerCase() : '';

      const correspondeAoTermo = textoDoNome.includes(termoDeBuscaNormalizado) || textoDaMensagem.includes(termoDeBuscaNormalizado);

      if (correspondeAoTermo) {
        itemDaConversa.style.display = 'flex';
      } else {
        itemDaConversa.style.display = 'none';
      }
    });
  });
}


// ---------------------------------------------------------
// Nome do bloco: Bloqueio de acesso via navegadores mobile
// ---------------------------------------------------------
function configurarBloqueioMobile() {
  const containerMobile = document.createElement('div');
  containerMobile.id = 'bloqueio-mobile-overlay';
  
  // Ícones em SVG
  const iconeApple = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.15 2.67.72 3.4 1.8-3.02 1.83-2.52 5.54.49 6.77-.73 1.82-1.61 3.55-2.54 4.44zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>`;
  const iconePlayStore = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M18.8 11.2L5.5 3.5C5.1 3.3 4.8 3.5 4.8 3.9v16.2c0 .4.4.6.7.4l13.3-7.7c.4-.2.4-.6 0-.8zM6.8 5.7l9 5.2-3.1 3.1-5.9-8.3zm0 12.6l5.9-8.3 3.1 3.1-9 5.2z"/></svg>`;

  containerMobile.innerHTML = `
    <div class="bloqueio-mobile__card">
      <div class="bloqueio-mobile__logo">FOLHEIO</div>
      <h2 class="bloqueio-mobile__titulo">Acesso via Computador</h2>
      <p class="bloqueio-mobile__texto">
        Nossa plataforma web foi desenhada para a melhor experiência no desktop. Por favor, acesse pelo seu computador.
      </p>
      
      <div class="bloqueio-mobile__divisor"></div>
      
      <p class="bloqueio-mobile__texto-secundario">Em breve nas lojas de aplicativo:</p>
      <div class="bloqueio-mobile__lojas">
        <div class="bloqueio-mobile__botao-loja" title="App Store" aria-label="App Store">
          ${iconeApple}
        </div>
        <div class="bloqueio-mobile__botao-loja" title="Google Play" aria-label="Google Play">
          ${iconePlayStore}
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(containerMobile);
}
