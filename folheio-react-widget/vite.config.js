import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// ---------------------------------------------------------
// Nome do bloco: Configuracao do Vite em modo de biblioteca
// Gera um bundle IIFE auto-executavel e isolado (widget.js)
// que pode ser embutido em qualquer pagina HTML
// ---------------------------------------------------------
export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      // Ponto de entrada do widget
      entry: 'src/principal.jsx',
      // Nome da variavel global exposta no bundle IIFE
      name: 'FolheioWidgetAvaliacao',
      // Nome do arquivo de saida
      fileName: () => 'widget.js',
      // Formato IIFE: auto-executa ao ser carregado pela tag <script>
      formats: ['iife'],
    },
    rollupOptions: {
      // React e ReactDOM sao embutidos no bundle para total independencia
      // Nao ha dependencia de CDN externo
    },
    outDir: 'dist',
    // Nao limpar o outDir ao rebuildar (preserva outros artefatos)
    emptyOutDir: true,
  },
});
