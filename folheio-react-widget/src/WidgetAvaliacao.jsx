// ---------------------------------------------------------
// Nome do bloco: Widget de avaliacao literaria
// Componente React isolado para registro e exibicao de
// avaliacoes de livros com persistencia via localStorage
// ---------------------------------------------------------
import React, { useState, useEffect } from 'react';

// ---------------------------------------------------------
// Nome do bloco: Lista de livros disponiveis para avaliacao
// Espelha o catalogo da pagina principal para coerencia de dados
// ---------------------------------------------------------
const livrosDisponiveis = [
  'Little Fires Everywhere — Celeste Ng',
  'Duna — Frank Herbert',
  'O Hobbit — J.R.R. Tolkien',
  'Ensaio Sobre a Cegueira — Jose Saramago',
  'Cem Anos de Solidao — Gabriel Garcia Marquez',
];

// ---------------------------------------------------------
// Nome do bloco: Chave de armazenamento no localStorage
// ---------------------------------------------------------
const CHAVE_AVALIACOES = 'folheio_avaliacoes_literarias';

// ---------------------------------------------------------
// Nome do bloco: Componente de selecao de estrelas
// Recebe a nota atual e uma funcao de callback para atualizacao
// ---------------------------------------------------------
function SeletorDeEstrelas({ notaAtual, aoAlterarNota }) {
  const [notaEmHover, definirNotaEmHover] = useState(0);

  return (
    <div style={estilos.containerEstrelas} aria-label="Selecionar nota de 1 a 5 estrelas">
      {[1, 2, 3, 4, 5].map((valorDaEstrela) => {
        const estrelaBrilha = valorDaEstrela <= (notaEmHover || notaAtual);

        return (
          <button
            key={valorDaEstrela}
            type="button"
            aria-label={`${valorDaEstrela} estrela${valorDaEstrela > 1 ? 's' : ''}`}
            style={{
              ...estilos.botaoEstrela,
              color: estrelaBrilha ? '#8F3D2C' : '#D1C9C0',
              transform: estrelaBrilha ? 'scale(1.15)' : 'scale(1)',
            }}
            onClick={() => aoAlterarNota(valorDaEstrela)}
            onMouseEnter={() => definirNotaEmHover(valorDaEstrela)}
            onMouseLeave={() => definirNotaEmHover(0)}
          >
            &#9733;
          </button>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------
// Nome do bloco: Componente de cartao de avaliacao registrada
// Exibe uma avaliacao salva com formatacao editorial
// ---------------------------------------------------------
function CartaoDeAvaliacao({ avaliacao }) {
  return (
    <div style={estilos.cartaoAvaliacao}>
      <div style={estilos.cartaoAvaliacaoCabecalho}>
        <span style={estilos.cartaoAvaliacaoTitulo}>{avaliacao.tituloDaObra}</span>
        <span style={estilos.cartaoAvaliacaoData}>{avaliacao.dataFormatada}</span>
      </div>
      <div style={{ display: 'flex', gap: '2px', marginBottom: '8px' }}>
        {[1, 2, 3, 4, 5].map((estrela) => (
          <span
            key={estrela}
            style={{ color: estrela <= avaliacao.nota ? '#8F3D2C' : '#D1C9C0', fontSize: '16px' }}
          >
            &#9733;
          </span>
        ))}
      </div>
      {avaliacao.notaDoLeitor && (
        <p style={estilos.cartaoAvaliacaoNota}>&ldquo;{avaliacao.notaDoLeitor}&rdquo;</p>
      )}
    </div>
  );
}

// ---------------------------------------------------------
// Nome do bloco: Componente raiz do widget de avaliacao
// Gerencia o formulario de nova avaliacao e a lista de registros
// ---------------------------------------------------------
export default function WidgetAvaliacao() {
  // Estado do formulario
  const [tituloDaObraSelecionada, definirTituloDaObraSelecionada] = useState('');
  const [notaSelecionada, definirNotaSelecionada] = useState(0);
  const [notaDoLeitor, definirNotaDoLeitor] = useState('');
  const [mensagemDeFeedback, definirMensagemDeFeedback] = useState('');

  // Lista de avaliacoes persistidas no localStorage
  const [listaDeAvaliacoes, definirListaDeAvaliacoes] = useState([]);

  // Carrega as avaliacoes salvas ao montar o componente
  useEffect(() => {
    const avaliacoesSalvas = JSON.parse(localStorage.getItem(CHAVE_AVALIACOES) || '[]');
    definirListaDeAvaliacoes(avaliacoesSalvas);
  }, []);

  // ---------------------------------------------------------
  // Processa o envio do formulario de avaliacao
  // ---------------------------------------------------------
  function registrarAvaliacao(eventoDeEnvio) {
    eventoDeEnvio.preventDefault();

    if (!tituloDaObraSelecionada || notaSelecionada === 0) {
      definirMensagemDeFeedback('Selecione uma obra e atribua uma nota antes de registrar.');
      return;
    }

    const novaAvaliacao = {
      identificador: Date.now().toString(),
      tituloDaObra: tituloDaObraSelecionada,
      nota: notaSelecionada,
      notaDoLeitor: notaDoLeitor.trim(),
      dataFormatada: new Date().toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }),
    };

    const avaliacoesAtualizadas = [novaAvaliacao, ...listaDeAvaliacoes];
    localStorage.setItem(CHAVE_AVALIACOES, JSON.stringify(avaliacoesAtualizadas));
    definirListaDeAvaliacoes(avaliacoesAtualizadas);

    // Reinicia o formulario
    definirTituloDaObraSelecionada('');
    definirNotaSelecionada(0);
    definirNotaDoLeitor('');
    definirMensagemDeFeedback('Avaliacao registrada com sucesso.');

    // Remove o feedback apos 3 segundos
    setTimeout(() => definirMensagemDeFeedback(''), 3000);
  }

  return (
    <section style={estilos.container} aria-labelledby="titulo-widget-avaliacao">

      {/* Cabecalho do widget */}
      <div style={estilos.cabecalho}>
        <div style={estilos.rotuloCabecalho}>Powered by React</div>
        <h2 id="titulo-widget-avaliacao" style={estilos.tituloCabecalho}>
          Registro de Leitura
        </h2>
        <p style={estilos.subtituloCabecalho}>
          Documente sua experiencia com cada obra da plataforma.
        </p>
      </div>

      {/* Formulario de nova avaliacao */}
      <form onSubmit={registrarAvaliacao} style={estilos.formulario}>

        <div style={estilos.grupoFormulario}>
          <label htmlFor="selecao-obra" style={estilos.rotulo}>
            Obra lida
          </label>
          <select
            id="selecao-obra"
            value={tituloDaObraSelecionada}
            onChange={(e) => definirTituloDaObraSelecionada(e.target.value)}
            style={estilos.campoSelecao}
            required
          >
            <option value="">Selecione uma obra do catalogo</option>
            {livrosDisponiveis.map((titulo) => (
              <option key={titulo} value={titulo}>{titulo}</option>
            ))}
          </select>
        </div>

        <div style={estilos.grupoFormulario}>
          <label style={estilos.rotulo}>Sua avaliacao</label>
          <SeletorDeEstrelas
            notaAtual={notaSelecionada}
            aoAlterarNota={definirNotaSelecionada}
          />
        </div>

        <div style={estilos.grupoFormulario}>
          <label htmlFor="nota-leitor" style={estilos.rotulo}>
            Nota pessoal sobre a leitura (opcional)
          </label>
          <textarea
            id="nota-leitor"
            value={notaDoLeitor}
            onChange={(e) => definirNotaDoLeitor(e.target.value)}
            placeholder="Registre suas impressoes sobre a obra, a edicao ou a traducao..."
            style={estilos.campoTexto}
            rows={3}
          />
        </div>

        {/* Mensagem de feedback ao usuario */}
        {mensagemDeFeedback && (
          <p style={estilos.mensagemFeedback}>{mensagemDeFeedback}</p>
        )}

        <button type="submit" style={estilos.botaoEnviar}>
          Registrar avaliacao
        </button>
      </form>

      {/* Lista de avaliacoes registradas */}
      {listaDeAvaliacoes.length > 0 && (
        <div style={estilos.secaoAvaliacoes}>
          <h3 style={estilos.tituloSecaoAvaliacoes}>
            Avaliacoes Registradas ({listaDeAvaliacoes.length})
          </h3>
          <div style={estilos.listaAvaliacoes}>
            {listaDeAvaliacoes.map((avaliacao) => (
              <CartaoDeAvaliacao key={avaliacao.identificador} avaliacao={avaliacao} />
            ))}
          </div>
        </div>
      )}

      {/* Estado vazio */}
      {listaDeAvaliacoes.length === 0 && (
        <p style={estilos.textoEstadoVazio}>
          Nenhuma avaliacao registrada ainda. Seja o primeiro a documentar sua leitura.
        </p>
      )}

    </section>
  );
}

// ---------------------------------------------------------
// Nome do bloco: Estilos do widget em objeto JavaScript
// Totalmente isolados do CSS global da pagina host
// Seguem a paleta editorial do FOLHEIO-WEB
// ---------------------------------------------------------
const estilos = {
  container: {
    fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
    backgroundColor: '#FFFFFF',
    border: '1px solid #E2DDD5',
    borderRadius: '10px',
    padding: '40px',
    marginTop: '64px',
    marginBottom: '40px',
    maxWidth: '860px',
    marginLeft: 'auto',
    marginRight: 'auto',
    boxShadow: '0 2px 12px rgba(26, 24, 22, 0.03)',
  },
  cabecalho: {
    borderBottom: '1px solid #E2DDD5',
    paddingBottom: '24px',
    marginBottom: '32px',
  },
  rotuloCabecalho: {
    fontSize: '11px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '1.5px',
    color: '#8F3D2C',
    marginBottom: '8px',
  },
  tituloCabecalho: {
    fontFamily: "'Cormorant Garamond', Georgia, serif",
    fontSize: '28px',
    fontWeight: '600',
    color: '#1A1816',
    marginBottom: '6px',
    letterSpacing: '-0.3px',
  },
  subtituloCabecalho: {
    fontSize: '14px',
    color: '#8F877D',
    lineHeight: '1.5',
  },
  formulario: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  grupoFormulario: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  rotulo: {
    fontSize: '13px',
    fontWeight: '500',
    color: '#5E5851',
  },
  campoSelecao: {
    fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
    fontSize: '14px',
    padding: '10px 14px',
    border: '1px solid #E2DDD5',
    borderRadius: '4px',
    backgroundColor: '#F8F6F0',
    color: '#1A1816',
    outline: 'none',
    cursor: 'pointer',
  },
  campoTexto: {
    fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
    fontSize: '14px',
    padding: '10px 14px',
    border: '1px solid #E2DDD5',
    borderRadius: '4px',
    backgroundColor: '#F8F6F0',
    color: '#1A1816',
    resize: 'vertical',
    outline: 'none',
    lineHeight: '1.6',
  },
  containerEstrelas: {
    display: 'flex',
    gap: '4px',
  },
  botaoEstrela: {
    background: 'none',
    border: 'none',
    fontSize: '28px',
    cursor: 'pointer',
    padding: '0',
    transition: 'color 0.15s ease, transform 0.15s ease',
    lineHeight: '1',
  },
  mensagemFeedback: {
    fontSize: '13px',
    color: '#2A483E',
    backgroundColor: '#E9F1ED',
    border: '1px solid #2A483E',
    borderRadius: '4px',
    padding: '10px 14px',
  },
  botaoEnviar: {
    fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
    fontSize: '14px',
    fontWeight: '600',
    backgroundColor: '#8F3D2C',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '4px',
    padding: '12px 24px',
    cursor: 'pointer',
    alignSelf: 'flex-start',
    transition: 'background-color 0.2s ease',
    letterSpacing: '0.3px',
  },
  secaoAvaliacoes: {
    marginTop: '40px',
    borderTop: '1px solid #E2DDD5',
    paddingTop: '32px',
  },
  tituloSecaoAvaliacoes: {
    fontFamily: "'Cormorant Garamond', Georgia, serif",
    fontSize: '20px',
    fontWeight: '600',
    color: '#1A1816',
    marginBottom: '20px',
    letterSpacing: '-0.3px',
  },
  listaAvaliacoes: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  cartaoAvaliacao: {
    backgroundColor: '#F8F6F0',
    border: '1px solid #E2DDD5',
    borderRadius: '6px',
    padding: '20px',
  },
  cartaoAvaliacaoCabecalho: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '8px',
    gap: '12px',
    flexWrap: 'wrap',
  },
  cartaoAvaliacaoTitulo: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1A1816',
  },
  cartaoAvaliacaoData: {
    fontSize: '12px',
    color: '#8F877D',
    whiteSpace: 'nowrap',
  },
  cartaoAvaliacaoNota: {
    fontSize: '14px',
    color: '#5E5851',
    lineHeight: '1.6',
    fontStyle: 'italic',
    marginTop: '8px',
  },
  textoEstadoVazio: {
    marginTop: '32px',
    fontSize: '14px',
    color: '#8F877D',
    textAlign: 'center',
    padding: '32px 0',
    borderTop: '1px solid #ECE8E1',
  },
};
