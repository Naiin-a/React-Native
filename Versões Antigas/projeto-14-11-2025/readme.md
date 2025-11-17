## Funcionando:
- Receita;
- Confirmação;
- CRUD;
- Login;
- Cadastro;
- Estoque;
- Banco de Dados;
- Telas.
- Estilizar.
- Ajeitar e adicionar Toasts.

## Falta:
- Integrar a API de Relatórios com o Banco;
- Adicionar comentários;
- Limpar, organizar e otimizar o código;

## 14/11 18:22h atualização:
Atualizei o projeto colocando a parte de estilização junto com a que estava o relatorio
## 14/11 15:44h atualização:
Criei uma tela acessível pelos administradores pra visualizar os relatórios e filtrá-los por nome.

## 13/11 atualização:
Implementei metade do sistema de Relatórios. Dá pra ver o sistema em ação abrindo o console do Expo Snack clicando na barrinha lá embaixo na tela e fazendo qualquer coisa relevante no sistema, como logar, fazer uma receita, editar o registro de um funcionário, etc.

Atualmente, o sistema de Relatórios é inteiramente local, então falta integrá-lo com o Firestore e fazer uma tela pros administradores acessarem. Se der tempo, eu gostaria de fazer uma funcionalidade nessa tela pra filtrar os relatórios por data e por pessoa; me parece algo útil.

Outras mudanças:
- O arquivo `AdminScreen/FuncionariosSection.js` era quase idêntico a `AdminScreen/ReceitasSection.js`, por algum motivo. Eu puxei uma versão levemente mais antiga de `FuncionariosSection.js` e arrumei;
- Os arquivos `AdminScreen/AdmScreen.js` e `AdminScreen/AdminSection.js` tinham seus conteúdos trocados, de alguma forma; o componente `AdmScreen` estava em `AdminSection.js` e vice-versa. Arrumei também.

## 10/11 att:
implementei a validação de senha ( 8 char) e a de email tambem por enquanto só isso, em aula devo continuar

se houver mais atualizações substitua esse arquivo com elas!

## 07/11 att:
mudei o estilo, só nao mudei os toasts e ainda tem os alerts

tem verificaçao de email

falta a senha precisar ter 8 caracteres e esses bagulhos relacionados

falta tirar a barriha lateral

de resto nao lembro