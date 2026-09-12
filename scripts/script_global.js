// ---------------------------------------------------------
// Nome do bloco: Configuracoes e inicializacao global do sistema
// ---------------------------------------------------------

document.addEventListener('DOMContentLoaded', function () {
  configurarAlternadorDeSenha();
  configurarAreaDeCarregamentoDeFoto();
  configurarEnvioDeMensagensNoChat();
  configurarFiltroDeConversas();
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
