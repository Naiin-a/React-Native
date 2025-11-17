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

/** @type {{timestamp: number, nome: string, admin: boolean, texto: string}[]} */
let BANCO = [];

export function pegarRelatorios() {
  // eventualmente, puxar do Firestore
  return BANCO.toReversed(); // inverte pra ficar na ordem de mais recente pra mais antigo
}

// função pra debugar
export function printarRelatorios() {
  console.log("relatórios:", "\n" + pegarRelatorios().map(r => `[${(new Date(r.timestamp)).toLocaleString("pt-br")}] ${r.admin ? "Admin" : "Funcionário(a)"} ${r.nome} ${r.texto}`).join("\n"));
}

/**
 * Exemplo: `adicionarRelatorio({..., nome: "Genivaldo", tipo: "adm"}, "fez login no sistema.");` resulta em `[12/11/2025, 20:16:26] Admin Genivaldo fez login no sistema.`.
 */
export function adicionarRelatorio(usuario_obj, texto) {
  const relatorio = {
    timestamp: Date.now(),
    nome: usuario_obj.nome,
    admin: usuario_obj.tipo.toLowerCase() === "adm",
    texto: texto,
  };

  // aqui depois vai chamar a API do Firestore
  BANCO.push(relatorio);

  printarRelatorios();
}