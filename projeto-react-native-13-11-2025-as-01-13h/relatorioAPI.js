/*
API simples para registro de relatórios.
Relatórios servem para registrar ações realizadas pelos usuários do sistema, como:
- login e logout;
- produção de uma receita;
- adição de uma receita;
- consumo de itens individuais no estoque;
- adição de novos funcionários e administradores;
- etc.
*/

let BANCO = [];

export function pegarRelatorios() {
  // eventualmente, puxar do Firestore
  return BANCO;
}

// função pra debugar
export function printarRelatorios() {
  console.log("relatórios:", "\n" + pegarRelatorios().join("\n"));
}

/**
 * Exemplo: `adicionarRelatorio({..., nome: "Genivaldo", tipo: "adm"}, "fez login no sistema.");` resulta em `[12/11/2025, 20:16:26] Admin Genivaldo fez login no sistema.`.
 * 
 * Por enquanto tá bem simples, adicionando somente texto, mas dá pra expandir essa ideia fazendo o relatório ser um objeto: `{timestamp: 1763006510507, nome_usuario: "Genivaldo", tipo_usuario: "adm", texto: "fez login no sistema."}`, porque aí na tela de ver os relatórios, dá pra fazer uma funcionalidade de filtrar por data e por pessoa, o que é útil.
 */
export function adicionarRelatorio(usuario_obj, texto) {
  const relatorio = `[${(new Date()).toLocaleString("pt-br")}] ${usuario_obj.tipo.toLowerCase() === "adm" ? "Admin" : "Funcionário(a)"} ${usuario_obj.nome} ${texto}`;

  // aqui depois vai chamar a API do Firestore
  BANCO.push(relatorio);

  printarRelatorios();
}