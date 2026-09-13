// ---------------------------------------------------------
// Nome do bloco: Ponto de entrada do widget React
// Monta o componente de avaliacao na div container da pagina host
// ---------------------------------------------------------
import React from 'react';
import { createRoot } from 'react-dom/client';
import WidgetAvaliacao from './WidgetAvaliacao.jsx';

// Aguarda o DOM estar pronto antes de montar o widget
document.addEventListener('DOMContentLoaded', function () {
  const elementoContainer = document.getElementById('widget-avaliacao-react');

  // Encerra silenciosamente se a pagina nao tiver o container do widget
  if (!elementoContainer) {
    return;
  }

  // Monta o app React dentro do container sem interferir no restante da pagina
  const raizDoWidget = createRoot(elementoContainer);
  raizDoWidget.render(React.createElement(WidgetAvaliacao));
});
