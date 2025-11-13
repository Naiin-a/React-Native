## Funcionando:
- Receita;
- Confirmação;
- CRUD;
- Login;
- Cadastro;
- Estoque;
- Banco de Dados;
- Telas.

## Falta:
- Tela para ver os Relatórios;
- Integrar a API de Relatórios com o Banco;
- Ajeitar e adicionar Toasts;
- Adicionar comentários;
- Limpar, organizar e otimizar o código;
- Estilizar.

## 07/11 att:
mudei o estilo, só nao mudei os toasts e ainda tem os alerts

tem verificaçao de email

falta a senha precisar ter 8 caracteres e esses bagulhos relacionados

falta tirar a barriha lateral

de resto nao lembro

## 10/11 att:
implementei a validação de senha ( 8 char) e a de email tambem por enquanto só isso, em aula devo continuar

se houver mais atualizações substitua esse arquivo com elas!

## 13/11 atualização:
Implementei metade do sistema de Relatórios. Dá pra ver o sistema em ação abrindo o console do Expo Snack clicando na barrinha lá embaixo na tela e fazendo qualquer coisa relevante no sistema, como logar, fazer uma receita, editar o registro de um funcionário, etc.

Atualmente, o sistema de Relatórios é inteiramente local, então falta integrá-lo com o Firestore e fazer uma tela pros administradores acessarem. Se der tempo, eu gostaria de fazer uma funcionalidade nessa tela pra filtrar os relatórios por data e por pessoa; me parece algo útil.

Outras mudanças:
- O arquivo `AdminScreen/FuncionarioSection.js` era quase idêntico a `AdminScreen/ReceitasSection.js`, por algum motivo. Eu puxei uma versão levemente mais antiga de `FuncionarioSection.js` e arrumei;
- Os arquivos `AdminScreen/AdmScreen.js` e `AdminScreen/AdminSection.js` tinham seus conteúdos trocados, de alguma forma; o componente `AdmScreen` estava em `AdminSection.js` e vice-versa. Arrumei também.
