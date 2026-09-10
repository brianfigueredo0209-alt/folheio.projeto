# Entendendo a Arquitetura do Projeto

Este documento explica o funcionamento da arquitetura antes da execução prática. O objetivo é compreender como as partes se comunicam, não apenas seguir o cronograma de tarefas.

---

## 1. Visão Geral

O projeto segue uma arquitetura orientada a serviços. Existe um único ponto central responsável por processar dados e regras de negócio, e dois clientes independentes que consomem esse ponto central de formas diferentes.

Os três componentes são:

- **Backend (Go ou Python)**: responsável por toda a lógica e pelo fornecimento dos dados.
- **Web Frontend**: interface executada no navegador, que consome os dados do backend.
- **Mobile App (Kotlin)**: interface nativa Android, que consome os mesmos dados do backend.

A ideia central é que Web e Mobile não têm inteligência própria sobre os dados: eles apenas exibem o que o backend fornece.

---

## 2. Por que essa separação existe

Separar o backend dos frontends resolve um problema prático: evitar que a mesma regra de negócio precise ser escrita duas vezes, uma para a Web e outra para o Mobile.

Com o backend centralizado:

- A regra de negócio existe em um único lugar.
- Web e Mobile podem evoluir de forma independente, sem depender da tecnologia um do outro.
- Qualquer novo cliente (por exemplo, um futuro app iOS) poderia consumir a mesma API sem exigir mudanças no backend.

---

## 3. O Papel de Cada Peça

### Backend

- Sobe um servidor que fica escutando uma porta local (exemplo: `localhost:8080`).
- Recebe requisições HTTP (GET, POST).
- Processa a lógica correspondente à rota chamada.
- Devolve uma resposta no formato JSON.

### Contrato de Comunicação (API)

- É o conjunto de rotas que o backend disponibiliza (exemplo: `GET /status`, `GET /teste`).
- Web e Mobile não acessam banco de dados diretamente. Eles só conversam com o backend através dessas rotas.
- Esse contrato é o que garante que Web e Mobile "falem a mesma língua" com o backend.

### Web Frontend

- Roda no navegador.
- Faz requisições HTTP para as mesmas rotas que o Mobile utiliza.
- Recebe o JSON de resposta e exibe o conteúdo na tela.

### Mobile App (Kotlin)

- Roda de forma nativa no Android.
- Usa bibliotecas de rede para fazer requisições HTTP ao backend.
- Recebe o mesmo JSON que a Web recebe e o exibe na interface do aplicativo.

---

## 4. O Fluxo dos Dados, Passo a Passo

1. O usuário interage com a Web ou com o App (por exemplo, clica em um botão).
2. A Web ou o App envia uma requisição HTTP para uma rota do backend.
3. O backend recebe a requisição, executa a lógica correspondente e monta uma resposta.
4. O backend devolve essa resposta no formato JSON.
5. A Web ou o App recebe o JSON e o transforma em algo visível na tela (texto, lista, etc.).

O ponto-chave: tanto a Web quanto o App percorrem exatamente o mesmo caminho até o backend. A diferença está apenas em como cada um exibe o resultado.

---

## 5. O Formato JSON

O JSON é a estrutura de texto usada pelo backend para responder às requisições. Ele é organizado em pares de chave e valor, e tanto a Web quanto o Kotlin sabem interpretar esse formato nativamente.

Exemplo de resposta da rota `GET /status`:

```json
{
  "status": "sucesso",
  "codigo": 200,
  "dados": {
    "mensagem": "API Backend conectada com sucesso",
    "servicos": ["Go", "Python", "Kotlin"]
  }
}
```

Leitura da estrutura:

- `status`: indica se a requisição deu certo ou não.
- `codigo`: código HTTP correspondente ao resultado.
- `dados`: contém o conteúdo real que será exibido na tela.

---

## 6. O que Observar Durante a Execução

Ao longo do dia de execução, o objetivo não é decorar sintaxe de Go, Python ou Kotlin, e sim confirmar, na prática, os seguintes pontos:

- O backend realmente responde no formato JSON esperado.
- A Web consegue chamar a rota e exibir o dado recebido.
- O App Mobile consegue chamar a mesma rota e exibir o mesmo dado.
- Web e Mobile, mesmo sendo tecnologias diferentes, chegam ao mesmo resultado porque dependem do mesmo contrato de API.

Se esses quatro pontos forem confirmados ao final do dia, a arquitetura foi compreendida na prática, independentemente de detalhes de sintaxe de cada linguagem.
