import React, { useEffect, useState } from "react";
import { View, Text, TextInput, FlatList, TouchableOpacity, Animated } from "react-native";
import Toast from "react-native-toast-message";
import { adicionarRelatorio } from "../../relatorioAPI";
import styles from "./styleAdm";

export default function ReceitasSection({
  confirmarExclusao, // função para confirmar exclusão de uma receita
  getDocuments,       // função para obter documentos do banco de dados
  createDocument,     // função para criar um novo documento
  updateDocument,     // função para atualizar um documento existente
  deleteDocument,     // função para deletar um documento
  user,               // usuário logado (para relatório)
}) {
  // Estados principais
  const [receitas, setReceitas] = useState([]); // lista de receitas
  const [novaReceitaNome, setNovaReceitaNome] = useState(""); // nome da nova receita
  const [itensSelecionados, setItensSelecionados] = useState([]); // itens selecionados para a receita
  const [receitaOriginal, setReceitaOriginal] = useState(null); // receita original para relatório
  const [editandoReceitaId, setEditandoReceitaId] = useState(null); // id da receita em edição
  const [estoque, setEstoque] = useState([]); // lista de itens do estoque
  const [mostrarItens, setMostrarItens] = useState(false); // controla se a lista de itens está visível

  // Carrega todas as receitas do banco
  async function carregarReceitas() {
    const docs = await getDocuments("receitas");
    if (!docs || docs.length === 0) {
      setReceitas([]);
      return;
    }

    const recs = docs.map((doc) => {
      const f = doc.fields;
      const itens = Array.isArray(f.itens?.arrayValue?.values)
        ? f.itens.arrayValue.values.map((v) => {
            const campos = v.mapValue?.fields || {};
            return {
              itemId: campos.itemId?.stringValue || "",
              quantidade: parseInt(campos.quantidade?.integerValue || "0"),
            };
          })
        : [];

      return {
        id: doc.name.split("/").pop(), // extrai o id do documento
        nome: f.nome?.stringValue || "Sem nome",
        itens,
      };
    });

    recs.sort((a, b) => a.nome.localeCompare(b.nome)); // ordena alfabeticamente
    setReceitas(recs);
  }

  // Carrega o estoque para seleção de itens
  async function carregarEstoque() {
    const docs = await getDocuments("estoque");
    const itens = docs.map((doc) => {
      const f = doc.fields || {};
      return {
        id: doc.name.split("/").pop(),
        nome: f.nome?.stringValue || "",
        quantidade: parseInt(f.quantidade?.integerValue || "0"),
      };
    });
    itens.sort((a, b) => a.nome.localeCompare(b.nome)); // ordena alfabeticamente
    setEstoque(itens);
  }

  // Alterna seleção de um item na receita
  function toggleItemSelecionado(itemId) {
    setItensSelecionados((prev) =>
      prev.some((i) => i.itemId === itemId)
        ? prev.filter((i) => i.itemId !== itemId) // remove se já estava selecionado
        : [...prev, { itemId, quantidade: 1 }]   // adiciona com quantidade padrão 1
    );
  }

  // Salva ou atualiza uma receita
  async function salvarReceita() {
    if (!novaReceitaNome || itensSelecionados.length === 0) return; // validação básica

    const itensParaSalvar = itensSelecionados.map((i) => ({
      itemId: i.itemId,
      quantidade: i.quantidade,
    }));

    const dadosReceita = { nome: novaReceitaNome, itens: itensParaSalvar };

    if (editandoReceitaId) {
      // Atualiza receita existente
      await updateDocument("receitas", editandoReceitaId, dadosReceita);

      // Prepara relatório de alterações
      const ingredientesOriginais = {};
      for (const receitaItem of receitaOriginal.itens) {
        const estoqueItem = estoque.find((e) => e.id === receitaItem.itemId);
        ingredientesOriginais[estoqueItem.nome] = receitaItem.quantidade;
      }

      const ingredientesNovos = {};
      for (const receitaItem of dadosReceita.itens) {
        const estoqueItem = estoque.find((e) => e.id === receitaItem.itemId);
        ingredientesNovos[estoqueItem.nome] = receitaItem.quantidade;
      }

      const alteracoesDeIngredientes = [];
      for (const entry of Object.entries(ingredientesNovos)) {
        const nome = entry[0];
        const qtd = entry[1];
        if (ingredientesOriginais[nome]) {
          if (ingredientesOriginais[nome] === ingredientesNovos[nome]) {continue;}
          alteracoesDeIngredientes.push(`- ${nome}: de ${ingredientesOriginais[nome]} para ${ingredientesNovos[nome]};`);
          delete ingredientesOriginais[nome];
        } else if (!ingredientesOriginais[nome]) {
          alteracoesDeIngredientes.push(`- ${nome}: ${qtd} (novo ingrediente);`);
        }
      }

      for (const entry of Object.entries(ingredientesOriginais)) {
        const nome = entry[0];
        const _qtd = entry[1];
        if (!ingredientesNovos[nome]) {
          alteracoesDeIngredientes.push(`- ${nome}: removido;`);
        }
      }

      const relatorio = alteracoesDeIngredientes.length === 0 ?
        `atualizou o nome da receita ${receitaOriginal.nome} para ${dadosReceita.nome}.` :
        `atualizou ingredientes da receita ${receitaOriginal.nome}` + (receitaOriginal.nome === dadosReceita.nome ? "" :
        ` (agora ${dadosReceita.nome})`) + `:\n${alteracoesDeIngredientes.join("\n")}`;

      adicionarRelatorio(user, relatorio);

    } else {
      // Cria nova receita
      await createDocument("receitas", dadosReceita);

      let relatorio = `adicionou receita ${dadosReceita.nome} com ingredientes:\n`
      for (const receitaItem of dadosReceita.itens) {
        const estoqueItem = estoque.find((e) => e.id === receitaItem.itemId);
        relatorio += `- ${estoqueItem.nome}: ${receitaItem.quantidade};\n`;
      }
      adicionarRelatorio(user, relatorio.trimEnd());
    }

    // Limpa estados
    setNovaReceitaNome("");
    setItensSelecionados([]);
    setReceitaOriginal(null);
    setEditandoReceitaId(null);
    carregarReceitas();

    // Mostra feedback
    Toast.show({
      type: "success",
      text1: "Sucesso",
      text2: `Receita ${editandoReceitaId ? "atualizada" : "cadastrada"} com sucesso!`,
      position: "top",
      visibilityTime: 2000,
    });
  }

  // Exclui receita
  async function excluirReceita(id, nome) {
    try {
      await deleteDocument("receitas", id);
      adicionarRelatorio(user, `excluiu receita ${nome}.`);
      carregarReceitas();
    } catch (error) {
      console.error("Erro ao excluir receita:", error);
      adicionarRelatorio(user, `tentou excluir receita ${nome}, mas houve impedimento por erro do sistema.`);
    }
  }

  // useEffect inicial: carrega receitas e estoque, configura listeners
  useEffect(() => {
    carregarReceitas();
    carregarEstoque();

    const deletar = (e) => {
      if (e.detail.tipo === "receita") excluirReceita(e.detail.id, e.detail.nome);
    };
    document.addEventListener("deleteItem", deletar);
    document.addEventListener("carregarTudo", carregarReceitas);
    return () => {
      document.removeEventListener("deleteItem", deletar);
      document.removeEventListener("carregarTudo", carregarReceitas);
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.subtitle}>Gerenciar Receitas</Text>

      {/* Input do nome da receita */}
      <TextInput
        style={styles.input}
        placeholder="Nome da receita"
        placeholderTextColor="#888"
        value={novaReceitaNome}
        onChangeText={setNovaReceitaNome}
      />

      {/* Botão para mostrar/esconder lista de itens */}
      <TouchableOpacity
        style={{
          marginTop: 10,
          backgroundColor: "#2B1E3F",
          borderRadius: 8,
          paddingVertical: 10,
          alignItems: "center",
        }}
        onPress={() => setMostrarItens(!mostrarItens)}
      >
        <Text style={{ color: "#E6D4FA", fontWeight: "bold" }}>
          {mostrarItens ? "Esconder Itens ▲" : "Mostrar Itens ▼"}
        </Text>
      </TouchableOpacity>

      {/* Lista de itens selecionáveis */}
      {mostrarItens && (
        <View style={{ marginTop: 10 }}>
          <Text style={[styles.textinho, { marginBottom: 6 }]}>
            Selecionar Itens e Quantidades:
          </Text>

          {estoque.map((item) => {
            const selecionado = itensSelecionados.find((i) => i.itemId === item.id);
            return (
              <View
                key={item.id}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginVertical: 4,
                }}
              >
                <TouchableOpacity
                  style={{ flex: 1 }}
                  onPress={() => toggleItemSelecionado(item.id)}
                >
                  <Text
                    style={{
                      color: selecionado ? "#A569BD" : "#DDD",
                      fontWeight: selecionado ? "bold" : "normal",
                    }}
                  >
                    {item.nome}
                  </Text>
                </TouchableOpacity>

                {selecionado && (
                  <TextInput
                    style={[
                      styles.input,
                      { width: 60, marginVertical: 0, textAlign: "center" },
                    ]}
                    keyboardType="numeric"
                    value={selecionado.quantidade.toString()}
                    onChangeText={(txt) => {
                      const novaQtd = parseInt(txt) || 0;
                      setItensSelecionados((prev) =>
                        prev.map((i) =>
                          i.itemId === item.id
                            ? { ...i, quantidade: novaQtd }
                            : i
                        )
                      );
                    }}
                  />
                )}
              </View>
            );
          })}
        </View>
      )}

      {/* Botão principal para salvar/atualizar receita */}
      <TouchableOpacity style={styles.buttonPrimary} onPress={salvarReceita}>
        <Text style={styles.buttonText}>
          {editandoReceitaId ? "Atualizar Receita" : "Salvar Receita"}
        </Text>
      </TouchableOpacity>

      <Text style={[styles.textinho, { marginTop: 16 }]}>Receitas cadastradas:</Text>

      {/* Lista de receitas */}
      <FlatList
        data={receitas}
        keyExtractor={(r) => r.id}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item }) => (
          <View style={styles.listItem}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: "bold", color: "#FFF" }}>{item.nome}</Text>
              {[...item.itens]
                  .sort((a, b) => {
                    const nomeA = (estoque.find(e => e.id === a.itemId)?.nome || "").toLowerCase();
                    const nomeB = (estoque.find(e => e.id === b.itemId)?.nome || "").toLowerCase();
                    return nomeA.localeCompare(nomeB);
                  })
                  .map((i) => {
                const estoqueItem = estoque.find((e) => e.id === i.itemId);
                return (
                  <Text key={i.itemId} style={{ fontSize: 12, color: "#BBB" }}>
                    • {estoqueItem ? estoqueItem.nome : "Item removido"}: {i.quantidade}
                  </Text>
                );
              })}
            </View>

            {/* Botões Editar e Excluir */}
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.buttonEdit}
                onPress={() => {
                  setReceitaOriginal(item);
                  setEditandoReceitaId(item.id);
                  setNovaReceitaNome(item.nome);
                  setItensSelecionados(item.itens);
                }}
              >
                <Text style={styles.buttonText}>Editar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.buttonDelete}
                onPress={() => confirmarExclusao(item.id, "receita", item.nome)}
              >
                <Text style={styles.buttonText}>Excluir</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}
