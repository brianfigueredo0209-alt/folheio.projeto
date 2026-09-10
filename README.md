# Folheio

O projeto **Folheio** consiste em um marketplace (plataforma de comércio eletrônico) e ambiente de troca focado no nicho literário. O objetivo principal do sistema é facilitar o reaproveitamento de livros que não estão mais em uso pelos seus proprietários.

A plataforma possibilita que os usuários realizem o repasse de seus livros, seja por meio de venda, doação ou troca, criando um ecossistema focado na circulação sustentável de livros.

## Propósito do Sistema

O Folheio atua como um mercado digital especializado, estruturado com os seguintes pilares:

- **Venda, Doação e Permuta:** A plataforma permite que os usuários cadastrem livros ociosos em anúncios para venda, doação ou para solicitar uma permuta com itens de outros usuários.
- **Análises e Avaliações Integradas:** Em vez de funcionar como uma rede social genérica, o sistema incorpora resenhas e avaliações diretamente nos anúncios dos livros. Os usuários podem incluir suas opiniões sobre a obra na própria página de venda ou troca, agregando valor à transação e auxiliando os interessados na decisão.
- **Foco no Leitor:** Diferente de plataformas de venda genéricas, toda a estrutura do sistema é otimizada para as necessidades de leitores, facilitando a busca por títulos e promovendo o acesso à leitura.

## Arquitetura do Projeto

O ecossistema do Folheio foi projetado com uma arquitetura multiplataforma, abrangendo as seguintes frentes:

- **Interface Web**
- **Aplicativo Móvel**

Ambas as interfaces de usuário (Web e Mobile) serão alimentadas por uma única Interface de Programação de Aplicações (API). Esta abordagem centralizada garante a consistência dos dados, a unificação das regras de negócio e uma experiência padronizada para o usuário, independentemente do dispositivo utilizado para acesso.