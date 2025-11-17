# Gestão Eficiente de Insumos e Produção: Registro de Itens, Receitas e Usuários
Projeto final da disciplina de **Programação Para Dispositivos Móveis em Android**, orientado pelo professor **Gabriel Moraes**.

Grupo composto por [Maria Eduarda](https://github.com/Mishy-Boog), [Paulo Marcos](https://github.com/Paulo-Marcos1), [Rafael Almeida](https://github.com/Naiin-a) e [Rhuan Bloomfield](https://github.com/rhuanbloomfield).

## Do que se trata?
É uma aplicação de **controle de estoque** voltada para lanchonetes e restaurantes. A ideia principal é poder registrar **receitas** que, ao serem produzidas, automaticamente subtraem seus ingredientes do estoque.

## Tecnologias utilizadas:
- Front-end em **React Native** (JavaScript) rodando no [Expo Snack](https://snack.expo.dev/);
- Back-end em **JavaScript** com **Firebase**;
- Bibliotecas/módulos utilizados: [React](https://www.npmjs.com/package/react), [React Native](https://www.npmjs.com/package/react-native) e [react-native-toast-message](https://www.npmjs.com/package/react-native-toast-message).

## Funcionalidades do projeto:
- Controle de **estoque**, que permite registrar itens e sua quantidade (CRUD);
- Registro e produção de **receitas**, que automaticamente subtraem seus ingredientes do estoque (CRUD);
- Cadastro e remoção de **novos funcionários** e **administradores** (CRUD);
- Sistema de **relatórios** ― registros de todas as ações realizadas no sistema por todo usuário ― com pesquisa por nome (até então, não tem integração com o banco de dados);
- Total de **8 telas**: 1 de login, 2 acessíveis aos funcionários e 5 acessíveis aos administradores.

<img width="382" height="818" alt="Imagem da tela de login." src="https://github.com/user-attachments/assets/db560dfb-b8b2-4b73-8942-c3bfba1edc58" />
<img width="382" height="818" alt="Imagem da tela de produção de receitas (visão do funcionário)." src="https://github.com/user-attachments/assets/5f0f930c-fd5f-44d3-8bb0-ff05a32f5d19" />

---

<img width="382" height="818" alt="Imagem da tela de estoque (visão do funcionário)." src="https://github.com/user-attachments/assets/11478fe7-fd8d-49e1-a511-169bfb98ea56" />
<img width="382" height="818" alt="Imagem da tela de edição de estoque (visão do administrador)." src="https://github.com/user-attachments/assets/72d46e85-01ca-448d-83b7-6a1f10cf66d8" />

---

<img width="382" height="818" alt="Imagem da tela de edição de receitas (visão do administrador)." src="https://github.com/user-attachments/assets/3dc6ef7c-c5e2-4713-9365-8728e50bc863" />
<img width="382" height="818" alt="Imagem da tela de cadastro de novos funcionários." src="https://github.com/user-attachments/assets/62820131-a1a7-4be7-a3fd-db98ba943c7a" />

---

<img width="382" height="818" alt="Imagem da tela de cadastro de novos administradores." src="https://github.com/user-attachments/assets/8fcfc1d9-91f8-40d7-a46e-f797b6dee7fa" />
<img width="382" height="818" alt="Imagem da tela de relatórios." src="https://github.com/user-attachments/assets/0b922e00-34bf-4969-bf34-c2cd99070456" />

---

## Como rodar o projeto?
Eis um passo a passo de como importar o projeto no Expo Snack e executá-lo:
1. Abra o [Expo Snack](https://snack.expo.dev/);
2. Clique nos três pontinhos ao lado de **Project** e então em **Import git repository**;

	<img width="472" height="319" alt="Imagem mostrando onde clicar." src="https://github.com/user-attachments/assets/854cbd7d-8bee-4f1d-a737-ecb03fdcc8ba" />

3. Na tela que abriu, clique em **Show advanced options**;
4. Sob **Repository URL**, cole o link deste repositório: `https://github.com/Naiin-a/React-Native`. Sob **Folder path**, escreva o nome da pasta com a versão final do projeto ― no caso, `Projeto Final`. Deixe **Branch name** vazio e clique em **Import repository**.

	<img width="455" height="606" alt="Imagem mostrando onde e quais informações pôr antes de importar." src="https://github.com/user-attachments/assets/8d9d2992-516f-4044-b358-a8f65a60b688" />

5. Se a tela da aplicação não aparecer, habilite **Preview** no canto inferior direito e então clique em **Web** no canto superior direito. Se desejar, clique na divisória do site com a tela do projeto (conforme demonstrado na imagem) e arraste para aumentar a tela do projeto.

	<img width="1920" height="1080" alt="Imagem mostrando onde clicar caso a tela não apareça." src="https://github.com/user-attachments/assets/af338754-5167-41e3-bd41-f2bbef81b813" />

6. Faça login! Você pode logar como funcionário ou como administrador. Há dois logins padrão:
	- Funcionário: `funcionario@email.com`, `senha123`;
	- Administrador: `admin@email.com`, `senha123`.

