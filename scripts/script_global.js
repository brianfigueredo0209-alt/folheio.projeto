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
  containerMobile.innerHTML = `
    <div style="font-size: 32px; font-weight: 700; margin-bottom: 24px;">FOLHEIO</div>
    <h2 style="font-size: 20px; margin-bottom: 16px; color: var(--cor-texto-principal);">Acesso pelo Computador</h2>
    <p style="font-size: 16px; line-height: 1.6; color: var(--cor-texto-secundario); max-width: 320px;">
      Acesse nossa plataforma web pelo seu computador, ou baixe nosso aplicativo nas lojas (Play Store e Apple Store) em breve!
    </p>
  `;
  document.body.appendChild(containerMobile);
}
