# Documentação técnica do FOLHEIO

- [Documento em PDF](FOLHEIO_DOCUMENTACAO.pdf)
- [Fonte LaTeX editável](FOLHEIO_DOCUMENTACAO.tex)

O guia descreve arquitetura, contrato HTTP, modelo de dados, execução do site e Android, testes, revisão visual, desenvolvimento e próximas etapas. Referência: commit `f96a04a` da branch `codex/integracao-api-web-android`.

## Atenção à versão do código

Esta publicação na `main` adiciona a documentação. A implementação descrita está na branch de integração; use essa branch para executar os comandos do guia. A execução e a revisão visual do Android ainda estão pendentes.

## Compilar

O fonte é independente de imagens ou outros arquivos locais. Use uma distribuição TeX com os pacotes declarados e compile duas vezes com `pdflatex`, ou execute `tectonic FOLHEIO_DOCUMENTACAO.tex`. O editor LaTeX do Codex também pode abrir o fonte com preview quando o compilador integrado estiver disponível.

O PDF desta edição foi gerado com Tectonic. Confira sumário, tabelas e links após alterações. Não versione arquivos auxiliares do compilador.
