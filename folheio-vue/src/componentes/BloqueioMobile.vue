<template>
  <!-- ---------------------------------------------------------
  Nome do bloco: Overlay de bloqueio para dispositivos mobile
  Exibido apenas em telas menores que 768px via CSS existente
  --------------------------------------------------------- -->
  <div id="bloqueio-mobile-overlay">
    <div class="bloqueio-mobile__card">
      <div class="bloqueio-mobile__logo">FOLHEIO</div>
      <h2 class="bloqueio-mobile__titulo">Acesso via Computador</h2>
      <p class="bloqueio-mobile__texto">
        Nossa plataforma web foi desenhada para a melhor experiencia no desktop.
        Por favor, acesse pelo seu computador.
      </p>

      <div class="bloqueio-mobile__divisor"></div>

      <p class="bloqueio-mobile__texto-secundario">Em breve nas lojas de aplicativo:</p>
      <div class="bloqueio-mobile__lojas">
        <div class="bloqueio-mobile__botao-loja" title="App Store" aria-label="App Store">
          <!-- Icone Apple -->
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.15 2.67.72 3.4 1.8-3.02 1.83-2.52 5.54.49 6.77-.73 1.82-1.61 3.55-2.54 4.44zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
          </svg>
        </div>
        <div class="bloqueio-mobile__botao-loja" title="Google Play" aria-label="Google Play">
          <!-- Icone Google Play -->
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.8 11.2L5.5 3.5C5.1 3.3 4.8 3.5 4.8 3.9v16.2c0 .4.4.6.7.4l13.3-7.7c.4-.2.4-.6 0-.8zM6.8 5.7l9 5.2-3.1 3.1-5.9-8.3zm0 12.6l5.9-8.3 3.1 3.1-9 5.2z"/>
          </svg>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// ---------------------------------------------------------
// Nome do bloco: Logica do componente de bloqueio mobile
// O overlay e controlado exclusivamente pelo CSS existente
// via media query, sem necessidade de logica JavaScript adicional
// ---------------------------------------------------------
</script>
