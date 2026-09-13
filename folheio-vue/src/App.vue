<template>
  <!-- ---------------------------------------------------------
  Nome do bloco: Componente raiz da aplicacao
  Renderiza o bloqueio mobile e o componente de rota ativa
  --------------------------------------------------------- -->
  <BloqueioMobile />
  <RouterView />
</template>

<script setup>
// ---------------------------------------------------------
// Nome do bloco: Importacao dos componentes globais do App
// ---------------------------------------------------------
import BloqueioMobile from './componentes/BloqueioMobile.vue';
</script>
