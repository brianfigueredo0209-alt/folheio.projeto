# FOLHEIO Android — Kotlin

Aplicativo Android nativo conectado ao mesmo contrato da SPA Vue.

Implementa cadastro, login, catalogo e pesquisa, publicacao/edicao com capa,
ofertas de troca/venda/doacao, perfil, remocao de anuncio e chat por livro.

O cliente HTTP esta em app/src/main/java/com/felipe/folheio_app/dados/ClienteApi.kt.
A navegacao inicial esta em MainActivity.kt. Os dados pertencem ao backend;
o token fica em memoria e um novo login e necessario ao reiniciar o aplicativo.

## Executar

Abra este diretorio no Android Studio com o JDK e o SDK configurados no projeto.
O emulador usa http://10.0.2.2:8080; o backend deve estar rodando no computador.

Para um celular na mesma rede, informe o IP do computador:

~~~powershell
.\gradlew.bat :app:assembleDebug -PfolheioApiUrl=http://192.168.1.10:8080
~~~

HTTP e permitido somente em depuracao. Em producao, use uma API HTTPS.
O chat atualiza mensagens a cada cinco segundos enquanto a tela esta ativa.

## Contrato

Consulte CONTRATO_API.md e backend/contrato.openapi.json no repositorio FOLHEIO-WEB.
A fonte de verdade e a API Go com PostgreSQL; a versao HTML e os prototipos
visuais nao fornecem os dados deste aplicativo.

## Estado da validacao

O Java incluido no Android Studio foi configurado no projeto e no JAVA_HOME do usuario. O SDK Android 37.0, Build Tools 36/37 e Platform Tools foram instalados. O build :app:assembleDebug terminou com sucesso e gerou app/build/outputs/apk/debug/app-debug.apk. O APK utiliza 10.0.2.2:8080 para o emulador; um celular fisico exige build com folheioApiUrl apontando ao IP do computador. A execucao em dispositivo ou emulador ainda nao foi validada.
