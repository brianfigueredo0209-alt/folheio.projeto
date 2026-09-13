<template>
  <!-- ---------------------------------------------------------
  Nome do bloco: Cabecalho principal reutilizavel
  Presente em todas as paginas internas da plataforma
  Usa RouterLink para navegacao SPA sem recarregar a pagina
  --------------------------------------------------------- -->
  <header class="cabecalho-principal">
    <RouterLink to="/livros" class="cabecalho-principal__logo">
      FOLHEIO
      <span class="cabecalho-principal__edicao">Curadoria</span>
    </RouterLink>

    <nav class="cabecalho-principal__navegacao" aria-label="Navegacao principal">
      <RouterLink
        to="/livros"
        class="cabecalho-principal__link"
        active-class="ativo"
      >
        Livros
      </RouterLink>
      <RouterLink
        to="/publicar"
        class="cabecalho-principal__link"
        active-class="ativo"
      >
        Anunciar
      </RouterLink>
      <RouterLink
        to="/mensagens"
        class="cabecalho-principal__link"
        active-class="ativo"
      >
        Mensagens
      </RouterLink>
      <RouterLink
        to="/perfil"
        class="cabecalho-principal__link"
        active-class="ativo"
      >
        Perfil
      </RouterLink>
    </nav>

    <div class="cabecalho-principal__acoes">
      <RouterLink to="/publicar" class="botao botao--primario">
        + Anunciar livro
      </RouterLink>
    </div>
  </header>
</template>

<script setup>
// ---------------------------------------------------------
// Nome do bloco: Cabecalho sem logica adicional
// O estado ativo dos links e gerenciado automaticamente
// pelo RouterLink com o atributo active-class
// ---------------------------------------------------------
</script>
