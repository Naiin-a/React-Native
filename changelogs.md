# Changelogs
Esse é o registro das atualizações que o grupo foi escrevendo de forma esporádica durante o desenvolvimento do projeto.

## Funcionando:
- Receita;
- Confirmação;
- CRUD;
- Login;
- Cadastro;
- Estoque;
- Banco de Dados;
- Relatórios (logs);
- Telas;
- Estilizar;
- Ajeitar e adicionar Toasts.

## Falta:
- Nada!

## 16/11 14:14h atualização:
Tentei integrar o sistema de relatórios com o Firestore, mas isso tava emitindo muitas requisições de leitura por algum motivo, o que fazia o Firestore bloquear requisições por exceder o limite diário, então removi em prol de podermos apresentar o projeto sem medo.

O sistema de relatórios vai permanecer local.

## 15/11
botei comentarios, mudei a cor e deixei levemente mais rapido a confirmaçao de receita

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